import { Plus, X } from "lucide-react";
import { useInlineCreate } from "./useInlineCreate";

/**
 * "+ Add Task" affordance at the bottom of a board column.
 * Transforms into an inline creator with the same keyboard contract.
 */
export default function AddTask({ onCreate, disabled }) {
  const f = useInlineCreate({ onSubmit: onCreate, placeholder: "Task Name" });

  if (disabled) return null;

  if (!f.open) {
    return (
      <button
        onClick={f.openForm}
        data-testid="add-task-trigger"
        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-black/[0.04] text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]/40"
      >
        <Plus className="w-4 h-4" />
        Add Task
      </button>
    );
  }

  return (
    <div className="p-1.5" data-testid="add-task-form">
      <textarea
        ref={f.inputRef}
        value={f.value}
        onChange={(e) => f.setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            f.handleSubmitAndClose();
          } else if (e.key === "Escape") {
            e.preventDefault();
            f.cancel();
          }
        }}
        onBlur={f.onBlur}
        placeholder="Task Name"
        aria-label="Task Name"
        rows={2}
        data-testid="add-task-input"
        className="w-full resize-none px-3 py-2 rounded-lg border border-[#C6A15B] bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]/40"
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={f.handleSubmitAndClose}
          disabled={f.busy || !f.value.trim()}
          data-testid="add-task-confirm"
          className="px-3 py-1.5 rounded-md bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
        >
          Add Task
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={f.cancel}
          aria-label="Cancel"
          data-testid="add-task-cancel"
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-black/[0.04] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
