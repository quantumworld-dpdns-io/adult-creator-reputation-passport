module ReputationAnalytics

using HTTP
using JSON
using DataFrames
using CSV
using DuckDB
using Statistics

export ReputationService, start_server

struct ReputationService
    host::String
    port::Int
    db::DuckDB.DB
end

function ReputationService(; host="0.0.0.0", port=8083)
    db = DuckDB.DB(":memory:")
    return ReputationService(host, port, db)
end

function analyze_reputation(scores::Vector{Float64})
    n = length(scores)
    if n == 0
        return Dict(
            "mean" => 0.0,
            "median" => 0.0,
            "std" => 0.0,
            "min" => 0.0,
            "max" => 0.0,
            "n" => 0,
        )
    end
    return Dict(
        "mean" => round(mean(scores), digits=4),
        "median" => round(median(scores), digits=4),
        "std" => round(std(scores), digits=4),
        "min" => round(minimum(scores), digits=4),
        "max" => round(maximum(scores), digits=4),
        "n" => n,
    )
end

function bayesian_score(positive::Int, total::Int, prior::Float64=0.5, weight::Float64=10.0)
    if total == 0
        return prior
    end
    return (positive + prior * weight) / (total + weight)
end

function router(request::HTTP.Request)
    path = HTTP.URIs.splitpath(request.target)

    if request.method == "GET" && path == ["healthz"]
        return HTTP.Response(200, JSON.json(Dict(
            "status" => "healthy",
            "service" => "julia-analytics",
            "version" => "0.1.0",
        )))
    end

    if request.method == "POST" && path == ["api", "v1", "analytics", "reputation"]
        body = JSON.parse(String(request.body))
        scores = [parse(Float64, string(v)) for (k, v) in body if occursin("score", k)]
        result = analyze_reputation(scores)
        return HTTP.Response(200, JSON.json(result))
    end

    if request.method == "POST" && path == ["api", "v1", "analytics", "bayesian"]
        body = JSON.parse(String(request.body))
        score = bayesian_score(
            get(body, "positive", 0),
            get(body, "total", 1),
            get(body, "prior", 0.5),
            get(body, "weight", 10.0),
        )
        return HTTP.Response(200, JSON.json(Dict("bayesian_score" => round(score, digits=4))))
    end

    return HTTP.Response(404, JSON.json(Dict("error" => "not found")))
end

function start_server(service::ReputationService)
    println("Starting Julia analytics service on $(service.host):$(service.port)")
    HTTP.serve(router, service.host, service.port)
end

if abspath(PROGRAM_FILE) == @__FILE__
    service = ReputationService()
    start_server(service)
end

end # module
