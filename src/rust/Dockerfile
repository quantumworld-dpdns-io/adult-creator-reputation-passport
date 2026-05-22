FROM rust:1.84-slim-bookworm AS builder

RUN apt-get update && apt-get install -y pkg-config libssl-dev cmake clang && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
COPY src/ src/

RUN cargo build --release -p reputation-data

FROM gcr.io/distroless/cc-debian12:nonroot
COPY --from=builder /app/target/release/reputation-data /reputation-data
EXPOSE 8081
ENTRYPOINT ["/reputation-data"]
