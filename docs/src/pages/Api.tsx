import { DotMatrixText, NothingCard, TerminalPrompt } from "@dennislee928/nothingx-react-components";

const endpoints = [
  {
    method: "GET",
    path: "/healthz",
    desc: "Health check",
  },
  {
    method: "GET",
    path: "/readyz",
    desc: "Readiness check",
  },
  {
    method: "GET",
    path: "/api/v1/credentials/:id",
    desc: "Get credential by ID",
  },
  {
    method: "POST",
    path: "/api/v1/credentials",
    desc: "Issue a new credential",
  },
  {
    method: "POST",
    path: "/api/v1/credentials/verify",
    desc: "Verify a credential",
  },
  {
    method: "POST",
    path: "/api/v1/credentials/:id/revoke",
    desc: "Revoke a credential",
  },
  {
    method: "GET",
    path: "/api/v1/reputation/:hash",
    desc: "Get reputation score",
  },
  {
    method: "GET",
    path: "/api/v1/reputation/:hash/history",
    desc: "Get reputation history",
  },
  {
    method: "POST",
    path: "/api/v1/endorsements",
    desc: "Add an endorsement",
  },
  {
    method: "GET",
    path: "/api/v1/endorsements/:hash",
    desc: "Get endorsements for a subject",
  },
  {
    method: "GET",
    path: "/api/v1/profiles/:id",
    desc: "Get creator profile",
  },
  {
    method: "PUT",
    path: "/api/v1/profiles/:id",
    desc: "Update creator profile",
  },
];

export function ApiPage() {
  return (
    <div>
      <DotMatrixText text="API REFERENCE" size={24} />
      <p style={{ color: "#aaa", fontSize: 13, marginBottom: 32 }}>
        Go (Gin) HTTP API · JWT Auth · OpenTelemetry Tracing
      </p>

      <NothingCard title="Endpoints">
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
                  <span style={{
                    color: ep.method === "GET" ? "#4fc3f7" : "#81c784",
                    fontWeight: "bold",
                  }}>
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

      <NothingCard title="Example Request" style={{ marginTop: 24 }}>
        <TerminalPrompt
          command={`curl -X POST https://api.reputation-passport.io/api/v1/credentials \\
  -H "Authorization: Bearer <jwt>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "subject_hash": "0xabc123...",
    "credential_type": "identity_verification",
    "expires_at": 1893456000
  }'`}
        />
      </NothingCard>

      <NothingCard title="Example Response" style={{ marginTop: 16 }}>
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
