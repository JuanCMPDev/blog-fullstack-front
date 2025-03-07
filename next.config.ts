import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [process.env.CLOUDFRONT_URL || ''],
  },
};

export default nextConfig;
