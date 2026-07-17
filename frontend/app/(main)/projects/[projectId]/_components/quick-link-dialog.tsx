"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const quickLinkSchema = z.object({
  title: z.string().min(1, "Title is required").max(30, "Title cannot exceed 30 characters"),
  url: z.string().url("Please enter a valid URL (e.g. https://example.com)"),
});

type QuickLinkFormValues = z.infer<typeof quickLinkSchema>;

interface QuickLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: { id: string; title: string; url: string } | null;
  onSave: (data: { title: string; url: string }) => Promise<void>;
  isLoading: boolean;
}

export function QuickLinkDialog({ open, onOpenChange, initialData, onSave, isLoading }: QuickLinkDialogProps) {
  // 2. Inisialisasi React Hook Form dengan Resolver Zod
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuickLinkFormValues>({
    resolver: zodResolver(quickLinkSchema),
    defaultValues: {
      title: "",
      url: "https://",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: initialData?.title || "",
        url: initialData?.url || "https://",
      });
    }
  }, [open, initialData, reset]);

  const onSubmit = async (values: QuickLinkFormValues) => {
    await onSave(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Hubungkan form dengan handleSubmit milik RHF */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{initialData ? "Edit Link" : "Add Link"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Input Title */}
            <div className="space-y-2">
              <Label htmlFor="link-title">Title</Label>
              <Input
                id="link-title"
                placeholder="e.g. Figma Design"
                disabled={isLoading}
                {...register("title")} // Bind ke RHF
              />
              {errors.title && (
                <p className="text-xs font-medium text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Input URL */}
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://..."
                disabled={isLoading}
                {...register("url")} // Bind ke RHF
              />
              {errors.url && (
                <p className="text-xs font-medium text-destructive">{errors.url.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
