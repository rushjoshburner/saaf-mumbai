import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next.js doesn't mistakenly
  // pick up unrelated lockfiles elsewhere on the machine.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
