# Immoral Finance MCP Server

Remote MCP (Model Context Protocol) server that connects **Claude** to the **Immoral Finance REST API**. Exposes 20 whitelisted financial tools — no proxy, no arbitrary endpoints, no frontend.

## Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict)
- **Framework**: Next.js 16 App Router (backend only)
- **MCP**: `mcp-handler` (Streamable HTTP + SSE)
- **Validation**: Zod (strict schemas, no extra properties)
- **HTTP Client**: Native `fetch` with timeout via `AbortController`
- **Deploy**: Vercel (serverless)

## Project Structure

```
immoral-finance-mcp/
├── app/
│   ├── api/
│   │   ├── mcp/[transport]/route.ts   # MCP endpoint (main)
│   │   └── health/route.ts            # Health check
│   ├── layout.tsx                     # Minimal layout (required by Next.js)
│   └── page.tsx                       # Status page
├── src/
│   ├── config/
│   │   └── env.ts                     # Environment config with validation
│   ├── lib/
│   │   ├── api.ts                     # HTTP client for Finance API
│   │   ├── errors.ts                  # Structured error classes
│   │   ├── logging.ts                 # JSON structured logger
│   │   └── response.ts               # Response builder (success/error)
│   ├── schemas/
│   │   └── index.ts                   # Zod schemas for all 20 tools
│   ├── tools/
│   │   ├── register.ts                # MCP server tool registration
│   │   ├── executor.ts                # Tool execution orchestrator
│   │   ├── billing.ts                 # Billing tools (2)
│   │   ├── clients.ts                 # Client tools (3)
│   │   ├── commissions.ts            # Commission tools (3)
│   │   ├── dashboard.ts              # Dashboard tools (1)
│   │   ├── expenses.ts               # Expense tools (1)
│   │   ├── payments.ts               # Payment tools (3)
│   │   ├── payroll.ts                 # Payroll tools (3)
│   │   ├── pl.ts                      # P&L tools (3)
│   │   ├── users.ts                   # User tools (1)
│   │   └── index.ts                   # Barrel exports
│   └── types/
│       └── index.ts                   # Shared TypeScript types
├── .env.example                       # Environment variables template
├── vercel.json                        # Vercel configuration
├── next.config.ts                     # Next.js configuration
├── tsconfig.json                      # TypeScript configuration
└── package.json
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `FINANCE_API_BASE_URL` | ✅ | — | Base URL of your Finance API (no trailing slash) |
| `FINANCE_API_KEY` | ✅ | — | API key (`ig_live_<key>` format) |
| `NODE_ENV` | ❌ | `development` | Environment mode |
| `REQUEST_TIMEOUT_MS` | ❌ | `15000` | Upstream request timeout in ms |
| `LOG_LEVEL` | ❌ | `info` | Log level: `debug`, `info`, `warn`, `error` |

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your real values:

```env
FINANCE_API_BASE_URL=https://your-finance-app.vercel.app
FINANCE_API_KEY=ig_live_your_actual_key
```

### 3. Run the dev server

```bash
npm run dev
```

The MCP server will be available at:
- **MCP endpoint**: `http://localhost:3000/api/mcp`
- **Health check**: `http://localhost:3000/api/health`

### 4. Verify types

