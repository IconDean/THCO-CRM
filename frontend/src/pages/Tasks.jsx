import TaskBoard from "../components/tasks/TaskBoard";

/**
 * Tasks page — Trello-like task board.
 *
 * Entry point: the "/tasks" route and the navbar "Tasks" link (same destination).
 * Renders inside DashboardLayout (via ProtectedRoute). Any authenticated user
 * may manage boards (no business-unit gate).
 */
export default function Tasks() {
  return (
    <div className="space-y-5" data-testid="tasks-page">
      {/* Page header */}
      <div className="flex items-end justify-between border-b border-gray-100 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#A9834E] mb-1.5">
            Task Board
          </p>
          <h1 className="font-display text-2xl text-gray-900">Tasks</h1>
          <p className="text-xs text-gray-500 mt-1">
            Organize project work into boards. Drag cards to reorder or move them across boards.
          </p>
        </div>
      </div>

      {/* Board canvas — fills available height, boards scroll horizontally */}
      <div className="flex-1" data-testid="tasks-canvas">
        <TaskBoard />
      </div>
    </div>
  );
}
