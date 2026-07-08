# Candidate Profile

<!-- Populated by /setup (Path B: single CV import, 2026-07-06). [TODO] tokens mark data the CV didn't contain. -->

## Identity
- **Name:** Brandon McCray
- **Location:** Seattle, WA, USA
- **Phone:** 206.708.3041
- **Email:** brandonmccray02@gmail.com (personal) / bmccray@seattle.edu (university — expires after graduation; prefer personal on applications)
- **LinkedIn:** https://linkedin.com/in/brandonjmccray
- **GitHub:** https://github.com/CIVIDISO
- **Languages:** English (native)
- **Status:** Employed (Chief Data Officer, Perfect Blend, LLC) while completing M.S. in Artificial Intelligence; actively seeking Applied AI Engineer roles
- **Constraints:** Seattle metro (Bellevue/Redmond OK); [TODO: remote preference and any other constraints]

## Education

| Degree | Period | Institution | Key Topics |
|--------|--------|-------------|------------|
| M.S. in Artificial Intelligence | 2025–2027 (expected) | Seattle University, School of Science & Engineering | ML, Advanced ML, AI Systems, Big Data Systems, NLP, Computer Vision, Generative AI & LLMs, AI Governance, Ethics of AI, Mathematics for AI. Capstone: PBOMNI platform |
| B.S. in Business Administration (Digital Marketing minor) | 2022–2025 | Central Washington University | Financial Statement Analysis, Econometrics, Futures & Derivatives, SQL, Python |
| A.A.S. in Business (Dean's List) | 2019–2021 | Pierce College | — |

## Professional Experience

### Chief Data Officer / Junior Board Member - Perfect Blend, LLC (Jul 2024 - Present)
Bellevue, WA — specialty agriculture (fertilizer) company
- Sole technical executive: technology strategy, AI integration roadmap, software development, vendor evaluation at board level
- Sole architect and engineer of PBOMNI (detailed below): multi-tenant AI operations SaaS in daily production across sales, accounting, quality, and logistics
- State product-compliance registration tracking across multiple U.S. jurisdictions, automated in the platform
- Account reconciliation, financial narrative writing, P&L analysis; multi-dimensional sales analysis (salesperson, product, customer, geography) informing pricing and sales strategy

**PBOMNI — AI-Powered Enterprise Operations Platform** (sole architect, full-stack engineer, product owner)
Stack: React/TypeScript, Supabase (Auth, PostgreSQL, Edge Functions/Deno, Storage), Vercel, DocuSign API, PWA
- **LLM email-bot network:** 8 specialized bots (order intake, quality, prebuy, AP, freight, HR, reports) parsing natural-language business email through prompt pipelines into structured data routed to workflow queues; human-correction feedback loop continuously improves extraction accuracy
- **Sales & logistics automation:** full sales-order lifecycle (draft → approved → fulfilled); Bill of Lading generation with embedded DocuSign signing on a loading-dock Surface tablet (touch-optimized PWA)
- **Compliance & ops:** multi-state product registration tracking; supplier management with document storage; fertilizer blend builder with real-time NPK composition, cost/ton, and margin calculations
- **Security:** Row Level Security across 18+ PostgreSQL tables with multi-tenant company isolation; anonymous PostgREST access revoked; audit-trigger logging on all financial records
- **Infrastructure:** 48+ idempotent production migrations; GitHub → Vercel CI/CD; installable PWA, no app store
- **Hard problems solved:** PostgreSQL RLS × database-view incompatibility diagnosed at the PL/pgSQL exception-handling level; LLM prompt chains engineered for reliable structured extraction from unstructured email; OAuth/CORS/iframe security conflicts resolved across DocuSign + Supabase Edge Functions + React
- **Metrics (confirmed 2026-07-08):** 10 daily users; ~350 emails/orders processed per week; ~20 hours/week of manual processing eliminated. Extraction accuracy not yet measured — [TODO: compute from the bot-learning corrections table: (records without human correction) / (total records)]

### Financial Services Representative - Bank of America, Consumer & Small Business (Jun 2023 - Jul 2024)
Seattle, WA
- Fraud investigation and initial due diligence on flagged consumer accounts
- G/L account accuracy and reconciliation
- Data-driven client pitch analyses on internal banking platforms; member of the Black Employee Network Group

### Youth Counselor - YMCA of Pearl Street (dates not on record — listed undated under "Additional" on the CV)
Tacoma, WA
- Mentored at-risk youth; facilitated group programming and academic/life-skills development

## Independent Projects
- **[TODO]**: Personal/open-source projects beyond PBOMNI (GitHub: CIVIDISO)

## Technical Skills

### Programming & ML
- **TypeScript/JavaScript** (advanced, daily production): React, Tailwind CSS, PWA, Supabase Edge Functions (Deno)
- **Python** (strong): Pandas, NumPy, scikit-learn, PyTorch, TensorFlow; NLP, Computer Vision, Generative AI & LLMs (graduate coursework + production prompt pipelines)
- **SQL/PostgreSQL** (advanced): Row Level Security, PL/pgSQL, migrations, PostgREST, audit triggers
- **R** (working knowledge)

### Domain Expertise
- LLM prompt-pipeline engineering for structured-data extraction with human-in-the-loop feedback
- Multi-tenant SaaS architecture and enterprise security (RLS, auth, audit)
- Business-operations automation: sales, logistics, accounts payable, HR, compliance
- Finance & accounting: reconciliation, P&L analysis, financial narratives; fraud due diligence

### Software & Tools
- Supabase, AWS, Vercel, GitHub, CI/CD, DocuSign API, Power BI, Google Analytics, Adobe Creative Suite, Canva, Hootsuite, Pro Tools, FL Studio, Blender

## Publications
- None (non-academic track)

## Awards
- Dean's List - Pierce College (2019–2021)
- Google Analytics Certification - Google (2025)

## References
- [TODO: name, title, company, contact — ideal: a Perfect Blend executive and a Seattle University professor/capstone advisor]

More references available upon request.
