import { UpdateProfilePayload, UserProfile } from "@/types/profile.type";
import { axiosClient } from "../axios";
import { NestResponse } from "@/types/api.type";
import { actionAsyncStorage } from "next/dist/server/app-render/action-async-storage.external";
import { MagicLinkFormValues } from "@/schemas/auth.schema";
import { EditProfileFormValues } from "@/schemas/profile.schema";

export const profileService = {
  fetchUserProfile: async (): Promise<UserProfile> => {
    const response =
      await axiosClient.get<NestResponse<UserProfile>>(`/profile`);

    return response.data.data;
  },

  updateProfile: async (
    payload: UpdateProfilePayload,
  ): Promise<UpdateProfilePayload> => {
    const formData = new FormData();
    formData.append("name", payload.name);

    if (payload.profileImage) {
      formData.append("file", payload.profileImage);
    }

    const response = await axiosClient.patch(`/profile`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },

  deleteAccount: async (password: string): Promise<void> => {
    await axiosClient.delete("/profile", { data: { password } });
  },
};
