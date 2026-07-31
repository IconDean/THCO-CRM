import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "../ui/alert-dialog";
import { Link2, Copy, RefreshCw, Eye, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { tasksAPI } from "../../lib/api";

/**
 * Share modal — Google-Docs-style link management for a project's task
 * board. One link per project: generate, copy, regenerate (invalidates the
 * old one), toggle on/off, and choose View Only vs. Editable access.
 * Coordinator-only (the Share button that opens this is itself gated).
 */
export default function ShareModal({ open, onClose, projectId }) {
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState(null); // { exists, share_token, permission, enabled }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    tasksAPI
      .getShare(projectId)
      .then((data) => {
        if (active) setShare(data);
      })
      .catch(() => toast.error("Failed to load sharing settings"))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, projectId]);

  const shareUrl = share?.share_token
    ? `${window.location.origin}/tasks/shared/${share.share_token}`
    : null;

  const generate = async () => {
    setBusy(true);
    try {
      const data = await tasksAPI.generateShare(projectId);
      setShare(data);
      toast.success("Share link created");
    } catch {
      toast.error("Failed to create share link");
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async () => {
    setBusy(true);
    try {
      const data = await tasksAPI.regenerateShare(projectId);
      setShare(data);
      toast.success("Link regenerated — the old link no longer works");
    } catch {
      toast.error("Failed to regenerate link");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied");
  };

  const setPermission = async (permission) => {
    if (permission === share.permission) return;
    const prev = share;
    setShare((s) => ({ ...s, permission }));
    try {
      const data = await tasksAPI.updateShare(projectId, { permission });
      setShare(data);
    } catch {
      setShare(prev);
      toast.error("Failed to update permission");
    }
  };

  const setEnabled = async (enabled) => {
    const prev = share;
    setShare((s) => ({ ...s, enabled }));
    try {
      const data = await tasksAPI.updateShare(projectId, { enabled });
      setShare(data);
      toast.success(enabled ? "Link enabled" : "Link disabled");
    } catch {
      setShare(prev);
      toast.error("Failed to update link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="sm:max-w-[480px] bg-[#F6F1EA] dark:bg-[#161E1B] border-[#EAE7E0] dark:border-[#2A303B]"
        data-testid="share-modal"
      >
        <DialogHeader>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#A9834E] dark:text-[#1FB58A] mb-1">
            Share
          </p>
          <DialogTitle className="font-display text-xl text-gray-900 dark:text-[#F2F0EB]">
            Project task board
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-[#1B4332]" />
          </div>
        ) : !share?.exists ? (
          <div className="py-4 text-center">
            <p className="text-sm text-gray-500 dark:text-[#8E8C87] mb-5 max-w-sm mx-auto">
              Generate a link clients can use to follow this project's progress —
              no ProcureAI login required.
            </p>
            <Button
              onClick={generate}
              disabled={busy}
              data-testid="share-generate"
              className="bg-[#C6A15B] hover:bg-[#8F7340] text-white"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Generate Link
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Link + copy */}
            <div>
              <div className={`flex items-center gap-2 ${!share.enabled ? "opacity-50" : ""}`}>
                <input
                  readOnly
                  value={shareUrl || ""}
                  onFocus={(e) => e.target.select()}
                  data-testid="share-url"
                  className="flex-1 px-3 py-2 rounded-lg border border-[#EAE7E0] dark:border-[#2A303B] bg-white dark:bg-[#10141A] text-sm text-gray-700 dark:text-[#B0AEA8] truncate focus:outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copy}
                  disabled={!share.enabled}
                  aria-label="Copy link"
                  data-testid="share-copy"
                  className="border-[#EAE7E0] dark:border-[#2A303B] bg-white dark:bg-[#1A2622]"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {!share.enabled && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                  This link is disabled — visitors won't be able to access it.
                </p>
              )}
            </div>

            {/* Permission */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-[#8E8C87] mb-2">Access</p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPermission("view")}
                  data-testid="share-permission-view"
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    share.permission !== "edit"
                      ? "bg-[#1B4332] border-transparent text-white"
                      : "bg-white dark:bg-[#10141A] border-[#EAE7E0] dark:border-[#2A303B] text-gray-600 dark:text-[#B0AEA8] hover:border-[#C6A15B]"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Only
                </button>
                <button
                  type="button"
                  onClick={() => setPermission("edit")}
                  data-testid="share-permission-edit"
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    share.permission === "edit"
                      ? "bg-[#1B4332] border-transparent text-white"
                      : "bg-white dark:bg-[#10141A] border-[#EAE7E0] dark:border-[#2A303B] text-gray-600 dark:text-[#B0AEA8] hover:border-[#C6A15B]"
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editable
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                {share.permission === "edit"
                  ? "Visitors can create, edit, and move tasks between boards — but can't manage boards, delete tasks, or assign people."
                  : "Visitors can view boards, tasks, assignees, due dates, and progress only."}
              </p>
            </div>

            {/* Enabled toggle */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-[#E6E4DF]">Link enabled</p>
                <p className="text-[11px] text-gray-400">Anyone with the link can access it while enabled.</p>
              </div>
              <Switch
                checked={share.enabled}
                onCheckedChange={setEnabled}
                data-testid="share-enabled-toggle"
              />
            </div>

            {/* Regenerate */}
            <div className="border-t border-[#EAE7E0] dark:border-[#2A303B] pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    data-testid="share-regenerate"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate Link
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Regenerate this link?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The current link will stop working immediately. Anyone who has it
                      will need the new one.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={regenerate} data-testid="share-regenerate-confirm">
                      Regenerate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
