# THCO Internal Portal - Product Requirements Document

## Original Problem Statement
Build an internal company portal for THCO — a professional services firm. This is the internal hub (like SharePoint) where staff access AI-powered tools organized by business unit. All tools connect to external n8n webhooks.

## Architecture & Tech Stack
- **Frontend**: React 19 with TailwindCSS, Shadcn/UI components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: Email/Password + Emergent Google OAuth
- **Email Service**: Resend (for password reset)

## User Personas
1. **Super Admin** - Full access, can manage users, configure webhooks, view all activity
2. **Mini Admin** - Can manage team members within assigned units
3. **Team Member** - Can access assigned units and use tools

## Core Requirements (Static)
- Dark mode only with THCO branding (#0D0F1A background, #7C64FF primary accent)
- Role-based access control
- Webhook integration for n8n workflows
- Responsive design (desktop, tablet, mobile)
- Activity logging

## What's Been Implemented (Feb 8, 2026)
### Authentication
- [x] Email/Password login
- [x] Google OAuth integration
- [x] Forgot Password flow (UI complete, needs Resend API key for emails)
- [x] Session management with secure cookies
- [x] First user seeded as Super Admin (joshua@thcohq.com)

### Dashboard
- [x] Welcome section with user name and role badge
- [x] Quick stats (Tools Available, Pending Requests, Recent Activity)
- [x] 8 Business Unit cards with access control
- [x] Activity feed

### Business Units
- [x] Talent & Human Capital - ACTIVE with 2 tools
- [x] 7 other units - Coming Soon placeholders

### Talent & Human Capital Tools
- [x] AI Candidate Sourcing form with all fields per spec
- [x] Database Search form with all fields per spec
- [x] Request History with expandable rows
- [x] Webhook submission (configurable URLs)

### Settings (Super Admin)
- [x] Webhook Configuration (Sourcing + Database Search)
- [x] User Management (Add/Edit/Disable/Delete users)
- [x] Activity Log viewer

### UI/UX
- [x] Collapsible sidebar navigation
- [x] Mobile responsive design
- [x] Toast notifications
- [x] Loading states
- [x] Form validation with Zod

## Prioritized Backlog

### P0 - Critical (Next)
- Add Resend API key to enable password reset emails

### P1 - High Priority
- Enable remaining business units as tools are built
- Add more webhooks as n8n workflows are created

### P2 - Future Enhancements
- Candidate Pipeline (Kanban board)
- Email & Outreach Templates
- Interview Scheduling integration
- Search across all accessible tools
- Notification system improvements

## Next Tasks
1. Configure Resend API key for password reset emails
2. Connect n8n webhook URLs in Settings
3. Add additional team members via User Management
4. Build out remaining tools for Talent unit

## Seeded Admin Credentials
- Email: joshua@thcohq.com
- Password: THCOAdmin2024!
- Role: Super Admin (full access to all units)
