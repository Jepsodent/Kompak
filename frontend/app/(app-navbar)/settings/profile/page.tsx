"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

export default function ProfilePage() {
  const [username, setUsername] = useState("kevin.m30w");
  const [avatarUrl, setAvatarUrl] = useState("https://github.com/shadcn.png");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local preview URL for immediate responsive feedback
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Profile Picture</h2>

        <div className="group relative w-40 h-40 overflow-hidden rounded-full">
          <Image src={avatarUrl} alt="Profile Picture" fill className="" />

          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={triggerFileSelect}
              className="w-10 h-10 cursor-pointer rounded-full shadow-md transform-all duration-200"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG or WebP. Max size 2MB.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">Change Username</h2>
        <p className="text-base max-w-[60ch]">
          Don't like your username? No worries, you can absolutely change it.
        </p>
        <Input value={username} className="w-80" />
      </div>

      <Button disabled={true} className="cursor-pointer">
        Save Update
      </Button>
    </div>
  );
}
