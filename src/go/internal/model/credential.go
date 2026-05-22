package model

import "time"

type Credential struct {
	ID             string            `json:"id" db:"id"`
	IssuerID       string            `json:"issuer_id" db:"issuer_id"`
	SubjectHash    string            `json:"subject_hash" db:"subject_hash"`
	CredentialType string            `json:"credential_type" db:"credential_type"`
	Attributes     map[string]string `json:"attributes"`
	IssuedAt       time.Time         `json:"issued_at" db:"issued_at"`
	ExpiresAt      *time.Time        `json:"expires_at,omitempty" db:"expires_at"`
	Revoked        bool              `json:"revoked" db:"revoked"`
	RevokedAt      *time.Time        `json:"revoked_at,omitempty" db:"revoked_at"`
	RevokeReason   string            `json:"revoke_reason,omitempty" db:"revoke_reason"`
	Signature      string            `json:"signature" db:"signature"`
	PQCSignature   string            `json:"pqc_signature,omitempty" db:"pqc_signature"`
	CreatedAt      time.Time         `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time         `json:"updated_at" db:"updated_at"`
}

type User struct {
	ID           string    `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	DisplayName  string    `json:"display_name" db:"display_name"`
	CreatorHash  string    `json:"creator_hash" db:"creator_hash"`
	Verified     bool      `json:"verified" db:"verified"`
	Role         string    `json:"role" db:"role"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type ReputationScore struct {
	SubjectHash          string    `json:"subject_hash" db:"subject_hash"`
	OverallScore         float64   `json:"overall_score" db:"overall_score"`
	ReliabilityScore     float64   `json:"reliability_score" db:"reliability_score"`
	ProfessionalismScore float64   `json:"professionalism_score" db:"professionalism_score"`
	CommunityTrustScore  float64   `json:"community_trust_score" db:"community_trust_score"`
	TotalEndorsements    int       `json:"total_endorsements" db:"total_endorsements"`
	TotalReviews         int       `json:"total_reviews" db:"total_reviews"`
	LastUpdated          time.Time `json:"last_updated" db:"last_updated"`
	PQCHashProof         string    `json:"pqc_hash_proof,omitempty" db:"pqc_hash_proof"`
}

type Endorsement struct {
	ID         string    `json:"id" db:"id"`
	FromHash   string    `json:"from_hash" db:"from_hash"`
	ToHash     string    `json:"to_hash" db:"to_hash"`
	Weight     float64   `json:"weight" db:"weight"`
	Category   string    `json:"category" db:"category"`
	Comment    string    `json:"comment" db:"comment"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	Signature  string    `json:"signature" db:"signature"`
}

type Review struct {
	ID          string    `json:"id" db:"id"`
	ReviewerID  string    `json:"reviewer_id" db:"reviewer_id"`
	TargetHash  string    `json:"target_hash" db:"target_hash"`
	Rating      int       `json:"rating" db:"rating"`
	Content     string    `json:"content" db:"content"`
	Moderated   bool      `json:"moderated" db:"moderated"`
	Approved    bool      `json:"approved" db:"approved"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type AuditLog struct {
	ID          string    `json:"id" db:"id"`
	ActorID     string    `json:"actor_id" db:"actor_id"`
	Action      string    `json:"action" db:"action"`
	Resource    string    `json:"resource" db:"resource"`
	ResourceID  string    `json:"resource_id" db:"resource_id"`
	Details     string    `json:"details" db:"details"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}
