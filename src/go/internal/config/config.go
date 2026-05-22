package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Port        string
	Env         string
	LogLevel    string
	JWTSecret   string
	JWTExpiry   time.Duration
	CORSOrigins []string
	RateLimit   int

	PostgresHost     string
	PostgresPort     string
	PostgresDB       string
	PostgresUser     string
	PostgresPassword string

	RedisHost     string
	RedisPort     string
	RedisPassword string

	NATSHost string
	NATSPort string

	OTLPEndpoint string
}

func Load() *Config {
	return &Config{
		Port:             getEnv("GO_API_PORT", "8080"),
		Env:              getEnv("ENVIRONMENT", "development"),
		LogLevel:         getEnv("LOG_LEVEL", "info"),
		JWTSecret:        getEnv("JWT_SECRET", "dev-secret-change-in-production"),
		JWTExpiry:        getDuration("JWT_EXPIRY_HOURS", 24),
		CORSOrigins:      getStrings("CORS_ORIGINS", "http://localhost:3000"),
		RateLimit:        getInt("RATE_LIMIT_REQUESTS", 100),
		PostgresHost:     getEnv("POSTGRES_HOST", "localhost"),
		PostgresPort:     getEnv("POSTGRES_PORT", "5432"),
		PostgresDB:       getEnv("POSTGRES_DB", "reputation_passport"),
		PostgresUser:     getEnv("POSTGRES_USER", "postgres"),
		PostgresPassword: getEnv("POSTGRES_PASSWORD", ""),
		RedisHost:        getEnv("REDIS_HOST", "localhost"),
		RedisPort:        getEnv("REDIS_PORT", "6379"),
		RedisPassword:    getEnv("REDIS_PASSWORD", ""),
		NATSHost:         getEnv("NATS_HOST", "localhost"),
		NATSPort:         getEnv("NATS_PORT", "4222"),
		OTLPEndpoint:     getEnv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}

func getDuration(key string, fallback time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return fallback * time.Hour
}

func getStrings(key, fallback string) []string {
	if v := os.Getenv(key); v != "" {
		return strings.Split(v, ",")
	}
	return []string{fallback}
}
