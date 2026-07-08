import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { apiFetch, writeError } from "../helpers.js"
import { limitGroups, renderGroupPlain, renderGroupTable } from "./autocomplete.js"

interface SuggestionItem {
  id: string
  text: string
  value: number | string
  category: string
  slug: string
}

interface SuggestionGroup {
  title: string
  items: SuggestionItem[]
}

export const locations = defineCommand({
  name: "locations",
  description: "Suggest municipalities, zip codes, and regions for a query",
  options: {
    query: option(z.string().optional(), {
      description: "Location text to search: city, zip code, region (required)",
    }),
    limit: option(z.coerce.number().int().positive().optional(), {
      description: "Cap total suggestions returned",
    }),
    format: option(z.enum(["json", "table", "plain"]).default("json"), {
      description: "Output format (json|table|plain)",
    }),
  },
  async handler({ flags }) {
    if (!flags.query) {
      writeError("--query is required", "MISSING_REQUIRED")
      process.exit(1)
    }

    try {
      const groups = await apiFetch<SuggestionGroup[]>("/api/search/locations", {
        q: flags.query,
      })
      const result = limitGroups(groups, flags.limit)

      if (flags.format === "table") {
        process.stdout.write(renderGroupTable(result) + "\n")
      } else if (flags.format === "plain") {
        process.stdout.write(renderGroupPlain(result) + "\n")
      } else {
        process.stdout.write(JSON.stringify(result, null, 2) + "\n")
      }
    } catch (e) {
      writeError(e instanceof Error ? e.message : String(e), "API_ERROR")
      process.exit(1)
    }
  },
})
