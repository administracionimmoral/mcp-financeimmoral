/**
 * PandaDoc tools (through the Finance app)
 * Service: pandadoc (/pandadoc)
 *
 * Not exposed: PDF download (binary), template preview (creates documents
 * in PandaDoc on each call) and embedded signing sessions (UI only).
 */

import { z } from 'zod';
import { defineTool, seg, omit, jsonObject, type AnyToolSpec } from '@/src/tools/spec';

const recipient = z.object({
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: z.string().optional(),
  signing_order: z.number().int().min(1).optional(),
});

export const pandadocSpecs: AnyToolSpec[] = [
  defineTool({
    name: 'get_pandadoc_health',
    description: 'PandaDoc: health of the PandaDoc integration in the Finance app.',
    shape: {},
    path: () => '/pandadoc/health',
  }),
  defineTool({
    name: 'list_pandadoc_templates',
    description: 'PandaDoc: list templates.',
    shape: {
      q: z.string().optional().describe('Search by name'),
      tag: z.string().optional(),
      count: z.number().int().min(1).max(100).optional(),
      page: z.number().int().min(1).optional(),
    },
    path: () => '/pandadoc/templates',
    query: (a) => ({ q: a.q, tag: a.tag, count: a.count, page: a.page }),
  }),
  defineTool({
    name: 'get_pandadoc_template',
    description: 'PandaDoc: template details (fields, tokens, roles, pricing tables).',
    shape: { id: z.string().describe('PandaDoc template ID') },
    path: (a) => `/pandadoc/templates/${seg(a.id)}`,
  }),
  defineTool({
    name: 'list_pandadoc_documents',
    description: 'PandaDoc: list documents.',
    shape: {
      q: z.string().optional().describe('Search by name'),
      status: z.number().int().optional().describe('PandaDoc numeric status filter (0 draft, 1 sent, 2 completed…)'),
      tag: z.string().optional(),
      count: z.number().int().min(1).max(100).optional(),
      page: z.number().int().min(1).optional(),
    },
    path: () => '/pandadoc/documents',
    query: (a) => ({ q: a.q, status: a.status, tag: a.tag, count: a.count, page: a.page }),
  }),
  defineTool({
    name: 'get_pandadoc_document',
    description: 'PandaDoc: document details.',
    shape: { id: z.string().describe('PandaDoc document ID') },
    path: (a) => `/pandadoc/documents/${seg(a.id)}`,
  }),
  defineTool({
    name: 'get_pandadoc_document_status',
    description: 'PandaDoc: current status of a document (draft, sent, viewed, completed…).',
    shape: { id: z.string().describe('PandaDoc document ID') },
    path: (a) => `/pandadoc/documents/${seg(a.id)}/status`,
  }),
  defineTool({
    name: 'create_pandadoc_document',
    description: 'PandaDoc: create a draft document from a template. Does not send it.',
    shape: {
      name: z.string(),
      template_uuid: z.string(),
      recipients: z.array(recipient).min(1),
      tokens: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
      fields: jsonObject.optional().describe('Map field name → {value, role?}'),
      metadata: jsonObject.optional(),
      tags: z.array(z.string()).optional(),
      pricing_tables: z.array(z.unknown()).optional(),
    },
    method: 'POST',
    path: () => '/pandadoc/documents',
    body: (a) => a,
  }),
  defineTool({
    name: 'send_pandadoc_document',
    description: 'PandaDoc: send a document to its recipients. EXTERNAL ACTION: emails the recipients — confirm with the user first.',
    shape: {
      id: z.string().describe('PandaDoc document ID'),
      subject: z.string().optional(),
      message: z.string().optional(),
      silent: z.boolean().optional().describe('If true, PandaDoc does not send the email notification'),
    },
    method: 'POST',
    path: (a) => `/pandadoc/documents/${seg(a.id)}/send`,
    body: (a) => omit(a, 'id'),
  }),
  defineTool({
    name: 'list_pandadoc_mappings',
    description: 'PandaDoc: template mapping per use case and department.',
    shape: { use_case: z.string().optional() },
    path: () => '/pandadoc/config/mappings',
    query: (a) => ({ use_case: a.use_case }),
  }),
  defineTool({
    name: 'set_pandadoc_mapping',
    description: 'PandaDoc: set which template is used for a use case and department.',
    shape: {
      use_case: z.string(),
      department_code: z.string(),
      template_id: z.string(),
      template_name: z.string().optional(),
    },
    method: 'PUT',
    path: () => '/pandadoc/config/mappings',
    body: (a) => a,
  }),
  defineTool({
    name: 'delete_pandadoc_mapping',
    description: 'PandaDoc: remove the template mapping of a use case and department.',
    shape: { use_case: z.string(), department_code: z.string() },
    method: 'DELETE',
    path: (a) => `/pandadoc/config/mappings/${seg(a.use_case)}/${seg(a.department_code)}`,
  }),
];
