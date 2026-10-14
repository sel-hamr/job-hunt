import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @jobhunt/shared ships TypeScript source (Server/packages/shared): Next compiles it.
  transpilePackages: ["@jobhunt/shared"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // The repo root, so Turbopack can follow the link to ../Server/packages/shared.
    root: path.join(__dirname, ".."),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
