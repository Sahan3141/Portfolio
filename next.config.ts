import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/Portfolio",
  output: "export",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/Portfolio",
  },
};

export default nextConfig;
