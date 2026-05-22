package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/go-api/internal/config"
	"github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/go-api/internal/handler"
	"github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/go-api/internal/middleware"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

func main() {
	cfg := config.Load()

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.StructuredLogger())
	r.Use(otelgin.Middleware("go-api"))
	r.Use(middleware.RequestID())
	r.Use(middleware.CORS(cfg.CORSOrigins))
	r.Use(middleware.NewRateLimiter(cfg.RateLimit))

	r.GET("/healthz", handler.HealthCheck)
	r.GET("/readyz", handler.ReadinessCheck)
	r.GET("/metrics", handler.PrometheusMetrics)

	v1 := r.Group("/api/v1")
	v1.Use(middleware.Auth(cfg.JWTSecret))
	{
		v1.GET("/credentials/:id", handler.GetCredential)
		v1.POST("/credentials", handler.IssueCredential)
		v1.POST("/credentials/verify", handler.VerifyCredential)
		v1.POST("/credentials/:id/revoke", handler.RevokeCredential)

		v1.GET("/reputation/:hash", handler.GetReputation)
		v1.GET("/reputation/:hash/history", handler.GetReputationHistory)
		v1.POST("/endorsements", handler.AddEndorsement)
		v1.GET("/endorsements/:hash", handler.GetEndorsements)

		v1.GET("/profiles/:id", handler.GetProfile)
		v1.PUT("/profiles/:id", handler.UpdateProfile)
	}

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("Starting Go API server on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exited gracefully")
}
