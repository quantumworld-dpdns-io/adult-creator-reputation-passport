package service

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/go-api/internal/model"
	"github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/go-api/internal/repository"
)

type ReputationService struct {
	repo *repository.ReputationRepository
}

func NewReputationService(repo *repository.ReputationRepository) *ReputationService {
	return &ReputationService{repo: repo}
}

func (s *ReputationService) CalculateScore(ctx context.Context, subjectHash string) (*model.ReputationScore, error) {
	existing, err := s.repo.GetByHash(ctx, subjectHash)
	if err != nil {
		existing = &model.ReputationScore{SubjectHash: subjectHash}
	}

	reliability := s.weightedScore(existing.ReliabilityScore, existing.TotalEndorsements, 0.3)
	professionalism := s.weightedScore(existing.ProfessionalismScore, existing.TotalReviews, 0.2)
	communityTrust := s.weightedScore(existing.CommunityTrustScore, existing.TotalEndorsements, 0.1)

	overall := (reliability*0.4 + professionalism*0.35 + communityTrust*0.25)

	score := &model.ReputationScore{
		SubjectHash:          subjectHash,
		OverallScore:         math.Round(overall*100) / 100,
		ReliabilityScore:     math.Round(reliability*100) / 100,
		ProfessionalismScore: math.Round(professionalism*100) / 100,
		CommunityTrustScore:  math.Round(communityTrust*100) / 100,
		TotalEndorsements:    existing.TotalEndorsements,
		TotalReviews:         existing.TotalReviews,
		LastUpdated:          time.Now(),
	}

	if err := s.repo.Upsert(ctx, score); err != nil {
		return nil, fmt.Errorf("failed to save reputation score: %w", err)
	}
	return score, nil
}

func (s *ReputationService) weightedScore(baseScore float64, count int, decayFactor float64) float64 {
	if count == 0 {
		return 0.5
	}
	confidence := 1 - math.Exp(-decayFactor*float64(count))
	return baseScore*confidence + 0.5*(1-confidence)
}
