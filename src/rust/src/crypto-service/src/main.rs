use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::post,
    Router,
};
use blake3::Hasher;
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Clone)]
struct AppState {
    signing_key: Arc<SigningKey>,
}

#[derive(Deserialize)]
struct SignRequest {
    message: String,
}

#[derive(Serialize)]
struct SignResponse {
    signature: String,
    public_key: String,
}

#[derive(Deserialize)]
struct VerifyRequest {
    message: String,
    signature: String,
    public_key: String,
}

#[derive(Serialize)]
struct VerifyResponse {
    valid: bool,
}

#[derive(Deserialize)]
struct HashRequest {
    data: String,
}

#[derive(Serialize)]
struct HashResponse {
    hash: String,
    algorithm: &'static str,
}

async fn sign_message(
    State(state): State<Arc<AppState>>,
    Json(req): Json<SignRequest>,
) -> Result<Json<SignResponse>, StatusCode> {
    let signature = state.signing_key.sign(req.message.as_bytes());
    let verifying_key = state.signing_key.verifying_key();

    Ok(Json(SignResponse {
        signature: hex::encode(signature.to_bytes()),
        public_key: hex::encode(verifying_key.to_bytes()),
    }))
}

async fn verify_signature(
    Json(req): Json<VerifyRequest>,
) -> Result<Json<VerifyResponse>, StatusCode> {
    let sig_bytes = hex::decode(&req.signature).map_err(|_| StatusCode::BAD_REQUEST)?;
    let pk_bytes = hex::decode(&req.public_key).map_err(|_| StatusCode::BAD_REQUEST)?;

    let signature = Signature::from_bytes(&sig_bytes.try_into().map_err(|_| StatusCode::BAD_REQUEST)?);
    let verifying_key = VerifyingKey::from_bytes(&pk_bytes.try_into().map_err(|_| StatusCode::BAD_REQUEST)?);

    let valid = verifying_key.verify(req.message.as_bytes(), &signature).is_ok();
    Ok(Json(VerifyResponse { valid }))
}

async fn hash_data(
    Json(req): Json<HashRequest>,
) -> Json<HashResponse> {
    let mut hasher = Hasher::new();
    hasher.update(req.data.as_bytes());
    let hash = hasher.finalize();

    Json(HashResponse {
        hash: hash.to_hex().to_string(),
        algorithm: "Blake3",
    })
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    let signing_key = SigningKey::generate(&mut OsRng);
    let state = Arc::new(AppState {
        signing_key: Arc::new(signing_key),
    });

    let app = Router::new()
        .route("/api/v1/sign", post(sign_message))
        .route("/api/v1/verify", post(verify_signature))
        .route("/api/v1/hash", post(hash_data))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8090").await?;
    tracing::info!("Crypto service listening on port 8090");

    axum::serve(listener, app).await?;
    Ok(())
}
