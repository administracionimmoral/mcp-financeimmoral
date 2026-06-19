/**
 * Payment request tools (commissions-service)
 * Service: commissions
 * NOTE: Backend POST / supports multipart with invoice file upload. MCP sends JSON only — no file attachment.
 * - create_payment_request
 * - list_payment_requests
 * - get_payment_request
 * - update_payment_request
 * - delete_payment_request
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function createPaymentRequest(params: {
  partner_id: string;
  partner_email?: string;
  fiscal_year: number;
  fiscal_month: number;
  total_amount: number;
  notes?: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_payment_request',
    params,
    path: '/commissions/payment-requests/',
    method: 'POST',
    body: params,
  });
}

export async function listPaymentRequests(params: { partner_id?: string; status?: string; year?: number; month?: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_payment_requests',
    params,
    path: '/commissions/payment-requests',
    queryParams: params,
  });
}

export async function getPaymentRequest(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_payment_request',
    params,
    path: `/commissions/payment-requests/${params.id}`,
  });
}

export async function updatePaymentRequest(params: { id: string; status?: string; admin_notes?: string; reviewed_by?: string }): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'update_payment_request',
    params,
    path: `/commissions/payment-requests/${id}`,
    method: 'PATCH',
    body,
  });
}

export async function deletePaymentRequest(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_payment_request',
    params,
    path: `/commissions/payment-requests/${params.id}`,
    method: 'DELETE',
  });
}
