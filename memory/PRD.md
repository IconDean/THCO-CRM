# FlowForge / Executive Decks Portal - PRD

## Original Problem Statement
Build "FlowForge," an AI-powered workflow automation tool within a company portal. The portal has expanded to include a library of high-fidelity, cinematic animated web presentations and a candidate assessment system.

## Core Architecture
- **Frontend**: React (CRA) with Tailwind CSS, Shadcn/UI components
- **Backend**: FastAPI + MongoDB
- **Presentations**: Self-contained JSX components with keyboard/touch navigation
- **Assessment System**: Public 3-page candidate flow + admin dashboard

## Candidate Assessment System (2026-04-01)
- **Public URL**: `/assessment` — 3-page flow (Info, 37 Questions, Final Details) + Confirmation
- **Admin URL**: `/admin/assessments` — List view with sorting/filtering/export + Detail view
- **37 questions**: Q1-Q32 original + Q33-Q37 new (Q33/Q35/Q36/Q37 radio, Q34 textarea)
- **Answer locking**: Radio locks immediately on selection, textarea locks on blur with content. Locked answers show green border + lock icon and cannot be changed. On resume, previously answered questions are pre-locked.
- **Timer**: 90-min countdown. Only exception to locking: timer expiry auto-pushes to Page 3 with whatever answered.
- **Continue button**: Disabled until all 37 questions answered.
- **Page 3 fields**: Onsite/Hybrid (Yes/No), Work Preference (Fully Onsite/Hybrid), Salary, Location
- **Theme**: Light/white background (#f5f6f8) with white cards
- **Backend**: `/app/backend/routers/assessments.py` — Full CRUD with admin endpoints
- **Frontend**: `CandidateAssessment.jsx` (public), `AdminAssessments.jsx` (admin)
- **MongoDB collection**: `assessments`

## Completed Presentations
1. Sagicor Executive Dashboard (8 sections)
2. AI for Banking (32 slides)
3. Pebbles Brand Overview (8 slides)
4. Procure AI Alignment Session (15 slides)
5. CeneTeam Security Audit (15 slides)
6. INGABO Presentation
7. THE FORGE V2 (24 pages)
8. TIDE WAR (26 pages)
9. Sagicor STEC Executive Briefing (20 slides)
10. Realloc AI Capability Program (44 slides)
11. Procure AI Team Presentation (12 slides)
12. AFC Cross-Border Treasury System (20 slides)

## Backlog
### P1
- PDF download buttons for Realloc & Procure AI presentations
- FlowForge tool execution results UI
- "My Tools" tab rollout to 11 business unit pages

### P2
- FlowForge Phase 5 & 6
- Permanent Babel plugin fix (patch-package)
- Database form_url column migration
- AFC Treasury V2 presentation (22 slides, USD at top)

### P3
- Refactor monolithic server.py
- "Forgot Password" flow
