import { useEffect, useRef, useState } from "react";

/**
 * Shared controller for Trello-style inline creators (AddBoard / AddTask).
 *
 * Contract (per spec):
 *   - Autofocus the input on open
 *   - Enter creates
 *   - Escape cancels
 *   - Clicking outside cancels when empty (saves when non-empty)
 *
 * Returns props to spread onto a trigger button and the form state.
 */
export function useInlineCreate({ onSubmit, placeholder = "" }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const reset = () => {
    setValue("");
    setOpen(false);
    setBusy(false);
  };

  const submit = async () => {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onSubmit(trimmed);
      // keep the form open for rapid entry of multiple items? Trello closes
      // Add Task after submit, but for boards we close. Each caller decides via closeAfter.
      setValue("");
      setBusy(false);
      return true;
    } catch {
      setBusy(false);
      return false;
    }
  };

  const handleSubmitAndClose = async () => {
    const ok = await submit();
    if (ok !== false) reset();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmitAndClose();
    } else if (e.key === "Escape") {
      e.preventDefault();
      reset();
    }
  };

  const onBlur = () => {
    // spec: clicking outside cancels if empty
    if (value.trim()) handleSubmitAndClose();
    else reset();
  };

  return {
    open,
    value,
    busy,
    inputRef,
    setValue,
    openForm: () => setOpen(true),
    cancel: reset,
    submit,
    handleSubmitAndClose,
    onKeyDown,
    onBlur,
    placeholder,
  };
}
