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

### Phase 2 - Approval System (COMPLETE ✅)
- [x] Approval request generation (new tools + updates)
- [x] Approval queue page (`/admin/approvals`) with list, filter, review details
- [x] Approve/reject/request-changes actions with notes
- [x] Notification system (in-app badge count)
- [x] Admin sidebar item with pending approval badge
- [x] Status flow: building → pending_approval → approved/rejected → deployed
- [x] Submit for Approval button in chat after workflow generation
- [x] Approval stats endpoint with counts
- [x] Approval detail modal with full request information

### Phase 3 - Duplicate Detection & Inventory (COMPLETE ✅) - Feb 20, 2026
- [x] n8n workflow inventory sync (20 workflows synced)
- [x] Inventory search API (keyword-based text matching)
- [x] Duplicate detection integrated into chat flow (triggers on first user message)
- [x] "Related Tools" card shown in chat with match percentages
- [x] User action buttons: "Yes, use this one", "Close, but needs changes", "No, build something new"
- **Files**: `/app/backend/services/duplicate_detection.py`, `/app/backend/routers/flowforge.py` (inventory endpoints)

### Phase 4 - Voice Input & Integration Checks (COMPLETE ✅) - Feb 20, 2026
- [x] Voice recording component with microphone button, waveform visualization, timer
- [x] Speech-to-text via OpenAI Whisper (Emergent LLM Key)
- [x] Editable transcriptions before sending
- [x] Integration registry seeded (15 integrations: Gmail, Slack, Google Sheets, etc.)
- [x] Integration status check after workflow generation (checks systems_used against registry)
- **Files**: `/app/frontend/src/components/flowforge/VoiceRecorder.jsx`, `/app/backend/routers/flowforge.py` (transcribe endpoint)

### Phase 4.5 - Two-Step Prompt Engineering Layer (COMPLETE ✅) - Feb 20, 2026
- [x] Prompt Architect service - Creates detailed Build Specifications from user input
- [x] Workflow Builder service - Generates structured workflow from Build Spec
- [x] THCO company context and unit-specific context embedded in prompts
- [x] Build Spec stored in database for admin review
- [x] Timeout handling and fallback to standard generation
- [x] **Guided Input Structure** - Structured Problem Brief Template
  - Unit-specific examples for each field (Tool Name, Problem, Trigger, etc.)
  - Voice note instructions (Step 2)
  - Checklist showing what FlowForge will do
  - Combined typed + voice input formatted for Prompt Architect
- **Files**: `/app/backend/services/prompt_engineering.py`, `/app/backend/services/guided_input.py`

### Phase 4.6 - Interactive Problem Brief Form (COMPLETE ✅) - Feb 20, 2026
- [x] **Interactive Form Component** - Replaced text template with full form UI
  - 11 form fields: Tool Name, Problem, Trigger, Steps, Outcome, Who Is Involved, How Often, Systems & Tools, Exceptions, Anything Else, Voice Note
  - Unit-specific placeholders (Talent, Sales, Marketing, etc.)
  - Required field validation with inline error messages
  - Conditional inputs (trigger detail, frequency detail, systems other)
- [x] **Systems & Tools Tag Selector** - Visual chips that toggle on/off
  - 16 system options with icons (Database, Gmail, Slack, WhatsApp, etc.)
  - "Other" input appears when Other tag selected
- [x] **Voice Note Section (Required)**
  - Large purple microphone button
  - Waveform visualization during recording
  - Guided prompts displayed as bullet points
  - Transcription preview with edit capability
  - Re-record and confirm buttons
  - Minimum 30 seconds warning (soft warning, not hard block)
- [x] **Form Integration with Chat**
  - Form replaces welcome template for new conversations
  - Chat messages hidden when form showing
  - Regular chat input hidden when form showing
  - Form submission creates user message and triggers AI generation

### Phase 4.7 - Structured Brief Detection (COMPLETE ✅) - Feb 22, 2026
- [x] **BUG FIX: AI now recognizes structured briefs and generates workflows immediately**
  - Added `_is_structured_brief()` function to detect form submissions
  - Updated `_should_trigger_two_step()` to prioritize structured briefs 
  - Updated PromptArchitect system prompt to never ask questions for structured briefs
  - When form data with markers like **TOOL NAME:**, **THE PROBLEM:**, etc. is submitted, AI:
    - Immediately generates workflow
    - Does NOT ask clarifying questions like "What should be the tool name?"
    - Returns workflow with correct tool name from form data
    - Includes action buttons for "Submit for Approval" and "Make Changes"
