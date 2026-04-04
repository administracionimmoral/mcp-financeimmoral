import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-only project — no static export needed
  // Vercel will handle this automatically

  // Increase serverless function timeout for MCP connections
  serverExternalPackages: ['mcp-handler'],

  // Headers for MCP compatibility
  async headers() {
    return [
      {
        source: '/api/mcp/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, x-api-key' },
        ],
      },
    ];
  },
};

export default nextConfig;
