/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "d20iz9a0oa67fs.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
