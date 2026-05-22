# ADR-001: Monorepo Structure

## Status

Accepted

## Context

We need a single repository housing multiple polyglot microservices with shared infrastructure configuration.

## Decision

Use a monorepo with the following structure:
- `src/{language}/` for each microservice
- Shared proto definitions in `src/proto/`
- Infrastructure configs at root level

## Consequences

- Simplified dependency management across services
- Unified CI/CD pipeline
- Requires careful gitignore management
