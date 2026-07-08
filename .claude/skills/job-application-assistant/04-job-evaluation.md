# Job Evaluation Framework

<!-- SETUP: Skill match areas and career goals are personalized by running /setup -->

## Scoring Dimensions

Evaluate each job posting against these five dimensions:

### 1. Technical Skills Match (0-100)
How well do the required/preferred skills align with the candidate's capabilities?

| Score | Meaning |
|-------|---------|
| 80-100 | Core requirements are primary skills |
| 60-79 | Most requirements match, 1-2 gaps that are learnable |
| 40-59 | Partial match, significant upskilling needed |
| 0-39 | Fundamental mismatch |

**Strong match areas:** LLM application engineering (prompt pipelines, structured extraction, human-in-the-loop feedback), TypeScript/React full-stack, PostgreSQL/Supabase (RLS, multi-tenant, migrations), REST/DocuSign API integration, Python data tooling (Pandas/NumPy)
**Moderate match areas:** PyTorch/TensorFlow/scikit-learn model training (coursework, not production), NLP/Computer Vision (coursework), AWS, Power BI, RAG/vector search (adjacent to existing LLM work but not yet on record)
**Weak match areas:** Distributed systems at scale, ML research/publications, MLOps at scale (Kubernetes, model serving infra), Go/Java/C++, formal production model training pipelines

### 2. Experience Match (0-100)
Does work history align with what they're looking for?

| Score | Meaning |
|-------|---------|
| 80-100 | Direct experience in the same domain and role type |
| 60-79 | Related experience, transferable skills clear |
| 40-59 | Adjacent experience, would need to make the case |
| 0-39 | Unrelated experience |

**Strong:** Applied AI / LLM product engineering for business operations; full-stack SaaS (0→1, solo); vertical software for regulated/ops-heavy industries (agtech, logistics, compliance); finance-adjacent tooling
**Moderate:** Data analytics/BI roles; solutions/forward-deployed engineering (has the customer-facing + technical mix, no formal title yet); fintech (Bank of America background)
**Entry-level:** ML research engineering, platform/infra engineering, big-tech SDE ladders (no team-based SWE track record yet)

### 3. Behavioral/Culture Fit (0-100)
Does the role and company culture match the behavioral profile?

| Score | Meaning |
|-------|---------|
| 80-100 | Culture strongly matches behavioral preferences |
| 60-79 | Mixed signals but mostly compatible |
| 40-59 | Some friction areas |
| 0-39 | Significant culture mismatch |

**Red flags to research:** Department disorganization, work dominated by maintenance over development, poor chemistry with leadership, culture mismatches. Check reviews, media coverage, LinkedIn connections, and network contacts for insider perspective.

### 4. Location & Logistics (Pass/Fail + Notes)
<!-- Confirmed 2026-07-08: role must run ALONGSIDE the Perfect Blend day job (side income for the M.S.) -->
- Fully remote, async-friendly: PASS
- Remote with rigid 9-5 core-hours in-seat requirements: FLAG (may conflict with day job)
- Hybrid in Seattle metro: FLAG (discuss — absolute maximum)
- On-site, relocation, or exclusivity/moonlighting-prohibition clauses: FAIL (deal-breakers)
- Direct competitor of Perfect Blend (specialty agriculture/fertilizer ops software): FAIL (board-member conflict of interest)

**Compensation floors** (2026 US market, sources: Second Talent, Zen van Riel, ZipRecruiter/Glassdoor intern data):
- Contract/freelance: ≥ $60/hr floor, target $75–100/hr (junior-mid LLM freelance runs $75–125/hr)
- Paid internship: ≥ $30/hr (ML intern median ~$30/hr; engineer-intern ranges $51–81/hr at larger cos)
- Part-time W-2: ≥ $50/hr equivalent
- Full-time remote (only if exceptional): ≥ $130k base

### 5. Career Alignment & Motivation (0-100)
Does this role advance career goals and contain tasks that energize?

| Score | Meaning |
|-------|---------|
| 80-100 | Strongly aligned with career direction, clear growth path |
| 60-79 | Good role but only partially aligned with long-term goals |
| 40-59 | Decent job but doesn't build toward career goals |
| 0-39 | Dead end or backwards step |

