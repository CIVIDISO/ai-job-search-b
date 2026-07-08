import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { apiFetch, parseHitCount, parseJobCards, writeError, type JobCard } from "../helpers.js"

/**
 * Response from /jobsoegning.json. The interesting payload is HTML blobs:
 * result_list_box_html holds the job cards, and the hit count appears as
 * "Viser 1-20 af <strong>N</strong>" in one of the HTML fragments.
 */
interface JobsearchResponse {
  result_list_box_html?: string
  hitcount_html?: string
  result_hitcount_html?: string
  [key: string]: unknown
}

function renderTable(cards: JobCard[]): string {
  if (cards.length === 0) return "No results."
  const header =
    "ID".padEnd(10) +
    " " +
    "TITLE".padEnd(46) +
    " " +
    "COMPANY".padEnd(26) +
    " " +
    "LOCATION".padEnd(20) +
    " DATE"
  const rows = cards.map((c) => {
    const title = (c.title || "").slice(0, 46).padEnd(46)
    const company = (c.company || "—").slice(0, 26).padEnd(26)
    const location = (c.location || "—").slice(0, 20).padEnd(20)
    return `${c.id.padEnd(10)} ${title} ${company} ${location} ${c.date || "—"}`
  })
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

function renderPlain(cards: JobCard[]): string {
  if (cards.length === 0) return "No results."
  return cards
    .map(
      (c) =>
        `${c.title}\n  ${c.company || "—"} · ${c.location || "—"} · ${c.date || "—"}\n  id: ${c.id}\n  ${c.url}`,
    )
    .join("\n\n")
}

export const search = defineCommand({
  name: "search",
  description: "Search for job listings on Jobindex.dk (20 results per page)",
  options: {
    query: option(z.string().optional(), {
      short: "q",
      description: "Keyword search query (job title, skill, company, city)",
    }),
    page: option(z.coerce.number().int().positive().default(1), {
      description: "Page number (1-indexed)",
    }),
    jobage: option(z.coerce.number().int().positive().default(9999), {
      description: "Max age of posting in days: 1, 7, 14, 30, or 9999 (all)",
    }),
    sort: option(z.enum(["score", "date"]).default("score"), {
      description: "Sort order: score (relevance) or date (newest first)",
    }),
    limit: option(z.coerce.number().int().positive().optional(), {
      description: "Cap total results returned by the CLI (client-side)",
    }),
    format: option(z.enum(["json", "table", "plain"]).default("json"), {
      description: "Output format (json|table|plain)",
    }),
  },
  async handler({ flags }) {
    const params: Record<string, string> = {
      page: String(flags.page),
    }
    if (flags.query) params.q = flags.query
    if (flags.jobage !== 9999) params.jobage = String(flags.jobage)
    if (flags.sort !== "score") params.sort = flags.sort

    try {
      const response = await apiFetch<JobsearchResponse>("/jobsoegning.json", params)
      const listHtml = response.result_list_box_html ?? ""
      let cards = parseJobCards(listHtml)
      const total =
        parseHitCount(response.hitcount_html ?? "") ||
        parseHitCount(response.result_hitcount_html ?? "") ||
        parseHitCount(listHtml)
      if (flags.limit && flags.limit > 0) cards = cards.slice(0, flags.limit)

      if (flags.format === "table") {
        process.stdout.write(renderTable(cards) + "\n")
      } else if (flags.format === "plain") {
        process.stdout.write(renderPlain(cards) + "\n")
      } else {
        process.stdout.write(
          JSON.stringify(
            { meta: { total, page: flags.page, perPage: 20 }, results: cards },
            null,
            2,
          ) + "\n",
        )
      }
    } catch (e) {
      writeError(e instanceof Error ? e.message : String(e), "API_ERROR")
      process.exit(1)
    }
  },
})
