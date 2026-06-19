/**
 * Imsales tools
 * Service: admin
 * - list_imsales_services
 * - get_imsales_billing
 * - save_imsales_billing
 * - hide_imsales_client
 * - unhide_imsales_client
 * - list_imsales_hidden_clients
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function listImsalesServices(): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_imsales_services',
    params: {},
    path: '/admin/imsales/services',
  });
}

export async function getImsalesBilling(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_imsales_billing',
    params,
    path: `/admin/imsales/billing/${params.year}/${params.month}`,
  });
}

export async function saveImsalesBilling(params: {
  client_id: string;
  fiscal_year: number;
  fiscal_month: number;
  service_id: string;
  amount: number;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'save_imsales_billing',
    params,
    path: '/admin/imsales/billing/save',
    method: 'POST',
    body: params,
  });
}

export async function hideImsalesClient(params: { client_id: string; fiscal_year: number; fiscal_month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'hide_imsales_client',
    params,
    path: '/admin/imsales/hide-client',
    method: 'POST',
    body: params,
  });
}

export async function unhideImsalesClient(params: { client_id: string; fiscal_year: number; fiscal_month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'unhide_imsales_client',
    params,
    path: '/admin/imsales/unhide-client',
    method: 'POST',
    body: params,
  });
}

export async function listImsalesHiddenClients(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_imsales_hidden_clients',
    params,
    path: `/admin/imsales/hidden-clients/${params.year}/${params.month}`,
  });
}
