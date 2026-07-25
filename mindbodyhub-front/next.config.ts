import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // hostname без порта — Next.js сравнивает только hostname из Origin
  allowedDevOrigins: ["192.168.88.14", "192.168.0.109"],
};

export default nextConfig;
