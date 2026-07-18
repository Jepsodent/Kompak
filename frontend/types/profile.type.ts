export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_image_url: string;
}

export interface UpdateProfilePayload {
  name: string;
  profileImage: File | null | undefined;
}
