/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ledgerline/ui", "@ledgerline/types", "@ledgerline/ledger-service"],
  experimental: {
    typedRoutes: false
  }
};

export default nextConfig;
