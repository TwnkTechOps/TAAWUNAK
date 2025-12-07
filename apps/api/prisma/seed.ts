import { PrismaClient } from '@prisma/client';
// @ts-ignore - bcryptjs has its own types
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin user
  const adminEmail = 'admin@tawawunak.sa';
  const adminPassword = 'Admin123!';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
  } else {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        fullName: 'System Administrator',
        role: 'ADMIN',
        // emailVerifiedAt: new Date(), // Pre-verify for convenience
      },
    });
    console.log('✅ Created admin user:', admin.email);
  }

  // Create a test researcher user
  const researcherEmail = 'researcher@example.com';
  const researcherPassword = 'Researcher123!';
  const researcherPasswordHash = await bcrypt.hash(researcherPassword, 10);

  const existingResearcher = await prisma.user.findUnique({
    where: { email: researcherEmail },
  });

  if (existingResearcher) {
    console.log('✅ Researcher user already exists');
  } else {
    const researcher = await prisma.user.create({
      data: {
        email: researcherEmail,
        passwordHash: researcherPasswordHash,
        fullName: 'Test Researcher',
        role: 'RESEARCHER',
        // emailVerifiedAt: new Date(),
      },
    });
    console.log('✅ Created researcher user:', researcher.email);
  }

  console.log('\n📋 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  Email:    admin@tawawunak.sa');
  console.log('  Password: Admin123!');
  console.log('\nResearcher:');
  console.log('  Email:    researcher@example.com');
  console.log('  Password: Researcher123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

