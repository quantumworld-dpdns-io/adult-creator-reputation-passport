CREATE TABLE IF NOT EXISTS endorsements (
    id VARCHAR(66) PRIMARY KEY,
    from_hash VARCHAR(66) NOT NULL,
    to_hash VARCHAR(66) NOT NULL,
    weight DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    category VARCHAR(50),
    comment TEXT,
    signature TEXT NOT NULL,
    blockchain_tx_hash VARCHAR(66),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_endorsements_from ON endorsements(from_hash);
CREATE INDEX idx_endorsements_to ON endorsements(to_hash);
CREATE INDEX idx_endorsements_to_weight ON endorsements(to_hash, weight DESC);
