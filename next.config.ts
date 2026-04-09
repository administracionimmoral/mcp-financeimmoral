import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-only project — no static export needed

  // Headers for MCP + CORS compatibility
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
      {
        source: '/.well-known/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Content-Type', value: 'application/json' },
        ],
      },
    ];
  },

  // Rewrite /.well-known/oauth-protected-resource to our API route
  // (Next.js doesn't support dots in folder names for app router)
  async rewrites() {
    return [
      {
        source: '/.well-known/oauth-protected-resource',
        destination: '/api/oauth-metadata',
      },
    ];
  },
};

export default nextConfig;
