import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { apiFetch, writeError } from "../helpers.js"

export const suggestions = defineCommand({
  name: "suggestions",
  description: "Typeahead suggestions for job title / keyword search",
  options: {
    query: option(z.string().optional(), {
      description: "Partial search string to complete (required)",
    }),
    limit: option(z.coerce.number().int().positive().optional(), {
      description: "Cap number of suggestions returned",
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
      let result = await apiFetch<string[]>("/FindJob/GetTypeaheadSuggestions", {
        SearchString: flags.query,
      })
      if (flags.limit && flags.limit > 0) result = result.slice(0, flags.limit)

      if (flags.format === "table" || flags.format === "plain") {
        process.stdout.write((result.length ? result.join("\n") : "No suggestions.") + "\n")
      } else {
        process.stdout.write(JSON.stringify(result, null, 2) + "\n")
      }
    } catch (e) {
      writeError(e instanceof Error ? e.message : String(e), "API_ERROR")
      process.exit(1)
    }
  },
})
