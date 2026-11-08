/**
 * Holded integration tools (through the Finance app)
 * Service: admin (/admin/integrations/holded)
 */

import { z } from 'zod';
import { defineTool, seg, jsonObject, type AnyToolSpec } from '@/src/tools/spec';

const paidArg = z.enum(['0', '1', '2']).optional().describe('Holded paid filter: 0 = unpaid, 1 = paid, 2 = partially paid');
const startArg = z.number().int().optional().describe('Start date as Unix timestamp (seconds)');
const endArg = z.number().int().optional().describe('End date as Unix timestamp (seconds)');

export const holdedSpecs: AnyToolSpec[] = [
  // ---- Read ----
  defineTool({
    name: 'get_holded_status',
    description: 'Holded: check the connection between the Finance app and Holded.',
    shape: {},
    path: () => '/admin/integrations/holded/status',
  }),
  defineTool({
    name: 'get_holded_summary',
    description: 'Holded: summary of invoicing and collections (issued, collected, pending).',
    shape: {},
    path: () => '/admin/integrations/holded/summary',
  }),
  defineTool({
    name: 'list_holded_invoices',
    description: 'Holded: list sales invoices with optional filters (paid status, date range, contact).',
    shape: {
      paid: paidArg,
      starttmp: startArg,
      endtmp: endArg,
      sort: z.string().optional().describe('Holded sort, e.g. created-asc / created-desc'),
      contactid: z.string().optional().describe('Holded contact ID'),
    },
    path: () => '/admin/integrations/holded/invoices',
    query: (a) => ({ paid: a.paid, starttmp: a.starttmp, endtmp: a.endtmp, sort: a.sort, contactid: a.contactid }),
  }),
  defineTool({
    name: 'search_holded_invoices',
    description: 'Holded: search invoices by text (number, client name…).',
    shape: {
      q: z.string().optional().describe('Search text'),
      status: z.enum(['pending', 'all']).optional().describe('pending = unpaid only (default), all = every invoice'),
    },
    path: () => '/admin/integrations/holded/invoices/search',
    query: (a) => ({ q: a.q, status: a.status }),
  }),
  defineTool({
    name: 'get_holded_invoice',
    description: 'Holded: get one invoice by Holded ID.',
    shape: { id: z.string().describe('Holded invoice ID') },
    path: (a) => `/admin/integrations/holded/invoices/${seg(a.id)}`,
  }),
  defineTool({
    name: 'list_holded_documents',
    description: 'Holded: list documents of any type (invoice, salesreceipt, creditnote, estimate, purchase, proform, waybill…).',
    shape: {
      doc_type: z.string().describe('Holded document type, e.g. invoice, purchase, creditnote, estimate'),
      paid: paidArg,
      starttmp: startArg,
      endtmp: endArg,
    },
    path: (a) => `/admin/integrations/holded/documents/${seg(a.doc_type)}`,
    query: (a) => ({ paid: a.paid, starttmp: a.starttmp, endtmp: a.endtmp }),
  }),
  defineTool({
    name: 'list_holded_contacts',
    description: 'Holded: list contacts (clients and suppliers).',
    shape: {},
    path: () => '/admin/integrations/holded/contacts',
  }),
  defineTool({
    name: 'get_holded_contact',
    description: 'Holded: get one contact by Holded ID.',
    shape: { id: z.string().describe('Holded contact ID') },
    path: (a) => `/admin/integrations/holded/contacts/${seg(a.id)}`,
  }),
  defineTool({
    name: 'get_holded_treasury',
    description: 'Holded: treasury accounts and balances.',
    shape: {},
    path: () => '/admin/integrations/holded/treasury',
  }),

  // ---- Write ----
  defineTool({
    name: 'create_holded_invoice',
    description: 'Holded: create a sales invoice. The payload is forwarded to Holded as-is (contactId, date, items…). Confirm with the user before creating.',
    shape: { invoice: jsonObject.describe('Holded invoice payload (see Holded API: POST /documents/invoice)') },
    method: 'POST',
    path: () => '/admin/integrations/holded/invoices',
    body: (a) => a.invoice,
  }),
  defineTool({
    name: 'pay_holded_invoice',
    description: 'Holded: register a payment on an invoice. Confirm with the user first.',
    shape: {
      id: z.string().describe('Holded invoice ID'),
      payment: jsonObject.describe('Holded pay payload, e.g. {"date": 1730000000, "amount": 1210, "treasury": "<id>"}'),
    },
    method: 'POST',
    path: (a) => `/admin/integrations/holded/invoices/${seg(a.id)}/pay`,
    body: (a) => a.payment,
  }),
  defineTool({
    name: 'send_holded_invoice',
    description: 'Holded: email an invoice to the client. EXTERNAL ACTION: sends an email to the client — confirm with the user first.',
    shape: {
      id: z.string().describe('Holded invoice ID'),
      options: jsonObject.optional().describe('Holded send payload, e.g. {"emails": "a@b.com", "subject": "...", "message": "..."}'),
    },
    method: 'POST',
    path: (a) => `/admin/integrations/holded/invoices/${seg(a.id)}/send`,
    body: (a) => a.options ?? {},
  }),
];
