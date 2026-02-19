# THCO Internal Portal - Product Requirements Document

## Original Problem Statement
Build an internal company portal for THCO — a professional services firm. This is the internal hub (like SharePoint) where staff access AI-powered tools organized by business unit. All tools connect to external n8n webhooks.

## Architecture & Tech Stack
- **Frontend**: React 19 with TailwindCSS, Shadcn/UI components, Framer Motion
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (legacy) + Supabase/PostgreSQL (FlowForge)
- **Authentication**: Email/Password + Emergent Google OAuth
- **Email Service**: Resend (for password reset)
- **AI Agents**: n8n webhooks for agent processing
- **AI Generation**: Claude via Emergent LLM Key
- **Theme**: Light sidebar with light content area (matching thcoteam.com)

---

## FlowForge - AI-Powered Workflow Builder (NEW - Feb 19, 2026)

### Overview
FlowForge is THCO's internal AI-powered automation platform embedded into the thcoteam.com portal. Users describe business problems in text/voice, and the system generates production-ready automation workflows for deployment to n8n.

### Phase 1 - Core Foundation (COMPLETE ✅)
- [x] Supabase database setup with all required tables
- [x] FlowForge backend API routes (`/api/flowforge/*`)
- [x] AI integration with Claude via Emergent LLM Key
- [x] FlowForge FAB (floating action button) on dashboard
- [x] Unit selection modal (all 11 business units)
- [x] FlowForge chat interface with:
  - Welcome message
  - Text input with send button
  - Voice recording button (UI only - Phase 4)
  - Attachment button (UI only - future)
  - Status badges (Building, Pending Approval, Active, etc.)
  - Editable tool name
- [x] Build History tab on Talent unit page
- [x] Message persistence in Supabase
- [x] AI-generated responses with clarifying questions

### Phase 2 - Approval System (UPCOMING)
- [ ] Admin roles table and management UI
- [ ] Approval request generation (new tools + updates)
- [ ] Approval queue page (list, filter, review details)
- [ ] Approve/reject/request-changes actions
- [ ] Notification system (in-app + email)
- [ ] Admin sidebar item with badge count

### Phase 3 - Duplicate Detection & Inventory (UPCOMING)
- [ ] n8n workflow inventory sync (every 15 min)
- [ ] Inventory search API (keyword + semantic similarity)
- [ ] Duplicate detection integrated into chat flow
- [ ] Similar tool cards shown in chat
- [ ] User options: use existing, request update, build new

### Phase 4 - Voice Input & Integration Checks (UPCOMING)
- [ ] Voice recording component (microphone, waveform, timer)
- [ ] Speech-to-text integration (Whisper)
- [ ] Editable transcriptions in chat
- [ ] Integration registry table and sync
- [ ] Integration status check before generation

### FlowForge Files
- `/app/backend/routers/flowforge.py` - Main API routes
- `/app/backend/services/flowforge_ai.py` - AI service (Claude)
- `/app/backend/sql/flowforge_schema.sql` - Database schema
- `/app/frontend/src/pages/FlowForgeChat.jsx` - Chat UI
- `/app/frontend/src/components/FlowForgeFAB.jsx` - FAB button
- `/app/frontend/src/components/UnitSelectionModal.jsx` - Unit picker
- `/app/frontend/src/components/BuildHistory.jsx` - History component

### FlowForge Database (Supabase)
- `flowforge_conversations` - Conversation/tool metadata
- `flowforge_messages` - Chat messages
- `flowforge_approvals` - Approval requests
- `flowforge_admins` - Admin roles
- `flowforge_workflow_inventory` - n8n workflow inventory
- `flowforge_integrations` - Available integrations
- `flowforge_execution_log` - Execution history
- `flowforge_activity` - Activity feed
- `flowforge_notifications` - User notifications

---

## What's Been Implemented

### AI Agent Registry - 37 Agents
All 37 AI agents from the THCO Agent Registry have been added to their respective business units:

#### Sales & BD (9 Agents)
- #1 Lead Research Agent (CRITICAL) - Daily prospect lists from LinkedIn, news, job boards
- #2 Email Outreach Agent (CRITICAL) - Personalized cold email sequences (50-100+/day)
- #3 Inbox Management Agent (CRITICAL) - Categorizes replies: Hot/Warm/Not Now
- #7 Client Reactivation Intel Agent (CRITICAL) - 320 clients cross-sell research
- #8 Intake Call Processing Agent (CRITICAL) - Transcribes calls, extracts Intake Brief
- #9 Follow-Up & Cadence Agent (HIGH) - Multi-step follow-up sequences
- #14 Meeting Prep Agent (HIGH) - 24hrs before meeting prep
- #30 CRM & Pipeline Intelligence Agent (CRITICAL) - Auto-logs, enriches leads
- #31 Competitive Intelligence Agent (HIGH) - Competitor monitoring

#### Talent & Human Capital (4 Agents)
- #4 Candidate Sourcing Agent (CRITICAL) - ACTIVE - Searches LinkedIn, GitHub, job boards
- #10 Candidate Screening Agent (HIGH) - Deep screens longlist → shortlist
- #11 Candidate Outreach Agent (HIGH) - Personalized outreach, scheduling
- #17 Client Reporting Agent (MEDIUM) - Weekly client reports

#### Technology & Build (5 Agents)
- #5 Spec-to-Tasks Agent (CRITICAL) - Converts specs into sprint tickets
- #12 MVP/Proposal Generator Agent (HIGH) - Generates proposal drafts
- #18 Project Status Tracker Agent (MEDIUM) - Daily engineering progress
- #34 QA & Testing Agent (MEDIUM) - Automated test suites
- #35 Scope Creep Detection Agent (MEDIUM) - Flags out-of-scope work

