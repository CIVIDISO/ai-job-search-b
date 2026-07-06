import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { apiFetch, writeError } from "../helpers.js"

interface JobAd {
  jobAdId: string
  title: string
  hiringOrgName: string
  occupation: string
  municipality: string
  postalCode: number
  postalDistrictName: string
  country: string
  publicationDate: string
  applicationDeadline: string
  workHourPartTime: boolean
  [key: string]: unknown
}

interface SearchResponse {
  meta: {
    totalJobAdCount: number
    pageNumber: number
    resultsPerPage: number
    searchString: string
  }
  facets: Record<string, unknown>
  results: JobAd[]
}

const REGIONS = [
  "HovedstadenOgBornholm",
  "Midtjylland",
  "Syddanmark",
  "OevrigeSjaelland",
  "Nordjylland",
] as const

function renderTable(results: JobAd[]): string {
  if (results.length === 0) return "No results."
  const header =
    "ID".padEnd(37) +
    " " +
    "TITLE".padEnd(42) +
    " " +
    "COMPANY".padEnd(24) +
    " " +
    "CITY".padEnd(14) +
    " DEADLINE"
  const rows = results.map((r) => {
    const title = (r.title || "").slice(0, 42).padEnd(42)
    const company = (r.hiringOrgName || "—").slice(0, 24).padEnd(24)
    const city = (r.municipality || "—").slice(0, 14).padEnd(14)
    const deadline = r.applicationDeadline ? r.applicationDeadline.slice(0, 10) : "—"
    return `${r.jobAdId.padEnd(37)} ${title} ${company} ${city} ${deadline}`
  })
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

function renderPlain(results: JobAd[]): string {
  if (results.length === 0) return "No results."
  return results
    .map(
      (r) =>
        `${r.title}\n  ${r.hiringOrgName || "—"} · ${r.municipality || "—"} · ${r.occupation || "—"}\n  published: ${r.publicationDate?.slice(0, 10) || "—"} · deadline: ${r.applicationDeadline?.slice(0, 10) || "—"}\n  id: ${r.jobAdId}\n  https://jobnet.dk/job/${r.jobAdId}`,
    )
    .join("\n\n")
}

export const search = defineCommand({
  name: "search",
  description: "Search for job ads on Jobnet.dk",
  options: {
    "search-string": option(z.string().optional(), {
      description: "Free-text keyword search (job title, skills, employer)",
    }),
    region: option(z.enum(REGIONS).optional(), {
      description: `Region: ${REGIONS.join(", ")}`,
    }),
    "postal-code": option(z.string().optional(), {
      description: "Postal code for radius search, e.g. 2100",
    }),
    radius: option(z.coerce.number().int().positive().default(50), {
      description: "Radius in km from postal code (requires --postal-code)",
    }),
    "work-hours": option(z.enum(["FullTime", "PartTime"]).optional(), {
      description: "FullTime or PartTime",
    }),
    duration: option(z.enum(["Permanent", "Temporary"]).optional(), {
      description: "Permanent or Temporary",
    }),
    "job-type": option(z.enum(["Ordinaert", "Efterloenner", "Foertidspension"]).optional(), {
      description: "Announcement type: Ordinaert, Efterloenner, Foertidspension",
    }),
    "occupation-area": option(z.string().optional(), {
      description: "Occupation area identifier, e.g. 10000",
    }),
    "occupation-group": option(z.string().optional(), {
      description: "Occupation group identifier, e.g. 10060",
    }),
    page: option(z.coerce.number().int().positive().default(1), {
      description: "Page number (1-indexed)",
    }),
    "per-page": option(z.coerce.number().int().positive().default(10), {
      description: "Results per page",
    }),
    limit: option(z.coerce.number().int().positive().optional(), {
      description: "Cap total results returned by CLI",
    }),
    order: option(z.enum(["PublicationDate", "BestMatch", "ApplicationDate"]).default("PublicationDate"), {
      description: "Sort order: PublicationDate, BestMatch, ApplicationDate",
    }),
    format: option(z.enum(["json", "table", "plain"]).default("json"), {
      description: "Output format (json|table|plain)",
    }),
  },
  async handler({ flags }) {
    if (flags.order === "BestMatch" && !flags["search-string"]) {
      writeError("--order BestMatch requires --search-string", "MISSING_REQUIRED")
      process.exit(1)
    }

    // PageNumber and ResultsPerPage must always be sent — omitting them while
    // providing SearchString makes the API return error 1014.
    const params: Record<string, string> = {
      PageNumber: String(flags.page),
      ResultsPerPage: String(flags["per-page"]),
      SortValue: flags.order,
    }
    if (flags["search-string"]) params.SearchString = flags["search-string"]
    if (flags.region) params.Region = flags.region
    if (flags["postal-code"]) {
      params.PostalCode = flags["postal-code"]
      params.Radius = String(flags.radius)
    }
    if (flags["work-hours"]) params.WorkHours = flags["work-hours"]
    if (flags.duration) params.EmploymentDuration = flags.duration
    if (flags["job-type"]) params.JobAnnouncementType = flags["job-type"]
    if (flags["occupation-area"]) params.OccupationAreas = flags["occupation-area"]
    if (flags["occupation-group"]) params.OccupationGroups = flags["occupation-group"]

    try {
      const response = await apiFetch<SearchResponse>("/FindJob/Search", params)
      let results = response.results ?? []
      if (flags.limit && flags.limit > 0) results = results.slice(0, flags.limit)

      if (flags.format === "table") {
        process.stdout.write(renderTable(results) + "\n")
      } else if (flags.format === "plain") {
        process.stdout.write(renderPlain(results) + "\n")
      } else {
        process.stdout.write(
          JSON.stringify({ meta: response.meta, facets: response.facets, results }, null, 2) + "\n",
        )
      }
    } catch (e) {
      writeError(e instanceof Error ? e.message : String(e), "API_ERROR")
      process.exit(1)
    }
  },
})
