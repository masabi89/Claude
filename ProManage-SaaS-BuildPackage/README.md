# ProManage SaaS – Build Package

This package contains production-ready specifications and scaffolding to build **ProManage SaaS**, a multi-tenant project & task management platform with AI features and strong security compliance (NCA-ECC).

## Contents
- `/docs/ADR.md` — Architecture Decision Record (stack, tenancy, security)
- `/docs/RBAC-Matrix.md` — Role-based access matrix (CRUD by module)
- `/docs/Security-Checklist.md` — Security controls with NCA-ECC mapping
- `/api/openapi.yaml` — REST API (OpenAPI 3.1) including AI endpoints
- `/api/realtime-spec.md` — WebSocket real-time events specification
- `/db/schema.sql` — Control Plane + Database-per-Tenant schema
- `/devops/.gitlab-ci.yml` — GitLab CI/CD pipeline
- `/devops/helm/*` — Helm chart skeleton
- `/devops/terraform/*` — Terraform skeleton

## Getting Started
1. **Review ADR** (`/docs/ADR.md`), then adjust variables in Helm/Terraform.
2. **Create databases** using `/db/schema.sql` (control plane first).
3. **Generate server from OpenAPI** or implement controllers in NestJS.
4. **Implement WS events** from `/api/realtime-spec.md`.
5. **Run CI/CD** with `.gitlab-ci.yml`. Deploy via Helm to your cluster.

## Suggested Build Order
ADR → DB Schema → REST API → Real-Time → RBAC → Security → DevOps

## Compliance
This package includes baseline controls aligned to **NCA-ECC**, **ISO 27001**, and **OWASP ASVS**.
