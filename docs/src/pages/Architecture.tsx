import { DotMatrixText, NothingCard, SegmentedDisplay } from "@dennislee928/nothingx-react-components";

export function ArchitecturePage() {
  return (
    <div>
      <DotMatrixText>ARCHITECTURE</DotMatrixText>
      <p style={{ color: "#aaa", fontSize: 13, marginBottom: 32 }}>
        End-to-end system architecture from client to data layer
      </p>

      <NothingCard>
        <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 12, color: "#888" }}>
          System Flow
        </div>
        <pre style={{
          background: "#111",
          padding: 16,
          borderRadius: 4,
          fontSize: 12,
          overflow: "auto",
          color: "#0f0",
          lineHeight: 1.8,
        }}>
{`
  ┌──────────┐    ┌─────────────┐    ┌─────────────┐
  │  Client   │───▶│  Nginx+PQC  │───▶│  Kong AI    │
  │ (Browser) │    │  (ML-KEM)   │    │  Gateway    │
  └──────────┘    └─────────────┘    └──────┬──────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
              ┌─────▼─────┐         ┌───────▼───────┐     ┌───────▼───────┐
              │   Go API   │         │   Rust Data   │     │  Python AI   │
              │   (Gin)    │         │   (Axum)      │     │  (FastAPI)   │
              │ Auth/CORS  │         │ DuckDB/Arrow  │     │  LLM/Vector  │
              │ Rate Limit │         │ DataFusion    │     │  Embeddings  │
              └─────┬─────┘         └───────┬───────┘     └───────┬───────┘
                    │                       │                     │
              ┌─────▼───────────────────────▼─────────────────────▼─────┐
              │                    Data Layer                            │
              │  Postgres  ·  Redis  ·  DuckDB  ·  Trino  ·  Iceberg   │
              │  Chroma  ·  Qdrant  ·  Milvus  ·  Weaviate  ·  LanceDB │
              └─────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────┐
  │                        Web3 / Blockchain                             │
  │  PassportSBT (ERC-5192)  ·  ReputationOracle  ·  EndorsementRegistry│
  │  DisputeResolutionDAO  ·  AttestationRegistry  ·  L2 Ready          │
  └──────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────┐
  │                      Infrastructure                                  │
  │  K8s / Docker Swarm  ·  Helm  ·  Terraform  ·  Pulumi               │
  │  AWS · GCP · Azure  ·  Bare Metal  ·  Prometheus · Grafana          │
  │  OpenTelemetry · Cilium Tetragon · PQC TLS 1.3                      │
  └──────────────────────────────────────────────────────────────────────┘`}
        </pre>
      </NothingCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
        <NothingCard>
          <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 12, color: "#888" }}>
            Gateway Layer
          </div>
          <ul style={{ fontSize: 12, lineHeight: 2, paddingLeft: 16 }}>
            <li>Nginx with oqs-provider (ML-KEM-768+X25519)</li>
            <li>Dual-stack RSA + PQC certificates</li>
            <li>mTLS authentication</li>
            <li>HTTP/3 QUIC support</li>
            <li>Kong AI Gateway with 60+ plugins</li>
            <li>AI Proxy, JWT, rate-limiting, CORS</li>
          </ul>
        </NothingCard>
        <NothingCard>
          <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 12, color: "#888" }}>
            Service Layer
          </div>
          <ul style={{ fontSize: 12, lineHeight: 2, paddingLeft: 16 }}>
            <li>Go: HTTP API, JWT auth, CRUD operations</li>
            <li>Rust: Data processing, DuckDB, Arrow</li>
            <li>Python: AI verification, embeddings</li>
            <li>Julia: Bayesian analytics, Monte Carlo</li>
            <li>QASM: Quantum circuits, PQC signatures</li>
            <li>gRPC/protobuf inter-service comms</li>
          </ul>
        </NothingCard>
        <NothingCard>
          <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 12, color: "#888" }}>
            Blockchain Layer
          </div>
          <ul style={{ fontSize: 12, lineHeight: 2, paddingLeft: 16 }}>
            <li>ERC-5192 Soulbound NFT passports</li>
            <li>Reputation oracle with proof hashes</li>
            <li>Endorsement registry with weighted scores</li>
            <li>Decentralized dispute resolution DAO</li>
            <li>EIP-712 typed attestations</li>
            <li>Hardhat + Foundry test coverage</li>
          </ul>
        </NothingCard>
        <NothingCard>
          <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 12, color: "#888" }}>
            Observability + Security
          </div>
          <ul style={{ fontSize: 12, lineHeight: 2, paddingLeft: 16 }}>
            <li>OpenTelemetry distributed tracing</li>
            <li>Prometheus metrics + Grafana dashboards</li>
            <li>Loki log aggregation</li>
            <li>Trivy + TruffleHog scanning</li>
            <li>OWASP ZAP active scanning</li>
            <li>Robot Framework acceptance tests</li>
          </ul>
        </NothingCard>
      </div>

      <div style={{ marginTop: 32 }}>
        <SegmentedDisplay value="POLYGLOT" />
        <div style={{ marginTop: 8 }}><SegmentedDisplay value="QUANTUM SAFE" /></div>
        <div style={{ marginTop: 8 }}><SegmentedDisplay value="WEB3 NATIVE" /></div>
      </div>
    </div>
  );
}
