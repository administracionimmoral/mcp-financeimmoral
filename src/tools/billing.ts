/**
 * Billing tools
 * Service: admin
 * - get_billing_matrix
 * - get_billing_records
 * - save_billing_matrix_cell
 * - delete_billing_row
 * - duplicate_billing_row
 * - calculate_billing
 * - get_client_billing_for_period
 * - update_billing_record
 * - add_billing_detail
 * - update_billing_detail
 * - delete_billing_detail
 * - get_billing_client_month_detail
 * - get_billing_annual_client_summary
 * - list_billing_hidden_clients
 * - hide_billing_client
 * - unhide_billing_client
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function getBillingMatrix(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_billing_matrix',
    params: { year: params.year, month: params.month },
    path: '/admin/billing/matrix',
    queryParams: { year: params.year, month: params.month },
  });
}

export async function getBillingRecords(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_billing_records',
    params: { year: params.year, month: params.month },
    path: '/admin/billing',
    queryParams: { year: params.year, month: params.month },
  });
}

export async function saveBillingMatrixCell(params: {
  year: number;
  month: number;
  client_id: string;
  field: string;
  value?: number;
  service_id?: string;
  comment?: string;
  assigned_to?: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'save_billing_matrix_cell',
    params,
    path: '/admin/billing/matrix/save',
    method: 'POST',
    body: params,
  });
}

export async function deleteBillingRow(params: { year: number; month: number; client_id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_billing_row',
    params,
    path: '/admin/billing/matrix/row',
    method: 'DELETE',
    queryParams: params,
  });
}

export async function duplicateBillingRow(params: { year: number; month: number; client_id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'duplicate_billing_row',
    params,
    path: '/admin/billing/matrix/row/duplicate',
    method: 'POST',
    body: params,
  });
}

export async function calculateBilling(params: { client_id: string; fiscal_year: number; fiscal_month: number; save?: boolean }): Promise<ToolResponse> {
  return executeTool({
    tool: 'calculate_billing',
    params,
    path: '/admin/billing/calculate',
    method: 'POST',
    body: params,
  });
}

export async function getClientBillingForPeriod(params: { client_id: string; year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_client_billing_for_period',
    params,
    path: `/admin/billing/${params.client_id}/${params.year}/${params.month}`,
  });
}

export async function updateBillingRecord(params: {
  id: string;
  fee_percentage?: number;
  target_billing_amount?: number;
  override_amount?: number;
  service_id?: string;
  notes?: string;
}): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'update_billing_record',
    params,
    path: `/admin/billing/${id}`,
    method: 'PATCH',
    body,
  });
}

export async function addBillingDetail(params: { billing_id: string; service_id: string; amount: number; notes?: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'add_billing_detail',
    params,
    path: '/admin/billing/details',
    method: 'POST',
    body: params,
  });
}

export async function updateBillingDetail(params: { id: string; service_id?: string; amount?: number; notes?: string }): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'update_billing_detail',
    params,
    path: `/admin/billing/details/${id}`,
    method: 'PATCH',
    body,
  });
}

export async function deleteBillingDetail(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_billing_detail',
    params,
    path: `/admin/billing/details/${params.id}`,
    method: 'DELETE',
  });
}

export async function getBillingClientMonthDetail(params: { year: number; month: number; client_id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_billing_client_month_detail',
    params,
    path: '/admin/billing/client-month-detail',
    queryParams: params,
  });
}

export async function getBillingAnnualClientSummary(params: { year: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_billing_annual_client_summary',
    params,
    path: '/admin/billing/annual-client-summary',
    queryParams: { year: params.year },
  });
}

export async function listBillingHiddenClients(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_billing_hidden_clients',
    params,
    path: '/admin/billing/hidden-clients',
    queryParams: params,
  });
}

export async function hideBillingClient(params: { client_id: string; fiscal_year: number; fiscal_month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'hide_billing_client',
    params,
    path: '/admin/billing/hide-client',
    method: 'POST',
    body: params,
  });
}

export async function unhideBillingClient(params: { client_id: string; fiscal_year: number; fiscal_month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'unhide_billing_client',
    params,
    path: '/admin/billing/unhide-client',
    method: 'POST',
    body: params,
  });
}
