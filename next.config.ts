import type { NextConfig } from "next";

const isGitHubPages = process.env.DEPLOY_TARGET === "github-pages";
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  ...(isGitHubPages ? { output: "export" as const } : {}),
  basePath,
  trailingSlash: isGitHubPages,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
