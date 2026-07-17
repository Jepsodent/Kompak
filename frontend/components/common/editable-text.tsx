"use client";

import { Pencil, Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onSave: (next: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  textClassName?: string;
  label?: string;
};

export function EditableText({
  value,
  onSave,
  multiline = false,
  placeholder,
  className = "",
  textClassName = "",
  label,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // place caret at end
      const el = inputRef.current;
      if ("setSelectionRange" in el) {
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
      if (multiline && el.tagName === "TEXTAREA") {
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
      }
    }
  }, [editing, multiline]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className={`relative group ${className}`}>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancel();
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
            }}
            rows={1}
            placeholder={placeholder}
            className={`w-full bg-background/60 border border-primary/40 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/30 resize-none overflow-hidden ${textClassName}`}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancel();
              if (e.key === "Enter") commit();
            }}
            placeholder={placeholder}
            className={`w-full bg-background/60 border border-primary/40 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/30 ${textClassName}`}
          />
        )}
        <div className="absolute -top-6 right-0 flex gap-1 text-[10px] text-muted-foreground">
          <span>
            <kbd className="font-mono">↵</kbd> save · <kbd className="font-mono">Esc</kbd> cancel
          </span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      aria-label={label ? `Edit ${label}` : "Edit"}
      className={`group relative w-full text-left rounded-lg -mx-2 px-2 py-1 hover:bg-foreground/[0.04] transition-colors cursor-text ${className}`}
    >
      <span className={`block ${multiline ? "whitespace-pre-wrap" : ""} ${textClassName}`}>{value || <span className="text-muted-foreground/60">{placeholder}</span>}</span>
      <Pencil className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2" />
    </button>
  );
}

// keep icons referenced (not always used inline elsewhere)
export const _icons = { Check, X };
