/**
 * P&L tools
 * Service: admin
 * - get_pl_summary
 * - get_pl_matrix
 * - get_cost_per_hour
 * - get_pl_notes
 * - save_pl_note
 * - set_pl_note_status
 * - save_pl_matrix_cell
 * - list_pl_custom_rows
 * - create_pl_custom_row
 * - delete_pl_custom_row
 * - update_pl_custom_row
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

export async function getPlMatrix(params: { year: number; type: 'real' | 'budget' | 'estimated' }): Promise<ToolResponse> {
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

export async function getPlNotes(params: { year: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_pl_notes',
    params: { year: params.year },
    path: `/admin/pl/notes/${params.year}`,
  });
}

export async function savePlNote(params: {
  year: number;
  view_type: string;
  section: string;
  dept?: string;
  item: string;
  month?: number;
  comment?: string;
  assigned_to?: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'save_pl_note',
    params,
    path: '/admin/pl/notes/save',
    method: 'POST',
    body: params,
  });
}

export async function setPlNoteStatus(params: { note_id: string; is_finalized: boolean }): Promise<ToolResponse> {
  return executeTool({
    tool: 'set_pl_note_status',
    params,
    path: '/admin/pl/notes/status',
    method: 'POST',
    body: params,
  });
}

export async function savePlMatrixCell(params: {
  year: number;
  view_type: string;
  section: string;
  month: number;
  item: string;
  value?: number;
  comment?: string;
  assigned_to?: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'save_pl_matrix_cell',
    params,
    path: '/admin/pl/matrix/save',
    method: 'POST',
    body: params,
  });
}

export async function listPlCustomRows(params: { year: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_pl_custom_rows',
    params,
    path: '/admin/pl/custom-rows',
    queryParams: { year: params.year },
  });
}

export async function createPlCustomRow(params: {
  year: number;
  view_type: string;
  section_key: string;
  item_name: string;
  position?: number;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_pl_custom_row',
    params,
    path: '/admin/pl/custom-rows',
    method: 'POST',
    body: params,
  });
}

export async function deletePlCustomRow(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_pl_custom_row',
    params,
    path: `/admin/pl/custom-rows/${params.id}`,
    method: 'DELETE',
  });
}

export async function updatePlCustomRow(params: { id: string; item_name?: string; position?: number }): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'update_pl_custom_row',
    params,
    path: `/admin/pl/custom-rows/${id}`,
    method: 'PATCH',
    body,
  });
}
