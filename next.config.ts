import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

if (process.env.NODE_ENV === "development" && !process.env.CI && !process.env.VERCEL) {
  initOpenNextCloudflareForDev();
}
