import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'places.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent client bundle from trying to include server-only modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false, // <-- Ignore async_hooks in client builds
      };
    }
    return config;
  },
};

export default nextConfig;
