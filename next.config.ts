import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  reactCompiler: !isDev,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
