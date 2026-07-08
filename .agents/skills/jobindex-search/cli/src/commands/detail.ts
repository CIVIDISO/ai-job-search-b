import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { BASE_URL, htmlFetch, writeError } from "../helpers.js"

interface JobDetail {
  id: string
  title: string | null
  company: string | null
  companyUrl: string | null
  location: string | null
  date: string | null
  deadline: string | null
  employmentType: string | null
  hours: string | null
  applyUrl: string | null
  url: string
  description: string | null
}

/** Accept a job ID (h1647303, r123456, 1647303) or a full jobindex.dk URL. */
function normalizeInput(input: string): { id: string; url: string } | null {
  const urlMatch = input.match(/jobindex\.dk\/jobannonce\/([hr]?\d+)/)
  if (urlMatch) {
    return { id: urlMatch[1], url: input.startsWith("http") ? input : `https://${input}` }
  }
  const idMatch = input.match(/^([hr]?\d+)$/)
  if (idMatch) {
    return { id: idMatch[1], url: `${BASE_URL}/jobannonce/${idMatch[1]}` }
  }
  return null
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&nbsp;/g, " ")
}

function stripHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, ""),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** Find the JSON-LD JobPosting block if the page embeds one. */
function extractJsonLd(html: string): Record<string, any> | null {
  const scripts = html.matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  )
  for (const match of scripts) {
    let data: unknown
    try {
      data = JSON.parse(match[1])
    } catch {
      continue
    }
    const candidates = Array.isArray(data) ? data : [data]
    for (const candidate of candidates) {
      if (candidate && typeof candidate === "object" && (candidate as any)["@type"] === "JobPosting") {
        return candidate as Record<string, any>
      }
    }
  }
  return null
}

/** Pull the value that follows a Danish label like "Ansøgningsfrist:" in the page. */
function labelValue(html: string, label: string): string | null {
  const re = new RegExp(`${label}[^<]*</[^>]+>\\s*(?:<[^>]+>)*\\s*([^<]+)<`, "i")
  const match = html.match(re)
  if (match) {
    const value = decodeEntities(match[1]).trim()
    if (value) return value
  }
  const inline = html.match(new RegExp(`${label}:?\\s*([^<\\n]+)`, "i"))
  return inline ? decodeEntities(inline[1]).trim() || null : null
}

function parsePage(html: string, id: string, url: string): JobDetail {
  const jsonLd = extractJsonLd(html)

  let title: string | null = null
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (h1) title = stripHtml(h1[1]) || null
  if (!title) {
    const og = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)
    if (og) title = decodeEntities(og[1]) || null
  }

  let description: string | null = null
  if (jsonLd?.description) {
    description = stripHtml(String(jsonLd.description)) || null
  }
  if (!description) {
    const jobtext =
      html.match(/<div[^>]+class="[^"]*jobtext[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div|<footer|$)/i) ||
      html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)
    if (jobtext) description = stripHtml(jobtext[1]) || null
  }

  let company: string | null = jsonLd?.hiringOrganization?.name ?? null
  const companyUrl: string | null = jsonLd?.hiringOrganization?.sameAs ?? null
  if (!company) {
    const byline = html.match(/class="[^"]*jix-toolbar-top__company[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
    if (byline) company = stripHtml(byline[1]) || null
  }

  const location: string | null =
    jsonLd?.jobLocation?.address?.addressLocality ??
    labelValue(html, "Arbejdssted") ??
    null

  const date: string | null =
    jsonLd?.datePosted ?? html.match(/<time[^>]+datetime="([^"]+)"/)?.[1] ?? null

  const deadline: string | null =
    jsonLd?.validThrough ?? labelValue(html, "Ansøgningsfrist") ?? null

  const employmentType: string | null =
    (Array.isArray(jsonLd?.employmentType) ? jsonLd?.employmentType[0] : jsonLd?.employmentType) ??
    labelValue(html, "Ansættelsesform") ??
    null

  const hours: string | null = labelValue(html, "Arbejdstid") ?? null

  // The apply button links through Jobindex's click tracker (/c?t=...). The
  // tracker URL is returned as-is; following the redirect needs another request.
  let applyUrl: string | null = null
  const apply = html.match(/href="(\/c\?t=[^"]+)"/) || html.match(/href="(https:\/\/www\.jobindex\.dk\/c\?t=[^"]+)"/)
  if (apply) {
    applyUrl = apply[1].startsWith("http") ? decodeEntities(apply[1]) : `${BASE_URL}${decodeEntities(apply[1])}`
  }

  return {
    id,
    title,
    company,
    companyUrl,
    location,
    date,
    deadline,
    employmentType,
    hours,
    applyUrl,
    url,
    description,
  }
}

export const detail = defineCommand({
  name: "detail",
  description: "Fetch full detail for a single job listing on Jobindex.dk",
  options: {
    format: option(z.enum(["json", "plain"]).default("json"), {
      description: "Output format (json|plain)",
    }),
  },
  async handler({ flags, positional }) {
    const input = positional[0]
    if (!input) {
      writeError("detail requires a job <id|url>", "MISSING_REQUIRED")
      process.exit(1)
    }
    const normalized = normalizeInput(input)
    if (!normalized) {
      writeError(`Could not parse a job ID from "${input}"`, "BAD_ID")
      process.exit(1)
    }

    try {
      const html = await htmlFetch(normalized.url)
      const job = parsePage(html, normalized.id, normalized.url)
      if (!job.title && !job.description) {
        writeError("Failed to parse job listing HTML", "PARSE_ERROR")
        process.exit(1)
      }

      if (flags.format === "plain") {
        const lines = [
          job.title || "(no title)",
          `${job.company || "—"} · ${job.location || "—"}`,
          "",
          job.employmentType ? `Employment: ${job.employmentType}` : "",
          job.hours ? `Hours: ${job.hours}` : "",
          job.date ? `Posted: ${job.date}` : "",
          job.deadline ? `Deadline: ${job.deadline}` : "",
          "",
          job.description || "(no description)",
          "",
          `URL: ${job.url}`,
          job.applyUrl ? `Apply: ${job.applyUrl}` : "",
        ].filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
        process.stdout.write(lines.join("\n") + "\n")
      } else {
        process.stdout.write(JSON.stringify(job, null, 2) + "\n")
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      if (message === "Job not found") {
        writeError("Job not found", "NOT_FOUND")
      } else {
        writeError(message, "API_ERROR")
      }
      process.exit(1)
    }
  },
})
