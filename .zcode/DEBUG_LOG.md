# Task Board — Debug Log

Running log of bugs found on `feature/tasks-board`, root cause, and fix
status. Newest entries on top. Append here instead of losing this in
conversation history.

---

## 2026-07-31 — "Failed to load sharing settings" / "Failed to generate link"

**Symptom:** Opening the Share modal shows a "Failed to load sharing
settings" toast; clicking "Generate Link" shows "Failed to generate
share link". Screenshot: modal falls back to the empty "Generate
Link" state because the failed fetch leaves `share` as `null`, which
happens to render the same as a legitimate "no link yet" state — so
the UI *looks* plausible even though the request actually errored.

**Root cause:** The FastAPI backend process actually serving
`http://localhost:8000` (behind the app's `http://localhost:5178`
frontend) is running **stale code** — it predates every sharing
endpoint added on this branch (`GET/POST/PATCH /tasks/projects/{id}/share`,
`/tasks/shared/{token}`, etc.), so those routes 404 on that process.
Confirmed directly:

```
GET http://localhost:8000/api/tasks/projects/<id>/share → 404 Not Found
GET http://localhost:8000/api/tasks/projects/summary   → 200, but missing the
                                                           "progress" field
                                                           added in an earlier
                                                           session — same
                                                           staleness signature
```

This is **not a code bug** — the same backend code, run as a fresh
process on a scratch port (8001), served every sharing endpoint
correctly (generate/regenerate/disable/view/edit all verified via
curl and a full browser pass).

**Why the running process won't pick up changes:** it was started
with `--reload`, which should auto-restart on `.py` changes, but it
never has, across two separate sessions of edits to
`backend/routers/taskboard.py`. Investigated whether it could simply
be killed and restarted cleanly — it cannot, from this environment:

```
Get-NetTCPConnection -LocalPort 8000 → OwningProcess 26900
Get-Process -Id 26900                → "Cannot find a process with the process identifier 26900"
Get-CimInstance Win32_Process -Filter 'ProcessId=26900' → no result
tasklist                             → PID 26900 not listed (only its
                                         multiprocessing child, PID 21076,
                                         reports ParentProcessId=26900)
taskkill /F /PID 26900 /T            → "ERROR: The process "26900" not found."
```

PID 26900 owns the listening socket and has successfully spawned at
least one child process (proof it's alive), but is invisible to
`Get-Process`/`tasklist`/`taskkill` from this shell — it's managed
outside the process namespace this session can see or signal. It is
**not something I can restart from inside this environment.**

**Fix / what actually changed:** No code fix was needed — the sharing
feature itself is correct (see verification below). The blocker is
operational: the long-running dev backend needs a **manual restart**
by whoever manages that process outside this sandbox.

**How to fix it yourself:**
1. Find and stop whatever is currently serving port 8000 (however you
   normally start/stop the backend — your own terminal, a process
   manager, etc.). If you don't remember starting it directly, it may
   be started by your dev environment's own supervisor/launcher.
2. Restart it the same way you normally do:
   ```
   cd backend
   python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
   ```
   (use whichever Python/venv you normally use — `backend/.venv` if
   you have one).
3. Reload the app at `localhost:5178` and retry — Generate Link should
   work immediately after.

**Verification performed (on an isolated backend+frontend pair, ports
8001/5179, same MongoDB, to avoid touching the stale process):**
- `GET /tasks/projects/{id}/share` → `{"exists": false}` before any
  link exists (not 404).
- `POST /tasks/projects/{id}/share` → creates a link.
- `PATCH .../share {"permission": "edit"}` and `{"enabled": false}` →
  both applied correctly.
- `POST .../share/regenerate` → new token issued; the **old** token
  immediately 404s (`This link is unavailable or has been disabled`).
- Public `GET /tasks/shared/{token}` → returns project name,
  permission, progress, and boards — no `project_id` in the payload.
- Public create/edit card via an "Editable" link → succeeds; the same
  calls against a "View Only" link → `403 This link is view-only`.
- Full browser pass: Share modal, public page with no sidebar/app
  chrome, live badge (View Only / Editable), disabled-link "Link
  unavailable" page, and two-way consistency (a task edited via the
  public link shows up in the internal board on refresh, and vice
  versa).
- Test data (cards/link created during verification) was cleaned up
  from the shared dev database afterward.

**Additional confirmation:** attempted to start a second uvicorn
directly on port 8000 (in case the "phantom" PID wasn't a real bind).
It is real — the attempt fails with `[Errno 10048] only one usage of
each socket address ... is normally permitted` once startup reaches
the bind step. So port 8000 is genuinely held by a live process that
just isn't visible/signalable from this shell; there's no way to
free it or replace it from here.

**Status:** ✅ Feature code confirmed working. ⏳ Blocked on a manual
restart of the port-8000 process (outside my control) before it's
visible on `localhost:5178`.
