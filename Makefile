.PHONY: all build test lint clean docker docker-build docker-push dev

# Default target
all: build

# Build all services
build: build-go build-rust build-python

build-go:
	cd src/go && go build -o ../../bin/go-api ./cmd/server

build-rust:
	cd src/rust && cargo build --release

build-python:
	cd src/python && pip install -e .

# Test all services
test: test-go test-rust test-python test-robot

test-go:
	cd src/go && go test ./...

test-rust:
	cd src/rust && cargo test

test-python:
	cd src/python && pytest

test-robot:
	robot tests/robot/

# Lint all services
lint: lint-go lint-rust lint-python

lint-go:
	cd src/go && golangci-lint run

lint-rust:
	cd src/rust && cargo clippy

lint-python:
	cd src/python && ruff check .

# Docker
docker-build:
	docker compose build

docker-push:
	docker compose push

docker-up:
	docker compose up -d

docker-down:
	docker compose down

# Development
dev:
	docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

dev-logs:
	docker compose logs -f

# Clean
clean:
	rm -rf bin/
	cd src/rust && cargo clean
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

# Help
help:
	@echo "Targets:"
	@echo "  build       - Build all services"
	@echo "  test        - Run all tests"
	@echo "  lint        - Lint all services"
	@echo "  docker-build - Build Docker images"
	@echo "  docker-up   - Start all services"
	@echo "  docker-down - Stop all services"
	@echo "  dev         - Start development environment"
	@echo "  clean       - Clean build artifacts"
