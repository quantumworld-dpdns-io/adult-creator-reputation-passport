import { DotMatrixText, NothingCard, PillBadge, GlitchText } from "@dennislee928/nothingx-react-components";

const securityLayers = [
  {
    title: "Post-Quantum Cryptography",
    items: [
      "ML-KEM-768 (FIPS 203) — key encapsulation",
      "ML-DSA-65 (FIPS 204) — digital signatures",
      "SLH-DSA (FIPS 205) — stateless hash-based",
      "Hybrid X25519+MLKEM768 TLS on Nginx",
      "QRNG entropy source for quantum key generation",
    ],
  },
  {
    title: "Application Security",
    items: [
      "JWT authentication with HMAC-SHA256",
      "Rate limiting (token bucket algorithm)",
      "CORS origin validation",
      "Request ID tracing",
      "Structured logging with zap (no secrets in logs)",
    ],
  },
  {
    title: "Smart Contract Security",
    items: [
      "OpenZeppelin audited base contracts",
      "Role-based access (DEFAULT_ADMIN, MINTER, REVOKER)",
      "Pausable emergency stop",
      "ReentrancyGuard on critical functions",
      "Soulbound — non-transferable by design",
    ],
  },
  {
    title: "Infrastructure Security",
    items: [
      "OWASP ZAP full active scan in CI/CD",
      "Trivy vulnerability scanning (FS + container)",
      "TruffleHog secrets detection",
      "Checkov IaC scanning",
      "OPA policy enforcement",
    ],
  },
];

const owaspTests = [
  { id: "A01", name: "Broken Access Control", desc: "IDOR tests on credential endpoints" },
  { id: "A02", name: "Cryptographic Failures", desc: "Weak TLS detection, PQC enforcement" },
  { id: "A03", name: "Injection", desc: "SQL injection payload fuzzing" },
  { id: "A05", name: "Security Misconfiguration", desc: "Security headers audit" },
  { id: "A07", name: "Identification & Auth Failures", desc: "Invalid/expired JWT tests" },
  { id: "A10", name: "SSRF", desc: "Server-side request forgery tests" },
];

export function SecurityPage() {
  return (
    <div>
      <DotMatrixText>SECURITY</DotMatrixText>
      <p style={{ color: "#aaa", fontSize: 13, marginBottom: 32 }}>
        Defense-in-depth across all layers
      </p>

      <GlitchText>PQC · OWASP · DEFENSE IN DEPTH</GlitchText>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
        {securityLayers.map((layer) => (
          <NothingCard key={layer.title}>
            <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 12, color: "#888" }}>
              {layer.title}
            </div>
            <ul style={{ fontSize: 12, lineHeight: 2, paddingLeft: 16, color: "#aaa" }}>
              {layer.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </NothingCard>
        ))}
      </div>

      <NothingCard style={{ marginTop: 24 }}>
        <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 12, color: "#888" }}>
          OWASP Top 10 Coverage
        </div>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #333" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "#888" }}>ID</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "#888" }}>Category</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "#888" }}>Coverage</th>
            </tr>
          </thead>
          <tbody>
            {owaspTests.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: "8px 12px" }}>
                  <PillBadge variant="off">{t.id}</PillBadge>
                </td>
                <td style={{ padding: "8px 12px", color: "#aaa" }}>{t.name}</td>
                <td style={{ padding: "8px 12px" }}>{t.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </NothingCard>

      <NothingCard style={{ marginTop: 16 }}>
        <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 12, color: "#888" }}>
          Rate Limiting
        </div>
        <pre style={{
          background: "#111", padding: 16, borderRadius: 4, fontSize: 12, color: "#0f0",
        }}>
{`# Default: 100 requests/minute per IP
# Test: 150 requests in burst → 429 Too Many Requests
# Window: 1 minute sliding window
# Cleanup: stale entries removed every 5 minutes`}
        </pre>
      </NothingCard>
    </div>
  );
}
