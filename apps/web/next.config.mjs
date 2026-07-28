import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ledgerline/db", "@ledgerline/ui", "@ledgerline/types", "@ledgerline/ledger-service"],
  typedRoutes: false
};

export default nextConfig;

if (process.env.OPENNEXT_CLOUDFLARE_DEV === "1") {
  initOpenNextCloudflareForDev();
}
