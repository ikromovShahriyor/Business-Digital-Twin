import type { NextConfig } from "next";

const isVercel = !!process.env.VERCEL;

const nextConfig: NextConfig = {
  ...(isVercel ? {} : { output: "standalone" }),
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return [
        {
          source: "/api/:path*",
          destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
        },
      ];
    }
    if (!isVercel) {
      return [
        {
          source: "/api/:path*",
          destination: "http://backend:5000/api/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