```bash
npm run typecheck
```

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Immoral Finance MCP Server v1.0.0"
git remote add origin https://github.com/YOUR_USER/immoral-finance-mcp.git
git push -u origin main
```

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Add environment variables:
   - `FINANCE_API_BASE_URL` = your Finance API URL
   - `FINANCE_API_KEY` = your API key
5. Click **Deploy**

### 3. Enable Fluid Compute (recommended)

In your Vercel project settings → Functions → Enable **Fluid compute** for better MCP connection handling.

### 4. Get your public URL

After deploy, your MCP server URL will be:

```
https://immoral-finance-mcp.vercel.app/api/mcp
```

(or whatever subdomain Vercel assigns)

## Connect to Claude

### Claude Desktop (Custom Connector)

1. Open **Claude Desktop** → **Settings** → **Connectors**
2. Click **"Add custom connector"**
3. Enter your MCP server URL:
   ```
   https://your-project.vercel.app/api/mcp
   ```
4. Save and restart Claude
5. Claude should now detect all 20 tools

### Claude Code (CLI)

```bash
claude mcp add --transport http immoral-finance https://your-project.vercel.app/api/mcp
```

### Verify Claude sees the tools

Ask Claude:
> "¿Qué herramientas de Immoral Finance tienes disponibles?"

Claude should list all 20 tools.

## Tools (20 total)

### Billing (2)
| Tool | Description | Parameters |
|---|---|---|
| `get_billing_matrix` | Get billing matrix for a month | `year`, `month` |
| `get_billing_records` | Get billing records for a month | `year`, `month` |

### Clients (3)
| Tool | Description | Parameters |
|---|---|---|
| `list_clients` | List all clients | — |
| `list_client_verticals` | List all verticals | — |
| `get_client_by_id` | Get client by UUID | `id` |

### Dashboard (1)
| Tool | Description | Parameters |
|---|---|---|
| `get_dashboard_kpis` | Get KPIs for a year | `year` |

### Expenses (1)
| Tool | Description | Parameters |
|---|---|---|
| `get_expenses_by_month` | Get expenses for a month | `year`, `month` |

### P&L (3)
| Tool | Description | Parameters |
|---|---|---|
| `get_pl_summary` | Get P&L summary for a year | `year` |
| `get_pl_matrix` | Get P&L matrix data | `year`, `type` (real/budget) |
| `get_cost_per_hour` | Get cost-per-hour metrics | `year`, `dept` (immedia/imcontent/immoralia) |

### Payments (3)
| Tool | Description | Parameters |
|---|---|---|
| `get_payment_schedule` | Get payment schedule | `year`, `month` |
| `list_payment_beneficiaries` | List beneficiaries | — |
| `get_payment_summary` | Get payment summary | `year`, `month` |

### Payroll (3)
| Tool | Description | Parameters |
|---|---|---|
| `get_payroll_by_month` | Get payroll data | `year`, `month` |
| `list_employees` | List all employees | — |
| `get_employee_by_id` | Get employee by UUID | `id` |

### Commissions (3)
| Tool | Description | Parameters |
|---|---|---|
| `list_partners` | List all partners | — |
| `get_partner_commissions_by_month` | Get monthly commissions | `year`, `month` |
| `get_partner_commissions_annual` | Get annual commissions | `year` |

### Users (1)
| Tool | Description | Parameters |
|---|---|---|
| `list_users` | List all system users | — |

## Input Validation Rules

- `year` — 4-digit integer (1000–9999)
- `month` — integer 1–12
- `id` — valid UUID
- `type` — enum: `real` | `budget`
- `dept` — enum: `immedia` | `imcontent` | `immoralia`
- All schemas use `.strict()` — extra properties are rejected
- Required fields cannot be null
- Type mismatches (string where number expected) are rejected

## Security

- ✅ Whitelisted endpoints only — no arbitrary API access
- ✅ API key stored in environment variables, never exposed
- ✅ No stack traces in production responses
- ✅ Sanitized error responses
- ✅ Configurable request timeouts
- ✅ No filesystem access
- ✅ No code execution
- ✅ Backend-only — no frontend, no UI components

## Response Format

### Success
```json
{
  "ok": true,
  "tool": "get_billing_matrix",
  "source": "/billing/matrix?year=2025&month=3",
  "params": { "year": 2025, "month": 3 },
  "data": { ... },
  "meta": {
    "timestamp": "2025-03-15T10:30:00.000Z",
    "apiVersion": "v1",
    "durationMs": 245
  }
}
```

### Error
```json
{
  "ok": false,
  "tool": "get_billing_matrix",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "\"month\" must be an integer between 1 and 12",
    "type": "validation",
    "retryable": false
  },
  "meta": {
    "timestamp": "2025-03-15T10:30:00.000Z"
  }
}
```

## v1 Limitations

- No OAuth — uses internal API key authentication
- Read-only — all tools are GET operations
- No MCP resources or prompts
- No custom domain required — uses Vercel public URL
- No rate limiting on the MCP side (relies on upstream API)

## License

Private — Internal use only.
