package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/go-api/internal/model"
	"github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/go-api/internal/repository"
)

type CredentialService struct {
	repo *repository.CredentialRepository
}

func NewCredentialService(repo *repository.CredentialRepository) *CredentialService {
	return &CredentialService{repo: repo}
}

func (s *CredentialService) Issue(ctx context.Context, issuerID, subjectHash, credType string, attrs map[string]string) (*model.Credential, error) {
	id := generateID("cred")
	cred := &model.Credential{
		ID:             id,
		IssuerID:       issuerID,
		SubjectHash:    subjectHash,
		CredentialType: credType,
		Attributes:     attrs,
		IssuedAt:       time.Now(),
		Signature:      fmt.Sprintf("sig_%s", id),
	}
	if err := s.repo.Create(ctx, cred); err != nil {
		return nil, fmt.Errorf("failed to issue credential: %w", err)
	}
	return cred, nil
}

func (s *CredentialService) Verify(ctx context.Context, credID, subjectHash string) (bool, string, error) {
	cred, err := s.repo.GetByID(ctx, credID)
	if err != nil {
		return false, "credential not found", err
	}
	if cred.Revoked {
		return false, "credential has been revoked", nil
	}
	if cred.SubjectHash != subjectHash {
		return false, "subject hash mismatch", nil
	}
	if cred.ExpiresAt != nil && time.Now().After(*cred.ExpiresAt) {
		return false, "credential has expired", nil
	}
	return true, "credential is valid", nil
}

func (s *CredentialService) Revoke(ctx context.Context, credID, reason string) error {
	return s.repo.Revoke(ctx, credID, reason)
}

func generateID(prefix string) string {
	b := make([]byte, 16)
	rand.Read(b)
	return fmt.Sprintf("%s_%s", prefix, hex.EncodeToString(b))
}
