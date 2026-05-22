package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type CredentialHandler struct {
	// credentialService service.CredentialService
}

func NewCredentialHandler() *CredentialHandler {
	return &CredentialHandler{}
}

func (h *CredentialHandler) GetCredential(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"credential_id": id,
		"status":        "active",
	})
}

func (h *CredentialHandler) IssueCredential(c *gin.Context) {
	var req struct {
		SubjectHash    string `json:"subject_hash" binding:"required"`
		CredentialType string `json:"credential_type" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"credential_id":   "cred_" + req.SubjectHash[:8],
		"subject_hash":    req.SubjectHash,
		"credential_type": req.CredentialType,
		"status":          "issued",
	})
}

func (h *CredentialHandler) VerifyCredential(c *gin.Context) {
	var req struct {
		CredentialID string `json:"credential_id" binding:"required"`
		SubjectHash  string `json:"subject_hash" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"valid":   true,
		"reason":  "credential is active and verified",
	})
}

func (h *CredentialHandler) RevokeCredential(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Reason string `json:"reason"`
	}
	c.ShouldBindJSON(&req)
	c.JSON(http.StatusOK, gin.H{
		"credential_id": id,
		"revoked":       true,
		"reason":        req.Reason,
	})
}
