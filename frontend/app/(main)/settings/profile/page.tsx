"use client";

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
import { Pencil } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

export default function ProfilePage() {
  const [isPending, startTransition] = useTransition();
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

  const watchedName = form.watch("name");
  const watchedImageFile = form.watch("profileImage");

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        profileImage: null,
      });
    }
  }, [profile, form]);

  const renderAvatarSrc = () => {
    if (watchedImageFile instanceof File) {
      return URL.createObjectURL(watchedImageFile);
    }
    return profile?.profile_image_url || "";
  };

  const getInitials = () => {
    if (!profile?.name) return "U";
    return profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const isFormUnchanged = () => {
    const nameChanged = watchedName !== (profile?.name || "");
    const imageChanged = watchedImageFile !== null;
    return !nameChanged && !imageChanged;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Manually set the file object directly into React Hook Form's engine
      form.setValue("profileImage", file, { shouldValidate: true });
    }
  };

  const onSubmitEditProfile = async (values: EditProfileFormValues) => {
    setRequestStatus({ text: "", type: null });

    startTransition(async () => {
      try {
        await updateProfileMutation.mutateAsync({
          name: values.name,
          profileImage: values.profileImage,
        });

        setRequestStatus({
          text: "Profile updated successfully!",
          type: "success",
        });

        // Reset form states so the "Save Changes" button locks back up safely
        form.reset({ name: values.name, profileImage: null });
      } catch (err: any) {
        setRequestStatus({
          text:
            err?.response?.data?.message ||
            "Something went wrong updating your profile.",
          type: "error",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitEditProfile)}>
        <div className="w-full space-y-8">
          {/* SECTION 1: PROFILE PICTURE*/}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Profile Picture</h2>

            <div className="group relative w-40 h-40 rounded-full ring-2 ring-border overflow-hidden bg-muted">
              <Avatar className="w-full h-full">
                <AvatarImage
                  src={renderAvatarSrc()}
                  alt="Profile Preview"
                  className="object-cover"
                />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              {/* Hover Overlay Button Layout */}
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

            {/* Native hidden input element acting as file capture node */}
            <input
              id="avatar-upload"
              type="file"
              onChange={handleImageChange}
              accept="image/jpeg, image/jpg, image/png, image/webp"
              className="hidden"
            />

            {/* Hidden field tracking node to output validation messages from Zod */}
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
              Don't like your username? No worries, you can absolutely change
              it.
            </p>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="Enter your username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={isFormUnchanged() || !form.formState.isValid}
            className="cursor-pointer"
          >
            {isPending ? (
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
