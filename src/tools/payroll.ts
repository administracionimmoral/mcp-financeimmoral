/**
 * Payroll tools
 * Service: payroll
 * - get_payroll_by_month
 * - list_employees
 * - get_employee_by_id
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function getPayrollByMonth(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_payroll_by_month',
    params: { year: params.year, month: params.month },
    path: `/payroll/payroll/${params.year}/${params.month}`,
  });
}

export async function listEmployees(): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_employees',
    params: {},
    path: '/payroll/employees',
  });
}

export async function getEmployeeById(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_employee_by_id',
    params: { id: params.id },
    path: `/payroll/employees/${params.id}`,
  });
}
