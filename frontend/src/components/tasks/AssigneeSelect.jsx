import { useEffect, useMemo, useState } from "react";
import { Search, Check, ChevronDown, Users2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { tasksAPI } from "../../lib/api";
import { toast } from "sonner";

/**
 * Searchable assignee dropdown for the task editor.
 *
 * - Fetches all team members from /api/tasks/team-members.
 * - Search filters by name/email.
 * - Selecting a user adds them as an assignee chip; duplicates are blocked.
 * - Assigned users render as removable chips beneath the field.
 *
 * `assignees` is an array of user objects { user_id, name, email, picture, role }.
 */
export default function AssigneeSelect({ assignees, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await tasksAPI.listTeamMembers();
        if (active) setMembers(data || []);
      } catch {
        if (active) toast.error("Failed to load team members");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const assignedIds = useMemo(() => new Set(assignees.map((a) => a.user_id)), [assignees]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        (m.name || "").toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q)
    );
  }, [members, query]);

  const initials = (name = "") =>
    name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";

  const addAssignee = (member) => {
    if (assignedIds.has(member.user_id)) return; // prevent duplicates
    onChange([...assignees, member]);
  };

  const removeAssignee = (userId) => {
    onChange(assignees.filter((a) => a.user_id !== userId));
  };

  return (
    <div className="space-y-2">
      {/* Trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-testid="assignee-trigger"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-[#EAE7E0] dark:border-[#2A303B] bg-[#FBFAF7] dark:bg-[#10141A] text-sm text-gray-700 dark:text-[#B0AEA8] hover:border-[#C6A15B] dark:hover:border-[#1FB58A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]/40 dark:focus-visible:ring-[#1FB58A]/40"
          >
            <Users2 className="w-4 h-4 text-gray-400" />
            <span className="flex-1 text-left">
              {assignees.length === 0 ? "Add assignees…" : `${assignees.length} assigned`}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] min-w-[260px] p-0 bg-white dark:bg-[#1A2029] border border-[#EAE7E0] dark:border-[#2A303B]"
          align="start"
        >
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#EAE7E0] dark:border-[#2A303B]">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search team members…"
              data-testid="assignee-search"
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-[#E6E4DF] placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          {/* List */}
          <div className="max-h-56 overflow-y-auto py-1">
            {loading && (
              <p className="px-3 py-3 text-xs text-gray-400">Loading…</p>
            )}
            {!loading && filtered.length === 0 && (
              <p className="px-3 py-3 text-xs text-gray-400">No members found.</p>
            )}
            {filtered.map((m) => {
              const isAssigned = assignedIds.has(m.user_id);
              return (
                <button
                  type="button"
                  key={m.user_id}
                  onClick={() => addAssignee(m)}
                  data-testid={`assignee-option-${m.user_id}`}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#F7F6F3] dark:hover:bg-[#242A34] transition-colors text-left"
                >
                  <Avatar className="w-7 h-7 rounded-full">
                    {m.picture ? <AvatarImage src={m.picture} /> : null}
                    <AvatarFallback className="bg-[#1B4332] text-white text-[10px] font-medium">
                      {initials(m.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-[#E6E4DF] truncate">{m.name}</p>
                    <p className="text-[11px] text-gray-500 dark:text-[#8E8C87] truncate">{m.email}</p>
                  </div>
                  {m.role && (
                    <span className="text-[10px] text-gray-400 capitalize">{m.role.replace("_", " ")}</span>
                  )}
                  {isAssigned && <Check className="w-4 h-4 text-[#1FB58A]" />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Assigned chips */}
      {assignees.length > 0 && (
        <div className="flex flex-wrap gap-1.5" data-testid="assignee-chips">
          {assignees.map((a) => (
            <span
              key={a.user_id}
              className="inline-flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-[#C6A15B]/15 dark:bg-[#1FB58A]/15 text-[#8F7340] dark:text-[#6FD3A8] text-xs font-medium"
            >
              <Avatar className="w-4 h-4 rounded-full">
                {a.picture ? <AvatarImage src={a.picture} /> : null}
                <AvatarFallback className="bg-[#1B4332] text-white text-[8px]">
                  {initials(a.name)}
                </AvatarFallback>
              </Avatar>
              {a.name}
              <button
                type="button"
                onClick={() => removeAssignee(a.user_id)}
                aria-label={`Remove ${a.name}`}
                data-testid={`assignee-remove-${a.user_id}`}
                className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
