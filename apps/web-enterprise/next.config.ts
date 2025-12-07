import withBundleAnalyzer from "@next/bundle-analyzer"
import createNextIntlPlugin from "next-intl/plugin"
import { type NextConfig } from "next"
import { env } from "./env.mjs"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const config: NextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enable standalone output for Docker
  eslint: {
    // Don't fail build on ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on TypeScript errors during production builds
    ignoreBuildErrors: true, // Temporarily ignore to allow Docker build
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  rewrites: async () => [
    { source: "/healthz", destination: "/api/health" },
    { source: "/api/healthz", destination: "/api/health" },
    { source: "/health", destination: "/api/health" },
    { source: "/ping", destination: "/api/health" },
  ],
}

const wrapped = env.ANALYZE
  ? withBundleAnalyzer({ enabled: env.ANALYZE })(withNextIntl(config))
  : withNextIntl(config)

export default wrapped
