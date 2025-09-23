/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle Twilio's CommonJS imports in ESM environment
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "module": false,
    };

    // Externalize Twilio for server-side to avoid bundling issues
    if (isServer) {
      config.externals.push('twilio');
    }

    return config;
  },
}

export default nextConfig
