import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { BASE_URL, stripHtml, writeError } from "../helpers.js"

interface JobDetail {
  slug: string
  url: string
  title: string
  datePosted: string | null
  validThrough: string | null
  employmentType: string[]
  hiringOrganization: {
    name: string | null
    logo: string | null
  }
  jobLocation: {
    streetAddress: string | null
    addressLocality: string | null
    addressRegion: string | null
    postalCode: string | null
    addressCountry: string | null
  }
  description: string
}

/** Accept a bare slug or a full jobdanmark.dk job URL. */
function normalizeSlug(input: string): string | null {
  const fromUrl = input.match(/jobdanmark\.dk\/job\/([^/?#]+)/)
  if (fromUrl) return fromUrl[1]
  if (/^[a-z0-9æøå-]+$/i.test(input)) return input
  return null
}

async function fetchJobPage(slug: string): Promise<string | null> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(`${BASE_URL}/job/${slug}`)
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((resolve) => setTimeout(resolve, delay + jitter))
      delay = Math.min(delay * 2, 5000)
      continue
    }
    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    return response.text()
  }
  throw new Error("API request failed after max retries")
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
    const candidates = Array.isArray(data) ? data : [data]
    for (const candidate of candidates) {
      if (candidate && typeof candidate === "object" && (candidate as any)["@type"] === "JobPosting") {
        return candidate as Record<string, any>
      }
    }
  }
  return null
}

function toDetail(posting: Record<string, any>, slug: string): JobDetail {
  const address = posting.jobLocation?.address ?? {}
  const employmentType = posting.employmentType
    ? Array.isArray(posting.employmentType)
      ? posting.employmentType
      : [posting.employmentType]
    : []
  return {
    slug,
    url: `${BASE_URL}/job/${slug}`,
    title: posting.title ?? "",
    datePosted: posting.datePosted ?? null,
    validThrough: posting.validThrough ?? null,
    employmentType,
    hiringOrganization: {
      name: posting.hiringOrganization?.name ?? null,
      logo: posting.hiringOrganization?.logo ?? null,
    },
    jobLocation: {
      streetAddress: address.streetAddress ?? null,
      addressLocality: address.addressLocality ?? null,
      addressRegion: address.addressRegion ?? null,
      postalCode: address.postalCode ?? null,
      addressCountry: address.addressCountry ?? null,
    },
    description: posting.description ?? "",
  }
}

export const detail = defineCommand({
  name: "detail",
  description: "Full detail for a single job posting (by slug)",
  options: {
    format: option(z.enum(["json", "plain"]).default("json"), {
      description: "Output format (json|plain)",
    }),
  },
  async handler({ flags, positional }) {
    const input = positional[0]
    if (!input) {
      writeError("detail requires a job <slug>", "MISSING_REQUIRED")
      process.exit(1)
    }
    const slug = normalizeSlug(input)
    if (!slug) {
      writeError(`Could not parse a job slug from "${input}"`, "BAD_SLUG")
      process.exit(1)
    }

    try {
      const html = await fetchJobPage(slug)
      if (html === null) {
        writeError("Job not found", "NOT_FOUND")
        process.exit(1)
      }
      const posting = extractJobPosting(html)
      if (!posting) {
        writeError("No JSON-LD found on job page", "PARSE_ERROR")
        process.exit(1)
      }
      const job = toDetail(posting, slug)

      if (flags.format === "plain") {
        const location = [
          job.jobLocation.addressLocality,
          job.jobLocation.addressRegion,
          job.jobLocation.addressCountry,
        ]
          .filter(Boolean)
          .join(", ")
        const lines = [
          job.title,
          `${job.hiringOrganization.name || "—"} · ${location || "—"}`,
          "",
          job.employmentType.length ? `Employment: ${job.employmentType.join(", ")}` : "",
          job.datePosted ? `Posted: ${job.datePosted}` : "",
          job.validThrough ? `Deadline: ${job.validThrough}` : "",
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
