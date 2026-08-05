/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "touchgiftshop.co.ke",
      },
    ],
  },
};

module.exports = nextConfig;
