/**
 * Minimal root layout — this project is backend-only.
 * No frontend pages, no UI components.
 */

export const metadata = {
  title: 'Immoral Finance MCP Server',
  description: 'Remote MCP server for Immoral Finance API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
