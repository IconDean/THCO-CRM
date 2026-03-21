# FlowForge / Executive Decks Portal - PRD

## Original Problem Statement
Build "FlowForge," an AI-powered workflow automation tool within a company portal. The portal has expanded to include a library of high-fidelity, cinematic animated web presentations.

## Core Architecture
- **Frontend**: React (CRA) with custom CSS animations
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
12. AFC Cross-Border Treasury System (20 slides)

## Latest Changes (2026-03-21)
- Built AFC Cross-Border Treasury presentation (20 slides, institutional-grade)
- Features: SVG flowchart arrows with stroke-dasharray draw animations, progressive phase reveals, matching engine simulation, balance decrements, ledger transitions
- **Fixed Slide 6 (Hero Flowchart)**: Rebuilt with dynamic measurement-based layout using useCallback ref + proportional Y positions. SVG arrow coordinates computed from measured container width to guarantee pixel-perfect alignment with HTML flex nodes. Exit arrows (activities to outputs), feedback loop arrow, and USD Treasury arrow all rendering correctly. No dead space.
- Integration: public route /proposals/afc-treasury, preview route, backend slug, Proposals.jsx card

## Backlog
### P1
- PDF download buttons for Realloc & Procure AI presentations
- FlowForge tool execution results UI
- "My Tools" tab rollout to 11 business unit pages

### P2
- FlowForge Phase 5 & 6
- Permanent Babel plugin fix (patch-package)
- Database form_url column migration

### P3
- Refactor monolithic server.py
- "Forgot Password" flow
