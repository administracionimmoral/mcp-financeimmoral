/**
 * Budget request tools
 * Service: admin
 * - get_budget_requests_summary
 * - get_budget_requests_by_dept
 * - list_budget_requests
 * - create_budget_request
 * - bulk_create_budget_requests
 * - approve_budget_request
 * - reject_budget_request
 * - approve_budget_requests_by_dept
 * - reject_budget_requests_by_dept
 * - delete_budget_requests_by_dept
 * - delete_budget_request
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function getBudgetRequestsSummary(params: { year: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_budget_requests_summary',
    params,
    path: '/admin/budget-requests/summary',
    queryParams: { year: params.year },
  });
}

export async function getBudgetRequestsByDept(params: { dept: string; year?: number; status?: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_budget_requests_by_dept',
    params,
    path: `/admin/budget-requests/dept/${params.dept}`,
    queryParams: { year: params.year, status: params.status },
  });
}

export async function listBudgetRequests(params: { year?: number; dept?: string; status?: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_budget_requests',
    params,
    path: '/admin/budget-requests',
    queryParams: params,
  });
}

export async function createBudgetRequest(params: {
  fiscal_year: number;
  dept: string;
  section: string;
  category: string;
  item: string;
  month_idx: number;
  current_value?: number;
  requested_value: number;
  reason?: string;
  requested_by: string;
  requested_by_email: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_budget_request',
    params,
    path: '/admin/budget-requests/',
    method: 'POST',
    body: params,
  });
}

export async function bulkCreateBudgetRequests(params: { requests: unknown[]; requested_by: string; requested_by_email: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'bulk_create_budget_requests',
    params,
    path: '/admin/budget-requests/bulk',
    method: 'POST',
    body: params,
  });
}

export async function approveBudgetRequest(params: { id: string; reviewed_by: string; reviewed_by_email: string; review_notes?: string }): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'approve_budget_request',
    params,
    path: `/admin/budget-requests/${id}/approve`,
    method: 'PATCH',
    body,
  });
}

export async function rejectBudgetRequest(params: { id: string; reviewed_by: string; reviewed_by_email: string; review_notes?: string }): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'reject_budget_request',
    params,
    path: `/admin/budget-requests/${id}/reject`,
    method: 'PATCH',
    body,
  });
}

export async function approveBudgetRequestsByDept(params: { fiscal_year: number; dept: string; reviewed_by: string; reviewed_by_email: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'approve_budget_requests_by_dept',
    params,
    path: '/admin/budget-requests/approve-dept',
    method: 'PATCH',
    body: params,
  });
}

export async function rejectBudgetRequestsByDept(params: {
  fiscal_year: number;
  dept: string;
  reviewed_by: string;
  reviewed_by_email: string;
  review_notes?: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'reject_budget_requests_by_dept',
    params,
    path: '/admin/budget-requests/reject-dept',
    method: 'PATCH',
    body: params,
  });
}

export async function deleteBudgetRequestsByDept(params: { fiscal_year: number; dept: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_budget_requests_by_dept',
    params,
    path: '/admin/budget-requests/dept',
    method: 'DELETE',
    body: params,
  });
}

export async function deleteBudgetRequest(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_budget_request',
    params,
    path: `/admin/budget-requests/${params.id}`,
    method: 'DELETE',
  });
}
