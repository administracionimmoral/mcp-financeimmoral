/**
 * User tools
 * Service: admin
 * - list_users
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function listUsers(): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_users',
    params: {},
    path: '/admin/users',
  });
}
