import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { apiFetch, writeError } from "../helpers.js"

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

/** Cap the total number of items across groups, dropping emptied groups. */
export function limitGroups(groups: SuggestionGroup[], limit?: number): SuggestionGroup[] {
  if (!limit || limit <= 0) return groups
  let remaining = limit
  const capped: SuggestionGroup[] = []
  for (const group of groups) {
    if (remaining <= 0) break
    const items = group.items.slice(0, remaining)
    remaining -= items.length
    if (items.length > 0) capped.push({ ...group, items })
  }
  return capped
}

export function renderGroupTable(groups: SuggestionGroup[]): string {
  const rows: string[] = []
  for (const group of groups) {
    for (const item of group.items) {
      rows.push(
        `${String(item.value).padEnd(10)} ${item.category.padEnd(14)} ${item.text.slice(0, 44).padEnd(44)} ${group.title}`,
      )
    }
  }
  if (rows.length === 0) return "No suggestions."
  const header = "VALUE".padEnd(10) + " " + "CATEGORY".padEnd(14) + " " + "TEXT".padEnd(44) + " GROUP"
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

export function renderGroupPlain(groups: SuggestionGroup[]): string {
  if (groups.length === 0) return "No suggestions."
  return groups
    .map(
      (g) =>
        `${g.title}:\n` + g.items.map((i) => `  ${i.text} (${i.category}: ${i.value})`).join("\n"),
    )
    .join("\n\n")
}

export const autocomplete = defineCommand({
  name: "autocomplete",
  description: "Suggest job titles and categories for a query",
  options: {
    query: option(z.string().optional(), {
      description: "Search text to autocomplete (required)",
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
      const groups = await apiFetch<SuggestionGroup[]>("/api/search/autocomplete", {
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
