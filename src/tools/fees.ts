/**
 * Fee tools
 * Service: admin
 * - get_client_fee_tiers
 * - set_client_fee_tiers
 * - get_platform_cost_rules
 * - add_platform_cost_rule
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function getClientFeeTiers(params: { clientId: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_client_fee_tiers',
    params,
    path: `/admin/fees/client/${params.clientId}`,
  });
}

export async function setClientFeeTiers(params: { clientId: string; tiers: unknown[] }): Promise<ToolResponse> {
  return executeTool({
    tool: 'set_client_fee_tiers',
    params,
    path: `/admin/fees/client/${params.clientId}`,
    method: 'POST',
    body: { tiers: params.tiers },
  });
}

export async function getPlatformCostRules(): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_platform_cost_rules',
    params: {},
    path: '/admin/fees/platform-costs',
  });
}

export async function addPlatformCostRule(params: { platform_count: number; cost_amount: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'add_platform_cost_rule',
    params,
    path: '/admin/fees/platform-costs',
    method: 'POST',
    body: params,
  });
}
