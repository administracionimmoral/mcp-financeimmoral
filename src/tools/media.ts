/**
 * Media investment tools
 * Service: admin
 * - list_media_platforms
 * - get_media_investment
 * - set_media_planned_investment
 * - set_media_platform_investment
 * - list_media_hidden_clients
 * - unhide_media_client
 * - hide_media_client
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function listMediaPlatforms(): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_media_platforms',
    params: {},
    path: '/admin/media/platforms',
  });
}

export async function getMediaInvestment(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_media_investment',
    params,
    path: `/admin/media/investment/${params.year}/${params.month}`,
  });
}

export async function setMediaPlannedInvestment(params: { client_id: string; fiscal_year: number; fiscal_month: number; amount: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'set_media_planned_investment',
    params,
    path: '/admin/media/planned',
    method: 'POST',
    body: params,
  });
}

export async function setMediaPlatformInvestment(params: {
  client_id: string;
  fiscal_year: number;
  fiscal_month: number;
  platform_id: string;
  amount: number;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'set_media_platform_investment',
    params,
    path: '/admin/media/platform',
    method: 'POST',
    body: params,
  });
}

export async function listMediaHiddenClients(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_media_hidden_clients',
    params,
    path: `/admin/media/hidden-clients/${params.year}/${params.month}`,
  });
}

export async function unhideMediaClient(params: { client_id: string; fiscal_year: number; fiscal_month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'unhide_media_client',
    params,
    path: '/admin/media/unhide-client',
    method: 'POST',
    body: params,
  });
}

export async function hideMediaClient(params: { client_id: string; fiscal_year: number; fiscal_month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'hide_media_client',
    params,
    path: '/admin/media/hide-client',
    method: 'POST',
    body: params,
  });
}
