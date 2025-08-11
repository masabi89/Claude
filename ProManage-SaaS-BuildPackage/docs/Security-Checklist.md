# Security Checklist — NCA-ECC Mapping (ProManage SaaS)

Status: Planned / Implemented / Verified

| Control Area | Requirement | NCA-ECC Ref | Status | Notes |
|--------------|-------------|-------------|--------|-------|
| IAM          | MFA for all privileged users | AC-2 | Implemented | Enforce TOTP/WebAuthn; policy per org plan |
| IAM          | SSO (OIDC/SAML) | AC-3 | Planned | Azure AD/Google; per-tenant config |
| Access Ctrl  | RBAC, least privilege | AC-1 | Implemented | See RBAC-Matrix.md |
| Logging      | Centralized audit logs, tamper-proof | LM-2 | Implemented | Append-only store; WORM retention |
| Monitoring   | Security monitoring & alerting | MN-1 | Planned | SIEM integration via webhooks/OTel |
| Crypto       | TLS 1.3 in transit | CR-1 | Implemented | HSTS, modern ciphers |
| Crypto       | AES-256 at rest | CR-2 | Implemented | DB, object storage encryption |
| Data Privacy | Tenant isolation (DB-per-tenant) | DP-1 | Implemented | Control plane manages routing |
| Backup/DR    | Scheduled backups + restore tests | OP-3 | Planned | Per-tenant snapshots; quarterly DR test |
| Vulnerability| SAST/DAST in CI/CD | VT-1 | Implemented | GitLab SAST, OWASP ZAP stage |
| App Sec      | OWASP ASVS compliance | ASVS | Planned | Coverage in code review |
| Incident     | IR playbook & comms plan | IR-1 | Planned | On-call rota; tabletop quarterly |

> Note: NCA-ECC references are indicative; align with the latest official catalog in production governance.
