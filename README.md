# Adult Creator Reputation Passport

> Portable soulbound credentials for professionalism and reliability  
> without exposing public identity — powered by **ERC-5192**, **PQC**, **polyglot microservices**

[![CI Pipeline](https://github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/actions/workflows/ci.yml/badge.svg)](https://github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/actions/workflows/ci.yml)
[![GitHub Packages](https://github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/actions/workflows/packages.yml/badge.svg)](https://github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/actions/workflows/packages.yml)
[![GitHub Pages](https://github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/actions/workflows/jekyll-gh-pages.yml/badge.svg)](https://github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/actions/workflows/jekyll-gh-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue)](contracts/)
[![Go](https://img.shields.io/badge/Go-1.26-blue)](src/go/)
[![Rust](https://img.shields.io/badge/Rust-2021-orange)](src/rust/)
[![Python](https://img.shields.io/badge/Python-3.12-blue)](src/python/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## Features

- **ERC-5192 Soulbound Token** — Non-transferable NFT passport credentials with full lifecycle management (mint, lock, revoke, expire)
- **Post-Quantum Cryptography** — ML-KEM-768, ML-DSA-65, SLH-DSA hybrid TLS via Nginx oqs-provider
- **Polyglot Microservices** — Go (Gin), Rust (Axum), Python (FastAPI), Julia (Genie), QASM (quantum circuits)
- **Kong AI Gateway** — 60+ plugins: AI proxy, JWT, rate-limiting, CORS, bot-detection, Prometheus
- **On-Chain Reputation** — Multi-dimensional scoring with cryptographic proof verification
- **Endorsement Registry** — Weighted peer endorsements with category tracking
- **Dispute Resolution DAO** — Full lifecycle: file → evidence → deliberation → resolve with mediator + juror roles
- **Attestation Registry** — EIP-712 typed attestations with schema, expiration, and revocation
- **Layer 2 Ready** — Deploy to Polygon, Optimism, Arbitrum, Base, Scroll
- **Full IaC** — Terraform + Pulumi dual coverage for AWS, GCP, Azure, and bare metal
- **CI/CD** — 10-stage pipeline: lint → test → security → build → accept → ZAP → Terraform → Pulumi → deploy
- **Observability** — OpenTelemetry, Prometheus, Grafana, Loki
- **OWASP Top 10** — Robot Framework acceptance tests + ZAP active scanning

## Demo

A full React SPA demo is available on GitHub Pages:

**https://quantumworld-dpdns-io.github.io/adult-creator-reputation-passport/**

Built with [`@dennislee928/nothingx-react-components`](https://www.npmjs.com/package/@dennislee928/nothingx-react-components) — Nothing OS inspired UI with 150+ components.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/quantumworld-dpdns-io/adult-creator-reputation-passport.git
cd adult-creator-reputation-passport

# Copy environment configuration
cp .env.example .env

# Start development environment (Docker Compose)
make dev

# Run all tests
make test

# Deploy smart contracts to local Hardhat node
cd contracts
npx hardhat node &
npx hardhat run scripts/deploy.ts --network localhost
```

## Architecture

```
┌──────────┐    ┌─────────────┐    ┌────────────┐
│  Client   │──▶│  Nginx+PQC  │──▶│  Kong AI   │
│ (Browser) │    │  (ML-KEM)   │    │  Gateway   │
└──────────┘    └─────────────┘    └─────┬──────┘
                                         │
           ┌─────────────────────────────┼─────────────────────────────┐
           │                             │                             │
     ┌─────▼─────┐               ┌───────▼───────┐           ┌───────▼───────┐
     │   Go API   │               │   Rust Data   │           │  Python AI   │
     │   (Gin)    │               │   (Axum)      │           │  (FastAPI)   │
     │ Auth/CORS  │               │ DuckDB/Arrow  │           │  LLM/Vector  │
     │ Rate Limit │               │ DataFusion    │           │  Embeddings  │
     └─────┬─────┘               └───────┬───────┘           └───────┬───────┘
           │                             │                           │
     ┌─────▼─────────────────────────────▼───────────────────────────▼─────┐
     │                          Data Layer                                 │
     │  Postgres · Redis · DuckDB · Trino · Iceberg · Arrow               │
     │  Chroma · Qdrant · Milvus · Weaviate · LanceDB                     │
     └─────────────────────────────────────────────────────────────────────┘

     ┌─────────────────────────────────────────────────────────────────────┐
     │                     Web3 / Blockchain                               │
     │  PassportSBT (ERC-5192) · ReputationOracle · EndorsementRegistry   │
     │  DisputeResolutionDAO · AttestationRegistry · L2: Polygon/Arbitrum  │
     └─────────────────────────────────────────────────────────────────────┘

     ┌─────────────────────────────────────────────────────────────────────┐
     │                     Infrastructure                                  │
     │  K8s / Docker Swarm · Helm · Terraform · Pulumi                    │
     │  AWS · GCP · Azure · Bare Metal                                     │
     │  OpenTelemetry · Prometheus · Grafana · Loki · Cilium               │
     └─────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Web3** | Solidity 0.8.28, ERC-5192, Hardhat, Foundry, EIP-712 |
| **Gateway** | Nginx (oqs-provider PQC TLS 1.3), Kong (AI Gateway) |
| **Backend** | Go (Gin) — HTTP API, Rust (Axum) — data, Python (FastAPI) — AI |
| **Analytics** | Julia (Genie) — Bayesian/statistical, QASM — quantum circuits |
| **Quantum** | liboqs (ML-KEM-768, ML-DSA-65, SLH-DSA), QRNG |
| **Data** | Postgres, Redis, DuckDB, Trino, Iceberg, Arrow, DataFusion |
| **Vector DB** | Chroma, Qdrant, Milvus, Weaviate, LanceDB |
| **AI/ML** | Ollama, vLLM, SGLang, llama.cpp, W&B Weave |
| **Messaging** | NATS, gRPC, protobuf |
| **Observability** | OpenTelemetry, Prometheus, Grafana, Loki, Tempo |
| **Orchestration** | Kubernetes, Docker Swarm, Helm |
| **IaC** | Terraform, Pulumi (AWS + GCP + Azure) |
| **CI/CD** | GitHub Actions (10-stage), Robot Framework, OWASP ZAP |
| **Security** | Trivy, TruffleHog, Checkov, OPA |
| **Testing** | Robot Framework, Foundry fuzz, Hardhat chai, OWASP |

## Project Structure

```
├── src/
│   ├── go/              # Go API services (Gin, JWT, rate-limit)
│   ├── rust/            # Rust data processing (Axum, DuckDB, Arrow)
│   ├── python/          # Python AI/ML + web3.py client
│   ├── julia/           # Julia statistical analytics
│   └── qasm/            # Quantum circuits + PQC service
├── contracts/           # Solidity smart contracts
│   ├── hardhat/         # Hardhat config, scripts, tests
│   └── foundry/         # Foundry fuzz/invariant tests
├── docs/                # React SPA demo (GitHub Pages)
├── nginx/               # Nginx + oqs-provider PQC config
├── kong/                # Kong declarative config (decK)
├── k8s/                  # Kubernetes manifests
├── helm/                # Helm charts
├── terraform/           # Terraform modules (AWS, GCP, Azure)
├── pulumi/              # Pulumi Go programs
├── tests/
│   ├── robot/           # Robot Framework acceptance tests
│   └── owasp/           # OWASP security test scripts
├── proto/               # Protobuf definitions
├── scripts/             # Build and automation scripts
└── .github/
    ├── workflows/
    │   ├── ci.yml              # Main CI/CD (10 stages)
    │   ├── packages.yml         # GitHub Packages (ghcr, npm)
    │   └── jekyll-gh-pages.yml # GitHub Pages deploy
```

## Smart Contracts

| Contract | Description | Size (KiB) |
|----------|-------------|-----------|
| [PassportSBT](contracts/hardhat/contracts/PassportSBT.sol) | ERC-5192 Soulbound token with mint/revoke/burn/expire | 8.88 |
| [ReputationOracle](contracts/hardhat/contracts/ReputationOracle.sol) | On-chain reputation with proof verification + slash | 2.57 |
| [EndorsementRegistry](contracts/hardhat/contracts/EndorsementRegistry.sol) | Weighted endorsements (1-100) with categories | 3.97 |
| [DisputeResolutionDAO](contracts/hardhat/contracts/DisputeResolutionDAO.sol) | 5-phase dispute lifecycle with evidence + voting | 7.39 |
| [AttestationRegistry](contracts/hardhat/contracts/AttestationRegistry.sol) | EIP-712 attestations with schema + revocation | 4.35 |
| [PassportFacade](contracts/hardhat/contracts/PassportFacade.sol) | Unified entry point for all passport operations | 3.51 |

**Test Coverage:** 26 passing tests across all contracts.

### Deployment

```bash
# Local Hardhat node
cd contracts
npx hardhat node &
npx hardhat run scripts/deploy.ts --network localhost

# Sepolia testnet
npx hardhat run scripts/deploy-l2.ts --network sepolia

# Layer 2 (Polygon, Optimism, Arbitrum, Base)
npx hardhat run scripts/deploy-l2.ts --network polygon
npx hardhat run scripts/deploy-l2.ts --network optimism
```

### SDK Clients

- **Go**: `src/go/internal/contract/client.go` — Ethereum RPC client with ABI bindings
- **Python**: `src/python/app/web3_client.py` — web3.py contract interaction
- **TypeScript**: `src/typescript/passport-client.ts` — ethers.js v6 client

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/healthz` | No | Health check |
| `GET` | `/readyz` | No | Readiness check |
| `GET` | `/metrics` | No | Prometheus metrics |
| `GET` | `/api/v1/credentials/:id` | JWT | Get credential |
| `POST` | `/api/v1/credentials` | JWT | Issue credential |
| `POST` | `/api/v1/credentials/verify` | JWT | Verify credential |
| `POST` | `/api/v1/credentials/:id/revoke` | JWT | Revoke credential |
| `GET` | `/api/v1/reputation/:hash` | JWT | Get reputation |
| `GET` | `/api/v1/reputation/:hash/history` | JWT | Get history |
| `POST` | `/api/v1/endorsements` | JWT | Add endorsement |
| `GET` | `/api/v1/endorsements/:hash` | JWT | Get endorsements |
| `GET` | `/api/v1/profiles/:id` | JWT | Get profile |
| `PUT` | `/api/v1/profiles/:id` | JWT | Update profile |

## CI/CD Pipelines

### Main Pipeline (`ci.yml`)
1. **Lint** — Go, Rust, Python (matrix)
2. **Unit Test** — go-api, rust-data, python-ai (matrix)
3. **Security Scan** — Trivy (filesystem) + TruffleHog (secrets)
4. **Docker Build** — go-api, rust-data, python-ai, nginx-pqc → ghcr.io
5. **Acceptance Test** — Robot Framework against running services
6. **OWASP ZAP** — Full active scan
7. **Terraform Plan** — PR only
8. **Pulumi Preview** — PR only
9. **Deploy Staging** — main branch
10. **Deploy Production** — version tags

### Package Publishing (`packages.yml`)
- Docker images → `ghcr.io/*/{go-api,rust-data,python-ai,nginx-pqc,quantum,julia-analytics}:latest`, `:v*`
- npm packages → npmjs.com + GitHub Packages
- TypeScript SDK → npm

### GitHub Pages (`jekyll-gh-pages.yml`)
- Build React SPA from `docs/` → deploy to GitHub Pages

## Deployment Options

### Docker Compose (Development)
```bash
docker compose up -d
```

### Docker Swarm (Production)
```bash
docker stack deploy -c docker-swarm.yml passport
```

### Kubernetes + Helm
```bash
helm upgrade --install passport ./helm --namespace passport-prod
```

### Terraform
```bash
cd terraform/environments/dev
terraform init && terraform apply
```

### Pulumi
```bash
cd pulumi/programs/infra
pulumi up --stack dev
```

## Security

- **Post-Quantum**: ML-KEM-768 + X25519 hybrid key exchange, ML-DSA-65 signatures
- **Web Application**: JWT auth, rate limiting (100/min/IP), CORS, structured logging
- **Smart Contracts**: OpenZeppelin audited, role-based access, pausable, reentrancy guard
- **Infrastructure**: Trivy CVEs, TruffleHog secrets, OWASP ZAP scans, Checkov IaC
- **OWASP Top 10**: A01 (IDOR), A02 (TLS), A03 (SQLi), A05 (headers), A07 (JWT), A10 (SSRF)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Development Roadmap

See [PLAN.md](PLAN.md) for the complete 1,405-commit implementation plan across 22 phases.

## License

MIT — see [LICENSE](LICENSE) for details.
