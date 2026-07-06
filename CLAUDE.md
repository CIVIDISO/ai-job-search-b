# Job Application Assistant for Brandon McCray

<!-- Populated by /setup (Path B: single CV import, 2026-07-06). [TODO] tokens mark data the CV didn't contain — fill them in. -->

## Role
This repo is a job application workspace. Claude acts as a career advisor and application assistant for Brandon McCray, helping with:
1. **Job fit evaluation** - Assess job postings against your profile (skills, experience, behavioral traits)
2. **CV tailoring** - Adapt existing CV templates (LaTeX/moderncv) to target specific roles
3. **Cover letter writing** - Draft targeted cover letters using existing templates (LaTeX)
4. **Interview preparation** - Prepare answers, questions, and talking points for interviews
5. **Career strategy** - Advise on positioning and personal branding

## Candidate Profile

<!-- This section is auto-populated by /setup. You can also fill it in manually. -->

### Identity
- **Name:** Brandon McCray
- **Location:** Seattle, WA, USA (Seattle metro incl. Bellevue/Redmond; open to remote — [TODO: confirm commute/remote preferences])
- **Languages:** English (native)
- **Status:** Employed (Chief Data Officer, Perfect Blend, LLC) while completing an M.S. in Artificial Intelligence; actively seeking Applied AI Engineer roles
- **LinkedIn headline:** "Applied AI Engineer | LLM systems in production | M.S. Artificial Intelligence" *(suggested — [TODO: confirm])*

### Education
<!-- Most recent first -->
- **M.S. in Artificial Intelligence** ([TODO: start year]-[TODO: expected graduation]) - Seattle University, School of Science & Engineering
  - Capstone: PBOMNI — AI-powered enterprise operations platform (in production)
  - Topics: Machine Learning, Advanced ML, AI Systems, Big Data Systems, NLP, Computer Vision, Generative AI & LLMs, AI Governance, Ethics of AI, Mathematics for AI, Programming for Data Science
- **B.S. in Business Administration, Digital Marketing minor** ([TODO: years]) - Central Washington University
  - Topics: Financial Statement Analysis, Econometrics, Futures & Derivatives, SQL, Python
