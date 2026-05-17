import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Improve image handling to prevent unused preload warnings */
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
