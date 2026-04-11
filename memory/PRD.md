# FlowForge / Executive Decks Portal - PRD

## Original Problem Statement
Build "FlowForge," an AI-powered workflow automation tool within a company portal. The portal has expanded to include a library of high-fidelity, cinematic animated web presentations and a candidate assessment system.

## Core Architecture
- **Frontend**: React (CRA) with Tailwind CSS, Shadcn/UI components, Framer Motion
- **Backend**: FastAPI + MongoDB
- **Presentations**: Self-contained JSX components with keyboard/touch navigation
- **Assessment System**: Public 3-page candidate flow + admin dashboard

## Candidate Assessment System (2026-04-01)
- **Public URL**: `/assessment` — 3-page flow (Info, 39 Questions, Final Details) + Confirmation
- **Admin URL**: `/admin/assessments` — List/detail/export (JSON/CSV)
- **Features**: 100-min timer, auto-save, answer locking, resume by email
- **Auth**: Switched to Bearer token auth (localStorage) to fix CORS with production domain

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
13. **Winston Duke Brand Identity (29 slides)** — NEW (2026-04-01)

## Winston Duke Presentation (2026-04-01)
- **Route**: `/proposals/winston-duke`
- **29 slides**: Cinematic brand identity reveal with 5 symbol sections (Crown, Hawk, Wave, Interlock, Bridge)
- **Assets**: 147 photos, inspiration images, icon zones, logo crops in `/public/winston-duke/`
- **Design**: Glossy black backgrounds, Cormorant Garamond serif, gold (#C9A84C) + forest green (#1B4332) accents, photo collage backgrounds with 87% dark overlay

## Backlog
### P1
- PDF download stabilization
- FlowForge tool execution results UI
- "My Tools" tab rollout

### P2
- AFC Treasury V2 presentation (22 slides)
- FlowForge Phase 5 & 6
- Babel plugin fix (patch-package)

### P3
- Refactor monolithic server.py
- "Forgot Password" flow
