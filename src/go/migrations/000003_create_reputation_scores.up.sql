CREATE TABLE IF NOT EXISTS reputation_scores (
    subject_hash VARCHAR(66) PRIMARY KEY,
    overall_score DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    reliability_score DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    professionalism_score DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    community_trust_score DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    total_endorsements INTEGER NOT NULL DEFAULT 0,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    pqc_hash_proof TEXT
);

CREATE INDEX idx_reputation_overall ON reputation_scores(overall_score DESC);
