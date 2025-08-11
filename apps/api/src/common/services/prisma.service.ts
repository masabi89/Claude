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
          url: configService.get('DATABASE_URL') || 'file:./dev.db',
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      // For development, continue without database
    }
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
   * For development, returns the same client
   */
  getTenantClient(tenantId: string): PrismaClient {
    if (!this.tenantClients.has(tenantId)) {
      // For development, use the same database
      const client = new PrismaClient({
        datasources: {
          db: {
            url: this.configService.get('DATABASE_URL') || 'file:./dev.db',
          },
        },
      });

      this.tenantClients.set(tenantId, client);
    }

    return this.tenantClients.get(tenantId)!;
  }

  /**
   * Create a new tenant database
   * For development, just return success
   */
  async createTenantDatabase(tenantId: string): Promise<void> {
    console.log(`📊 Creating tenant database for: ${tenantId}`);
    // For development, we'll skip actual database creation
    return Promise.resolve();
  }

  /**
   * Remove a tenant database (use with caution!)
   */
  async removeTenantDatabase(tenantId: string): Promise<void> {
    console.log(`🗑️ Removing tenant database for: ${tenantId}`);
    
    // Disconnect tenant client if exists
    if (this.tenantClients.has(tenantId)) {
      await this.tenantClients.get(tenantId)!.$disconnect();
      this.tenantClients.delete(tenantId);
    }
  }
}

