# FlowForge / THCO Executive Portal - PRD

## Original Problem Statement
Build "FlowForge," an internal AI-powered workflow automation tool within an executive portal. The portal also serves as a library for complex, animated, single-page-application-style presentations for various business purposes.

## Core Features

### 1. FlowForge Automation Tool
- AI-powered workflow automation
- Business unit pages with "My Tools" tab
- Problem brief form with progressive enhancements

### 2. Proposals & Presentations Library
- Multiple cinematic animated presentations
- Public-facing versions with email gate
- PDF download capability (unstable)

### 3. Candidate Assessment Portal
- 3-page flow: Info, 39 Questions (100-min timer, answer locking), Final Details
- Admin Dashboard with JSON/CSV export
- Auto-saving with debounced API calls

### 4. Authentication
- Bearer Token auth via localStorage (migrated from cookies due to CORS)
- Login/Logout flow
- Super Admin: joshua@thcohq.com / THCOAdmin2024!

## Completed Presentations
- SagicorProgressDashboard.jsx
- AIFforBankingPresentation.jsx (THCO branding)
- PebblesBrandOverview.jsx
- ProcureAIAlignmentSession.jsx
- CeneTeamAuditPresentation.jsx
- WinstonDukePresentation.jsx (30 slides, 9-point revision VERIFIED Feb 2026)

## Architecture
- Frontend: React (CRA) + Framer Motion + Tailwind + Shadcn
- Backend: FastAPI + MongoDB
- Auth: Bearer Token via localStorage, Axios interceptors
- Font: Cormorant Garamond (presentations), Inter (UI)

## What's Been Implemented
- All 6 presentations created and integrated
- Candidate Assessment system (full CRUD + admin)
- Auth refactor (cookies -> Bearer token)
- Winston Duke 9-point revision (VERIFIED Feb 2026)

## Known Issues
- P2: PDF download unstable (client-side generation failing)
- P3: Babel plugin patch in node_modules (fragile, needs patch-package)
- P3: form_url column migration pending

## Upcoming Tasks (Priority Order)
- P1: Implement FlowForge tool execution results UI
- P1: Roll out "My Tools" tab to all 11 business unit pages
- P2: Stable PDF download for proposals

## Future/Backlog
- P2: FlowForge Phase 5 (Polish & White-Label) and Phase 6 (Rollout & Monitoring)
- P3: Refactor monolithic server.py into modular routes
- P3: "Forgot Password" flow

## 3rd Party Integrations
- Supabase (PostgreSQL)
- n8n (THCO Automation Engine)
- Anthropic Claude (via Emergent LLM Key)
- OpenAI Whisper (via Emergent LLM Key)
