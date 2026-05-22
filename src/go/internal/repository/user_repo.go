package repository

import (
	"context"
	"database/sql"

	"github.com/quantumworld-dpdns-io/adult-creator-reputation-passport/go-api/internal/model"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, u *model.User) error {
	query := `INSERT INTO users (id, email, password_hash, display_name, creator_hash,
		verified, role, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err := r.db.ExecContext(ctx, query,
		u.ID, u.Email, u.PasswordHash, u.DisplayName, u.CreatorHash,
		u.Verified, u.Role, u.CreatedAt, u.UpdatedAt)
	return err
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	u := &model.User{}
	query := `SELECT id, email, password_hash, display_name, creator_hash,
		verified, role, created_at, updated_at FROM users WHERE id = $1`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.DisplayName, &u.CreatorHash,
		&u.Verified, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	u := &model.User{}
	query := `SELECT id, email, password_hash, display_name, creator_hash,
		verified, role, created_at, updated_at FROM users WHERE email = $1`
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.DisplayName, &u.CreatorHash,
		&u.Verified, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}
