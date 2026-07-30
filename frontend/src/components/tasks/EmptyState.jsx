/**
 * Elegant empty state shown when no boards exist yet.
 * Matches the spec's copy and the CRM's gold-accented design language.
 */
export default function EmptyState({ onAdd }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-20 px-6 select-none"
      data-testid="tasks-empty-state"
    >
      <div className="w-20 h-20 mb-6 rounded-2xl bg-white border border-[#EAE7E0] shadow-sm flex items-center justify-center">
        {/* Minimal board/column illustration */}
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#C6A15B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="6" height="16" rx="1.5" />
          <rect x="11" y="4" width="6" height="11" rx="1.5" />
          <path d="M6 8h0M6 11h0M14 8h0" />
        </svg>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#A9834E] mb-3">
        Task Board
      </p>
      <h3 className="font-display text-2xl text-gray-900 mb-3">No boards have been created yet.</h3>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-7">
        Click <span className="font-medium text-gray-700">Add another board</span> to begin
        organizing project tasks.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C6A15B] hover:bg-[#8F7340] text-white text-sm font-medium transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B] focus-visible:ring-offset-2"
        data-testid="empty-add-board"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add another board
      </button>
    </div>
  );
}
