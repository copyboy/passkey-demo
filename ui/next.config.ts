import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 确保开发服务器只监听localhost
  devIndicators: {
    buildActivity: true,
  },
  // 禁用自动检测主机名
  experimental: {
    // 强制使用localhost
  }
};

export default nextConfig;
