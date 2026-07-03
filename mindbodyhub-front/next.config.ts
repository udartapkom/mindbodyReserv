import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // hostname без порта — Next.js сравнивает только hostname из Origin
  allowedDevOrigins: ["192.168.88.14", "192.168.0.110"],
};

export default nextConfig;
