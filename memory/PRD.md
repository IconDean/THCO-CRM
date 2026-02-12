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
- **Theme**: Dark mode with colorful gradient business unit cards

## User Personas
1. **Super Admin** - Full access, can manage users, configure webhooks, view all activity and login records
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
- [x] Dark theme with colorful gradient cards
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

### Settings - Super Admin
- [x] Webhook Configuration
- [x] User Management
- [x] Login Records tracking
- [x] Device Locking
- [x] Activity Log viewer

### UI Theme Update (Feb 12, 2026)
- [x] Restored dark theme matching production (thcoteam.com)
- [x] Colorful gradient business unit cards (purple, green, pink, blue, cyan, orange, amber, red)
- [x] Updated all pages to dark theme

## Prioritized Backlog

### P1 - High Priority
- Add Resend API key to enable password reset emails
- Enable remaining business units as tools are built

### P2 - Future Enhancements  
- Candidate Pipeline (Kanban board)
- Email & Outreach Templates
- Interview Scheduling integration
- Pagination for history tables

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
- Role: Super Admin (full access)
