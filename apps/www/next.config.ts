import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 env: {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
 },
 eslint: {
  ignoreDuringBuilds: true,
 },
 devIndicators: {
  position: "bottom-right",
 },

 /* eslint-disable require-await */
 async headers() {
  return [
   {
    source: "/(.*)",
    headers: [
     {
      key: "Access-Control-Allow-Origin",
      value: process.env.NEXT_PUBLIC_APP_URL || "*",
     },
     {
      key: "Access-Control-Allow-Methods",
      value: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
     },
     {
      key: "Access-Control-Allow-Headers",
      value: "X-Requested-With, Content-Type, Authorization",
     },
    ],
   },
  ];
 },
};

export default nextConfig;
