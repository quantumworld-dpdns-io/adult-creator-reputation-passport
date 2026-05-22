import { DotMatrixText, NothingCard, SegmentedDisplay } from "@dennislee928/nothingx-react-components";

export function DeploymentPage() {
  return (
    <div>
      <DotMatrixText text="DEPLOYMENT" size={24} />
      <p style={{ color: "#aaa", fontSize: 13, marginBottom: 32 }}>
        Multi-platform infrastructure with full IaC coverage
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <NothingCard title="Kubernetes">
          <pre style={{
            background: "#111",
            padding: 12,
            borderRadius: 4,
            fontSize: 11,
            color: "#0f0",
            overflow: "auto",
          }}>
{`# Deploy with Helm
helm upgrade --install passport \\
  ./helm \\
  --namespace passport-prod \\
  --set global.environment=production

# Verify
kubectl get pods -n passport-prod
kubectl get svc -n passport-prod`}
          </pre>
        </NothingCard>
        <NothingCard title="Docker Swarm">
          <pre style={{
            background: "#111",
            padding: 12,
            borderRadius: 4,
            fontSize: 11,
            color: "#0f0",
            overflow: "auto",
          }}>
{`# Deploy stack
docker stack deploy -c \\
  docker-swarm.yml passport

# Verify
docker stack services passport
docker service logs passport_go-api`}
          </pre>
        </NothingCard>
        <NothingCard title="Terraform">
          <pre style={{
            background: "#111",
            padding: 12,
            borderRadius: 4,
            fontSize: 11,
            color: "#0f0",
            overflow: "auto",
          }}>
{`# AWS infrastructure
cd terraform/environments/dev
terraform init
terraform plan
terraform apply

# Modules: VPC, EKS, RDS, ElastiCache, ECR`}
          </pre>
        </NothingCard>
        <NothingCard title="Pulumi">
          <pre style={{
            background: "#111",
            padding: 12,
            borderRadius: 4,
            fontSize: 11,
            color: "#0f0",
            overflow: "auto",
          }}>
{`# Go-based Pulumi program
cd pulumi/programs/infra
pulumi up --stack dev

# Stacks: dev, staging, prod, on-prem`}
          </pre>
        </NothingCard>
      </div>

      <NothingCard title="Environments" style={{ marginTop: 24 }}>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #333" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "#888" }}>Environment</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "#888" }}>Trigger</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "#888" }}>Deployment</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #222" }}>
              <td style={{ padding: "8px 12px" }}>Development</td>
              <td style={{ padding: "8px 12px", color: "#aaa" }}>Push to dev</td>
              <td style={{ padding: "8px 12px" }}>Docker Compose local</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #222" }}>
              <td style={{ padding: "8px 12px" }}>Staging</td>
              <td style={{ padding: "8px 12px", color: "#aaa" }}>Push to main</td>
              <td style={{ padding: "8px 12px" }}>K8s staging namespace</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #222" }}>
              <td style={{ padding: "8px 12px" }}>Production</td>
              <td style={{ padding: "8px 12px", color: "#aaa" }}>Tag v*</td>
              <td style={{ padding: "8px 12px" }}>K8s production namespace</td>
            </tr>
          </tbody>
        </table>
      </NothingCard>

      <NothingCard title="CI/CD Pipeline" style={{ marginTop: 16 }}>
        <pre style={{
          background: "#111",
          padding: 16,
          borderRadius: 4,
          fontSize: 12,
          color: "#0f0",
        }}>
{`Lint (Go, Rust, Python)
  └─► Unit Test (go-api, rust-data, python-ai)
        └─► Security Scan (Trivy + TruffleHog)
              └─► Docker Build & Push to GHCR
                    └─► Acceptance Test (Robot Framework)
                    │     └─► OWASP ZAP Full Scan
                    └─► Terraform Plan (PR only)
                    └─► Pulumi Preview (PR only)
                          └─► Deploy Staging (main)
                                └─► Deploy Production (tags)

Package Publishing:
  └─► Docker images → ghcr.io/*:latest, :v*, :sha-*
  └─── npm package → npmjs.com + GitHub Packages
  └────── TypeScript SDK → npm`}
        </pre>
      </NothingCard>

      <div style={{ marginTop: 24 }}>
        <SegmentedDisplay value="DEV OPS READY" />
      </div>
    </div>
  );
}
