# Interview Preparation Guide

<!-- SETUP: STAR examples are personalized by running /setup based on your actual experience -->

## STAR Format

Structure answers as: **Situation** (context), **Task** (your responsibility), **Action** (what you did), **Result** (outcome).

Keep answers to 1-2 minutes. Be specific. End with what you learned or would do differently.

## Ready-Made STAR Examples

<!-- Populated by /setup 2026-07-06 from the CV. [TODO] items need Brandon's real numbers — add them before interviews. -->

### 1. LLM Email-Bot Network (applied AI system design)
**S:** Perfect Blend ran order intake, quality reports, AP, freight, and HR on manual email-to-spreadsheet workflows — slow, error-prone, and unauditable.
**T:** As sole engineer, automate intake across all of these departments without breaking how customers and staff already communicated (plain email).
**A:** Designed a network of 8 specialized LLM bots, each with a prompt pipeline that parses natural-language email into structured, validated records routed to per-department workflow queues. Built a feedback loop that records every human correction and feeds it back to improve extraction — accepting that the model would be wrong sometimes and designing for it rather than pretending it wouldn't be.
**R:** In daily production across four departments. [TODO: emails/orders per week, extraction accuracy before/after feedback loop, hours saved]
**Use for:** "Tell me about an AI system you built", "How do you handle LLM unreliability?", "Design an automation for messy input"

### 2. PostgreSQL RLS Debugging (root-cause depth)
**S:** Multi-tenant security in PBOMNI depended on Row Level Security, but queries through database views were failing in ways the documentation didn't explain.
**T:** Find the real cause — shipping a multi-tenant system with a security model I didn't fully understand wasn't acceptable.
**A:** Reproduced the failure in isolation and traced it down to how RLS interacts with views at the PL/pgSQL exception-handling level, then restructured the affected access paths accordingly. Also hardened the rest of the surface: revoked anonymous PostgREST access, added audit triggers on all financial records.
**R:** RLS enforced across 18+ tables with clean tenant isolation; no cross-tenant leakage; audit trail on every financial mutation.
**Use for:** "Hardest bug you've debugged", "How do you approach security?", "Tell me about going beyond the documentation"

### 3. Three-Vendor Integration Conflict (systems debugging under constraints)
**S:** Embedding DocuSign signing inside the PWA broke with a tangle of OAuth, CORS, and iframe security errors spanning DocuSign, Supabase Edge Functions, and the React frontend — three vendors, each pointing at the others.
**T:** Make embedded signing work at the loading dock on a Surface tablet, where a redirect-heavy flow would have been unusable.
**A:** Isolated each failure layer (auth flow vs. cross-origin policy vs. frame-ancestors), worked out which constraint belonged to which vendor, and re-architected the signing flow so each vendor's security requirements were satisfied without compromising the embedded UX.
**R:** Bill of Lading generation with embedded digital signing runs on the dock daily; drivers sign on the tablet.
**Use for:** "Tell me about integrating third-party systems", "Debugging across boundaries you don't control"

### 4. Manual Ops → Production Platform (ownership / 0→1)
**S:** A specialty agriculture company ran sales, logistics, compliance, and accounting on email, spreadsheets, and paper.
**T:** As the company's only technical person, replace that with software — no team, no spec, no existing infrastructure.
**A:** Built PBOMNI end to end: React/TypeScript PWA, Supabase/PostgreSQL with RLS, Deno Edge Functions, DocuSign integration, 48+ idempotent migrations, GitHub → Vercel CI/CD. Sequenced rollout by department so daily operations never stopped; trained users; iterated from their feedback.
**R:** Four departments run on it daily; state compliance tracking across multiple U.S. jurisdictions automated. [TODO: users, order volume, time saved]
**Use for:** "Tell me about a project you owned end to end", "Working with ambiguity", "Why should we trust you with scope?"

### 5. Banking Fraud Investigation (judgment + data rigor)
**S:** At Bank of America, flagged consumer accounts needed fraud investigation and due diligence with real money and real customers on the line.
**T:** Assess flagged accounts accurately — both false positives and missed fraud are costly.
**A:** Ran initial due diligence on flagged accounts, maintained G/L accuracy and reconciliation, and built data-driven client pitch analyses on internal platforms.
**R:** [TODO: any volume/accuracy detail you can share]
**Use for:** "Attention to detail", "Handling sensitive data", "Experience in regulated environments"

<!-- Aim for 4-6 covering different competencies. #5 is thinner — strengthen or swap once real numbers are in. -->

## Common Tough Questions

### "Why did you leave [previous company]?"
> [PREPARE YOUR ANSWER - be honest, forward-looking, no negativity about former employer]

### "You don't have [specific skill/experience]."
> [PREPARE YOUR ANSWER - acknowledge the gap, bridge to adjacent experience, show willingness to learn]

### "Where do you see yourself in 5 years?"
> [PREPARE YOUR ANSWER - show ambition aligned with the role's growth path]

### "What's your biggest weakness?"
> [PREPARE YOUR ANSWER - genuine weakness with concrete mitigation strategy]

### "Why this company specifically?"
> Customize per company. Must reference: specific projects, company values, market position, or team structure. Never give a generic answer.

## Questions You Should Ask Interviewers

### About the Role
- "What does a typical week look like in this role?"
- "What would success look like in the first 6 months?"
- "What's the biggest challenge the team is facing right now?"

### About the Team
- "How big is the team, and how do you divide work?"
- "What does the development/project lifecycle look like, from idea to production?"
- "How do you onboard new team members?"

### About Tech & Growth
- "What's your current tech stack for [relevant area]?"
- "Is there room to grow into more architectural or strategic decisions?"
- "How does the team stay current with new tools and methods?"

### About Culture (use these to prevent disappointment)
- "How would you describe the team culture?"
- "What does professional development look like here?"
- "Is there flexibility for remote/hybrid work?"
- "What's the balance between development/new projects and maintenance work?"
- "How would you describe the leadership style in this team?"
- "What do people who thrive here have in common?"

## Phone/Video Interview Tips
- Have STAR examples written out (use this file)
- Keep a glass of water nearby
- Smile when speaking (it changes your tone)
- Ask for clarification if a question is vague
- It's OK to take 5 seconds to think before answering
- End with: "Is there anything else you'd like to know about my background?"

## After the Application (Best Practice)

### Follow-Up Etiquette
- **Don't call to "stand out"** or to learn more about the role post-submission - this risks a negative impression
- If the employer specified a timeline, respect it and wait
- If no timeline was given and significant time has passed (2+ weeks), a brief call to ask about status is acceptable
- If you have genuinely new, relevant information to share, a short follow-up is fine

### Thank-You Notes
- When you receive any update (interview invitation, rejection, or status update), send a brief thank-you message
- Express appreciation for their time and the process
- Keep it short (2-3 sentences)

## Roleplay Guidelines
When the user asks for interview practice:
1. Ask which role/company to simulate
2. Start with easy warm-up questions ("Tell me about yourself")
3. Progress to role-specific technical questions
4. Include 1-2 behavioral questions using the competencies from the job posting
5. End with a tough question or curveball
6. After each answer, give brief feedback: what worked, what to sharpen
7. Suggest which STAR example would work best for each question
