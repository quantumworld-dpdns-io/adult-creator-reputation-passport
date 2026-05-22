use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;

#[derive(Clone)]
struct AppState {
    db_pool: Option<deadpool_postgres::Pool>,
    redis_client: Option<redis::aio::ConnectionManager>,
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
    version: &'static str,
}

#[derive(Serialize, Deserialize)]
struct Credential {
    id: String,
    subject_hash: String,
    credential_type: String,
    issued_at: i64,
    valid: bool,
}

#[derive(Serialize)]
struct ReputationScore {
    subject_hash: String,
    overall_score: f64,
    reliability_score: f64,
    professionalism_score: f64,
    total_endorsements: i32,
    last_updated: i64,
}

async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "healthy",
        service: "reputation-data",
        version: "0.1.0",
    })
}

async fn get_credential(
    State(_state): State<Arc<AppState>>,
    axum::extract::Path(id): axum::extract::Path<String>,
) -> Result<Json<Credential>, StatusCode> {
    let cred = Credential {
        id,
        subject_hash: "0xabc123".to_string(),
        credential_type: "soulbound_passport".to_string(),
        issued_at: chrono::Utc::now().timestamp(),
        valid: true,
    };
    Ok(Json(cred))
}

async fn query_reputation(
    State(state): State<Arc<AppState>>,
    axum::extract::Path(hash): axum::extract::Path<String>,
) -> Result<Json<ReputationScore>, StatusCode> {
    let score = ReputationScore {
        subject_hash: hash,
        overall_score: 0.85,
        reliability_score: 0.90,
        professionalism_score: 0.88,
        total_endorsements: 42,
        last_updated: chrono::Utc::now().timestamp(),
    };
    Ok(Json(score))
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env()
            .add_directive("reputation_data=info".parse()?))
        .json()
        .init();

    let state = Arc::new(AppState {
        db_pool: None,
        redis_client: None,
    });

    let app = Router::new()
        .route("/healthz", get(health_check))
        .route("/api/v1/credentials/{id}", get(get_credential))
        .route("/api/v1/reputation/{hash}", get(query_reputation))
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::permissive())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8081").await?;
    tracing::info!("Rust data service listening on port 8081");

    axum::serve(listener, app).await?;
    Ok(())
}
