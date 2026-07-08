import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import {
  BASE_URL,
  extractJobIdFromUrl,
  fetchWithUA,
  parseRssDescription,
  rssFetch,
  writeError,
  type RssItem,
} from "../helpers.js"

interface JobResult {
  id: string
  title: string
  company: string
  location: string
  jobType: string
  description: string
  url: string
  posted: string
  deadline: string | null
}

/** Normalize an RFC 822 pubDate to ISO 8601. Returns the input on parse failure. */
function toIso(pubDate: string): string {
  const d = new Date(pubDate)
  return Number.isNaN(d.getTime()) ? pubDate : d.toISOString()
}

/** Normalize a DD.MM.YYYY deadline to YYYY-MM-DD. Returns the input if it doesn't match. */
function normalizeDeadline(deadline: string | null): string | null {
  if (!deadline) return null
  const m = deadline.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : deadline
}

function toResult(item: RssItem): JobResult {
  const parsed = parseRssDescription(item.description)
  return {
    id: extractJobIdFromUrl(item.link),
    title: item.title,
    company: parsed.company,
    location: parsed.location,
    jobType: parsed.jobType,
    description: item.description,
    url: item.link,
    posted: toIso(item.pubDate),
    deadline: normalizeDeadline(parsed.deadline),
  }
}

/**
 * The RSS feed is capped at 100 items and carries no total count. The true
 * total appears in the HTML search page <title> as "{N} relevante job og
 * karriereopslag" — fetch it in a secondary request, null on any failure.
 */
async function fetchTotal(params: Record<string, string | string[]>): Promise<number | null> {
  try {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const v of value) searchParams.append(key, v)
      } else {
        searchParams.append(key, value)
      }
    }
    const response = await fetchWithUA(`${BASE_URL}/job/?${searchParams.toString()}`)
    if (!response.ok) return null
    const html = await response.text()
    const match = html.match(/<title>[^<]*?([\d.]+)\s+relevante job/i)
    if (!match) return null
    const total = parseInt(match[1].replace(/\./g, ""), 10)
    return Number.isNaN(total) ? null : total
  } catch {
    return null
  }
}

function renderTable(results: JobResult[]): string {
  if (results.length === 0) return "No results."
  const header =
    "ID".padEnd(8) +
    " " +
    "TITLE".padEnd(46) +
    " " +
    "COMPANY".padEnd(26) +
    " " +
    "LOCATION".padEnd(20) +
    " DEADLINE"
  const rows = results.map((r) => {
    const title = r.title.slice(0, 46).padEnd(46)
    const company = (r.company || "—").slice(0, 26).padEnd(26)
    const location = (r.location || "—").slice(0, 20).padEnd(20)
    return `${r.id.padEnd(8)} ${title} ${company} ${location} ${r.deadline || "løbende"}`
  })
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

function renderPlain(results: JobResult[]): string {
  if (results.length === 0) return "No results."
  return results
    .map(
      (r) =>
        `${r.title}\n  ${r.company || "—"} · ${r.location || "—"} · ${r.jobType || "—"}\n  deadline: ${r.deadline || "løbende"}\n  id: ${r.id}\n  ${r.url}`,
    )
    .join("\n\n")
}

export const search = defineCommand({
  name: "search",
  description: "Search job listings on Akademikernes Jobbank (RSS feed, max 100 results)",
  options: {
    key: option(z.string().optional(), {
      description: "Keyword search (title, company, keyword)",
    }),
    exclude: option(z.string().optional(), {
      description: "Exclude keywords from results",
    }),
    type: option(z.array(z.string()).optional(), {
      description: "Job type code, e.g. 3=Fuldtidsjob, 6=Graduate/trainee (repeatable)",
      repeatable: true,
    }),
    location: option(z.array(z.string()).optional(), {
      description: "Region code, e.g. 2=Storkøbenhavn, 8=Østjylland (repeatable)",
      repeatable: true,
    }),
    "work-area": option(z.array(z.string()).optional(), {
      description: "Work area code, e.g. 31=IT-Software, 43=Data & Analyse (repeatable)",
      repeatable: true,
    }),
    industry: option(z.array(z.string()).optional(), {
      description: "Industry code, e.g. 10331=IT & Tele (repeatable)",
      repeatable: true,
    }),
    education: option(z.array(z.string()).optional(), {
      description: "Education area code, e.g. 24=IT (repeatable)",
      repeatable: true,
    }),
    remote: option(z.enum(["helt", "delvist"]).optional(), {
      description: "Remote work: helt (fully) or delvist (partially)",
    }),
    "suitable-for": option(z.array(z.string()).optional(), {
      description: "Suitability code: 2=Nyuddannede, 4=International baggrund, 5=Erfarne (repeatable)",
      repeatable: true,
    }),
    company: option(z.string().optional(), {
      description: "Filter by company ID",
    }),
    since: option(z.string().optional(), {
      description: "Jobs posted on or after this date (YYYY-MM-DD)",
    }),
    limit: option(z.coerce.number().int().positive().optional(), {
      description: "Cap results returned by the CLI",
    }),
    format: option(z.enum(["json", "table", "plain"]).default("json"), {
      description: "Output format (json|table|plain)",
    }),
  },
  async handler({ flags }) {
    const params: Record<string, string | string[]> = {}
    if (flags.key) params.key = flags.key
    if (flags.exclude) params.antikey = flags.exclude
    if (flags.type?.length) params.cvtype = flags.type
    if (flags.location?.length) params.amt = flags.location
    if (flags["work-area"]?.length) params.erf = flags["work-area"]
    if (flags.industry?.length) params.branche = flags.industry
    if (flags.education?.length) params.udd = flags.education
    if (flags.remote) params.fjernarbejde = flags.remote
    if (flags["suitable-for"]?.length) params.andet = flags["suitable-for"]
    if (flags.company) params.virk = flags.company
    if (flags.since) params.oprettet = flags.since

    if (Object.keys(params).length === 0) {
      writeError("--key or at least one filter is required", "MISSING_REQUIRED")
      process.exit(1)
    }

    try {
      const items = await rssFetch(params)
      let results = items.map(toResult)
      if (flags.limit && flags.limit > 0) results = results.slice(0, flags.limit)

      if (flags.format === "table") {
        process.stdout.write(renderTable(results) + "\n")
      } else if (flags.format === "plain") {
        process.stdout.write(renderPlain(results) + "\n")
      } else {
        const total = await fetchTotal(params)
        process.stdout.write(JSON.stringify({ meta: { total }, results }, null, 2) + "\n")
      }
    } catch (e) {
      writeError(e instanceof Error ? e.message : String(e), "API_ERROR")
      process.exit(1)
    }
  },
})
