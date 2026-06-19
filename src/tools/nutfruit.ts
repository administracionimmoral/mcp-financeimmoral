/**
 * Nutfruit tools
 * Service: admin
 * - get_nutfruit
 * - save_nutfruit_cell
 * - create_nutfruit_row
 * - delete_nutfruit_row
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function getNutfruit(params: { year: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_nutfruit',
    params,
    path: `/admin/nutfruit/${params.year}`,
  });
}

export async function saveNutfruitCell(params: { year: number; row_id: string; month_idx: number; value: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'save_nutfruit_cell',
    params,
    path: '/admin/nutfruit/save',
    method: 'POST',
    body: params,
  });
}

export async function createNutfruitRow(params: { year: number; item_name: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_nutfruit_row',
    params,
    path: '/admin/nutfruit/rows',
    method: 'POST',
    body: params,
  });
}

export async function deleteNutfruitRow(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_nutfruit_row',
    params,
    path: `/admin/nutfruit/rows/${params.id}`,
    method: 'DELETE',
  });
}
