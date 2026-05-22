FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /go-api ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /go-api /go-api
EXPOSE 8080
ENTRYPOINT ["/go-api"]
