# THCO Internal Portal - Product Requirements Document

## Original Problem Statement
Build an internal company portal for THCO — a professional services firm. This is the internal hub (like SharePoint) where staff access AI-powered tools organized by business unit. All tools connect to external n8n webhooks.

## Architecture & Tech Stack
- **Frontend**: React 19 with TailwindCSS, Shadcn/UI components, Framer Motion
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: Email/Password + Emergent Google OAuth
- **Email Service**: Resend (for password reset)
- **File Storage**: Local file storage in /app/backend/uploads/proposals/
- **Theme**: Light sidebar with light content area (matching thcoteam.com)
- **PDF Export**: html2pdf.js for presentation downloads

## User Personas
1. **Super Admin** - Full access, can manage users, configure webhooks, view all activity, login records, and analytics
2. **Mini Admin** - Can manage team members within assigned units
3. **Team Member** - Can access assigned units and use tools

## What's Been Implemented

### Authentication
- [x] Email/Password login
- [x] Google OAuth integration
- [x] Forgot Password flow (UI complete, needs Resend API key)
- [x] Session management with secure cookies
- [x] First user seeded as Super Admin (joshua@thcohq.com)

### Dashboard
- [x] Light theme with colorful gradient cards (matching thcoteam.com)
- [x] Welcome section with user name and role badge
- [x] Quick stats (Tools Available, Pending Requests, Recent Activity)
- [x] 11 Business Unit cards with access control - ALL ACTIVE
- [x] Activity feed

### Business Units - ALL 11 IMPLEMENTED (Feb 17, 2026)

#### 1. Talent & Human Capital
- [x] AI Candidate Sourcing tool
- [x] Database Search tool
- [x] Tool cards with gradient styling

#### 2. THCO HR (NEW)
- [x] Employee Directory with 12 team members
- [x] Performance Reviews tool
- [x] Department filtering
- [x] Stats: Team Members, Departments, Review Cycle, Active Rate

#### 3. Project Management (NEW)
- [x] Project Tracker table with 5 projects
- [x] Operating Cycle Pipeline visualization (FIND → SCOPE → BUILD → REVIEW → EARN → LEARN → GROW)
- [x] Phase and Pillar filters
- [x] Progress bars for each project
- [x] Stats: Total Projects, In Progress, In Review, Delivered

#### 4. IT & THCO Tools (NEW)
- [x] AI Agents Hub showing 12 AI agents across departments
- [x] Email Warming tool
- [x] Agent status tracking (Active/Idle)
- [x] Stats: Total AI Agents, Active Agents, Email Domains, System Uptime

#### 5. Sales & Business Development (NEW)
- [x] 4 Intake Paths: Outbound, Inbound, Referrals, Reactivation
- [x] Lead Pipeline table with status tracking
- [x] Conversion rates for each path
- [x] 5 Pillars filter (Technology, Talent, Advisory, Academy, Operate)
- [x] Stats: Active Leads, Pipeline Value, Existing Clients, Avg Conversion

#### 6. Marketing & Brand (NEW)
- [x] Content Targets with progress bars (Articles 14/20, LinkedIn 98/130, Newsletters 3/4, Case Studies 1/2)
- [x] Content Calendar tool
- [x] LinkedIn Scheduler tool
- [x] Recent Content table with performance metrics
- [x] Content type filtering

#### 7. Advisory & Consulting (NEW)
- [x] Pricing Approval Gates (Under $30K, $30K-$75K, Over $75K)
- [x] Scoping Tool
- [x] Proposal Generator tool
- [x] Engagements table with status tracking
- [x] Stats: Engagements, Pipeline Value, In Scoping, Approved

#### 8. Technology & Build (NEW)
- [x] 3 Engineering Pods (Pod A, Pod B, Pod C) with focus areas
- [x] Engineering Board tool
- [x] Pod Assignment tool
- [x] Projects table with progress tracking
- [x] Pod filtering
- [x] Stats: Active Projects, In Development, In Review, Engineers

#### 9. Operations & Finance (NEW)
- [x] Invoice Tracker with status (Paid, Pending, Overdue, Draft)
- [x] Contract Manager tool
- [x] Financial stats: Total Revenue, Collected, Outstanding, Overdue count
- [x] Status filtering and search

#### 10. Academy & Learning (NEW)
- [x] Learning Tracks: AI Engineer Track, Brand Architect Track, Tech Fundamentals
- [x] Day Learning Platform tool
- [x] Trainee Tracker tool
- [x] Trainees table with progress bars
- [x] Track filtering
- [x] Stats: Total Trainees, Currently Learning, Successfully Placed, Avg Progress

#### 11. Client Delivery (NEW)
- [x] Deployed Staff Manager with 5 staff members
- [x] SLA Tracker tool
- [x] SLA scores with color coding
- [x] Status filtering (Active, Ending Soon, Completed)
- [x] Stats: Total Deployed, Active, Avg SLA Score, Ending Soon

### Proposal Management System
- [x] Client folder management (Create, View, Delete)
- [x] Proposal file upload (PDF, PPTX, DOC, DOCX, XLS, XLSX)
- [x] Shareable links for clients (public access, no auth required)
- [x] Download functionality
- [x] Link regeneration
- [x] Activity logging for all proposal actions
- [x] Public proposal view page at /proposals/view/:shareToken

