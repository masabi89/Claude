# ProManage SaaS

A multi-tenant project & task management platform with AI features and strong security compliance (NCA-ECC).

## Overview

ProManage SaaS is a comprehensive project management solution designed for modern organizations that require secure, scalable, and feature-rich project collaboration tools. The platform implements a database-per-tenant architecture ensuring complete data isolation while providing advanced AI-powered features for enhanced productivity.

## Key Features

- **Multi-tenant Architecture**: Complete data isolation with database-per-tenant design
- **AI-Powered Insights**: Intelligent task prioritization and project analytics
- **Real-time Collaboration**: WebSocket-based real-time updates and notifications
- **Enterprise Security**: NCA-ECC compliant with comprehensive audit logging
- **Role-Based Access Control**: Granular permissions for different organizational roles
- **SSO Integration**: Support for OAuth2/OIDC and SAML authentication
- **Mobile Responsive**: Optimized for desktop and mobile devices
- **Internationalization**: Support for Arabic and English languages

## Technology Stack

### Frontend
- React 18 with Next.js 14
- Material UI for component library
- Redux Toolkit for state management
- Socket.IO for real-time communication
- TypeScript for type safety

### Backend
- Node.js with NestJS framework
- Prisma ORM for database management
- PostgreSQL for data storage
- Redis for caching and job queues
- JWT authentication with refresh tokens

### Infrastructure
- Kubernetes for container orchestration
- Helm charts for deployment
- Terraform for infrastructure as code
- GitLab CI/CD for automated deployment
- NGINX Ingress with TLS 1.3

## Architecture

The platform follows a microservices-inspired architecture with clear separation between:

- **Control Plane**: Manages tenants, users, billing, and authentication
- **Tenant Databases**: Isolated data storage for each organization
- **API Gateway**: Centralized routing and authentication
- **Real-time Service**: WebSocket connections for live updates
- **AI Gateway**: Secure integration with external AI providers

## Security & Compliance

- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Authentication**: Multi-factor authentication for privileged users
- **Audit Logging**: Comprehensive, tamper-proof audit trails
- **Data Isolation**: Complete tenant separation at database level
- **Compliance**: Aligned with NCA-ECC, ISO 27001, and OWASP ASVS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Docker and Docker Compose (for development)

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/masabi89/Claude.git
   cd Claude
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start development services:
   ```bash
   docker-compose up -d postgres redis
   ```

5. Run database migrations:
   ```bash
   npm run db:migrate
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
promanage-saas/
├── apps/
│   ├── api/                 # NestJS backend API
│   ├── web/                 # Next.js frontend application
│   └── realtime/            # WebSocket service
├── packages/
│   ├── database/            # Prisma schema and migrations
│   ├── shared/              # Shared types and utilities
│   └── ui/                  # Shared UI components
├── docs/                    # Documentation
├── devops/                  # Deployment configurations
└── tools/                   # Development tools and scripts
```

## API Documentation

The REST API is documented using OpenAPI 3.1 specification. Access the interactive documentation at:
- Development: `http://localhost:3000/api/docs`
- Production: `https://api.promanage.sa/docs`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Email: support@promanage.sa
- Documentation: https://docs.promanage.sa
- Issues: https://github.com/masabi89/Claude/issues

## Roadmap

- [ ] Mobile applications (iOS/Android)
- [ ] Advanced AI features (natural language task creation)
- [ ] Integration marketplace
- [ ] Advanced analytics and reporting
- [ ] Workflow automation engine

---

Built with ❤️ by the ProManage team

