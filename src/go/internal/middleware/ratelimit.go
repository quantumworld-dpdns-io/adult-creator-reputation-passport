package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type visitor struct {
	count    int
	lastSeen time.Time
}

type RateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	limit    int
	window   time.Duration
}

func NewRateLimiter(limit int) gin.HandlerFunc {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		limit:    limit,
		window:   time.Minute,
	}
	go rl.cleanup()
	return rl.middleware
}

func (rl *RateLimiter) middleware(c *gin.Context) {
	key := c.ClientIP()
	rl.mu.Lock()
	v, exists := rl.visitors[key]
	if !exists {
		rl.visitors[key] = &visitor{count: 1, lastSeen: time.Now()}
		rl.mu.Unlock()
		c.Next()
		return
	}
	if time.Since(v.lastSeen) > rl.window {
		v.count = 1
		v.lastSeen = time.Now()
		rl.mu.Unlock()
		c.Next()
		return
	}
	v.count++
	v.lastSeen = time.Now()
	if v.count > rl.limit {
		rl.mu.Unlock()
		c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
			"error": "rate limit exceeded",
			"retry_after": int(rl.window.Seconds()),
		})
		return
	}
	rl.mu.Unlock()
	c.Next()
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	for range ticker.C {
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			if time.Since(v.lastSeen) > 10*time.Minute {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}
