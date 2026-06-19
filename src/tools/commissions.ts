/**
 * Commission tools
 * Service: commissions
 * - list_partners
 * - get_partner_commissions_by_month
 * - get_partner_commissions_annual
 * - create_partner
 * - assign_client_to_partner
 * - delete_partner
 * - calculate_partner_commissions
 * - create_partner_commission
 * - update_partner_commission
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

export async function createPartner(params: {
  name: string;
  email?: string;
  phone?: string;
  department_id?: string;
  default_commission_rate?: number;
  payment_info?: unknown;
  notes?: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_partner',
    params,
    path: '/commissions/partners/',
    method: 'POST',
    body: params,
  });
}

export async function assignClientToPartner(params: {
  id: string;
  client_id: string;
  commission_percentage: number;
  effective_from?: string;
  notes?: string;
}): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'assign_client_to_partner',
    params,
    path: `/commissions/partners/${id}/clients`,
    method: 'POST',
    body,
  });
}

export async function deletePartner(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_partner',
    params,
    path: `/commissions/partners/${params.id}`,
    method: 'DELETE',
  });
}

export async function calculatePartnerCommissions(params: { fiscal_year: number; fiscal_month: number; save?: boolean }): Promise<ToolResponse> {
  return executeTool({
    tool: 'calculate_partner_commissions',
    params,
    path: '/commissions/partners/commissions/calculate',
    method: 'POST',
    body: params,
  });
}

export async function createPartnerCommission(params: {
  partner_id: string;
  client_id: string;
  fiscal_year: number;
  fiscal_month: number;
  client_billing_amount: number;
  commission_rate: number;
  commission_amount: number;
  is_paid?: boolean;
  client_is_paid?: boolean;
  paid_date?: string;
  notes?: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_partner_commission',
    params,
    path: '/commissions/partners/commissions',
    method: 'POST',
    body: params,
  });
}

export async function updatePartnerCommission(params: {
  id: string;
  fiscal_month?: number;
  client_id?: string;
  client_billing_amount?: number;
  commission_rate?: number;
  commission_amount?: number;
  is_paid?: boolean;
  client_is_paid?: boolean;
  paid_date?: string;
  notes?: string;
}): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'update_partner_commission',
    params,
    path: `/commissions/partners/commissions/${id}`,
    method: 'PATCH',
    body,
  });
}
