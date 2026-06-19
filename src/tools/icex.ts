/**
 * Icex tools
 * Service: admin
 * - get_icex
 * - save_icex_cell
 * - create_icex_row
 * - delete_icex_row
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function getIcex(params: { year: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_icex',
    params,
    path: `/admin/icex/${params.year}`,
  });
}

export async function saveIcexCell(params: { year: number; row_id: string; month_idx: number; value: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'save_icex_cell',
    params,
    path: '/admin/icex/save',
    method: 'POST',
    body: params,
  });
}

export async function createIcexRow(params: { year: number; item_name: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_icex_row',
    params,
    path: '/admin/icex/rows',
    method: 'POST',
    body: params,
  });
}

export async function deleteIcexRow(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_icex_row',
    params,
    path: `/admin/icex/rows/${params.id}`,
    method: 'DELETE',
  });
}
