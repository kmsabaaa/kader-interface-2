import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Standalone for lighter footprint
  output: "standalone",
  
  // 2. Strict Type Checking OFF for Build (Saves RAM/Time)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 3. Image Optimization (Prevent Crashes & Broken Images)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },      // Clerk Avatars
      { protocol: "https", hostname: "utfs.io" },            // UploadThing
      { protocol: "https", hostname: "lh3.googleusercontent.com" } // Google Logins
    ],
    // Disable heavy optimization on Hostinger to save CPU/RAM
    unoptimized: true, 
  },

  // 4. Disable Powered By Header (Security/Perf)
  poweredByHeader: false,

  // 5. Compress Assets (Save Bandwidth)
  compress: true,
};

export default nextConfig;
