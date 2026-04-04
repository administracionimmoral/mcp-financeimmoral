/**
 * Root page — backend-only project.
 * Returns a simple status message for health checks.
 */

export default function Home() {
  return (
    <div style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <h1>Immoral Finance MCP Server</h1>
      <p>Status: ✅ Running</p>
      <p>Version: 1.0.0</p>
      <p>MCP Endpoint: <code>/api/mcp</code></p>
      <hr />
      <p style={{ color: '#666', fontSize: '0.875rem' }}>
        This is a backend-only MCP server. Connect via Claude using the public URL.
      </p>
    </div>
  );
}
