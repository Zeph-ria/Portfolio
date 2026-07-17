/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 is a native module — keep it external to the server bundle.
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  images: {
    // Project photos are stored as data URLs / local uploads in the MVP.
    remotePatterns: [],
  },
};

export default nextConfig;
