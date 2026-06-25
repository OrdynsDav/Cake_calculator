import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  reactCompiler: !isDev,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
