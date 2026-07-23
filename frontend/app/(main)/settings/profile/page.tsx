"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import {
  EditProfileFormValues,
  editProfileSchema,
} from "@/schemas/profile.schema";
import { StatusMessage } from "@/types/auth.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CircleX, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [requestStatus, setRequestStatus] = useState<StatusMessage>({
    text: "",
    type: null,
  });

  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { name: "", profileImage: null },
  });

  const watchedImageFile = form.watch("profileImage");

  // Reset form defaults when profile data arrives
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        profileImage: null,
      });
    }
  }, [profile, form]);

  // Handle preview URL generation with memory cleanup
  useEffect(() => {
    if (watchedImageFile instanceof File) {
      const objectUrl = URL.createObjectURL(watchedImageFile);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(profile?.profile_image_url || "");
    }
  }, [watchedImageFile, profile]);

  const getInitials = () => {
    if (!profile?.name) return "U";
    return profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("profileImage", file, { shouldValidate: true });
    }
  };

  const onSubmitEditProfile = async (values: EditProfileFormValues) => {
    setRequestStatus({ text: "", type: null });

    try {
      await updateProfileMutation.mutateAsync({
        name: values.name,
        profileImage: values.profileImage,
      });

      setRequestStatus({
        text: "Profile updated successfully!",
        type: "success",
      });

      // Clear internal form state and native file input
      form.reset({ name: values.name, profileImage: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setRequestStatus({
        text:
          err?.response?.data?.message ||
          "Something went wrong updating your profile.",
        type: "error",
      });
    }
  };

  const isSubmitting = updateProfileMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitEditProfile)}>
        <div className="w-full space-y-8">
          {/* SECTION 1: PROFILE PICTURE */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Profile Picture</h2>

            <div className="group relative w-40 h-40 rounded-full ring-2 ring-border overflow-hidden bg-muted">
              <Avatar className="w-full h-full">
                <AvatarImage
                  src={previewUrl}
                  alt="Profile Preview"
                  className="object-cover"
                />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <label
                  htmlFor="avatar-upload"
                  className="p-3 bg-card hover:bg-accent text-foreground rounded-full shadow-lg cursor-pointer transition-colors"
                >
                  <Pencil className="w-5 h-5" />
                </label>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              JPG, PNG or WebP. Max size 2MB.
            </p>

            <input
              ref={fileInputRef}
              id="avatar-upload"
              type="file"
              onChange={handleImageChange}
              accept="image/jpeg, image/jpg, image/png, image/webp"
              className="hidden"
            />

            <FormField
              control={form.control}
              name="profileImage"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* SECTION 2: USERNAME */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Change Username</h2>

            <p className="text-base max-w-[60ch]">
              Don't like your username? No worries, you can change it here.
            </p>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Enter your username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {requestStatus.type && (
              <Alert variant={requestStatus.type}>
                {requestStatus.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <CircleX className="h-4 w-4" />
                )}
                <AlertDescription className="w-full">
                  {requestStatus.text}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Spinner /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
