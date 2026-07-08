import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { BASE_URL, extractJobIdFromUrl, fetchWithUA, writeError } from "../helpers.js"

interface JobDetail {
  id: string
  url: string
  title: string
  description: string
  datePosted: string
  deadline: string | null
  employmentType: string[]
  company: {
    name: string
    logo: string | null
  }
  location: {
    streetAddress: string
    city: string
    postalCode: string
    country: string
  }
}

/** Accept a bare numeric ID or a full jobbank.dk job URL. */
function normalizeId(input: string): string | null {
  if (/^\d+$/.test(input)) return input
  const fromUrl = extractJobIdFromUrl(input)
  return fromUrl || null
}

/** Find the JSON-LD block with "@type": "JobPosting" among all ld+json scripts. */
function extractJobPosting(html: string): Record<string, any> | null {
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
    const candidates = Array.isArray(data)
      ? data
      : data && typeof data === "object" && "@graph" in (data as any)
        ? (data as any)["@graph"]
        : [data]
    for (const candidate of candidates) {
      if (candidate && typeof candidate === "object" && candidate["@type"] === "JobPosting") {
        return candidate
      }
    }
  }
  return null
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function toDetail(posting: Record<string, any>, id: string): JobDetail {
  const address = posting.jobLocation?.address ?? {}
  const employmentType = posting.employmentType
    ? Array.isArray(posting.employmentType)
      ? posting.employmentType
      : [posting.employmentType]
    : []
  return {
    id: posting.identifier?.value ?? id,
    url: posting.url ?? `${BASE_URL}/job/${id}/`,
    title: posting.title ?? "",
    description: posting.description ?? "",
    datePosted: posting.datePosted ?? "",
    deadline: posting.validThrough ?? null,
    employmentType,
    company: {
      name: posting.hiringOrganization?.name ?? "",
      logo: posting.hiringOrganization?.logo ?? null,
    },
    location: {
      streetAddress: address.streetAddress ?? "",
      city: address.addressLocality ?? "",
      postalCode: address.postalCode ?? "",
      country: address.addressCountry ?? "",
    },
  }
}

export const detail = defineCommand({
  name: "detail",
  description: "Full detail for a single job posting (parses JSON-LD from the job page)",
  options: {
    format: option(z.enum(["json", "plain"]).default("json"), {
      description: "Output format (json|plain)",
    }),
  },
  async handler({ flags, positional }) {
    const input = positional[0]
    if (!input) {
      writeError("detail requires a job <id>", "MISSING_REQUIRED")
      process.exit(1)
    }
    const id = normalizeId(input)
    if (!id) {
      writeError(`Could not parse a job ID from "${input}"`, "BAD_ID")
      process.exit(1)
    }

    try {
      const response = await fetchWithUA(`${BASE_URL}/job/${id}/`)
      if (response.status === 404) {
        writeError("Job not found", "NOT_FOUND")
        process.exit(1)
      }
      if (!response.ok) {
        writeError(`Failed to fetch job page: ${response.status} ${response.statusText}`, "API_ERROR")
        process.exit(1)
      }
      const html = await response.text()
      const posting = extractJobPosting(html)
      if (!posting) {
        writeError("No JSON-LD found on job page", "PARSE_ERROR")
        process.exit(1)
      }
      const job = toDetail(posting, id)

      if (flags.format === "plain") {
        const lines = [
          job.title,
          `${job.company.name || "—"} · ${[job.location.city, job.location.country].filter(Boolean).join(", ") || "—"}`,
          "",
          job.employmentType.length ? `Employment: ${job.employmentType.join(", ")}` : "",
          job.datePosted ? `Posted: ${job.datePosted}` : "",
          job.deadline ? `Deadline: ${job.deadline}` : "",
          "",
          stripHtml(job.description) || "(no description)",
          "",
          `URL: ${job.url}`,
        ].filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
        process.stdout.write(lines.join("\n") + "\n")
      } else {
        process.stdout.write(JSON.stringify(job, null, 2) + "\n")
      }
    } catch (e) {
      writeError(e instanceof Error ? e.message : String(e), "API_ERROR")
      process.exit(1)
    }
  },
})
