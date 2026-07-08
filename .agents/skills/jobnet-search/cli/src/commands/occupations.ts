import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { apiFetch, writeError } from "../helpers.js"

interface OccupationAlias {
  aliasIdentifier: string
  conceptUriDa: string
  alternativeLabelDa: string
}

interface Occupation {
  conceptUriDa: string
  preferredLabelDa: string
  aliases: OccupationAlias[]
}

/** The UUID at the end of an ESCO concept URI — usable as an occupation filter seed. */
function conceptId(uri: string): string {
  return uri.split("/").pop() ?? uri
}

function renderTable(occupations: Occupation[]): string {
  if (occupations.length === 0) return "No occupations."
  const header = "LABEL".padEnd(40) + " CONCEPT_ID"
  const rows = occupations.map(
    (o) => `${o.preferredLabelDa.slice(0, 40).padEnd(40)} ${conceptId(o.conceptUriDa)}`,
  )
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

function renderPlain(occupations: Occupation[]): string {
  if (occupations.length === 0) return "No occupations."
  return occupations
    .map((o) => {
      const aliases = (o.aliases ?? []).map((a) => a.alternativeLabelDa).filter(Boolean)
      return (
        `${o.preferredLabelDa}\n  concept: ${o.conceptUriDa}` +
        (aliases.length ? `\n  aliases: ${aliases.join(", ")}` : "")
      )
    })
    .join("\n\n")
}

export const occupations = defineCommand({
  name: "occupations",
  description: "Search occupation types (for building search filters)",
  options: {
    "search-string": option(z.string().optional(), {
      description: "Search term for occupation, e.g. sygeplejerske (required)",
    }),
    "per-page": option(z.coerce.number().int().positive().default(10), {
      description: "Max results to return",
    }),
    format: option(z.enum(["json", "table", "plain"]).default("json"), {
      description: "Output format (json|table|plain)",
    }),
  },
  async handler({ flags }) {
    if (!flags["search-string"]) {
      writeError("--search-string is required", "MISSING_REQUIRED")
      process.exit(1)
    }

    try {
      const result = await apiFetch<Occupation[]>("/OccupationSearch", {
        SearchString: flags["search-string"],
        ResultsPerPage: String(flags["per-page"]),
      })
      const occupations = (result ?? []).slice(0, flags["per-page"])

      if (flags.format === "table") {
        process.stdout.write(renderTable(occupations) + "\n")
      } else if (flags.format === "plain") {
        process.stdout.write(renderPlain(occupations) + "\n")
      } else {
        process.stdout.write(JSON.stringify(occupations, null, 2) + "\n")
      }
    } catch (e) {
      writeError(e instanceof Error ? e.message : String(e), "API_ERROR")
      process.exit(1)
    }
  },
})
