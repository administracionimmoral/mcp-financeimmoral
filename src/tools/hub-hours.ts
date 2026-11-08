/**
 * Hub hours & hub adjustments tools
 * Service: admin (/admin/hub-hours, /admin/hub-adjustments)
 */

import { z } from 'zod';
import { defineTool, seg, yearArg, monthArg, jsonObject, type AnyToolSpec } from '@/src/tools/spec';

export const hubHoursSpecs: AnyToolSpec[] = [
  // ---- Read ----
  defineTool({
    name: 'get_hub_hours_year',
    description: 'Hub hours: allocation of each person across hubs for a year (hours and % per month, source ClickUp/manual, closed months).',
    shape: { year: yearArg },
    path: (a) => `/admin/hub-hours/year/${seg(a.year)}`,
  }),
  defineTool({
    name: 'get_hub_hours_entries',
    description: 'Hub hours: raw ClickUp time entries for a month, optionally filtered.',
    shape: {
      year: yearArg,
      month: monthArg,
      only: z.enum(['unclassified']).optional().describe('"unclassified" = only entries not assigned to a hub'),
      person: z.string().optional().describe('Filter by person name'),
    },
    path: (a) => `/admin/hub-hours/entries/${seg(a.year)}/${seg(a.month)}`,
    query: (a) => ({ only: a.only, person: a.person }),
  }),
  defineTool({
    name: 'get_hub_hours_config',
    description: 'Hub hours: configuration (ClickUp start month, location→hub map, ClickUp user→person map, departments).',
    shape: {},
    path: () => '/admin/hub-hours/config',
  }),
  defineTool({
    name: 'list_hub_hours_clickup_spaces',
    description: 'Hub hours: ClickUp spaces available for mapping.',
    shape: {},
    path: () => '/admin/hub-hours/clickup/spaces',
  }),
  defineTool({
    name: 'get_hub_hours_clickup_space',
    description: 'Hub hours: folders/lists of one ClickUp space (for location mapping).',
    shape: { space_id: z.string().describe('ClickUp space ID') },
    path: (a) => `/admin/hub-hours/clickup/space/${seg(a.space_id)}`,
  }),
  defineTool({
    name: 'get_hub_adjustments',
    description: 'Hub adjustments: losses assumed by each hub lead (calculated from commissions) and real profitability per hub for a year.',
    shape: { year: yearArg },
    path: (a) => `/admin/hub-adjustments/${seg(a.year)}`,
  }),

  // ---- Write ----
  defineTool({
    name: 'upsert_hub_hours_manual',
    description: 'Hub hours: set manual hours per hub for a person in a month (fails if the month is closed).',
    shape: {
      year: yearArg,
      month: monthArg,
      person_name: z.string(),
      hours: jsonObject.describe('Hours per hub, e.g. {"immedia": 80, "imcontent": 40}'),
      notes: z.string().optional(),
    },
    method: 'PUT',
    path: () => '/admin/hub-hours/manual',
    body: (a) => a,
  }),
  defineTool({
    name: 'delete_hub_hours_manual',
    description: 'Hub hours: delete the manual hours of a person for a month.',
    shape: { year: yearArg, month: monthArg, person: z.string().describe('Person name') },
    method: 'DELETE',
    path: (a) => `/admin/hub-hours/manual/${seg(a.year)}/${seg(a.month)}/${seg(a.person)}`,
  }),
  defineTool({
    name: 'close_hub_hours_month',
    description: 'Hub hours: close a month, freezing each person\'s % allocation.',
    shape: { year: yearArg, month: monthArg },
    method: 'POST',
    path: () => '/admin/hub-hours/close',
    body: (a) => a,
  }),
  defineTool({
    name: 'reopen_hub_hours_month',
    description: 'Hub hours: reopen a closed month.',
    shape: { year: yearArg, month: monthArg },
    method: 'POST',
    path: () => '/admin/hub-hours/reopen',
    body: (a) => a,
  }),
  defineTool({
    name: 'sync_hub_hours_clickup',
    description: 'Hub hours: re-sync a full year of ClickUp time entries (replaces the stored ClickUp hours for that year).',
    shape: { year: yearArg },
    method: 'POST',
    path: () => '/admin/hub-hours/sync-clickup',
    body: (a) => a,
  }),
  defineTool({
    name: 'set_hub_hours_clickup_start',
    description: 'Hub hours: set the first month from which ClickUp hours are used.',
    shape: { year: yearArg, month: monthArg },
    method: 'PUT',
    path: () => '/admin/hub-hours/settings/clickup-start',
    body: (a) => a,
  }),
  defineTool({
    name: 'set_hub_hours_location_map',
    description: 'Hub hours: map a ClickUp location (space/folder/list) to a hub/department.',
    shape: {
      location_id: z.string(),
      location_name: z.string().optional(),
      dept_name: z.string().describe('Hub/department name'),
    },
    method: 'PUT',
    path: () => '/admin/hub-hours/location-map',
    body: (a) => a,
  }),
  defineTool({
    name: 'delete_hub_hours_location_map',
    description: 'Hub hours: remove a ClickUp location → hub mapping.',
    shape: { location_id: z.string() },
    method: 'DELETE',
    path: (a) => `/admin/hub-hours/location-map/${seg(a.location_id)}`,
  }),
  defineTool({
    name: 'set_hub_hours_person_map',
    description: 'Hub hours: map a ClickUp user to a person name.',
    shape: {
      clickup_user_id: z.string(),
      clickup_username: z.string().optional(),
      person_name: z.string(),
    },
    method: 'PUT',
    path: () => '/admin/hub-hours/person-map',
    body: (a) => a,
  }),
  defineTool({
    name: 'delete_hub_hours_person_map',
    description: 'Hub hours: remove a ClickUp user → person mapping.',
    shape: { clickup_user_id: z.string() },
    method: 'DELETE',
    path: (a) => `/admin/hub-hours/person-map/${seg(a.clickup_user_id)}`,
  }),
];
