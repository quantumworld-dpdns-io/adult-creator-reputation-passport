use axum::{
    extract::State,
    response::Json,
    routing::get,
    Router,
};
use datafusion::prelude::*;
use serde::Serialize;
use std::sync::Arc;

#[derive(Clone)]
struct AppState {
    ctx: Arc<SessionContext>,
}

#[derive(Serialize)]
struct QueryResult {
    columns: Vec<String>,
    rows: Vec<Vec<String>>,
    row_count: usize,
}

async fn query_sql(
    State(state): State<Arc<AppState>>,
    axum::extract::Query(params): axum::extract::Query<std::collections::HashMap<String, String>>,
) -> Result<Json<QueryResult>, axum::http::StatusCode> {
    let sql = params.get("sql").ok_or(axum::http::StatusCode::BAD_REQUEST)?;

    let df = state.ctx.sql(sql).await.map_err(|e| {
        tracing::error!("SQL error: {}", e);
        axum::http::StatusCode::BAD_REQUEST
    })?;

    let batches = df.collect().await.map_err(|_| {
        axum::http::StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let mut columns = Vec::new();
    let mut rows = Vec::new();

    if let Some(batch) = batches.first() {
        for col in batch.schema().fields() {
            columns.push(col.name().clone());
        }
        for batch in &batches {
            for row_idx in 0..batch.num_rows() {
                let mut row = Vec::new();
                for col_idx in 0..batch.num_columns() {
                    let array = batch.column(col_idx);
                    row.push(format!("{:?}", array));
                }
                rows.push(row);
            }
        }
    }

    Ok(Json(QueryResult {
        columns,
        row_count: rows.len(),
        rows,
    }))
}

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "healthy",
        "service": "analytics-engine",
        "engine": "datafusion"
    }))
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    let ctx = SessionContext::new();

    ctx.register_csv(
        "reputation",
        "data/reputation.csv",
        CsvReadOptions::new().has_header(true),
    ).await.ok();

    let state = Arc::new(AppState {
        ctx: Arc::new(ctx),
    });

    let app = Router::new()
        .route("/healthz", get(health))
        .route("/api/v1/query", get(query_sql))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8091").await?;
    tracing::info!("Analytics engine listening on port 8091");

    axum::serve(listener, app).await?;
    Ok(())
}
