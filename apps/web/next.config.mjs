import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ledgerline/db", "@ledgerline/ui", "@ledgerline/types", "@ledgerline/ledger-service"],
  experimental: {
    typedRoutes: false
  }
};

export default nextConfig;

initOpenNextCloudflareForDev();
