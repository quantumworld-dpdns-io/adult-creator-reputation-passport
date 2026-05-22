package repository

import (
	"context"
	"database/sql"

	"github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/go-api/internal/model"
)

type ReputationRepository struct {
	db *sql.DB
}

func NewReputationRepository(db *sql.DB) *ReputationRepository {
	return &ReputationRepository{db: db}
}

func (r *ReputationRepository) GetByHash(ctx context.Context, hash string) (*model.ReputationScore, error) {
	rs := &model.ReputationScore{}
	query := `SELECT subject_hash, overall_score, reliability_score, professionalism_score,
		community_trust_score, total_endorsements, total_reviews, last_updated, pqc_hash_proof
		FROM reputation_scores WHERE subject_hash = $1`
	err := r.db.QueryRowContext(ctx, query, hash).Scan(
		&rs.SubjectHash, &rs.OverallScore, &rs.ReliabilityScore,
		&rs.ProfessionalismScore, &rs.CommunityTrustScore,
		&rs.TotalEndorsements, &rs.TotalReviews, &rs.LastUpdated, &rs.PQCHashProof)
	if err != nil {
		return nil, err
	}
	return rs, nil
}

func (r *ReputationRepository) Upsert(ctx context.Context, rs *model.ReputationScore) error {
	query := `INSERT INTO reputation_scores (subject_hash, overall_score, reliability_score,
		professionalism_score, community_trust_score, total_endorsements, total_reviews,
		last_updated, pqc_hash_proof)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (subject_hash) DO UPDATE SET
		overall_score = EXCLUDED.overall_score,
		reliability_score = EXCLUDED.reliability_score,
		professionalism_score = EXCLUDED.professionalism_score,
		community_trust_score = EXCLUDED.community_trust_score,
		total_endorsements = EXCLUDED.total_endorsements,
		total_reviews = EXCLUDED.total_reviews,
		last_updated = EXCLUDED.last_updated,
		pqc_hash_proof = EXCLUDED.pqc_hash_proof`
	_, err := r.db.ExecContext(ctx, query,
		rs.SubjectHash, rs.OverallScore, rs.ReliabilityScore,
		rs.ProfessionalismScore, rs.CommunityTrustScore,
		rs.TotalEndorsements, rs.TotalReviews, rs.LastUpdated, rs.PQCHashProof)
	return err
}