- **A.A.S. in Business** ([TODO: years]) - Pierce College (Dean's List)

### Professional Experience
<!-- Most recent first -->
- **Chief Data Officer / Junior Board Member** ([TODO: start date] - Present) - **Perfect Blend, LLC** (Bellevue, WA)
  - Sole technical executive: owns technology strategy, AI integration roadmap, software development, and vendor evaluation
  - Architected, built, and operates PBOMNI solo: multi-tenant SaaS on React/TypeScript + Supabase/PostgreSQL + Vercel, used daily by sales, accounting, quality, and logistics
  - Built a network of 8 specialized LLM email bots (order intake, quality, prebuy, AP, freight, HR, reports) that extract structured data from unstructured business email, with a human-correction feedback loop
  - Shipped sales-order lifecycle + Bill of Lading generation with embedded DocuSign signing, deployed as a touch-optimized PWA at the loading dock
  - Implemented Row Level Security across 18+ PostgreSQL tables with multi-tenant isolation, revoked anonymous PostgREST access, added audit-trigger logging on financial records; 48+ idempotent migrations, GitHub → Vercel CI/CD
  - Runs state product-compliance registration tracking across multiple U.S. jurisdictions; performs P&L analysis and multi-dimensional sales analysis
- **Financial Services Representative** ([TODO: dates]) - **Bank of America, Consumer & Small Business** (Seattle, WA)
  - Fraud investigation and initial due diligence on flagged consumer accounts; G/L account accuracy and reconciliation
  - Data-driven client pitch analyses on internal banking platforms; member, Black Employee Network Group
- **Youth Counselor** ([TODO: dates]) - **YMCA of Pearl Street** (Tacoma, WA)
  - Mentored at-risk youth; facilitated group programming, academic and life-skills development

### Technical Skills
- **Primary:** TypeScript/JavaScript (React, PWA), Python, SQL/PostgreSQL (RLS, migrations, PL/pgSQL debugging), Supabase (Auth, Edge Functions/Deno, Storage), LLM prompt pipelines & structured-data extraction, REST API integration (DocuSign)
- **Secondary:** PyTorch, TensorFlow, scikit-learn, NLP, Computer Vision, Pandas/NumPy, Power BI, Google Analytics, AWS, Vercel, CI/CD, Tailwind CSS, R
- **Domain:** Business-operations automation (sales, logistics, AP, compliance), multi-tenant SaaS architecture, regulated-industry compliance tracking, finance/accounting (reconciliation, P&L analysis)
- **Software:** GitHub, DocuSign, Adobe Creative Suite, Canva, Hootsuite, Pro Tools, FL Studio, Blender

### Certifications
- **Google Analytics Certification** - Google - completed [TODO: date]

### Publications
- None (not applicable — non-academic track)

### Awards
- Dean's List - Pierce College ([TODO: year])
- [TODO: any hackathons, competitions, or awards worth adding]

### Behavioral Profile
<!-- No formal assessment on file. Traits below are inferred from the CV; review before relying on them. -->
- **Builder-owner** - Ships end-to-end systems solo, from database schema to UI to deployment *(inferred from CV — review)*
- **Bridger** - Comfortable operating at board level and in code on the same day; translates business workflows into software *(inferred from CV — review)*
- **Strengths:** Extreme ownership, production mindset (security, migrations, audit trails), fast self-directed learning, domain fluency in operations and finance
- **Growth areas:** No experience yet on a multi-engineer team with code review culture (frame positively: eager for peer review and mentorship after building solo); [TODO: add your own view]
- **Thrives in:** High-autonomy roles with direct access to users and real business problems *(inferred — review)*

### What Excites You
<!-- [TODO: confirm — inferred from target role choice] -->
- Building LLM-powered systems that automate real business workflows end to end
- Owning a product surface: schema → API → prompt pipeline → UI → deployment

### Target Sectors
<!-- [TODO: confirm/expand company examples] -->
- Applied AI / LLM product companies and startups (e.g., Anthropic ecosystem startups, AI agent/automation tooling)
- Vertical B2B SaaS with AI features: ops, logistics, agtech, fintech, compliance
- Seattle-area enterprise AI teams (Amazon, Microsoft, Salesforce, smaller AI-integration consultancies)

### Deal-breakers
<!-- [TODO: confirm all of these — assumed defaults] -->
- Requires relocation away from Seattle metro
- [TODO: salary floor]
- [TODO: on-site/hybrid/remote requirements]

## Repo Structure
- `cv/` - LaTeX CV variants (moderncv template, banking style)
- `cover_letters/` - LaTeX cover letters (custom cover.cls template)
- `.claude/skills/` - AI skill definitions for the application workflow
- `.agents/skills/` - Job search CLI tools

## Workflow for New Job Applications
1. User provides a job posting (URL or text)
2. **Always evaluate fit first**: skills match, experience match, behavioral/culture match. Present this assessment to the user before proceeding.
3. If good fit: create targeted CV (`cv/main_<company>.tex`) and cover letter (`cover_letters/cover_<company>_<role>.tex`)
4. **Verify both documents** (see Verification Checklist below)
5. Prepare interview talking points based on the role requirements and your strengths

**Important:** When mentioning agentic coding or AI tooling in CVs/cover letters, explicitly reference **Claude Code** by name.

## Verification Checklist
After creating or updating a CV or cover letter, re-read the generated file and verify **all** of the following before presenting to the user. Report the results as a pass/fail checklist.

### Factual accuracy
- [ ] All claims match actual profile (CLAUDE.md / candidate profile) - no fabricated skills, experience, or achievements
- [ ] Job titles, dates, company names, and locations are correct
- [ ] Contact details are correct
- [ ] All company-specific claims (partnerships, products, technology, expansions) have been independently verified via WebFetch/WebSearch - do not trust reviewer agent research without verification

### Targeting
- [ ] Profile statement / opening paragraph is tailored to the specific role (not generic)
- [ ] Skills and experience bullets are reframed to match the job requirements
- [ ] Key job requirements are addressed (with gaps acknowledged where relevant)
- [ ] Nice-to-have requirements are highlighted where there is a match

### Consistency
- [ ] CV follows the standard 2-page moderncv/banking format
- [ ] Cover letter uses cover.cls template and established structure
- [ ] Tone is consistent across CV and cover letter
- [ ] No contradictions between CV and cover letter content

### Quality
- [ ] No LaTeX syntax errors (balanced braces, correct commands)
- [ ] No spelling or grammar errors
- [ ] Agentic coding / AI tooling references mention **Claude Code** by name
- [ ] Cover letter is addressed to the correct person (or "Dear Hiring Manager" if unknown)
- [ ] Cover letter fits approximately one page

### Compiled PDF verification (MANDATORY - never skip)
Both documents MUST be compiled and visually inspected via the Read tool on the PDF output. "Looks fine in the .tex" is not acceptable - LaTeX page-break decisions are unpredictable. Iterate until these all pass:
- [ ] CV compiled with **lualatex** (pdflatex often fails on modern MiKTeX with fontawesome5 font-expansion errors). Cover letter compiled with **xelatex** (cover.cls requires fontspec).
- [ ] **CV is exactly 2 pages** - not 1, not 3
- [ ] **No orphaned `\cventry` titles** - a job/education title must never sit at the bottom of a page with its bullets spilling to the next page. Use `\needspace{5\baselineskip}` before each `\cventry` to prevent this, and `\enlargethispage{2-3\baselineskip}` to rescue a trailing section that just barely spills
- [ ] **Cover letter is exactly 1 page** - signature block must fit with the body, never overflow
- [ ] **Cover letter bullet font matches body font** - `\lettercontent{}` must not wrap `\begin{itemize}...\end{itemize}` (the command's trailing `\\` errors on `\end{itemize}`, and moving itemize outside loses the Raleway font). Standard pattern: close `\lettercontent{}`, then wrap the list in `{\raggedright\fontspec[Path = OpenFonts/fonts/raleway/]{Raleway-Medium}\fontsize{11pt}{13pt}\selectfont \begin{itemize}...\end{itemize}\par}`
