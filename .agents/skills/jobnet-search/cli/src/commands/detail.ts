import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { apiFetch, stripHtml, writeError } from "../helpers.js"

interface JobAdDetail {
  id: string
  title: string
  body: string
  publicationDateTime: string
  unpublicationDateTime: string
  employer: {
    cvrNumber: string
    name: string
    [key: string]: unknown
  }
  job: {
    type: string
    address: {
      streetName: string
      city: string
      postalCode: string
      municipality: string
      countryCode: string
      countryName: string
    }
    isPartTime: boolean
    preferredLabelDa: string
    [key: string]: unknown
  }
  application: {
    deadlineDate: string
    availablePositions: number
    contactPersons: Array<{ firstNames: string; lastName: string; phoneNumber: string }>
    url: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

/** Accept a bare jobAdId UUID or a jobnet.dk/job/{id} URL. */
function normalizeId(input: string): string | null {
  const uuid = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
  return uuid ? uuid[0] : null
}

export const detail = defineCommand({
  name: "detail",
  description: "Full detail for a single job ad",
  options: {
    format: option(z.enum(["json", "plain"]).default("json"), {
      description: "Output format (json|plain)",
    }),
  },
  async handler({ flags, positional }) {
    const input = positional[0]
    if (!input) {
      writeError("detail requires a job ad <id>", "MISSING_REQUIRED")
      process.exit(1)
    }
    const id = normalizeId(input)
    if (!id) {
      writeError(`Could not parse a job ad UUID from "${input}"`, "BAD_ID")
      process.exit(1)
    }

    try {
      // incrementViews=false avoids polluting the ad's view counter.
      const job = await apiFetch<JobAdDetail>(`/FindJob/JobAdDetails/${id}`, {
        incrementViews: "false",
      })

      if (flags.format === "plain") {
        const address = job.job?.address
        const location = address
          ? [address.streetName, `${address.postalCode ?? ""} ${address.city ?? ""}`.trim()]
              .filter(Boolean)
              .join(", ")
          : ""
        const contacts = (job.application?.contactPersons ?? [])
          .map((c) => `${c.firstNames} ${c.lastName}${c.phoneNumber ? ` (${c.phoneNumber})` : ""}`)
          .join(", ")
        const lines = [
          job.title,
          `${job.employer?.name || "—"} · ${location || "—"}`,
          "",
          job.job?.preferredLabelDa ? `Occupation: ${job.job.preferredLabelDa}` : "",
          job.publicationDateTime ? `Posted: ${job.publicationDateTime.slice(0, 10)}` : "",
          job.application?.deadlineDate
            ? `Deadline: ${job.application.deadlineDate.slice(0, 10)}`
            : "",
          contacts ? `Contact: ${contacts}` : "",
          job.application?.url ? `Apply: ${job.application.url}` : "",
          "",
          stripHtml(job.body ?? "") || "(no description)",
          "",
          `URL: https://jobnet.dk/job/${job.id ?? id}`,
        ].filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
        process.stdout.write(lines.join("\n") + "\n")
      } else {
        process.stdout.write(JSON.stringify(job, null, 2) + "\n")
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      if (message.includes("404")) {
        writeError("Job ad not found", "NOT_FOUND")
      } else {
        writeError(message, "API_ERROR")
      }
      process.exit(1)
    }
  },
})
