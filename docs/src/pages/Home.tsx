import {
  DotMatrixText,
  NothingCard,
  PillBadge,
  RadarScan,
  ProgressDots,
} from "@dennislee928/nothingx-react-components";

const badges = [
  "ERC-5192 Soulbound",
  "PQC ML-KEM TLS",
  "Kong AI Gateway",
  "K8s + Helm",
  "Terraform + Pulumi",
  "Rust · Go · Python · Julia",
  "OpenTelemetry",
  "OWASP Top 10",
  "Hardhat · Foundry",
  "Layer 2 Ready",
];

export function HomePage() {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <DotMatrixText text="ADULT CREATOR REPUTATION PASSPORT" size={28} />
        <p style={{ color: "#aaa", fontSize: 13, marginTop: 8 }}>
          Portable soulbound credentials for professionalism and reliability
          without exposing public identity
        </p>
        <RadarScan />
      </div>

      <NothingCard title="Features" style={{ marginBottom: 32 }}>
        <ul style={{ lineHeight: 2, fontSize: 13, paddingLeft: 20 }}>
          <li>ERC-5192 Soulbound Token (non-transferable) credential passport</li>
          <li>Post-Quantum Cryptography — ML-KEM-768, ML-DSA-65 hybrid TLS on Nginx</li>
          <li>Polyglot microservices: Go (Gin), Rust (Axum), Python (FastAPI), Julia, QASM</li>
          <li>Kong AI Gateway with 60+ plugins for rate limiting, JWT, AI proxy</li>
          <li>Kubernetes + Docker Swarm + Helm orchestration</li>
          <li>Terraform + Pulumi dual IaC coverage for AWS / GCP / Azure</li>
          <li>OpenTelemetry distributed tracing, Prometheus metrics, Grafana dashboards</li>
          <li>Robot Framework + OWASP ZAP acceptance and security testing</li>
          <li>Decentralized dispute resolution DAO with mediation and voting</li>
          <li>Layer 2 deployment ready: Polygon, Optimism, Arbitrum, Base, Scroll</li>
        </ul>
      </NothingCard>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
          Tech Stack
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {badges.map((b) => (
            <PillBadge key={b} label={b} />
          ))}
        </div>
      </div>

      <NothingCard title="Quick Start">
        <pre style={{
          background: "#111",
          padding: 16,
          borderRadius: 4,
          fontSize: 12,
          overflow: "auto",
          color: "#0f0",
        }}>
{`# Clone and run
git clone https://github.com/quantumworld-dpdns-io/adult-creator-reputation-passport.git
cd adult-creator-reputation-passport
cp .env.example .env
make dev

# Run tests
make test

# Deploy contracts (local Hardhat node)
cd contracts
npx hardhat node &
npx hardhat run scripts/deploy.ts --network localhost

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia`}
        </pre>
      </NothingCard>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <ProgressDots total={6} active={0} />
        <p style={{ fontSize: 11, color: "#555", marginTop: 8 }}>
          Explore the sections above to learn more
        </p>
      </div>
    </div>
  );
}
