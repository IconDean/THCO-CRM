import { Plus, X } from "lucide-react";
import { useInlineCreate } from "./useInlineCreate";

/**
 * "+ Add another board" affordance that transforms into an inline creator.
 * Sits at the end of the horizontal board row.
 */
export default function AddBoard({ onCreate }) {
  const f = useInlineCreate({ onSubmit: onCreate, placeholder: "Board Name" });

  if (!f.open) {
    return (
      <button
        onClick={f.openForm}
        data-testid="add-board-trigger"
        className="shrink-0 w-[280px] flex items-center gap-2 px-4 py-3 rounded-xl bg-white/60 hover:bg-white border border-dashed border-[#D8D3C7] text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]/40"
      >
        <Plus className="w-4 h-4" />
        Add another board
      </button>
    );
  }

  return (
    <div
      className="shrink-0 w-[280px] rounded-xl bg-white border border-[#EAE7E0] p-3 shadow-sm"
      data-testid="add-board-form"
    >
      <input
        ref={f.inputRef}
        value={f.value}
        onChange={(e) => f.setValue(e.target.value)}
        onKeyDown={f.onKeyDown}
        onBlur={f.onBlur}
        placeholder="Board Name"
        aria-label="Board Name"
        data-testid="add-board-input"
        className="w-full px-3 py-2 rounded-lg border border-[#EAE7E0] bg-[#FBFAF7] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]/40 focus:border-[#C6A15B]"
      />
      <div className="flex items-center gap-2 mt-2.5">
        <button
          onMouseDown={(e) => e.preventDefault()} /* prevent blur before click */
          onClick={f.handleSubmitAndClose}
          disabled={f.busy || !f.value.trim()}
          data-testid="add-board-confirm"
          className="px-3 py-1.5 rounded-md bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
        >
          Create Board
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={f.cancel}
          aria-label="Cancel"
          data-testid="add-board-cancel"
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-black/[0.04] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
