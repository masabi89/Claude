# ADR — Technology Stack and Architecture (ProManage SaaS)
**Date:** 2025-08-10  
**Status:** Accepted

## Context
Multi-tenant SaaS for project/task management with subscription billing, strong data isolation, AI-assisted features, and KSA compliance (NCA-ECC).

## Decision
- **Frontend:** React + Next.js, Material UI, Redux Toolkit, WebSocket (Socket.IO)
- **Backend:** Node.js + NestJS; Prisma ORM; REST (OpenAPI 3.1), WS for realtime
- **Databases:** PostgreSQL; **Database-per-Tenant** + Control Plane DB
- **Caching/Queues:** Redis (cache, pub/sub, jobs)
- **Storage:** S3-compatible (AWS S3 / MinIO)
- **Auth:** JWT (short-lived) + refresh; SSO (OAuth2/OIDC, SAML) via Azure AD/Google
- **AI:** External model providers via secure gateway; endpoints exposed by API
- **Infra:** Kubernetes, Helm, Terraform, GitLab CI/CD, NGINX Ingress, TLS 1.3
- **Security:** MFA, RBAC, audit logs (append-only), encryption at-rest (AES-256) & in-transit

## Consequences
- Strong isolation and compliance readiness; higher infra complexity and cost.
- Clear separation between control plane and tenant data simplifies operations.
