import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Optimize font loading to prevent preload warnings */
  optimizeFonts: true,
  
  /* Improve image handling to prevent unused preload warnings */
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
