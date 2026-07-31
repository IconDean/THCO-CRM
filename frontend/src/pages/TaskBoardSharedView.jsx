import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, Eye, Pencil, Loader2 } from "lucide-react";
import TaskBoard from "../components/tasks/TaskBoard";
import { tasksAPI } from "../lib/api";
import { READ_ONLY_PERMISSIONS, SHARED_EDIT_PERMISSIONS } from "../components/tasks/permissions";

/**
 * Public, unauthenticated view of a single project's task board — the page
 * a Project Coordinator's share link points at. Rendered as a bare route
 * (no ProtectedRoute / DashboardLayout — see App.js), so there is no
 * sidebar, no other projects, no admin navigation: only this project's
 * boards and tasks, isolated exactly like the rest of the app enforces
 * for the authenticated workspace.
 */
export default function TaskBoardSharedView() {
  const { shareToken } = useParams();
  const [meta, setMeta] = useState(null); // { project_name, permission, progress }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await tasksAPI.getSharedBoard(shareToken);
        if (active) setMeta(data);
      } catch {
        if (active) setError("This link is unavailable or has been disabled.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [shareToken]);

  const permissions = meta?.permission === "edit" ? SHARED_EDIT_PERMISSIONS : READ_ONLY_PERMISSIONS;

  const api = useMemo(
    () => ({
      load: () => tasksAPI.getSharedBoard(shareToken).then((r) => r.boards),
      createCard: (boardId, data) => tasksAPI.createSharedCard(shareToken, boardId, data),
      editCard: (cardId, data) => tasksAPI.updateSharedCard(shareToken, cardId, data),
      reorder: (_boardOrder, cards) => tasksAPI.reorderShared(shareToken, cards),
    }),
    [shareToken]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F1EA] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#1B4332]" />
      </div>
    );
  }

  if (error || !meta) {
    return (
      <div className="min-h-screen bg-[#F6F1EA] flex items-center justify-center p-4" data-testid="shared-board-error">
        <div className="bg-white rounded-2xl border border-[#EAE7E0] shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="font-display text-xl text-gray-900 mb-2">Link unavailable</h1>
          <p className="text-sm text-gray-500">{error || "This link is unavailable or has been disabled."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F1EA]" data-testid="shared-board-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#EAE7E0] pb-5 mb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#A9834E] mb-1.5">
              Task Board
            </p>
            <h1 className="font-display text-2xl text-gray-900">{meta.project_name}</h1>
          </div>

          <span
            data-testid="shared-permission-badge"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 ${
              permissions === SHARED_EDIT_PERMISSIONS
                ? "bg-[#1B4332]/10 text-[#1B4332]"
                : "bg-[#C6A15B]/15 text-[#8F7340]"
            }`}
          >
            {permissions === SHARED_EDIT_PERMISSIONS ? (
              <Pencil className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
            {permissions === SHARED_EDIT_PERMISSIONS ? "Editable" : "View Only"}
          </span>
        </div>

        {/* Progress */}
        {typeof meta.progress === "number" && (
          <div className="mb-6 max-w-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Progress</span>
              <span className="text-[11px] font-semibold text-gray-700">{meta.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white border border-[#EAE7E0] overflow-hidden">
              <div className="h-full rounded-full bg-[#C6A15B]" style={{ width: `${meta.progress}%` }} />
            </div>
          </div>
        )}

        <TaskBoard permissions={permissions} api={api} />
      </div>
    </div>
  );
}
