# RBAC Matrix — ProManage SaaS

Legend: C=Create, R=Read, U=Update, D=Delete, (M)=Manage/Configure

| Module / Action        | Super Admin | Org Admin | Project Manager | Team Member | Client/Guest |
|------------------------|-------------|----------:|----------------:|------------:|-------------:|
| **Tenants (Control)**  | C/R/U/D/M   | —         | —               | —           | —            |
| **Billing (Org)**      | C/R/U/D/M   | C/R/U/D/M | —               | —           | —            |
| **Users (Org)**        | C/R/U/D/M   | C/R/U/D/M | R               | —           | —            |
| **Projects**           | C/R/U/D/M   | C/R/U/D/M | C/R/U/D/M       | R/U (own)   | R (if shared)|
| **Tasks**              | C/R/U/D/M   | C/R/U/D/M | C/R/U/D/M       | C/R/U (own) | R (shared)   |
| **Subtasks**           | C/R/U/D     | C/R/U/D   | C/R/U/D         | C/R/U (own) | R (shared)   |
| **Comments**           | C/R/U/D     | C/R/U/D   | C/R/U/D         | C/R/U/D     | C/R          |
| **Files**              | C/R/U/D     | C/R/U/D   | C/R/U/D         | C/R/U/D     | R            |
| **Custom Fields**      | C/R/U/D     | C/R/U/D   | C/R/U/D         | R           | —            |
| **Views (Saved)**      | C/R/U/D     | C/R/U/D   | C/R/U/D         | C/R/U/D     | R            |
| **Reports/Analytics**  | R           | R         | R               | R           | —            |
| **Integrations**       | C/R/U/D/M   | C/R/U/D/M | R               | —           | —            |
| **AI Features**        | C/R/U/D     | C/R/U/D   | C/R/U/D         | R           | —            |
| **Audit Logs**         | R           | R         | R (project)     | —           | —            |
| **Org Settings**       | R           | C/R/U/M   | —               | —           | —            |

Notes:
- “own” = creator or assignee.
- Sharing rules allow PM/Admin to grant read/comment to Client/Guest per project.
- All destructive actions require confirmation & permission checks.
