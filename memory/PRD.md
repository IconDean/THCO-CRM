# THCO Internal Portal - Product Requirements Document

## Original Problem Statement
Build an internal company portal for THCO — a professional services firm. This is the internal hub (like SharePoint) where staff access AI-powered tools organized by business unit. All tools connect to external n8n webhooks.

## Architecture & Tech Stack
- **Frontend**: React 19 with TailwindCSS, Shadcn/UI components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: Email/Password + Emergent Google OAuth
- **Email Service**: Resend (for password reset)
- **File Storage**: Local file storage in /app/backend/uploads/proposals/

## User Personas
1. **Super Admin** - Full access, can manage users, configure webhooks, view all activity and login records
2. **Mini Admin** - Can manage team members within assigned units
3. **Team Member** - Can access assigned units and use tools

## Core Requirements (Static)
- Light mode theme with THCO branding (redesigned from dark mode)
- Role-based access control
- Webhook integration for n8n workflows
- Responsive design (desktop, tablet, mobile)
- Activity logging
- Login tracking with device locking

## What's Been Implemented

### Authentication (Feb 8, 2026)
- [x] Email/Password login
- [x] Google OAuth integration
- [x] Forgot Password flow (UI complete, needs Resend API key for emails)
- [x] Session management with secure cookies
- [x] First user seeded as Super Admin (joshua@thcohq.com)

### Dashboard (Feb 8, 2026)
- [x] Welcome section with user name and role badge
- [x] Quick stats (Tools Available, Pending Requests, Recent Activity)
- [x] 8 Business Unit cards with access control
- [x] Activity feed

### Business Units (Feb 8, 2026)
- [x] Talent & Human Capital - ACTIVE with 2 tools
- [x] 7 other units - Coming Soon placeholders

### Talent & Human Capital Tools (Feb 8, 2026)
- [x] AI Candidate Sourcing form with all fields per spec
- [x] Database Search form with all fields per spec
- [x] Request History with expandable rows
- [x] Webhook submission (configurable URLs)

### Settings - Super Admin (Feb 8, 2026)
- [x] Webhook Configuration (Sourcing + Database Search)
- [x] User Management (Add/Edit/Disable/Delete users)
- [x] Login Records tracking
- [x] Device Locking
- [x] Activity Log viewer

### Proposal Management System (Feb 12, 2026) - NEW
- [x] Client folder management (Create, View, Delete)
- [x] Proposal file upload (PDF, PPTX, DOC, DOCX, XLS, XLSX)
- [x] Shareable links for clients (public access, no auth required)
- [x] Download functionality
- [x] Link regeneration
- [x] Activity logging for all proposal actions
- [x] Public proposal view page at /proposals/view/:shareToken

### UI Redesign (Feb 2026)
- [x] Complete redesign from dark to light theme
- [x] Modern, minimalist aesthetic
- [x] Updated all pages and components

## Prioritized Backlog

### P0 - Critical (Completed)
- [x] Proposal Management System ✓

### P1 - High Priority
- Add Resend API key to enable password reset emails
- Enable remaining business units as tools are built
- Add more webhooks as n8n workflows are created

### P2 - Future Enhancements
- Move logout button to user dropdown (currently at sidebar bottom)
- Dashboard activity feed improvements
- Search bar functionality
- Notification bell feature
- Pagination for history tables
- Candidate Pipeline (Kanban board)
- Email & Outreach Templates
- Interview Scheduling integration

## API Endpoints

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

## Seeded Admin Credentials
- Email: joshua@thcohq.com
- Password: THCOAdmin2024!
- Role: Super Admin (full access to all units)