### Procure AI Presentations
- [x] V1: Original presentation
- [x] V2: 8-section enterprise presentation with PDF export
- [x] V3: Executive Pack (pricing removed)
- [x] V4: Premium 12-slide executive kick-off presentation
- [x] Scroll-based presentation variant
- [x] Email gating for public presentation links
- [x] Proposal Viewer analytics tracking

### DocSend-like Email Gate & Analytics
- [x] Email/name capture form before viewing presentations
- [x] Viewer tracking with IP, device, browser info
- [x] Proposal Viewers admin dashboard
- [x] View statistics and summaries

### Comprehensive Analytics System
- [x] Analytics tab in Settings (Super Admin only)
- [x] Automatic page view tracking via AnalyticsProvider context
- [x] User action tracking (clicks, form submissions, uploads)
- [x] Session management with heartbeat (30-second intervals)
- [x] Analytics dashboard with charts and tables

### Settings - Super Admin
- [x] Webhook Configuration
- [x] User Management
- [x] Login Records tracking
- [x] Device Locking
- [x] Activity Log viewer
- [x] Analytics Dashboard
- [x] Proposal Viewers Analytics

## Prioritized Backlog

### P0 - Critical (Completed)
- [x] All 11 Business Unit Pages - DONE Feb 17, 2026
- [x] Comprehensive Analytics System - DONE
- [x] Procure AI Presentations - DONE
- [x] PDF Download Fix - DONE

### P1 - High Priority
- [ ] Add Resend API key to enable password reset emails
- [ ] Connect business unit tools to backend APIs (currently using static data)
- [ ] Build working Project Tracker with CRUD operations
- [ ] Build working Invoice Tracker with CRUD operations

### P2 - Future Enhancements  
- [ ] Global search bar functionality
- [ ] Notification bell feature
- [ ] Recent Activity Feed on dashboard using analytics data
- [ ] Pagination for history tables
- [ ] Backend refactoring (server.py is >2000 lines - split into routers)
- [ ] PDF download verification for V2 and V3 presentations

## API Endpoints

### Analytics
- `GET /api/analytics/summary` - Get analytics summary (days param)
- `GET /api/analytics/users` - Get per-user analytics
- `GET /api/analytics/sessions` - Get session history
- `GET /api/analytics/page-views` - Get page view analytics
- `GET /api/analytics/actions` - Get user action analytics
- `GET /api/analytics/user/{user_id}` - Get single user details
- `POST /api/analytics/page-view` - Track page view
- `POST /api/analytics/action` - Track user action
- `POST /api/analytics/session/start` - Start analytics session
- `POST /api/analytics/session/end` - End analytics session
- `POST /api/analytics/heartbeat` - Update session activity

### Proposal Management
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create client folder
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client and all proposals
- `GET /api/clients/{id}/proposals` - Get client proposals
- `POST /api/clients/{id}/proposals` - Upload proposal file
- `GET /api/proposals` - Get all proposals
- `DELETE /api/proposals/{id}` - Delete proposal
- `POST /api/proposals/{id}/regenerate-link` - Regenerate share link
- `GET /api/proposals/shared/{token}` - Public: Get proposal info
- `GET /api/proposals/shared/{token}/download` - Public: Download file

### Proposal Viewers
- `POST /api/proposals/viewers` - Record new view
- `GET /api/proposals/viewers/{proposal_slug}` - Get viewers for proposal
- `GET /api/proposals/viewers/stats` - Aggregate stats
- `GET /api/proposals/viewers/summary` - Summary per proposal

## Public Routes (No Auth Required)
- `/proposals/view/:shareToken` - View shared proposal
- `/proposals/procure-ai` - Procure AI V2 presentation (email gated)
- `/proposals/procure-ai-executive` - Executive Pack V4 (email gated)
- `/proposals/procure-ai-executive-v3` - Executive Pack V3 (email gated)
- `/proposals/procure-ai-scroll` - Scroll presentation (email gated)
- `/proposals/procure-ai-v1` - V1 presentation (email gated)

## Seeded Admin Credentials
- Email: joshua@thcohq.com
- Password: THCOAdmin2024!
- Role: Super Admin (full access)

## Recent Changes

### Feb 17, 2026 - Business Unit Pages Implementation
- Created all 10 new business unit pages with tools based on THCO Operating Cycle
- Each page includes: breadcrumb, header, stats cards, tools grid, data tables
- All pages use static/sample data for display purposes
- Removed UnitComingSoon placeholders
- Updated sidebar to show all units as ACTIVE
- Testing agent confirmed 100% success rate

### Files Created
- `/app/frontend/src/pages/SalesAndBD.jsx`
- `/app/frontend/src/pages/ITAndTools.jsx`
- `/app/frontend/src/pages/THCOHRPage.jsx`
- `/app/frontend/src/pages/MarketingAndBrand.jsx`
- `/app/frontend/src/pages/OperationsAndFinance.jsx`
- `/app/frontend/src/pages/AdvisoryAndConsulting.jsx`
- `/app/frontend/src/pages/TechnologyAndBuild.jsx`
- `/app/frontend/src/pages/AcademyAndLearning.jsx`
- `/app/frontend/src/pages/ClientDelivery.jsx`
- `/app/frontend/src/pages/ProjectManagement.jsx` (already existed, now connected)
