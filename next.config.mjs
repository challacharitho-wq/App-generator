/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs"],
  },
  output: undefined,
  webpack: (config) => {
    config.externals.push("bcryptjs");
    return config;
  },
};

export default nextConfig;
