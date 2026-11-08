/**
 * Dunning ("Impagos") tools — READ ONLY
 * Service: admin (/admin/dunning)
 *
 * Only GET endpoints are exposed: nothing here sends reminders, emails or
 * changes configuration. The upstream module requires either a superadmin
 * session or a valid API key for read requests.
 */

import { z } from 'zod';
import { defineTool, seg, type AnyToolSpec } from '@/src/tools/spec';

const limitArg = (def: number, max: number) =>
  z.number().int().min(1).max(max).optional().describe(`Max rows (default ${def}, max ${max})`);

const includeTestArg = z.boolean().optional().describe('Include test sends (default false)');

export const dunningSpecs: AnyToolSpec[] = [
  defineTool({
    name: 'get_dunning_overdue_invoices',
    description: 'Impagos: list all unpaid/overdue invoices from Holded with client, due date, days overdue, amount and the reminder level that applies to each.',
    shape: {},
    path: () => '/admin/dunning/overdue-invoices',
  }),
  defineTool({
    name: 'get_dunning_stats',
    description: 'Impagos: summary statistics of the dunning module (open cases, amounts overdue, reminders sent, recovered).',
    shape: {},
    path: () => '/admin/dunning/stats',
  }),
  defineTool({
    name: 'list_dunning_cases',
    description: 'Impagos: list dunning cases (one per overdue invoice being chased), newest first.',
    shape: {
      status: z.string().optional().describe('Filter by case status (e.g., open, paid, closed)'),
      limit: limitArg(200, 1000),
    },
    path: () => '/admin/dunning/cases',
    query: (a) => ({ status: a.status, limit: a.limit }),
  }),
  defineTool({
    name: 'get_dunning_case',
    description: 'Impagos: get one dunning case with its full reminder history.',
    shape: { id: z.string().describe('Dunning case ID') },
    path: (a) => `/admin/dunning/cases/${seg(a.id)}`,
  }),
  defineTool({
    name: 'list_dunning_reminders',
    description: 'Impagos: list reminder emails sent (automatic and manual), newest first.',
    shape: {
      status: z.string().optional().describe('Filter by reminder status'),
      limit: limitArg(100, 1000),
      include_test: includeTestArg,
    },
    path: () => '/admin/dunning/reminders',
    query: (a) => ({ status: a.status, limit: a.limit, include_test: a.include_test }),
  }),
  defineTool({
    name: 'get_dunning_overdue_report',
    description: 'Impagos: preview of the overdue report (aggregated view of what is owed, by client and age). Does not send anything.',
    shape: {},
    path: () => '/admin/dunning/overdue-report/preview',
  }),
  defineTool({
    name: 'get_dunning_multi_overdue_alerts',
    description: 'Impagos: clients that currently have several overdue invoices at once (multi-overdue alert). Does not send anything.',
    shape: {},
    path: () => '/admin/dunning/multi-overdue-alerts',
  }),
  defineTool({
    name: 'get_dunning_multi_overdue_history',
    description: 'Impagos: history of multi-overdue situations, optionally for one Holded contact.',
    shape: {
      contact_id: z.string().optional().describe('Holded contact ID'),
      months: z.number().int().min(1).max(36).optional().describe('Months of history (default 12)'),
    },
    path: () => '/admin/dunning/multi-overdue-history',
    query: (a) => ({ contact_id: a.contact_id, months: a.months }),
  }),
  defineTool({
    name: 'get_dunning_effectiveness',
    description: 'Impagos: weekly effectiveness of reminders (reminders sent vs invoices paid afterwards).',
    shape: { weeks: z.number().int().min(1).max(52).optional().describe('Number of weeks (default 12)') },
    path: () => '/admin/dunning/effectiveness',
    query: (a) => ({ weeks: a.weeks }),
  }),
  defineTool({
    name: 'get_dunning_effectiveness_summary',
    description: 'Impagos: monthly/yearly summary of dunning effectiveness.',
    shape: { months: z.number().int().min(1).max(24).optional().describe('Number of months (default 12)') },
    path: () => '/admin/dunning/effectiveness/summary',
    query: (a) => ({ months: a.months }),
  }),
  defineTool({
    name: 'get_dunning_effectiveness_week',
    description: 'Impagos: detail of one week — reminders sent and cases paid, with client, invoice and amount.',
    shape: { key: z.string().regex(/^\d{4}-W\d{2}$/).describe('ISO week key, format YYYY-Www (e.g., 2026-W44)') },
    path: () => '/admin/dunning/effectiveness/week',
    query: (a) => ({ key: a.key }),
  }),
  defineTool({
    name: 'get_dunning_effectiveness_report',
    description: 'Impagos: preview of the weekly effectiveness report (current vs previous week). Does not send anything.',
    shape: {},
    path: () => '/admin/dunning/effectiveness-report/preview',
  }),
  defineTool({
    name: 'get_dunning_config',
    description: 'Impagos: current dunning configuration (enabled, send days/hour, level thresholds, minimum amount, exclusions, CC/BCC rules, alert settings).',
    shape: {},
    path: () => '/admin/dunning/config',
  }),
  defineTool({
    name: 'list_dunning_templates',
    description: 'Impagos: reminder email templates, optionally filtered by level.',
    shape: { level: z.number().int().min(1).max(3).optional().describe('Reminder level 1-3') },
    path: () => '/admin/dunning/templates',
    query: (a) => ({ level: a.level }),
  }),
  defineTool({
    name: 'list_dunning_overrides',
    description: 'Impagos: per-client overrides (custom recipients, paused clients, etc.).',
    shape: {},
    path: () => '/admin/dunning/overrides',
  }),
  defineTool({
    name: 'list_dunning_hubs',
    description: 'Impagos: hubs with their CC recipients for reminders.',
    shape: {},
    path: () => '/admin/dunning/hubs',
  }),
  defineTool({
    name: 'list_dunning_contact_hubs',
    description: 'Impagos: mapping of Holded contacts to hubs and responsible people (Responsables por cliente).',
    shape: {},
    path: () => '/admin/dunning/contact-hubs',
  }),
  defineTool({
    name: 'get_dunning_contact_emails',
    description: 'Impagos: email addresses available for a Holded contact (used as reminder recipients).',
    shape: { contact_id: z.string().describe('Holded contact ID') },
    path: (a) => `/admin/dunning/manual/contact-emails/${seg(a.contact_id)}`,
  }),
  defineTool({
    name: 'list_dunning_cron_runs',
    description: 'Impagos: log of the automatic dunning runs (hourly reminders and daily paid sync).',
    shape: {
      limit: limitArg(50, 500),
      status: z.string().optional().describe('Filter by run status'),
      endpoint: z.string().optional().describe('Filter by cron endpoint'),
    },
    path: () => '/admin/dunning/cron-runs',
    query: (a) => ({ limit: a.limit, status: a.status, endpoint: a.endpoint }),
  }),
];
