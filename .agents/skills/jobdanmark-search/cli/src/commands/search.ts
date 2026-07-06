import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { BASE_URL, apiPost, writeError } from "../helpers.js"

const JOB_TYPES = ["fuldtid", "deltid", "fleksjob", "elev", "studiejob", "praktik"] as const

interface SearchFilter {
  type: string
  value: string | number
  displayText: string
}

interface SearchRequestBody {
  jobTypes: string[]
  filters: SearchFilter[]
  locationMode: string
  distance: number
}

interface RawResult {
  title: string
  companyName: string
  companyAddress: string | null
  jobTypes: string[]
  publishedDate: string
  applicationDeadline: string | null
  url: string
  [key: string]: unknown
}

interface SearchResponse {
  meta: {
    currentPage: number
    totalItems: number
    itemsPrPage: number
    totalPages: number
  }
  results: RawResult[]
}

/** Normalize the relative API url to a full URL and derive the slug. */
function normalizeResult(raw: RawResult): RawResult & { slug: string } {
  const relative = raw.url || ""
  const url = relative.startsWith("http") ? relative : `${BASE_URL}${relative}`
  const slug = url.match(/\/job\/([^/?#]+)/)?.[1] ?? ""
  return { ...raw, url, slug }
}

function renderTable(results: Array<RawResult & { slug: string }>): string {
  if (results.length === 0) return "No results."
  const header =
    "SLUG".padEnd(40) +
    " " +
    "TITLE".padEnd(42) +
    " " +
    "COMPANY".padEnd(26) +
    " DEADLINE"
  const rows = results.map((r) => {
    const slug = r.slug.slice(0, 40).padEnd(40)
    const title = r.title.slice(0, 42).padEnd(42)
    const company = (r.companyName || "—").slice(0, 26).padEnd(26)
    return `${slug} ${title} ${company} ${r.applicationDeadline || "—"}`
  })
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

function renderPlain(results: Array<RawResult & { slug: string }>): string {
  if (results.length === 0) return "No results."
  return results
    .map(
      (r) =>
        `${r.title}\n  ${r.companyName || "—"} · ${r.jobTypes.join(", ") || "—"}\n  published: ${r.publishedDate} · deadline: ${r.applicationDeadline || "—"}\n  slug: ${r.slug}\n  ${r.url}`,
    )
    .join("\n\n")
}

export const search = defineCommand({
  name: "search",
  description: "Search job listings on Jobdanmark.dk (30 results per page)",
  options: {
    text: option(z.string().optional(), {
      description: "Free-text keyword search (job title, keyword)",
    }),
    category: option(z.coerce.number().int().optional(), {
      description: "Category ID (see `categories` command)",
    }),
    "jobtitle-id": option(z.coerce.number().int().optional(), {
      description: "Job title ID from `autocomplete` results",
    }),
    municipality: option(z.string().optional(), {
      description: "Municipality name, e.g. Odense, København",
    }),
    zip: option(z.string().optional(), {
      description: "Zip code, e.g. 5000",
    }),
    region: option(z.string().optional(), {
      description: "Region name",
    }),
    "job-type": option(z.string().optional(), {
      description: "Comma-separated job types: fuldtid,deltid,fleksjob,elev,studiejob,praktik",
    }),
    page: option(z.coerce.number().int().positive().default(1), {
      description: "Page number (30 items per page, server-enforced)",
    }),
    limit: option(z.coerce.number().int().positive().optional(), {
      description: "Cap total results returned by CLI (client-side)",
    }),
    format: option(z.enum(["json", "table", "plain"]).default("json"), {
      description: "Output format (json|table|plain)",
    }),
  },
  async handler({ flags }) {
    const jobTypes: string[] = []
    if (flags["job-type"]) {
      for (const raw of flags["job-type"].split(",")) {
        const jobType = raw.trim().toLowerCase()
        if (!jobType) continue
        if (!(JOB_TYPES as readonly string[]).includes(jobType)) {
          writeError(
            `Invalid --job-type "${jobType}" (valid: ${JOB_TYPES.join(", ")})`,
            "BAD_JOB_TYPE",
          )
          process.exit(1)
        }
        jobTypes.push(jobType)
      }
    }

    const filters: SearchFilter[] = []
    if (flags.text) {
      filters.push({ type: "freetext", value: flags.text, displayText: flags.text })
    }
    if (flags.category !== undefined) {
      filters.push({ type: "category", value: flags.category, displayText: String(flags.category) })
    }
    if (flags["jobtitle-id"] !== undefined) {
      filters.push({
        type: "jobtitle",
        value: flags["jobtitle-id"],
        displayText: String(flags["jobtitle-id"]),
      })
    }
    if (flags.municipality) {
      filters.push({ type: "municipality", value: flags.municipality, displayText: flags.municipality })
    }
    if (flags.zip) {
      filters.push({ type: "zipcode", value: flags.zip, displayText: flags.zip })
    }
    if (flags.region) {
      filters.push({ type: "region", value: flags.region, displayText: flags.region })
    }

    const body: SearchRequestBody = {
      jobTypes,
      filters,
      locationMode: "Text",
      distance: 50,
    }

    try {
      const response = await apiPost<SearchResponse>(`/api/jobsearch/search/${flags.page}`, body)
      let results = (response.results ?? []).map(normalizeResult)
      if (flags.limit && flags.limit > 0) results = results.slice(0, flags.limit)

      if (flags.format === "table") {
        process.stdout.write(renderTable(results) + "\n")
      } else if (flags.format === "plain") {
        process.stdout.write(renderPlain(results) + "\n")
      } else {
        process.stdout.write(
          JSON.stringify({ meta: response.meta, results }, null, 2) + "\n",
        )
      }
    } catch (e) {
      writeError(e instanceof Error ? e.message : String(e), "API_ERROR")
      process.exit(1)
    }
  },
})
