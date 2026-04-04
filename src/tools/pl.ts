/**
 * P&L tools
 * Service: admin
 * - get_pl_summary
 * - get_pl_matrix
 * - get_cost_per_hour
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function getPlSummary(params: { year: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_pl_summary',
    params: { year: params.year },
    path: `/admin/pl/summary/${params.year}`,
  });
}

export async function getPlMatrix(params: { year: number; type: 'real' | 'budget' }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_pl_matrix',
    params: { year: params.year, type: params.type },
    path: `/admin/pl/matrix/${params.year}`,
    queryParams: { type: params.type },
  });
}

export async function getCostPerHour(params: { year: number; dept: 'immedia' | 'imcontent' | 'immoralia' }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_cost_per_hour',
    params: { year: params.year, dept: params.dept },
    path: `/admin/pl/cost-per-hour/${params.year}/${params.dept}`,
  });
}
