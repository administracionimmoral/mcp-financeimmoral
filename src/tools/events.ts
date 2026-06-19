/**
 * Billing event tools
 * Service: billing
 * - record_invoice_issued
 * - events_health
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function recordInvoiceIssued(params: {
  contract_id: string;
  invoice_number: string;
  invoice_date: string;
  base_amount: number;
  client_name?: string;
  description?: string;
  metadata?: unknown;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'record_invoice_issued',
    params,
    path: '/billing/events/invoice-issued',
    method: 'POST',
    body: params,
  });
}

export async function eventsHealth(): Promise<ToolResponse> {
  return executeTool({
    tool: 'events_health',
    params: {},
    path: '/billing/events/health',
  });
}
