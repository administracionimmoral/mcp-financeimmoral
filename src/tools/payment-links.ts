/**
 * Payment link tools
 * Service: admin
 * - create_payment_link_from_invoice
 * - create_manual_payment_link
 * - list_payment_links
 * - get_payment_link
 * - send_payment_link_email
 * - cancel_payment_link
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function createPaymentLinkFromInvoice(params: {
  holded_invoice_id?: string;
  holded_doc_number?: string;
  concept: string;
  amount_cents: number;
  currency?: string;
  customer_email?: string;
  client_name?: string;
  client_tax_id?: string;
  vertical?: string;
  internal_note?: string;
  expires_in_days?: number;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_payment_link_from_invoice',
    params,
    path: '/admin/payment-links/from-invoice',
    method: 'POST',
    body: params,
  });
}

export async function createManualPaymentLink(params: {
  concept: string;
  amount_cents: number;
  currency?: string;
  vertical?: string;
  client_name?: string;
  client_tax_id?: string;
  customer_email?: string;
  internal_note?: string;
  expires_in_days?: number;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_manual_payment_link',
    params,
    path: '/admin/payment-links/manual',
    method: 'POST',
    body: params,
  });
}

export async function listPaymentLinks(params: {
  status?: string;
  vertical?: string;
  from?: string;
  to?: string;
  limit?: number;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_payment_links',
    params,
    path: '/admin/payment-links',
    queryParams: params,
  });
}

export async function getPaymentLink(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_payment_link',
    params,
    path: `/admin/payment-links/${params.id}`,
  });
}

export async function sendPaymentLinkEmail(params: { id: string; to: string; subject?: string; body_html?: string }): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'send_payment_link_email',
    params,
    path: `/admin/payment-links/${id}/send-email`,
    method: 'POST',
    body,
  });
}

export async function cancelPaymentLink(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'cancel_payment_link',
    params,
    path: `/admin/payment-links/${params.id}/cancel`,
    method: 'POST',
  });
}
