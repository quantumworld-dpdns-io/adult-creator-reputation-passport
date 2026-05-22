import { DotMatrixText, NothingCard, TerminalPrompt } from "@dennislee928/nothingx-react-components";

const endpoints = [
  { method: "GET", path: "/healthz", desc: "Health check" },
  { method: "GET", path: "/readyz", desc: "Readiness check" },
  { method: "GET", path: "/api/v1/credentials/:id", desc: "Get credential by ID" },
  { method: "POST", path: "/api/v1/credentials", desc: "Issue a new credential" },
  { method: "POST", path: "/api/v1/credentials/verify", desc: "Verify a credential" },
  { method: "POST", path: "/api/v1/credentials/:id/revoke", desc: "Revoke a credential" },
  { method: "GET", path: "/api/v1/reputation/:hash", desc: "Get reputation score" },
  { method: "GET", path: "/api/v1/reputation/:hash/history", desc: "Get reputation history" },
  { method: "POST", path: "/api/v1/endorsements", desc: "Add an endorsement" },
  { method: "GET", path: "/api/v1/endorsements/:hash", desc: "Get endorsements" },
  { method: "GET", path: "/api/v1/profiles/:id", desc: "Get creator profile" },
  { method: "PUT", path: "/api/v1/profiles/:id", desc: "Update creator profile" },
];

const methodColors: Record<string, string> = {
  GET: "#4fc3f7",
  POST: "#81c784",
  PUT: "#ffb74d",
};

export function ApiPage() {
  return (
    <div>
      <DotMatrixText>API REFERENCE</DotMatrixText>
      <p style={{ color: "#aaa", fontSize: 13, marginBottom: 32 }}>
        Go (Gin) HTTP API · JWT Auth · OpenTelemetry Tracing
      </p>

      <NothingCard>
        <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 12, color: "#888" }}>
          Endpoints
        </div>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #333" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "#888" }}>Method</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "#888" }}>Path</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "#888" }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep) => (
              <tr key={ep.path} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: "8px 12px" }}>
                  <span style={{ color: methodColors[ep.method] || "#fff", fontWeight: "bold" }}>
                    {ep.method}
                  </span>
                </td>
                <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#fff" }}>
                  {ep.path}
                </td>
                <td style={{ padding: "8px 12px", color: "#aaa" }}>
                  {ep.desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </NothingCard>

      <NothingCard style={{ marginTop: 24 }}>
        <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 12, color: "#888" }}>
          Example Request
        </div>
        <TerminalPrompt prompt="$ " initialInput="curl -X POST https://..." />
        <pre style={{
          background: "#111",
          padding: 12,
          borderRadius: 4,
          fontSize: 11,
          color: "#aaa",
          marginTop: 8,
        }}>
{`curl -X POST https://api.reputation-passport.io/api/v1/credentials \\
  -H "Authorization: Bearer <jwt>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "subject_hash": "0xabc123...",
    "credential_type": "identity_verification",
    "expires_at": 1893456000
  }'`}
        </pre>
      </NothingCard>

      <NothingCard style={{ marginTop: 16 }}>
        <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 12, color: "#888" }}>
          Example Response
        </div>
        <pre style={{
          background: "#111",
          padding: 16,
          borderRadius: 4,
          fontSize: 12,
          color: "#0f0",
          overflow: "auto",
        }}>
{`{
  "credential_id": "cred_abc12345",
  "subject_hash": "0xabc123...",
  "credential_type": "identity_verification",
  "status": "issued",
  "token_id": 42,
  "tx_hash": "0xdef789..."
}`}
        </pre>
      </NothingCard>
    </div>
  );
}
