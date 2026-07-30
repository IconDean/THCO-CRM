import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, Clock, ChevronDown, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Calendar } from "../ui/calendar";

/**
 * Combined date + time picker.
 *
 * - A calendar selects the date; a 12-hour time selector (HH + MM + AM/PM)
 *   picks the time.
 * - `value` is an ISO datetime string (or null).
 * - Emits the full ISO datetime via `onChange`.
 * - Selected value renders as "July 30, 2026 · 3:30 PM".
 */

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

function toDateParts(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d;
}

export default function DateTimePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const date = toDateParts(value);

  // Keep a working date object in state while the popover is open.
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (open) {
      setDraft(date ? new Date(date) : new Date());
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!draft && open) {
    // ensures draft is initialized before rendering time selectors
    setDraft(date ? new Date(date) : new Date());
  }

  const emit = (next) => {
    if (!next || isNaN(next.getTime())) {
      onChange(null);
      return;
    }
    onChange(next.toISOString());
  };

  // --- time helpers (12h) ---
  let h12 = 12, min = 0, ampm = "AM";
  if (draft) {
    h12 = draft.getHours() % 12 || 12;
    min = draft.getMinutes();
    ampm = draft.getHours() >= 12 ? "PM" : "AM";
  }

  const setTime = (newH12, newMin, newAmpm) => {
    const next = draft ? new Date(draft) : new Date();
    let h24 = newH12 % 12;
    if (newAmpm === "PM") h24 += 12;
    next.setHours(h24, newMin, 0, 0);
    setDraft(next);
    emit(next);
  };

  const setDay = (day) => {
    const next = draft ? new Date(draft) : new Date();
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    setDraft(next);
    emit(next);
  };

  const clear = () => {
    onChange(null);
    setOpen(false);
  };

  // Display formatting
  const display = useMemo(() => {
    if (!date) return null;
    const d = new Date(date);
    const dh = d.getHours() % 12 || 12;
    const dm = d.getMinutes().toString().padStart(2, "0");
    const dap = d.getHours() >= 12 ? "PM" : "AM";
    const dstr = d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    return { date: dstr, time: `${dh}:${dm} ${dap}` };
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              data-testid="datetime-trigger"
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-[#EAE7E0] dark:border-[#2A303B] bg-[#FBFAF7] dark:bg-[#10141A] text-sm text-gray-700 dark:text-[#B0AEA8] hover:border-[#C6A15B] dark:hover:border-[#1FB58A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]/40 dark:focus-visible:ring-[#1FB58A]/40"
            >
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <span className="flex-1 text-left">
                {display ? display.date : "Select due date"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-white dark:bg-[#1A2029] border border-[#EAE7E0] dark:border-[#2A303B] shadow-lg"
            align="start"
          >
            {/* Calendar (themed) */}
            <div className="task-calendar" data-testid="datetime-calendar">
              <Calendar
                mode="single"
                selected={draft}
                onSelect={(day) => day && setDay(day)}
                initialFocus
              />
            </div>

            {/* Time selector */}
            <div className="border-t border-[#EAE7E0] dark:border-[#2A303B] p-3">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-gray-500 dark:text-[#8E8C87]">
                <Clock className="w-3.5 h-3.5" />
                Time
              </div>
              <div className="flex items-center gap-1.5" data-testid="datetime-time">
                {/* Hours */}
                <select
                  value={h12}
                  onChange={(e) => setTime(Number(e.target.value), min, ampm)}
                  aria-label="Hours"
                  data-testid="datetime-hours"
                  className="px-2 py-1.5 rounded-md border border-[#EAE7E0] dark:border-[#2A303B] bg-[#FBFAF7] dark:bg-[#10141A] text-sm text-gray-900 dark:text-[#E6E4DF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]/40 dark:focus-visible:ring-[#1FB58A]/40"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-gray-400">:</span>
                {/* Minutes */}
                <select
                  value={min.toString().padStart(2, "0")}
                  onChange={(e) => setTime(h12, Number(e.target.value), ampm)}
                  aria-label="Minutes"
                  data-testid="datetime-minutes"
                  className="px-2 py-1.5 rounded-md border border-[#EAE7E0] dark:border-[#2A303B] bg-[#FBFAF7] dark:bg-[#10141A] text-sm text-gray-900 dark:text-[#E6E4DF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]/40 dark:focus-visible:ring-[#1FB58A]/40"
                >
                  {MINUTES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {/* AM/PM */}
                <select
                  value={ampm}
                  onChange={(e) => setTime(h12, min, e.target.value)}
                  aria-label="AM or PM"
                  data-testid="datetime-ampm"
                  className="px-2 py-1.5 rounded-md border border-[#EAE7E0] dark:border-[#2A303B] bg-[#FBFAF7] dark:bg-[#10141A] text-sm text-gray-900 dark:text-[#E6E4DF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]/40 dark:focus-visible:ring-[#1FB58A]/40"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {value && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear due date"
            data-testid="datetime-clear"
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selected time display beneath the date */}
      {display && (
        <p className="text-xs text-gray-500 dark:text-[#8E8C87] flex items-center gap-1.5" data-testid="datetime-display">
          <Clock className="w-3 h-3" />
          {display.time}
        </p>
      )}
    </div>
  );
}
