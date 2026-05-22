package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type ProfileHandler struct{}

func NewProfileHandler() *ProfileHandler {
	return &ProfileHandler{}
}

func (h *ProfileHandler) GetProfile(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"profile_id":     id,
		"creator_hash":   "0x" + id,
		"display_name":   "Creator " + id[:8],
		"verified":       true,
		"joined_at":      "2026-01-01T00:00:00Z",
		"credentials_count": 5,
	})
}

func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		DisplayName string `json:"display_name"`
		Bio         string `json:"bio"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"profile_id":   id,
		"display_name": req.DisplayName,
		"updated":      true,
	})
}
