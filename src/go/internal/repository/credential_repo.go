package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/go-api/internal/model"
)

type CredentialRepository struct {
	db *sql.DB
}

func NewCredentialRepository(db *sql.DB) *CredentialRepository {
	return &CredentialRepository{db: db}
}

func (r *CredentialRepository) Create(ctx context.Context, c *model.Credential) error {
	query := `INSERT INTO credentials (id, issuer_id, subject_hash, credential_type, attributes,
		issued_at, expires_at, revoked, signature, pqc_signature, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`
	_, err := r.db.ExecContext(ctx, query,
		c.ID, c.IssuerID, c.SubjectHash, c.CredentialType, c.Attributes,
		c.IssuedAt, c.ExpiresAt, c.Revoked, c.Signature, c.PQCSignature,
		time.Now(), time.Now())
	return err
}

func (r *CredentialRepository) GetByID(ctx context.Context, id string) (*model.Credential, error) {
	c := &model.Credential{}
	query := `SELECT id, issuer_id, subject_hash, credential_type, issued_at, expires_at,
		revoked, revoked_at, revoke_reason, signature, pqc_signature, created_at, updated_at
		FROM credentials WHERE id = $1`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&c.ID, &c.IssuerID, &c.SubjectHash, &c.CredentialType,
		&c.IssuedAt, &c.ExpiresAt, &c.Revoked, &c.RevokedAt,
		&c.RevokeReason, &c.Signature, &c.PQCSignature, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func (r *CredentialRepository) Revoke(ctx context.Context, id, reason string) error {
	query := `UPDATE credentials SET revoked = true, revoke_reason = $1, revoked_at = $2, updated_at = $2 WHERE id = $3`
	_, err := r.db.ExecContext(ctx, query, reason, time.Now(), id)
	return err
}

func (r *CredentialRepository) ListBySubject(ctx context.Context, subjectHash string, limit, offset int) ([]*model.Credential, error) {
	query := `SELECT id, issuer_id, subject_hash, credential_type, issued_at, expires_at,
		revoked, created_at, updated_at FROM credentials WHERE subject_hash = $1
		ORDER BY created_at DESC LIMIT $2 OFFSET $3`
	rows, err := r.db.QueryContext(ctx, query, subjectHash, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var credentials []*model.Credential
	for rows.Next() {
		c := &model.Credential{}
		if err := rows.Scan(&c.ID, &c.IssuerID, &c.SubjectHash, &c.CredentialType,
			&c.IssuedAt, &c.ExpiresAt, &c.Revoked, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		credentials = append(credentials, c)
	}
	return credentials, nil
}
