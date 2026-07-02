import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  logging: {
    fetches: {
      fullUrl: true, // Hiển thị chi tiết URL, trạng thái Cache (HIT/MISS) của từng request
    },
  },
};

export default nextConfig;
