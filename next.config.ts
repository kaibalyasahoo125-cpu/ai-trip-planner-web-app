import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    // Disable image optimization in dev mode to eliminate ALL /_next/image ERR_ABORTED issues.
    // Dev mode has no image cache so every request optimizes fresh, often timing out or aborting.
    // Images still load directly from their source URL, instantly.
    unoptimized: isDev,

    remotePatterns: [
      { protocol: 'https', hostname: 'places.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: '**.googleapis.com' },
      { protocol: 'https', hostname: 'mma.prnewswire.com' },
      { protocol: 'https', hostname: '**.prnewswire.com' },
      { protocol: 'https', hostname: 'assets.aceternity.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tabler/icons-react",
      "motion/react",
      "mapbox-gl",
      "@clerk/nextjs",
      "convex/react",
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false,
      };
    }
    return config;
  },
};

export default nextConfig;
