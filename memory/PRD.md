# FlowForge / Executive Decks Portal — PRD

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
9. Sagicor STEC Executive Briefing (20 slides) — latest, actively iterated

## Latest Changes (2026-03-18)
- Updated "What the Scores Tell Us" slide: Added subtitle, score band definitions table, key insight callout, secondary insight
- Updated "Sentiment by Department" slide: Added subtitle, score interpretation scale with color legend, 7.0 threshold line, dual-insight callout
- Updated "What We Navigated" slide: Added "Platform issues reported by users" row with IN PROGRESS status badge

## Backlog
### P0
- None currently

### P1
- FlowForge tool execution results UI
- "My Tools" tab rollout to 11 business unit pages

### P2
- FlowForge Phase 5 & 6
- Progressive Enhancements for problem brief form
- PDF download for ProcureAI proposals

### P3
- Refactor monolithic server.py
- "Forgot Password" flow
- Permanent Babel plugin fix (patch-package)
- Database form_url column migration
