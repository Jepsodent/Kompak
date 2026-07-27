import React from "react";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";

type TitleInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export default function TitleInput({
  value,
  onChange,
  onBlur,
  onCancel,
  disabled,
  placeholder,
  className,
}: TitleInputProps) {
  return (
    <Textarea
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") {
          onCancel?.();
          e.currentTarget.blur();
        }
      }}
      disabled={disabled}
      placeholder={placeholder}
      rows={1}
      className={cn(
        // Remove default form-like styling
        "shadow-none border-none bg-transparent!",
        "focus:ring-0!",
        // Remove padding so it aligns
        "px-0 py-1 min-h-0",
        // Enable auto-resizing
        "resize-none overflow-hidden [field-sizing:content]",
        // Subtle hover state
        "rounded-md! hover:bg-muted/30! transition-all duration-300",
        // Default Text
        "text-base!",
        className,
      )}
    />
  );
}
