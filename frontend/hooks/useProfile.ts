import { profileService } from "@/lib/api/profile.api";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: profileService.fetchUserProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: () => {
      // ⚡ Force TanStack Query to clear cache and re-fetch everywhere across the app
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const supabase = createClient();

  return useMutation({
    mutationFn: (password: string) => profileService.deleteAccount(password),
    onSuccess: async () => {
      await supabase.auth.signOut();

      queryClient.clear();

      router.push("/login");
    },
  });
}
