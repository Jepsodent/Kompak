"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProjectService } from "@/lib/api/project.api";
import { Loader2 } from "lucide-react";

export default function JoinProjectPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const hasAttempted = useRef(false);
  useEffect(() => {
    if (!token || hasAttempted.current) return;
    
    hasAttempted.current = true;
    
    async function handleJoin() {
      try {
        const data = await ProjectService.joinProject(token);
        toast.success("Successfully joined the project!");
        router.replace(`/projects/${data.project_id}`);
      } catch (error: any) {
        // 1. Cek apakah error-nya adalah 409 Conflict (ada di dalam project)
        if (error?.response?.status === 409) {
          toast.info("You are already a member of this project.");
          
          try {
            // 2. Decode token JWT bagian payload (indeks ke-1) 
            const payloadPart = token.split(".")[1];
            const decodedPayload = JSON.parse(
              atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"))
            );
            
            if (decodedPayload?.projectId) {
              router.replace(`/projects/${decodedPayload.projectId}`);
              return;
            }
          } catch (decodeError) {
            console.error("Failed to decode token", decodeError);
          }
        }
        // 4. Jika error lain (link expired atau invalid), arahkan ke dashboard
        toast.error("Failed to join project", {
          description: error?.response?.data?.message || "Invalid or expired link",
        });
        router.replace(`/dashboard`);
      }
    }

    handleJoin();
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] space-y-4">
      <Loader2 className="size-8 animate-spin text-primary" />
      <h2 className="text-xl font-display font-bold">Joining Project...</h2>
      <p className="text-sm text-muted-foreground">Verifying your invitation link</p>
    </div>
  );
}