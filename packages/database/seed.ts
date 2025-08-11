import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create super admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@promanage.sa' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'admin@promanage.sa',
      name: 'Super Admin',
      password: hashedPassword,
    },
  });

  console.log('✅ Created super admin user:', superAdmin.email);

  // Create demo tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Demo Organization',
      slug: 'demo',
      plan: 'PRO',
    },
  });

  console.log('✅ Created demo tenant:', demoTenant.name);

  // Create demo users
  const demoUsers = [
    {
      email: 'john.doe@demo.com',
      name: 'John Doe',
      role: 'ORG_ADMIN' as const,
    },
    {
      email: 'jane.smith@demo.com',
      name: 'Jane Smith',
      role: 'PROJECT_MANAGER' as const,
    },
    {
      email: 'bob.wilson@demo.com',
      name: 'Bob Wilson',
      role: 'TEAM_MEMBER' as const,
    },
  ];

  for (const userData of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        id: uuidv4(),
        email: userData.email,
        name: userData.name,
        password: await bcrypt.hash('demo123', 12),
      },
    });

    await prisma.orgUser.upsert({
      where: {
        tenantId_userId: {
          tenantId: demoTenant.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        tenantId: demoTenant.id,
        userId: user.id,
        role: userData.role,
      },
    });

    console.log(`✅ Created demo user: ${user.email} with role ${userData.role}`);
  }

  // Create subscription for demo tenant
  await prisma.subscription.upsert({
    where: { tenantId: demoTenant.id },
    update: {},
    create: {
      id: uuidv4(),
      tenantId: demoTenant.id,
      plan: 'PRO',
      status: 'ACTIVE',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  console.log('✅ Created subscription for demo tenant');

  // Add super admin to demo tenant
  await prisma.orgUser.upsert({
    where: {
      tenantId_userId: {
        tenantId: demoTenant.id,
        userId: superAdmin.id,
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: superAdmin.id,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Added super admin to demo tenant');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

