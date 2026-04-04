/**
 * Client tools
 * Service: admin
 * - list_clients
 * - list_client_verticals
 * - get_client_by_id
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
