import { createClient } from "@/utils/supabase/client";
import axios from "axios";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
});

// Injects session data (Supabase Access Token) into Nest.js requests
axiosClient.interceptors.request.use(
  async (config) => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      console.log(
        "Session Token (use this for swagger testing): " + session.access_token,
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
