# ADR-002: Polyglot Service Architecture

## Status

Accepted

## Context

Different workloads require different language strengths. Go excels at HTTP APIs, Rust at data processing, Python at AI/ML, Julia at analytics, QASM at quantum circuits.

## Decision

Assign languages by workload:
- **Go**: API gateway, business logic, auth, CRUD
- **Rust**: Data processing, Arrow/Iceberg, vector DB, crypto
- **Python**: AI/ML, LLM, vector embeddings, RAG
- **Julia**: Statistical analysis, numerical computation
- **QASM**: Quantum circuits, PQC integration

## Consequences

- Inter-service communication via gRPC/protobuf
- Each service has independent Dockerfile
- Different build and test toolchains
