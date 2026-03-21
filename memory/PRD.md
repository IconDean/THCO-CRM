# FlowForge / Executive Decks Portal - PRD

## Original Problem Statement
Build "FlowForge," an AI-powered workflow automation tool within a company portal. The portal has since expanded to include a library of high-fidelity, cinematic animated web presentations.

## Core Architecture
- **Frontend**: React (CRA) with Framer Motion, custom CSS animations
- **Backend**: FastAPI + MongoDB (via Supabase PostgreSQL for some features)
- **Presentations**: Self-contained JSX components with keyboard/touch navigation

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
12. AFC Cross-Border Treasury System (20 slides) - NEW

## Latest Changes (2026-03-21)
- Built and integrated AFC Cross-Border Treasury and Settlement System presentation
- 20-slide institutional-grade animated presentation for Africa Finance Corporation
- Features: animated SVG flowcharts, progressive phase reveals, matching engine simulation, balance decrements, ledger status transitions
- Design system: Playfair Display headings, Inter body, JetBrains Mono numbers, dark navy #0B1120 background
- Color coding: teal (#1D9E75) for portfolio/AFC returns, coral (#D85A30) for cross-border payments, purple (#6C5CE7) for USD Treasury
- Public route: /proposals/afc-treasury
- Preview route: /proposals/preview/afc-treasury
- Added card to Proposals.jsx listing page
- Added slug to PROPOSAL_NAMES in server.py
- Fixed usePhase hook dependency array issue causing animation phases to not progress

## Backlog
### P0
- None currently

### P1
- FlowForge tool execution results UI
- "My Tools" tab rollout to 11 business unit pages
- PDF download buttons for Realloc & Procure AI presentations

### P2
- FlowForge Phase 5 & 6
- Progressive Enhancements for problem brief form
- PDF download for ProcureAI proposals (client-side fix or permanent backend service)

### P3
- Refactor monolithic server.py
- "Forgot Password" flow
- Permanent Babel plugin fix (patch-package)
- Database form_url column migration
