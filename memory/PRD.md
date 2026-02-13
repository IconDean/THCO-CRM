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
- [x] 8 Business Unit cards with access control
- [x] Activity feed

### Business Units
- [x] Talent & Human Capital - ACTIVE with 2 tools
- [x] 7 other units - Coming Soon placeholders

### Proposal Management System (Feb 12, 2026)
- [x] Client folder management (Create, View, Delete)
- [x] Proposal file upload (PDF, PPTX, DOC, DOCX, XLS, XLSX)
- [x] Shareable links for clients (public access, no auth required)
- [x] Download functionality
- [x] Link regeneration
- [x] Activity logging for all proposal actions
- [x] Public proposal view page at /proposals/view/:shareToken

### Procure AI Presentation (Feb 12, 2026)
- [x] 8-section enterprise presentation at /proposals/procure-ai (PUBLIC - no auth)
- [x] Page-based slideshow navigation with Framer Motion animations
- [x] Sections: Overview, Architecture, RFQ Flow, Vendor Onboarding, Reverse Auction, Database, Data Upload, Next Steps
- [x] Keyboard navigation (arrow keys)
- [x] Left sidebar page numbers with hover expand
- [x] Bottom navigation bar with progress indicator
- [x] Multi-page PDF export using jspdf + html2canvas (Fixed Feb 13, 2026)
- [x] Scroll-based presentation variant at /proposals/procure-ai-scroll

### Comprehensive Analytics System (Feb 12, 2026)
- [x] Analytics tab in Settings (Super Admin only)
- [x] Automatic page view tracking via AnalyticsProvider context
- [x] User action tracking (clicks, form submissions, uploads)
- [x] Session management with heartbeat (30-second intervals)
- [x] Analytics dashboard with:
  - Total Users, Active Users, Total Sessions, Avg Duration
  - Page Views with daily/hourly breakdown
  - User Actions summary
  - Device and Browser breakdown
  - Most visited pages
  - User activity table with drill-down
  - Recent sessions table

### Settings - Super Admin
- [x] Webhook Configuration
- [x] User Management
- [x] Login Records tracking
- [x] Device Locking
- [x] Activity Log viewer
- [x] Analytics Dashboard (NEW)

### UI Theme (Feb 12, 2026)
- [x] Light sidebar with light content area (matching thcoteam.com)
- [x] Colorful gradient business unit cards
- [x] "Made with Emergent" branding removed

## Prioritized Backlog

### P0 - Critical (Completed)
- [x] Comprehensive Analytics System - DONE
- [x] Procure AI Presentation Page - DONE
- [x] PDF Download Fix (Multi-page capture) - DONE Feb 13, 2026

### P1 - High Priority
- [ ] Add Resend API key to enable password reset emails
- [ ] Enable remaining business units as tools are built
- [ ] Build remaining tools for Talent & Human Capital unit

### P2 - Future Enhancements  
- [ ] Move logout button to user dropdown in header (UX improvement)
- [ ] Recent Activity Feed on dashboard using analytics data
- [ ] Global search bar functionality
- [ ] Notification bell feature
- [ ] Candidate Pipeline (Kanban board)
- [ ] Email & Outreach Templates
- [ ] Interview Scheduling integration
- [ ] Pagination for history tables
- [ ] Backend refactoring (server.py is >2000 lines - split into routers)

## API Endpoints

### Analytics (NEW - Feb 12, 2026)
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

## Public Routes (No Auth Required)
- `/proposals/view/:shareToken` - View shared proposal
- `/proposals/procure-ai` - Procure AI presentation

## Seeded Admin Credentials
- Email: joshua@thcohq.com
- Password: THCOAdmin2024!
- Role: Super Admin (full access)
