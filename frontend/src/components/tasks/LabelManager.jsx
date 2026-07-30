import { useEffect, useMemo, useState } from "react";
import { Tag, Plus, Check, X, ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { tasksAPI } from "../../lib/api";
import { toast } from "sonner";

/**
 * Persistent, reusable label manager.
 *
 * - Clicking the field opens a dropdown of all saved labels (color + name).
 * - Selecting a label attaches it to the task; selected labels show a check.
 * - "+ Create New Label" reveals an inline form (name + color picker) that
 *   persists the label to the DB and immediately attaches it.
 *
 * `selected` is an array of label objects { label_id, name, color }.
 */

const PALETTE = [
  "#1B4332", "#2D6A4F", "#1FB58A", "#C6A15B", "#8F7340", "#D6BC8A",
  "#A94E5B", "#6B4C5B", "#4C6B5B", "#5B4C6B", "#73408F", "#4C5B6B",
  "#2563EB", "#DC2626", "#EA580C", "#CA8A04", "#16A34A", "#0891B2",
];

export default function LabelManager({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PALETTE[0]);
  const [saving, setSaving] = useState(false);

  const loadLabels = async () => {
    setLoading(true);
    try {
      const data = await tasksAPI.listLabels();
      setLabels(data || []);
    } catch {
      toast.error("Failed to load labels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLabels();
  }, []);

  const selectedIds = useMemo(() => new Set(selected.map((l) => l.label_id)), [selected]);

  const toggle = (label) => {
    if (selectedIds.has(label.label_id)) {
      onChange(selected.filter((l) => l.label_id !== label.label_id));
    } else {
      onChange([...selected, label]);
    }
  };

  const createLabel = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const created = await tasksAPI.createLabel({ name, color: newColor });
      setLabels((prev) => [...prev, created]);
      onChange([...selected, created]); // immediately attach
      setNewName("");
      setNewColor(PALETTE[0]);
      setCreating(false);
      toast.success(`Label "${created.name}" created`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create label");
    } finally {
      setSaving(false);
    }
  };

  const removeChip = (labelId) => {
    onChange(selected.filter((l) => l.label_id !== labelId));
  };

  return (
    <div className="space-y-2">
      {/* Trigger */}
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setCreating(false);
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            data-testid="label-trigger"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-[#EAE7E0] dark:border-[#2A303B] bg-[#FBFAF7] dark:bg-[#10141A] text-sm text-gray-700 dark:text-[#B0AEA8] hover:border-[#C6A15B] dark:hover:border-[#1FB58A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]/40 dark:focus-visible:ring-[#1FB58A]/40"
          >
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="flex-1 text-left">
              {selected.length === 0 ? "Add labels…" : `${selected.length} label${selected.length > 1 ? "s" : ""}`}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] min-w-[260px] p-0 bg-white dark:bg-[#1A2029] border border-[#EAE7E0] dark:border-[#2A303B]"
          align="start"
        >
          {/* Existing labels list */}
          <div className="max-h-48 overflow-y-auto py-1">
            {loading && <p className="px-3 py-3 text-xs text-gray-400">Loading…</p>}
            {!loading && labels.length === 0 && !creating && (
              <p className="px-3 py-3 text-xs text-gray-400">No labels yet. Create one below.</p>
            )}
            {labels.map((label) => {
              const isSelected = selectedIds.has(label.label_id);
              return (
                <button
                  type="button"
                  key={label.label_id}
                  onClick={() => toggle(label)}
                  data-testid={`label-option-${label.label_id}`}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#F7F6F3] dark:hover:bg-[#242A34] transition-colors text-left"
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 ring-1 ring-black/10"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="flex-1 text-sm font-medium text-gray-900 dark:text-[#E6E4DF] truncate">
                    {label.name}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-[#1FB58A]" />}
                </button>
              );
            })}
          </div>

          {/* Divider + create new */}
          <div className="border-t border-[#EAE7E0] dark:border-[#2A303B]">
            {!creating ? (
              <button
                type="button"
                onClick={() => setCreating(true)}
                data-testid="label-create-trigger"
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[#C6A15B] dark:text-[#1FB58A] hover:bg-[#FBF8F1] dark:hover:bg-[#242A34] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Label
              </button>
            ) : (
              <div className="p-3 space-y-3" data-testid="label-create-form">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); createLabel(); }
                    if (e.key === "Escape") { setCreating(false); setNewName(""); }
                  }}
                  placeholder="Label name"
                  data-testid="label-create-name"
                  className="w-full px-2.5 py-1.5 rounded-md border border-[#EAE7E0] dark:border-[#2A303B] bg-white dark:bg-[#10141A] text-sm text-gray-900 dark:text-[#E6E4DF] placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]/40 dark:focus-visible:ring-[#1FB58A]/40"
                />
                {/* Color picker */}
                <div className="flex flex-wrap gap-1.5" data-testid="label-color-picker">
                  {PALETTE.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewColor(c)}
                      aria-label={`Color ${c}`}
                      className={`w-6 h-6 rounded-full ring-1 ring-black/10 transition-transform hover:scale-110 ${
                        newColor === c ? "ring-2 ring-offset-1 ring-offset-white dark:ring-offset-[#1A2029] ring-gray-900 dark:ring-white" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={createLabel}
                    disabled={saving || !newName.trim()}
                    data-testid="label-create-save"
                    className="px-3 py-1.5 rounded-md bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-40 text-white text-xs font-medium transition-colors"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCreating(false); setNewName(""); setNewColor(PALETTE[0]); }}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-[#B0AEA8]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5" data-testid="label-chips">
          {selected.map((l) => (
            <span
              key={l.label_id}
              className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-0.5 rounded-full text-[11px] font-medium text-white"
              style={{ backgroundColor: l.color }}
            >
              {l.name}
              <button
                type="button"
                onClick={() => removeChip(l.label_id)}
                aria-label={`Remove ${l.name}`}
                data-testid={`label-remove-${l.label_id}`}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
