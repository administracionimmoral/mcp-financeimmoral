/**
 * Platform commission tools
 * Service: commissions
 * - list_platforms
 * - create_platform
 * - create_platform_commission
 * - get_platform_commissions
 * - update_platform_commission
 * - mark_platform_commission_received
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function listPlatforms(params: { is_active?: boolean }): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_platforms',
    params,
    path: '/commissions/platforms',
    queryParams: { is_active: params.is_active },
  });
}

export async function createPlatform(params: {
  name: string;
  platform_type?: string;
  default_commission_percentage?: number;
  payment_frequency?: string;
  contact_email?: string;
  notes?: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_platform',
    params,
    path: '/commissions/platforms/',
    method: 'POST',
    body: params,
  });
}

export async function createPlatformCommission(params: {
  platform_id: string;
  fiscal_year: number;
  fiscal_month: number;
  total_client_spending: number;
  commission_percentage: number;
  commission_earned: number;
  payment_status?: string;
  notes?: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_platform_commission',
    params,
    path: '/commissions/platforms/commissions',
    method: 'POST',
    body: params,
  });
}

export async function getPlatformCommissions(params: {
  year: number;
  month: number;
  platform_id?: string;
  payment_status?: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_platform_commissions',
    params,
    path: `/commissions/platforms/commissions/${params.year}/${params.month}`,
    queryParams: { platform_id: params.platform_id, payment_status: params.payment_status },
  });
}

export async function updatePlatformCommission(params: {
  id: string;
  total_client_spending?: number;
  commission_percentage?: number;
  commission_earned?: number;
  payment_status?: string;
  payment_date?: string;
  notes?: string;
}): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'update_platform_commission',
    params,
    path: `/commissions/platforms/commissions/${id}`,
    method: 'PATCH',
    body,
  });
}

export async function markPlatformCommissionReceived(params: { id: string; payment_date: string; payment_reference?: string }): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'mark_platform_commission_received',
    params,
    path: `/commissions/platforms/commissions/${id}/receive`,
    method: 'POST',
    body,
  });
}
