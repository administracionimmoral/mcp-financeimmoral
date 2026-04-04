/**
 * Tool registry — central index of all 20 MCP tools
 * Maps tool names to their descriptions, schemas, and handler functions
 */

export { getBillingMatrix, getBillingRecords } from './billing';
export { listClients, listClientVerticals, getClientById } from './clients';
export { getDashboardKpis } from './dashboard';
export { getExpensesByMonth } from './expenses';
export { getPlSummary, getPlMatrix, getCostPerHour } from './pl';
export { getPaymentSchedule, listPaymentBeneficiaries, getPaymentSummary } from './payments';
export { getPayrollByMonth, listEmployees, getEmployeeById } from './payroll';
export { listPartners, getPartnerCommissionsByMonth, getPartnerCommissionsAnnual } from './commissions';
export { listUsers } from './users';
