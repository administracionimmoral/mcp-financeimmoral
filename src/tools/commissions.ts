/**
 * Commission tools
 * Service: commissions
 * - list_partners
 * - get_partner_commissions_by_month
 * - get_partner_commissions_annual
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function listPartners(): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_partners',
    params: {},
    path: '/commissions/partners',
  });
}

export async function getPartnerCommissionsByMonth(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_partner_commissions_by_month',
    params: { year: params.year, month: params.month },
    path: `/commissions/partners/commissions/${params.year}/${params.month}`,
  });
}

export async function getPartnerCommissionsAnnual(params: { year: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_partner_commissions_annual',
    params: { year: params.year },
    path: `/commissions/partners/commissions/annual/${params.year}`,
  });
}
