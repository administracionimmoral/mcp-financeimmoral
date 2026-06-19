/**
 * Payroll tools
 * Service: payroll
 * - get_payroll_by_month
 * - list_employees
 * - get_employee_by_id
 * - list_employees_filtered
 * - create_employee
 * - update_employee_salary
 * - update_employee
 * - delete_employee_permanent
 * - delete_employee
 * - create_payroll
 * - update_payroll
 * - set_payroll_splits
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

export async function listEmployeesFiltered(params: { is_active?: boolean; department_id?: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_employees_filtered',
    params,
    path: '/payroll/employees',
    queryParams: params,
  });
}

export async function createEmployee(params: {
  employee_code?: string;
  first_name: string;
  last_name: string;
  email?: string;
  hire_date: string;
  current_salary: number;
  position?: string;
  primary_department_id: string;
  is_active?: boolean;
  currency?: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_employee',
    params,
    path: '/payroll/employees/',
    method: 'POST',
    body: params,
  });
}

export async function updateEmployeeSalary(params: {
  id: string;
  new_salary: number;
  effective_from: string;
  change_reason?: string;
  approved_by?: string;
}): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'update_employee_salary',
    params,
    path: `/payroll/employees/${id}/salary`,
    method: 'PATCH',
    body,
  });
}

export async function updateEmployee(params: {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  position?: string;
  primary_department_id?: string;
  is_active?: boolean;
  employee_code?: string;
  currency?: string;
}): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'update_employee',
    params,
    path: `/payroll/employees/${id}`,
    method: 'PATCH',
    body,
  });
}

export async function deleteEmployeePermanent(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_employee_permanent',
    params,
    path: `/payroll/employees/${params.id}/permanent`,
    method: 'DELETE',
  });
}

export async function deleteEmployee(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_employee',
    params,
    path: `/payroll/employees/${params.id}`,
    method: 'DELETE',
  });
}

export async function createPayroll(params: {
  employee_id: string;
  fiscal_year: number;
  fiscal_month: number;
  gross_salary: number;
  social_security_company?: number;
  other_benefits?: number;
  total_company_cost?: number;
  payment_date?: string;
  notes?: string;
  auto_split?: boolean;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_payroll',
    params,
    path: '/payroll/payroll/',
    method: 'POST',
    body: params,
  });
}

export async function updatePayroll(params: {
  id: string;
  gross_salary?: number;
  social_security_company?: number;
  other_benefits?: number;
  total_company_cost?: number;
  payment_date?: string;
  notes?: string;
}): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'update_payroll',
    params,
    path: `/payroll/payroll/${id}`,
    method: 'PATCH',
    body,
  });
}

export async function setPayrollSplits(params: { id: string; splits: unknown[] }): Promise<ToolResponse> {
  return executeTool({
    tool: 'set_payroll_splits',
    params,
    path: `/payroll/payroll/${params.id}/splits`,
    method: 'POST',
    body: { splits: params.splits },
  });
}
