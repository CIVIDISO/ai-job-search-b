# Search Queries for Job Scraper

<!-- Populated by /setup 2026-07-06 for Brandon McCray — Applied AI Engineer, Seattle, WA, USA.
     NOTE: The framework's built-in Danish portal CLIs (jobindex, jobbank, jobdanmark, jobnet) do not
     apply to the US market. The usable built-in tool is linkedin-search (country-agnostic). Everything
     else below runs through WebSearch/site: queries. -->

## Search Sites

Primary (US market):
- **linkedin.com/jobs** — via the `linkedin-search` CLI: `bun run .agents/skills/linkedin-search/cli/src/cli.ts search -l "Seattle, Washington, United States" --query "<title>"`
- **Company career pages** — Greenhouse (`boards.greenhouse.io`), Lever (`jobs.lever.co`), Ashby (`jobs.ashbyhq.com`) via site: searches
- **builtinseattle.com** — Seattle startup jobs
- **wellfound.com** — startup/AI roles
- **hiring.cafe / otta.com** — curated tech roles

Secondary:
- Direct Google `site:` searches for target companies
- **indeed.com** (broad net)

## Query Categories

Combine each query with location terms ("Seattle", "Bellevue", "Redmond", "Remote US") where the site supports it.

### Priority 1: Remote Contract / Part-Time / Internship AI roles

Primary goal (confirmed 2026-07-08): remote work that runs alongside the current job, funding the M.S.

```
linkedin-search: --query "AI engineer contract" -l "United States" --remote remote
linkedin-search: --query "machine learning intern" -l "United States" --remote remote
linkedin-search: --query "AI engineer part time" -l "United States" --remote remote
linkedin-search: --query "LLM engineer" -l "United States" --remote remote
site:boards.greenhouse.io "machine learning intern" remote
site:jobs.ashbyhq.com intern AI remote
"AI engineer" contract part-time site:wellfound.com
```

Also maintain platform profiles (not scrapeable — direct signup): Toptal, Lemon.io, Braintrust, Contra, Upwork.

### Priority 1b: Applied AI / AI Engineer (full-time remote — only exceptional fits)

```
linkedin-search: --query "Applied AI Engineer" -l "Seattle, Washington, United States"
linkedin-search: --query "AI Engineer" -l "Seattle, Washington, United States"
site:boards.greenhouse.io "applied AI engineer"
site:jobs.lever.co "AI engineer" LLM
site:jobs.ashbyhq.com "AI engineer"
```

### Priority 2: LLM Product / Automation Domain

Domain expertise: LLM pipelines for business-workflow automation.

```
linkedin-search: --query "generative AI engineer" -l "Seattle, Washington, United States"
linkedin-search: --query "AI automation engineer" -l "United States" --remote remote
site:linkedin.com/jobs "LLM" "structured extraction" OR "document intelligence"
site:boards.greenhouse.io "AI integration" engineer
"prompt engineering" engineer site:jobs.lever.co
```

### Priority 3: Adjacent — Forward-Deployed / Solutions / Full-Stack AI

Roles the profile pivots into naturally (customer-facing engineering + business fluency).

```
linkedin-search: --query "Forward Deployed Engineer" -l "United States"
linkedin-search: --query "Solutions Engineer AI" -l "Seattle, Washington, United States"
linkedin-search: --query "Full Stack Engineer AI" -l "Seattle, Washington, United States"
site:boards.greenhouse.io "forward deployed"
```

### Priority 4: Broader Technical (wider net)

```
linkedin-search: --query "Software Engineer TypeScript React" -l "Seattle, Washington, United States"
linkedin-search: --query "Machine Learning Engineer" -l "Seattle, Washington, United States"
site:builtinseattle.com "AI" engineer
```

## Location Filter

<!-- Confirmed 2026-07-08 -->
- Remote-US, async-friendly (ideal — must run alongside current job)
- Seattle / Bellevue / Redmond hybrid (acceptable — absolute maximum in-office commitment)
- On-site anywhere, or roles with rigid core-hours in-seat requirements (fail)
- Anything requiring relocation (fail)

## Date Filter

Only include jobs posted within the last 14 days, or with an application deadline that has not yet passed. If a posting date cannot be determined, include it but flag as "date unknown". For linkedin-search, pass `--jobage 14`.

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also generate 2-3 custom queries for that focus. For example:
- "/scrape agents" → Priority 1 queries + "AI agents engineer", "agentic workflows"
- "/scrape fintech" → Priority 2 queries + "AI engineer fintech", "LLM financial services"
