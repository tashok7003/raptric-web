import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: {
      // Default is 1MB — src/lib/actions/upload.ts accepts images up to
      // 5MB, so the default would silently reject anything past 1MB
      // before that check ever ran.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