**Career goals:**
- Near term (confirmed 2026-07-08): remote applied-AI work — contract, part-time, or internship — that supplements income for the M.S. without conflicting with the Perfect Blend role
- Benchmark his market value as someone already running production AI systems, against industry standards
- Join a real engineering team to gain peer review, mentorship, and team-scale practices after years of building solo
- Long term: senior applied-AI/product-engineering scope that keeps the business-strategy dimension

**Motivation filter:** Evaluate not just whether you *can* do the tasks, but whether the tasks will *energize* you. Consider:
- Tasks that energize: shipping LLM features end-to-end, automating real workflows, debugging gnarly integration problems, talking to the people who use the software *(inferred — [TODO: confirm])*
- Tasks that drain: [TODO: fill in]
- Non-task factors: leadership style, department culture, company values, degree of autonomy

**Life situation alignment:** Consider personal constraints:
- **Security**: currently employed — this search is for supplemental income (school costs), so he can be selective; "favorable" beats "maximal" but don't accept exploitative rates (confirmed 2026-07-08)
- **Flexibility**: must fit around the Perfect Blend day job AND M.S. coursework (through 2027) — async/flexible-hours engagements only
- **Professional development**: teams with strong senior engineers and code-review culture are a plus, second to schedule compatibility

### 6. Salary Benchmark (Optional)

If the salary lookup tool is configured (`salary_data.json` exists), look up the company:
```
python salary_lookup.py "<Company Name>" --json
```

If a city is known from the posting, add `--city "<City>"` to narrow results.

Present findings as:
```
### Salary Benchmark
| Metric | Value |
|--------|-------|
| [Category] index | XX.X (+/-X.X% vs baseline) |
| Overall index | XX.X (+/-X.X% vs baseline) |
```

Interpret results relative to the baseline defined in the data file's metadata. For index-based data, higher typically means above-market compensation.

If the salary tool is not configured, skip this section.

## Output Format

Present the evaluation as:

```
## Job Fit Evaluation: [Role] at [Company]

| Dimension | Score | Notes |
|-----------|-------|-------|
| Technical Skills | XX/100 | [brief note] |
| Experience Match | XX/100 | [brief note] |
| Behavioral Fit | XX/100 | [brief note] |
| Location | PASS/FAIL | [brief note] |
| Career Alignment | XX/100 | [brief note] |

**Overall Score: XX/100** (weighted average of scored dimensions)

### Verdict: [Strong Fit / Good Fit / Moderate Fit / Weak Fit / Poor Fit]

### Key Strengths for This Role
- [bullet points]

### Gaps to Address
- [bullet points]

### Recommendation
[1-2 sentences: apply/skip/apply with caveats]

### Company Research Checklist
- [ ] Checked company website (mission, values, recent news)
- [ ] Checked review sites (Glassdoor, Jobindex, etc.)
- [ ] Checked LinkedIn for team size, recent hires, connections
- [ ] Checked media for restructuring, growth, or workplace issues
- [ ] Identified network contacts who may know the team/manager
```

## Weighting
- Technical Skills: 30%
- Experience Match: 25%
- Behavioral Fit: 15%
- Career Alignment: 30%

(Location is pass/fail, not weighted)

## Thresholds
- **Strong Fit** (75+): Definitely apply, tailor everything
- **Good Fit** (60-74): Apply, address gaps in cover letter
- **Moderate Fit** (45-59): Consider carefully, discuss with user
- **Weak Fit** (30-44): Probably skip unless strategic reasons
- **Poor Fit** (<30): Skip

## Pre-Application: Call the Employer (Best Practice)

Before writing the application, consider whether the candidate should call the contact person listed in the posting. **Only call if there are substantive questions** - never call just to "be remembered."

### When to Suggest Calling
- The posting has unclear or ambiguous requirements
- It's unclear which competencies are essential vs. nice-to-have
- The role description is vague about day-to-day tasks
- There's a named contact person who invites questions

### Good Questions to Ask
- "What are the primary challenges in this role?"
- "How is time typically divided across the listed responsibilities?"
- "Which competencies are most critical for success in this position?"
- "What does success look like in the first 6-12 months?"

### Rules for the Call
- Prepare a 30-second "elevator pitch" about your background in case they ask
- The call's purpose is **gathering information**, not delivering a pitch
- Take notes - use what you learn to tailor the application
- Reference the conversation naturally in the cover letter ("After speaking with [name], I was especially drawn to...")
