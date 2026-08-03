import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  // hostname без порта — Next.js сравнивает только hostname из Origin
  allowedDevOrigins: ["192.168.88.14", "192.168.0.109"],
  // Avoid Turbopack guessing the monorepo parent as workspace root (HMR reload loops).
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