#### Marketing & Brand (3 Agents)
- #6 Content Generation Agent (CRITICAL) - 20 articles, 130+ LinkedIn posts/month
- #16 Social Media Scheduling Agent (MEDIUM) - 130+ posts/month scheduling
- #28 Newsletter & Lead Nurture Agent (LOW) - 4 monthly newsletters

#### Operations & Finance (6 Agents)
- #15 Project Management Agent (HIGH) - Victoria's daily dashboard
- #23 Document & Proposal Automation (MEDIUM) - Generates proposals, MSAs, SOWs
- #24 Performance Tracking Agent (LOW) - Revenue per person, utilization
- #32 Client Onboarding & Kickoff Agent (HIGH) - Contract → kickoff in 48hrs
- #33 Invoicing & Collections Agent (HIGH) - Milestone-triggered invoicing
- #36 Timesheet & Utilization Agent (MEDIUM) - Auto-captures hours

#### Advisory & Consulting (3 Agents)
- #19 Workforce Assessment Agent (MEDIUM) - Org data → skills heat map
- #20 HR Policy Generator Agent (MEDIUM) - Jurisdiction-compliant HR policies
- #21 Research & Analysis Agent (MEDIUM) - Market sizing, competitive analysis

#### Academy & Learning (3 Agents)
- #22 Applicant Screening Agent (MEDIUM) - Day Learning applicant screening
- #26 Curriculum & Learning Path Agent (LOW) - Personalized learning paths
- #27 Code Review & Mentoring Agent (LOW) - Reviews trainee code

#### Project Management (2 Agents)
- #15 Project Management Agent (HIGH) - Daily project dashboard
- #25 Knowledge Capture Agent (LOW) - Post-project learnings, knowledge base

#### IT & THCO Tools (2 Agents + Full Registry)
- #13 Tool Health Monitor Agent (HIGH) - Email deliverability, domain health
- #37 Security & Compliance Agent (LOW) - Multi-jurisdiction compliance
- **Full 37-Agent Registry View** - Hub showing all agents across all departments

#### THCO HR (1 Agent)
- #29 Internal HR & People Ops Agent (LOW) - Leave requests, expense reports

### Business Unit Pages - All 11 Complete
Each page now shows:
- Unit header with description and lead
- Quick stats relevant to the unit
- AI Agents section with priority badges (CRITICAL/HIGH/MEDIUM/LOW)
- Tools grid (some active, some "Coming Soon")
- Data tables with sample data

### Priority Legend
- 🔴 **CRITICAL** (Build Week 1-2): Core revenue-generating agents
- 🟡 **HIGH** (Within 30 Days): Important operational agents
- 🔵 **MEDIUM** (Within 60 Days): Efficiency agents
- ⚪ **LOW** (Within 90 Days): Nice-to-have agents

## Currently Active Features
1. **#4 Candidate Sourcing Agent** - Only active agent (n8n webhook connected)
2. **Email Gate System** - DocSend-like proposal sharing
3. **Proposal Viewer Analytics** - Tracks who views presentations
4. **User Management** - Full RBAC with Super Admin, Mini Admin, Team Member
5. **Login Records & Device Locking** - Security features
6. **Procure AI Presentations** - V1, V2, V3, V4 with PDF download

## Prioritized Backlog

### P0 - Critical Agents to Build Next
1. #1 Lead Research Agent
2. #2 Email Outreach Agent  
3. #3 Inbox Management Agent
4. #5 Spec-to-Tasks Agent
5. #6 Content Generation Agent
6. #7 Client Reactivation Intel
7. #8 Intake Call Processing
8. #30 CRM & Pipeline Intelligence

### P1 - High Priority
- #9, #10, #11, #12, #14, #15, #13, #31, #32, #33 agents
- Connect tools to real backend APIs
- Build CRUD for Project Tracker, Invoice Tracker

### P2 - Medium Priority
- #16, #17, #18, #19, #20, #21, #22, #23, #24, #34, #35, #36 agents
- Global search bar
- Notification bell

### P3 - Low Priority
- #25, #26, #27, #28, #29, #37 agents
- Backend refactoring
- Pagination for tables

## Key Files Modified (Feb 17, 2026)
- `/app/frontend/src/pages/SalesAndBD.jsx` - Added 9 agents
- `/app/frontend/src/pages/TalentUnit.jsx` - Added 4 agents
- `/app/frontend/src/pages/ITAndTools.jsx` - Added full 37-agent registry
- `/app/frontend/src/pages/TechnologyAndBuild.jsx` - Added 5 agents
- `/app/frontend/src/pages/MarketingAndBrand.jsx` - Added 3 agents
- `/app/frontend/src/pages/OperationsAndFinance.jsx` - Added 6 agents
- `/app/frontend/src/pages/AdvisoryAndConsulting.jsx` - Added 3 agents
- `/app/frontend/src/pages/AcademyAndLearning.jsx` - Added 3 agents
- `/app/frontend/src/pages/THCOHRPage.jsx` - Added 1 agent
- `/app/frontend/src/pages/ProjectManagement.jsx` - Added 2 agents

## Seeded Admin Credentials
- Email: joshua@thcohq.com
- Password: THCOAdmin2024!
- Role: Super Admin (full access)

## Agent Connection Architecture
Each agent follows the pattern:
1. **Trigger**: Cron schedule, event, or manual
2. **n8n Workflow**: Processes the logic
3. **Inputs**: Data from portal or external sources
4. **AI Processing**: Claude/Gemini via n8n
5. **Outputs**: Stored in MongoDB, sent to Slack/Email, or displayed in portal
