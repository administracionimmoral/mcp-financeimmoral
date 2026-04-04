/**
 * Health check endpoint
 * GET /api/health
 * 
 * Returns a simple JSON status — useful for monitoring.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'immoral-finance-mcp',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
