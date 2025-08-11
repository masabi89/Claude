import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private tenantClients: Map<string, PrismaClient> = new Map();

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    // Disconnect all tenant clients
    for (const client of this.tenantClients.values()) {
      await client.$disconnect();
    }
    await this.$disconnect();
  }

  /**
   * Get a Prisma client for a specific tenant
   */
  getTenantClient(tenantId: string): PrismaClient {
    if (!this.tenantClients.has(tenantId)) {
      const tenantDatabaseUrl = this.configService
        .get('TENANT_DATABASE_URL_TEMPLATE')
        ?.replace('{tenant_id}', tenantId);

      if (!tenantDatabaseUrl) {
        throw new Error('TENANT_DATABASE_URL_TEMPLATE not configured');
      }

      const client = new PrismaClient({
        datasources: {
          db: {
            url: tenantDatabaseUrl,
          },
        },
      });

      this.tenantClients.set(tenantId, client);
    }

    return this.tenantClients.get(tenantId)!;
  }

  /**
   * Create a new tenant database
   */
  async createTenantDatabase(tenantId: string): Promise<void> {
    const tenantDatabaseUrl = this.configService
      .get('TENANT_DATABASE_URL_TEMPLATE')
      ?.replace('{tenant_id}', tenantId);

    if (!tenantDatabaseUrl) {
      throw new Error('TENANT_DATABASE_URL_TEMPLATE not configured');
    }

    // Extract database name from URL
    const url = new URL(tenantDatabaseUrl);
    const dbName = url.pathname.slice(1); // Remove leading slash

    // Create database using control plane connection
    await this.$executeRawUnsafe(`CREATE DATABASE "${dbName}"`);

    // Get tenant client and run migrations
    const tenantClient = this.getTenantClient(tenantId);
    await tenantClient.$connect();

    // Note: In production, you would run Prisma migrations here
    // For now, we'll assume the schema is already applied
  }

  /**
   * Remove a tenant database (use with caution!)
   */
  async removeTenantDatabase(tenantId: string): Promise<void> {
    const tenantDatabaseUrl = this.configService
      .get('TENANT_DATABASE_URL_TEMPLATE')
      ?.replace('{tenant_id}', tenantId);

    if (!tenantDatabaseUrl) {
      throw new Error('TENANT_DATABASE_URL_TEMPLATE not configured');
    }

    // Disconnect tenant client if exists
    if (this.tenantClients.has(tenantId)) {
      await this.tenantClients.get(tenantId)!.$disconnect();
      this.tenantClients.delete(tenantId);
    }

    // Extract database name from URL
    const url = new URL(tenantDatabaseUrl);
    const dbName = url.pathname.slice(1); // Remove leading slash

    // Drop database using control plane connection
    await this.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${dbName}"`);
  }
}