- **Files Updated**: `/app/backend/services/flowforge_ai.py`, `/app/backend/services/prompt_engineering.py`
- **Test File**: `/app/backend/tests/test_structured_brief.py`
- [x] **Build New Tool Button on ALL Unit Pages**
  - Added to all 11 business unit pages: Sales, Marketing, Advisory, Technology, Operations, Academy, Client Delivery, THCO HR, IT & Tools, Project Management, Talent
  - Consistent purple gradient button with Zap icon
  - Routes to unit-specific build page with tailored form placeholders
- **Files**: `/app/frontend/src/components/flowforge/ProblemBriefForm.jsx`, `/app/frontend/src/pages/FlowForgeChat.jsx`, all unit page files

### Phase 4.8 - n8n Deployment & Tool Visibility (COMPLETE ✅) - Feb 22, 2026
- [x] **n8n Workflow Deployment on Approval**
  - Created `/app/backend/services/n8n_deployment.py` for n8n API integration
  - When admin approves a tool, automatically creates workflow in n8n via `POST /api/v1/workflows`
  - Uses `X-N8N-API-KEY` header for authentication
  - Maps workflow steps to n8n nodes (Set, Gmail, Slack, Database, etc.)
  - Stores `engine_workflow_id` and `engine_workflow_url` in conversation
- [x] **Approval Status Messages in Chat**
  - Posts detailed status message to conversation when approved/rejected
  - Shows: Who approved, workflow ID, n8n URL link, next steps
  - Action button "Open in Automation Engine" links directly to n8n
- [x] **"My Tools" Tab on Unit Pages**
  - Added "My Tools" tab next to "Tools" and "Build History"
  - Shows deployed tools with: name, status (Ready/Active), trigger info
  - Displays execution stats (runs, success, errors)
  - Buttons: Activate, Open (n8n link), View (conversation)
- [x] **Tool Activation/Deactivation**
  - `POST /api/flowforge/tools/{id}/activate` endpoint for admins
  - Updates workflow active status in n8n
  - Updates local inventory status
- **New Files**: `/app/backend/services/n8n_deployment.py`, `/app/frontend/src/components/flowforge/DeployedTools.jsx`
- **Updated**: `/app/backend/routers/flowforge.py`, `/app/frontend/src/pages/TalentUnit.jsx`, `/app/frontend/src/lib/api.js`

### Phase 5 - Polish & White-Label (UPCOMING)
- [ ] Final UI polish and animations
- [ ] Error handling improvements
- [ ] Loading states and feedback
- [ ] Documentation and help tooltips

### FlowForge Files
- `/app/backend/routers/flowforge.py` - Main API routes (conversations, approvals, inventory, transcribe, tools)
- `/app/backend/services/flowforge_ai.py` - AI service (Claude + integration checking)
- `/app/backend/services/prompt_engineering.py` - Two-step Prompt Architect + Workflow Builder
- `/app/backend/services/n8n_deployment.py` - n8n API integration for workflow deployment (NEW)
- `/app/backend/services/duplicate_detection.py` - Duplicate detection service
- `/app/backend/sql/flowforge_schema.sql` - Database schema
- `/app/frontend/src/pages/FlowForgeChat.jsx` - Chat UI
- `/app/frontend/src/components/flowforge/ProblemBriefForm.jsx` - Interactive form component
- `/app/frontend/src/components/flowforge/DeployedTools.jsx` - Deployed tools list component (NEW)
- `/app/frontend/src/components/flowforge/VoiceRecorder.jsx` - Voice recording component
- `/app/frontend/src/components/FlowForgeFAB.jsx` - FAB button
- `/app/frontend/src/components/UnitSelectionModal.jsx` - Unit picker
- `/app/frontend/src/components/BuildHistory.jsx` - History component

### FlowForge Database (Supabase)
- `flowforge_conversations` - Conversation/tool metadata (now includes engine_workflow_id, engine_workflow_url)
- `flowforge_messages` - Chat messages (now stores build_spec, workflow_steps)
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
