/**
 * Dashboard tools
 * Service: admin
 * - get_dashboard_kpis
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function getDashboardKpis(params: { year: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_dashboard_kpis',
    params: { year: params.year },
    path: `/admin/dashboard/kpis/${params.year}`,
  });
}
