import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { withSentryConfig } from "@sentry/nextjs";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ["@coral-xyz/anchor"],
  turbopack: {
    resolveAlias: {
      "@proxa/sdk": "../../packages/sdk/dist/index.js",
    },
  },
  webpack: (config) => {
    config.externals["@solana/kit"] = "commonjs @solana/kit";
    config.externals["@solana-program/memo"] = "commonjs @solana-program/memo";
    config.externals["@solana-program/system"] = "commonjs @solana-program/system";
    config.externals["@solana-program/token"] = "commonjs @solana-program/token";
    config.resolve.alias = {
      ...config.resolve.alias,
      "@proxa/sdk": path.resolve(root, "../../packages/sdk/dist"),
    };
    return config;
  },
};

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, { silent: true })
  : nextConfig;
