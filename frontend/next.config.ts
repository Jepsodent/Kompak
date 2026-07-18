import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.githubusercontent.com",
        pathname: "/**",
      },
      // 💡 Pro-tip: Add your Supabase storage domain now so it doesn't crash later!
      {
        protocol: "https",
        hostname: "igowyoyfbyisydzgzkwv.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
