/**
 * Client tools
 * Service: admin
 * - list_clients
 * - list_client_verticals
 * - get_client_by_id
 * - create_client
 * - update_client
 * - delete_client
 * - duplicate_client
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function listClients(): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_clients',
    params: {},
    path: '/admin/clients',
  });
}

export async function listClientVerticals(): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_client_verticals',
    params: {},
    path: '/admin/clients/verticals',
  });
}

export async function getClientById(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_client_by_id',
    params: { id: params.id },
    path: `/admin/clients/${params.id}`,
  });
}

export async function createClient(params: {
  name: string;
  legal_name?: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  vertical_id?: string;
  fee_config?: unknown;
  notes?: string;
  fiscal_year?: number;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_client',
    params,
    path: '/admin/clients/',
    method: 'POST',
    body: params,
  });
}

export async function updateClient(params: {
  id: string;
  name?: string;
  legal_name?: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  vertical_id?: string;
  fee_config?: unknown;
  notes?: string;
}): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'update_client',
    params,
    path: `/admin/clients/${id}`,
    method: 'PATCH',
    body,
  });
}

export async function deleteClient(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_client',
    params,
    path: `/admin/clients/${params.id}`,
    method: 'DELETE',
  });
}

export async function duplicateClient(params: { id: string; new_name: string; fiscal_year?: number }): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'duplicate_client',
    params,
    path: `/admin/clients/${id}/duplicate`,
    method: 'POST',
    body,
  });
}
