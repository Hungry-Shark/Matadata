import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA headers for service worker scope
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  // Disable image optimization for PWA (all SVG inline)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
