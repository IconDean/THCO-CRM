# feature/tasks-board — Project Summary

Living summary of this branch's work, kept up to date as we go so we
can look things up here instead of re-deriving them from scratch each
session. Update the relevant section whenever a session makes a
meaningful change; don't let this go stale.

See also: [DEBUG_LOG.md](DEBUG_LOG.md) for bug investigations.

---

## What this branch is

Restructures THCO CRM's Task Management module into a **project-centric,
Trello-style workspace**, plus a **public sharing** feature for clients.
Two rounds of work so far:

### Round 1 — Project-centric restructure
- Task page now opens to a **Projects Workspace** (grid of existing
  Flow projects, reused via `db.projects` — never duplicated), not
  boards directly.
- Selecting a project opens *only that project's* boards (`project_id`
  scoping on `task_boards`/`task_cards`).
- "Add another board" opens a dropdown of 8 predefined templates
  (`UI/UX Tasks, Dependencies, Backlog, Frontend Todo, Backend Todo,
  QA Review, Ready For Merge, Done`) + "+ Add Custom Board" (dedupe,
  autofocus, Enter/Esc, reusable in the session's dropdown after save).
- Coordinator gate: `is_delivery_coordinator` flag or `super_admin`
  (existing app concept, reused as-is per "don't alter the permission
  architecture").
- Added `priority` field end-to-end (was modeled in the backend but
  had no UI control at all — added the selector + card badge).
- Added `progress` (stage/10 × 100) to the project summary + cards.
- Fixed a permission leak: `TaskCard` wasn't reading the `canManage`
  prop `BoardColumn` passed it, so drag handles/menus were visible to
  non-coordinators (backend still blocked the actual mutation, but the
  UI shouldn't have offered it).
- Fixed a spec violation: the empty-boards CTA bypassed the template
  dropdown and hardcoded a "Backlog" board — now reuses the same
  `AddBoard` dropdown as the populated state.

### Round 2 — Sharing + dropdown scroll
- **Per-project share link** (Google-Docs-style), stored in its own
  `task_shares` collection (one doc per `project_id`, decoupled from
  the Flow `projects` collection on purpose — keeps the feature easy
  to extend later with password/expiry/audit-log without touching
  Flow).
  - Coordinator-only management: generate / regenerate (invalidates
    old token in place) / enable-disable / permission (`view`|`edit`).
  - Public endpoints under `/tasks/shared/{token}` — no auth, token is
    the only thing in the URL, project id is never returned to the
    client. Every mutation re-validates the board/card actually
    belongs to the token's project.
  - "Editable" links can create/edit/move tasks between boards, but
    can **never** manage boards, delete anything, or assign people
    (assignment stays coordinator-only, matching the round-1 rule).
  - Public page: `frontend/src/pages/TaskBoardSharedView.jsx`, route
    `/tasks/shared/:shareToken` registered as a bare route in `App.js`
    (no `ProtectedRoute`/sidebar — same pattern as the existing public
    proposal-view route).
- **Permissions refactor**: replaced the boolean `canManage` prop with
  a `permissions` object (`manageBoards / createTasks / editTasks /
  moveTasks / deleteTasks / assignTasks`), defined in
  `frontend/src/components/tasks/permissions.js`. This is what lets
  `TaskBoard`/`BoardColumn`/`TaskCard` serve THREE modes (coordinator,
  internal read-only, public "Editable" share) with zero duplicated
  rendering/drag-and-drop code, instead of forking a "SharedBoard"
  component.
- **IoC refactor**: `TaskBoard.jsx` no longer calls `tasksAPI`
  directly — it takes an injected `api` object
  (`load/createBoard/renameBoard/deleteBoard/createCard/editCard/deleteCard/reorder`).
  `Tasks.jsx` wires it to the authenticated endpoints;
  `TaskBoardSharedView.jsx` wires it to the public/shared endpoints.
- **Scrollable board-template dropdown**: the template list is now
  `max-h-64 overflow-y-auto` (verified via DOM inspection: 288px of
  content in a 256px box, scrolls), with "+ Add Custom Board" pinned
  outside the scroll region.

---

## Key files

| Area | File |
|---|---|
| Backend router (boards/cards/labels/sharing) | `backend/routers/taskboard.py` |
| Permission sets | `frontend/src/components/tasks/permissions.js` |
| Projects grid (landing view) | `frontend/src/components/tasks/ProjectsWorkspace.jsx` |
| Page shell (Share button, Back to Projects) | `frontend/src/pages/Tasks.jsx` |
| Board/DnD orchestration (IoC'd) | `frontend/src/components/tasks/TaskBoard.jsx` |
| Board column | `frontend/src/components/tasks/BoardColumn.jsx` |
| Board template dropdown + custom board | `frontend/src/components/tasks/AddBoard.jsx` |
| Task card (face) | `frontend/src/components/tasks/TaskCard.jsx` |
| Task editor modal | `frontend/src/components/tasks/TaskCardEditor.jsx` |
| Share modal | `frontend/src/components/tasks/ShareModal.jsx` |
| Public shared board page | `frontend/src/pages/TaskBoardSharedView.jsx` |
| Frontend API client | `frontend/src/lib/api.js` (`tasksAPI`) |
| Route registration | `frontend/src/App.js` (`/tasks/shared/:shareToken`) |

## Data model

```
projects (Flow, reused — not owned by this module)

task_boards          { board_id, project_id, title, position, ... }
task_cards            { card_id, board_id, project_id, title, description,
                         priority, labels[], assignees[], due_date, position }
task_labels           { label_id, name, color }  — global, reusable
task_shares           { project_id, share_token, permission, enabled,
                         created_by, created_at, updated_at }  — one per project
```

## Known operational quirk (not a code bug)

The dev backend on **port 8000** (behind `localhost:5178`) is a
long-running process that does not pick up code changes despite
`--reload`, and cannot be killed/restarted from inside this sandboxed
session (`Get-Process`/`tasklist`/`taskkill` all report it doesn't
exist, yet it owns the port and has live children). Every round of
backend changes in this project has had to be verified against a
**scratch instance on port 8001** instead. See
[DEBUG_LOG.md](DEBUG_LOG.md) for the exact investigation and the
restart steps. **After backend changes, remind the user to restart
their real backend process before testing on 5178/8000.**

## Conventions carried across sessions

- Reuse existing UI primitives under `frontend/src/components/ui/`
  (Dialog, AlertDialog, Switch, Popover, Avatar, Button, Badge) rather
  than building new ones.
- Warm/gold ProcureAI palette for this module: `#F6F1EA` (linen bg),
  `#C6A15B` (marigold accent), `#1B4332` (deep green), dark mode
  `#161E1B` / `#1FB58A`. The proposals module's navy/emerald branding
  is a *different* feature — don't copy it here.
- Dev seed accounts: `admin@thco.dev` / `Admin123!` (super_admin),
  `user@thco.dev` / `User123!` (team_member, non-coordinator) —
  `backend/seed_users.py`.
