# Adult Creator Reputation Passport

> Portable soulbound credentials for professionalism and reliability without exposing public identity

## Architecture

```
Nginx+PQC Reverse Proxy → Kong AI Gateway → Polyglot Microservices → Data Layer
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Gateway | Nginx (PQC TLS), Kong (AI Gateway) |
| Backend | Go (Gin), Rust (Axum), Python (FastAPI), Julia (Genie) |
| Quantum | QASM, liboqs (ML-KEM, ML-DSA, SLH-DSA) |
| Blockchain | Solidity (ERC-5192 SBT), Hardhat, Foundry |
| Data | Postgres, Redis, DuckDB, Trino, Iceberg, Arrow |
| Vector DB | Chroma, Qdrant, Milvus, Weaviate, LanceDB |
| AI/ML | Ollama, vLLM, SGLang, llama.cpp, W&B Weave |
| Observability | OpenTelemetry, Prometheus, Grafana, Loki |
| Orchestration | Kubernetes, Docker Swarm, Helm |
| IaC | Terraform, Pulumi |

## Quick Start

```bash
# Clone
git clone https://github.com/quantumworld-dpdns-io/adult-creator-reputation-passport.git
cd adult-creator-reputation-passport

# Copy env
cp .env.example .env

# Start development environment
make dev

# Run tests
make test
```

## Project Structure

```
├── src/
│   ├── go/          # Go API services
│   ├── rust/        # Rust data processing
│   ├── python/      # Python AI/ML services
│   ├── julia/       # Julia analytics
│   └── qasm/        # Quantum circuits
├── contracts/       # Solidity smart contracts
├── k8s/             # Kubernetes manifests
├── helm/            # Helm charts
├── terraform/       # Terraform IaC
├── pulumi/          # Pulumi IaC
├── tests/           # Test suites
│   ├── robot/       # Robot Framework
│   ├── owasp/       # OWASP security tests
│   └── load/        # Performance tests
├── docs/            # Documentation
└── .github/         # CI/CD pipelines
```

## Documentation

See [PLAN.md](PLAN.md) for the full 1,405-commit implementation plan.

## License

MIT
