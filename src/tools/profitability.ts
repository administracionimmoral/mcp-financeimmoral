/**
 * Profitability tools
 * Service: admin
 * - get_clickup_status
 * - refresh_clickup_cache
 * - list_clickup_spaces
 * - list_clickup_lists_for_space
 * - debug_clickup_entries
 * - clickup_lists_with_time
 * - list_clickup_members
 * - auto_match_profitability_clients
 * - get_profitability_user_mappings
 * - get_profitability_auto_mapping
 * - set_profitability_user_mappings
 * - get_profitability_client_lists
 * - set_profitability_client_lists
 * - get_profitability_accounts
 * - list_manual_persons
 * - create_manual_person
 * - update_manual_person
 * - delete_manual_person
 * - list_manual_hours
 * - upsert_manual_hours
 * - delete_manual_hours
 * - list_profitability_hidden_items
 * - hide_profitability_item
 * - unhide_profitability_item
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function getClickupStatus(): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_clickup_status',
    params: {},
    path: '/admin/profitability/clickup/status',
  });
}

export async function refreshClickupCache(params: { year?: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'refresh_clickup_cache',
    params,
    path: '/admin/profitability/clickup/refresh-cache',
    method: 'POST',
    queryParams: { year: params.year },
  });
}

export async function listClickupSpaces(): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_clickup_spaces',
    params: {},
    path: '/admin/profitability/clickup/spaces',
  });
}

export async function listClickupListsForSpace(params: { spaceId: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_clickup_lists_for_space',
    params,
    path: `/admin/profitability/clickup/lists/${params.spaceId}`,
  });
}

export async function debugClickupEntries(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'debug_clickup_entries',
    params,
    path: `/admin/profitability/clickup/debug-entries/${params.year}/${params.month}`,
  });
}

export async function clickupListsWithTime(params: { year: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'clickup_lists_with_time',
    params,
    path: `/admin/profitability/clickup/lists-with-time/${params.year}`,
  });
}

export async function listClickupMembers(): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_clickup_members',
    params: {},
    path: '/admin/profitability/clickup/members',
  });
}

export async function autoMatchProfitabilityClients(params: { year: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'auto_match_profitability_clients',
    params,
    path: `/admin/profitability/auto-match-clients/${params.year}`,
  });
}

export async function getProfitabilityUserMappings(): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_profitability_user_mappings',
    params: {},
    path: '/admin/profitability/user-mappings',
  });
}

export async function getProfitabilityAutoMapping(params: { year: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_profitability_auto_mapping',
    params,
    path: `/admin/profitability/auto-mapping/${params.year}`,
  });
}

export async function setProfitabilityUserMappings(params: { mappings: unknown[] }): Promise<ToolResponse> {
  return executeTool({
    tool: 'set_profitability_user_mappings',
    params,
    path: '/admin/profitability/user-mappings',
    method: 'PUT',
    body: { mappings: params.mappings },
  });
}

export async function getProfitabilityClientLists(): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_profitability_client_lists',
    params: {},
    path: '/admin/profitability/client-lists',
  });
}

export async function setProfitabilityClientLists(params: { client_lists: unknown[] }): Promise<ToolResponse> {
  return executeTool({
    tool: 'set_profitability_client_lists',
    params,
    path: '/admin/profitability/client-lists',
    method: 'PUT',
    body: { client_lists: params.client_lists },
  });
}

export async function getProfitabilityAccounts(params: { year: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_profitability_accounts',
    params,
    path: `/admin/profitability/accounts/${params.year}`,
  });
}

export async function listManualPersons(params: { year?: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_manual_persons',
    params,
    path: '/admin/profitability/manual-persons',
    queryParams: { year: params.year },
  });
}

export async function createManualPerson(params: { name: string; cost_per_hour: number; department?: string; notes?: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_manual_person',
    params,
    path: '/admin/profitability/manual-persons',
    method: 'POST',
    body: params,
  });
}

export async function updateManualPerson(params: { id: string; name?: string; cost_per_hour?: number; department?: string; notes?: string }): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'update_manual_person',
    params,
    path: `/admin/profitability/manual-persons/${id}`,
    method: 'PUT',
    body,
  });
}

export async function deleteManualPerson(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_manual_person',
    params,
    path: `/admin/profitability/manual-persons/${params.id}`,
    method: 'DELETE',
  });
}

export async function listManualHours(params: { year?: number; client_id?: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_manual_hours',
    params,
    path: '/admin/profitability/manual-hours',
    queryParams: params,
  });
}

export async function upsertManualHours(params: {
  client_id: string;
  manual_person_id: string;
  year: number;
  month: number;
  hours: number;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'upsert_manual_hours',
    params,
    path: '/admin/profitability/manual-hours',
    method: 'POST',
    body: params,
  });
}

export async function deleteManualHours(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_manual_hours',
    params,
    path: `/admin/profitability/manual-hours/${params.id}`,
    method: 'DELETE',
  });
}

export async function listProfitabilityHiddenItems(params: { scope?: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_profitability_hidden_items',
    params,
    path: '/admin/profitability/hidden-items',
    queryParams: { scope: params.scope },
  });
}

export async function hideProfitabilityItem(params: { scope: string; ref_id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'hide_profitability_item',
    params,
    path: '/admin/profitability/hidden-items',
    method: 'POST',
    body: params,
  });
}

export async function unhideProfitabilityItem(params: { scope: string; ref_id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'unhide_profitability_item',
    params,
    path: `/admin/profitability/hidden-items/${params.scope}/${params.ref_id}`,
    method: 'DELETE',
  });
}
