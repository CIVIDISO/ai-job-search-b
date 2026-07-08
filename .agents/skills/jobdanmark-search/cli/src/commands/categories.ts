import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { apiFetch, writeError } from "../helpers.js"

interface Category {
  id: number
  title: string
  helpText: string
  count: number
}

function renderTable(categories: Category[]): string {
  if (categories.length === 0) return "No categories."
  const header = "ID".padEnd(8) + " " + "TITLE".padEnd(50) + " COUNT"
  const rows = categories.map(
    (c) => `${String(c.id).padEnd(8)} ${c.title.slice(0, 50).padEnd(50)} ${c.count}`,
  )
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

function renderPlain(categories: Category[]): string {
  if (categories.length === 0) return "No categories."
  return categories.map((c) => `${c.id}  ${c.title} (${c.count})\n  ${c.helpText}`).join("\n\n")
}

export const categories = defineCommand({
  name: "categories",
  description: "List all job categories with live counts",
  options: {
    limit: option(z.coerce.number().int().positive().optional(), {
      description: "Cap number of categories returned",
    }),
    format: option(z.enum(["json", "table", "plain"]).default("json"), {
      description: "Output format (json|table|plain)",
    }),
  },
  async handler({ flags }) {
    try {
      let result = await apiFetch<Category[]>("/api/categorycount/getcounts")
      if (flags.limit && flags.limit > 0) result = result.slice(0, flags.limit)

      if (flags.format === "table") {
        process.stdout.write(renderTable(result) + "\n")
      } else if (flags.format === "plain") {
        process.stdout.write(renderPlain(result) + "\n")
      } else {
        process.stdout.write(JSON.stringify(result, null, 2) + "\n")
      }
    } catch (e) {
      writeError(e instanceof Error ? e.message : String(e), "API_ERROR")
      process.exit(1)
    }
  },
})
