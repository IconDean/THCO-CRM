# FlowForge / THCO Executive Portal - PRD

## Original Problem Statement
Build "FlowForge," an internal AI-powered workflow automation tool within an executive portal. The portal also serves as a library for complex, animated, single-page-application-style presentations for various business purposes, a candidate assessment system, and a project delivery workflow.

## Core Features

### 1. FlowForge Automation Tool
- AI-powered workflow automation
- Business unit pages with "My Tools" tab
- Problem brief form with progressive enhancements

### 2. Proposals & Presentations Library
- 24+ cinematic animated presentations
- Public-facing versions with email gate
- PDF download capability (unstable)

### 3. Candidate Assessment Portal
- 3-page flow: Info, 39 Questions (100-min timer, answer locking), Final Details
- Admin Dashboard with JSON/CSV export

### 4. Authentication
- Bearer Token auth via localStorage (migrated from cookies due to CORS)
- Super Admin: joshua@thcohq.com / THCOAdmin2024!
- Second admin: adoption@thcohqs.com / THCOAdmin2024!

### 5. Winston Duke Brand Identity Presentation
- 30-slide cinematic brand reveal
- 9-point revision verified (Feb 2026)
- Section order: Crown → Hawk → Wave → Bridge → Interlock

### 5.5 Project Delivery Workflow (NEW - Feb 2026)

End-to-end internal workflow: project intake → HR delegation → engineer review → daily standup tracking.

**Workflow Status Flow:**
awaiting_delegation → delegated → under_review → revision_requested → approved_for_build → in_build → completed

**Three Business Unit Touchpoints:**
- **Talent & Human Capital** (`/talent/projects`) — Fulfillment uploads Brief + Roadmap
- **THCO HR** (`/thco-hr/delegation`) — HR delegates projects to engineers
- **Technology & Build** (`/technology/my-projects`) — Engineers review, approve, build, track

**Key Components Built:**
- 12 backend API endpoints (`/api/projects/*`)
- SLA scheduler (APScheduler: 120-min open + review windows with email reminders)
- 13 branded HTML email templates (Resend integration, placeholder key)
- User role flags: is_engineer, is_fulfillment, is_hr
- Engineer workload calculation (available/at_capacity/busy)
- Document upload/download with file validation (PDF/DOCX, 25MB limit)
- Daily standup form with progress tracking
- User Management page (`/admin/users`) for role toggles
- Notification badge system

**Database Collections Added:**
- projects, engineer_reviews, project_tracker_updates, email_logs

**Testing:** 100% pass rate (19 backend + all frontend Playwright tests)

## Architecture
- Frontend: React (CRA) + Framer Motion + Tailwind + Shadcn
- Backend: FastAPI + MongoDB
- Auth: Bearer Token via localStorage, Axios interceptors
- Email: Resend SDK (placeholder key)
- Scheduler: APScheduler (in-process)

## What's Been Implemented
- All 24+ presentations created and integrated
- Candidate Assessment system (full CRUD + admin)
- Auth refactor (cookies -> Bearer token)
- Winston Duke 9-point revision (VERIFIED)
- **Project Delivery Workflow (COMPLETE, TESTED Feb 2026)**
  - Backend: routers/projects.py, services/email_service.py, services/email_templates.py, services/sla_scheduler.py
  - Frontend: ProjectFulfillment, NewProjectForm, DelegationBoard, MyProjects, ProjectReview, ProjectTracker, UserManagement
  - Routes added in App.js, tabs added to TalentUnit, THCOHRPage, TechnologyAndBuild

## Known Issues
- P2: PDF download unstable
- P3: Babel plugin patch in node_modules (fragile)
- P3: form_url column migration pending
- Email service: RESEND_API_KEY is placeholder (needs real key from Joshua)

## Post-Deployment: Joshua's Setup Steps
1. Sign up for Resend at resend.com
2. Verify thcohq.com domain (SPF, DKIM, DMARC)
3. Replace RESEND_API_KEY in /app/backend/.env
4. Restart backend: sudo supervisorctl restart backend
5. At /admin/users, flag users: is_engineer, is_fulfillment, is_hr
6. Test end-to-end flow with sample project

## Upcoming Tasks (Priority Order)
- P1: Implement FlowForge tool execution results UI
- P1: Roll out "My Tools" tab to all 11 business unit pages
- P2: Stable PDF download for proposals

## Future/Backlog
- P2: FlowForge Phase 5 & 6
- P3: Refactor monolithic server.py
- P3: "Forgot Password" flow
- P3: Permanent Babel plugin fix

## 3rd Party Integrations
- MongoDB (local)
- Supabase (PostgreSQL, legacy)
- n8n (THCO Automation Engine)
- Anthropic Claude (via Emergent LLM Key)
- OpenAI Whisper (via Emergent LLM Key)
- Resend (email, placeholder key)
