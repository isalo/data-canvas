/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Linting is handled by the repo-level `pnpm lint` (flat config).
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
