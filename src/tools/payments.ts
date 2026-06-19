/**
 * Payment tools
 * Service: admin
 * - get_payment_schedule
 * - list_payment_beneficiaries
 * - get_payment_summary
 * - create_payment_beneficiary
 * - update_payment_beneficiary
 * - delete_payment_beneficiary
 * - list_payments_for_period
 * - create_payment
 * - update_payment
 * - set_payment_status
 * - delete_payment
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function getPaymentSchedule(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_payment_schedule',
    params: { year: params.year, month: params.month },
    path: `/admin/payments/schedule/${params.year}/${params.month}`,
  });
}

export async function listPaymentBeneficiaries(): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_payment_beneficiaries',
    params: {},
    path: '/admin/payments/beneficiaries',
  });
}

export async function getPaymentSummary(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_payment_summary',
    params: { year: params.year, month: params.month },
    path: `/admin/payments/summary/${params.year}/${params.month}`,
  });
}

export async function createPaymentBeneficiary(params: {
  name: string;
  type?: string;
  bank_details?: unknown;
  preferred_payment_method?: string;
  notes?: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_payment_beneficiary',
    params,
    path: '/admin/payments/beneficiaries',
    method: 'POST',
    body: params,
  });
}

export async function updatePaymentBeneficiary(params: {
  id: string;
  name?: string;
  type?: string;
  bank_details?: unknown;
  preferred_payment_method?: string;
  notes?: string;
}): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'update_payment_beneficiary',
    params,
    path: `/admin/payments/beneficiaries/${id}`,
    method: 'PATCH',
    body,
  });
}

export async function deletePaymentBeneficiary(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_payment_beneficiary',
    params,
    path: `/admin/payments/beneficiaries/${params.id}`,
    method: 'DELETE',
  });
}

export async function listPaymentsForPeriod(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_payments_for_period',
    params,
    path: `/admin/payments/list/${params.year}/${params.month}`,
  });
}

export async function createPayment(params: {
  payment_type: string;
  beneficiary_id?: string;
  beneficiary_name?: string;
  issuing_bank?: string;
  invoice_reference?: string;
  invoice_received_date?: string;
  amount_admk?: number;
  amount_infinite?: number;
  base_amount?: number;
  commission_amount?: number;
  incentives_amount?: number;
  total_amount: number;
  currency?: string;
  payment_status?: string;
  payment_date?: string;
  due_date?: string;
  fiscal_year: number;
  fiscal_month: number;
  notes?: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_payment',
    params,
    path: '/admin/payments/',
    method: 'POST',
    body: params,
  });
}

export async function updatePayment(params: {
  id: string;
  payment_type?: string;
  beneficiary_id?: string;
  amount_admk?: number;
  amount_infinite?: number;
  base_amount?: number;
  commission_amount?: number;
  incentives_amount?: number;
  total_amount?: number;
  currency?: string;
  payment_status?: string;
  due_date?: string;
  notes?: string;
}): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'update_payment',
    params,
    path: `/admin/payments/${id}`,
    method: 'PATCH',
    body,
  });
}

export async function setPaymentStatus(params: { id: string; status: string; payment_date?: string }): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'set_payment_status',
    params,
    path: `/admin/payments/${id}/status`,
    method: 'PATCH',
    body,
  });
}

export async function deletePayment(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_payment',
    params,
    path: `/admin/payments/${params.id}`,
    method: 'DELETE',
  });
}
