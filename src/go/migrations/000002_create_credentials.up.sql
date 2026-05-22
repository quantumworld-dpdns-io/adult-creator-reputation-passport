CREATE TABLE IF NOT EXISTS credentials (
    id VARCHAR(66) PRIMARY KEY,
    issuer_id UUID NOT NULL REFERENCES users(id),
    subject_hash VARCHAR(66) NOT NULL,
    credential_type VARCHAR(50) NOT NULL,
    attributes JSONB DEFAULT '{}',
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMPTZ,
    revoke_reason TEXT,
    signature TEXT NOT NULL,
    pqc_signature TEXT,
    blockchain_tx_hash VARCHAR(66),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credentials_subject ON credentials(subject_hash);
CREATE INDEX idx_credentials_issuer ON credentials(issuer_id);
CREATE INDEX idx_credentials_type ON credentials(credential_type);
CREATE INDEX idx_credentials_revoked ON credentials(revoked);
