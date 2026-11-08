/**
 * P&L scenarios, forecast versions and management control panel
 * Service: admin (/admin/pl/scenarios, /admin/pl/forecast-versions, /admin/dashboard/control)
 */

import { z } from 'zod';
import { defineTool, seg, omit, yearArg, monthArg, jsonObject, type AnyToolSpec } from '@/src/tools/spec';

const scopeArg = z.enum(['forecast', 'budget']).describe('Version scope: forecast or budget');

export const plForecastSpecs: AnyToolSpec[] = [
  // ---- Scenarios ----
  defineTool({
    name: 'list_pl_scenarios',
    description: 'P&L: list saved scenarios, optionally filtered by scope or by a department they are shared with.',
    shape: {
      scope: scopeArg.optional(),
      dept: z.string().optional().describe('Department code the scenario is shared with'),
    },
    path: () => '/admin/pl/scenarios',
    query: (a) => ({ scope: a.scope, dept: a.dept }),
  }),
  defineTool({
    name: 'create_pl_scenario',
    description: 'P&L: create a scenario (a set of what-if adjustments over the P&L).',
    shape: {
      name: z.string(),
      scenario: jsonObject.describe('Scenario payload as used by the Finance app'),
      shared_with_depts: z.array(z.string()).optional(),
      scope: scopeArg.optional(),
    },
    method: 'POST',
    path: () => '/admin/pl/scenarios',
    body: (a) => a,
  }),
  defineTool({
    name: 'update_pl_scenario',
    description: 'P&L: update a scenario (name, payload or departments it is shared with).',
    shape: {
      id: z.string(),
      name: z.string().optional(),
      scenario: jsonObject.optional(),
      shared_with_depts: z.array(z.string()).optional(),
    },
    method: 'PATCH',
    path: (a) => `/admin/pl/scenarios/${seg(a.id)}`,
    body: (a) => omit(a, 'id'),
  }),
  defineTool({
    name: 'delete_pl_scenario',
    description: 'P&L: delete a scenario.',
    shape: { id: z.string() },
    method: 'DELETE',
    path: (a) => `/admin/pl/scenarios/${seg(a.id)}`,
  }),
  defineTool({
    name: 'share_pl_scenario',
    description: 'P&L: share a scenario by email. EXTERNAL ACTION: sends emails — confirm with the user first.',
    shape: {
      id: z.string(),
      emails: z.array(z.string().email()),
      message: z.string().optional(),
    },
    method: 'POST',
    path: (a) => `/admin/pl/scenarios/${seg(a.id)}/share`,
    body: (a) => omit(a, 'id'),
  }),

  // ---- Forecast versions ----
  defineTool({
    name: 'list_pl_forecast_versions',
    description: 'P&L: history of forecast/budget versions for a year (which scenario was "vigente" and when).',
    shape: { year: yearArg, scope: scopeArg.optional() },
    path: (a) => `/admin/pl/forecast-versions/${seg(a.year)}`,
    query: (a) => ({ scope: a.scope }),
  }),
  defineTool({
    name: 'get_pl_forecast_version',
    description: 'P&L: get one forecast version with its full scenario payload.',
    shape: { id: z.string() },
    path: (a) => `/admin/pl/forecast-versions/version/${seg(a.id)}`,
  }),
  defineTool({
    name: 'get_pl_forecast_baseline',
    description: 'P&L: get the original baseline (frozen original forecast/budget) for a year.',
    shape: { year: yearArg, scope: scopeArg.optional() },
    path: (a) => `/admin/pl/forecast-versions/${seg(a.year)}/baseline`,
    query: (a) => ({ scope: a.scope }),
  }),
  defineTool({
    name: 'create_pl_forecast_baseline',
    description: 'P&L: freeze the current forecast/budget as the original baseline for a year.',
    shape: { year: yearArg, scope: scopeArg, name: z.string().optional() },
    method: 'POST',
    path: (a) => `/admin/pl/forecast-versions/${seg(a.year)}/baseline`,
    body: (a) => omit(a, 'year'),
  }),
  defineTool({
    name: 'delete_pl_forecast_baseline',
    description: 'P&L: delete the original baseline of a year (irreversible).',
    shape: { year: yearArg, scope: scopeArg },
    method: 'DELETE',
    path: (a) => `/admin/pl/forecast-versions/${seg(a.year)}/baseline`,
    query: (a) => ({ scope: a.scope, confirm: a.year }),
  }),
  defineTool({
    name: 'set_pl_forecast_vigente',
    description: 'P&L: mark a saved scenario as the current ("vigente") forecast/budget for a year.',
    shape: {
      year: yearArg,
      scope: scopeArg,
      scenario_id: z.string(),
      note: z.string().optional(),
    },
    method: 'POST',
    path: (a) => `/admin/pl/forecast-versions/${seg(a.year)}/vigente`,
    body: (a) => omit(a, 'year'),
  }),
  defineTool({
    name: 'clear_pl_forecast_vigente',
    description: 'P&L: clear the current ("vigente") forecast/budget for a year.',
    shape: { year: yearArg, scope: scopeArg },
    method: 'POST',
    path: (a) => `/admin/pl/forecast-versions/${seg(a.year)}/vigente/clear`,
    body: (a) => omit(a, 'year'),
  }),

  // ---- Management control panel (Cuadro de mando) ----
  defineTool({
    name: 'get_control_panel_definitions',
    description: 'Cuadro de mando: list of panels and the definition/source of each metric.',
    shape: {},
    path: () => '/admin/dashboard/control/definitions',
  }),
  defineTool({
    name: 'get_control_panel',
    description: 'Cuadro de mando de dirección: KPIs for the group and each hub for a year/month (billing, margin, Holded collections, etc.). Without panel returns all panels.',
    shape: {
      year: yearArg,
      month: monthArg.optional().describe('Month 1-12 (default: current/last closed month)'),
      panel: z.enum(['grupo', 'immedia', 'imcontent', 'immoralia', 'imsales', 'imfilms']).optional(),
    },
    path: (a) => `/admin/dashboard/control/${seg(a.year)}`,
    query: (a) => ({ month: a.month, panel: a.panel }),
  }),
];
