FROM julia:1.11-slim

WORKDIR /app
COPY Project.toml .
RUN julia -e 'using Pkg; Pkg.activate("."); Pkg.instantiate()'

COPY src/ src/

EXPOSE 8083
CMD ["julia", "-e", "using ReputationAnalytics; ReputationAnalytics.start_server(ReputationAnalytics.ReputationService())"]
