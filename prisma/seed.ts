import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default event configuration
  const eventConfig = await prisma.eventConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Summer Party Canggu',
      date: '2024-09-27',
      time: '14:00-21:00',
      venue: 'Canggu, Bali, Indonesia',
      description: 'The ultimate summer party experience in Canggu with live music, food, and drinks.',
      maxCapacity: 200,
      bannerImage: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%5BSPC%5D%201st%20Poster%20-%20IG-n3sOlDEwhDML4dnjhrfIFVyz6zMEfj.png',
      eventHighlights: [
        'Live DJ performances',
        'Beachfront location',
        'Premium food & drinks',
        'Referral rewards system',
        'Exclusive merchandise'
      ],
      mainPageAnnouncement: '🎉 Summer Party Canggu is happening! Join us for the ultimate beach party experience with live music, food, and drinks. Limited spots available!',
      customerPageAnnouncement: 'Welcome to Summer Party Canggu! Get ready for an unforgettable experience. Don\'t forget to bring your friends and earn rewards through our referral system!',
      instagramHandle: '@summerpartycanggu',
      whatsappNumber: '+62 812-3456-7890',
      referralCommissionRate: 0.05,
    },
  });

  // Create super admin from environment variables
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@summerpartycanggu.com';
  const superAdminPhone = process.env.SUPER_ADMIN_PHONE || '+6282243019049';
  const superAdminInstagram = process.env.SUPER_ADMIN_INSTAGRAM || 'spc_admin';
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  console.log('👑 Creating super admin with:');
  console.log(`  Name: ${superAdminName}`);
  console.log(`  Email: ${superAdminEmail}`);
  console.log(`  Phone: ${superAdminPhone}`);
  console.log(`  Instagram: ${superAdminInstagram}`);

  const superAdmin = await prisma.admin.upsert({
    where: { adminId: 'ADMIN001' },
    update: {
      // Update existing super admin with env values
      fullName: superAdminName,
      email: superAdminEmail,
      phone: superAdminPhone,
      whatsapp: superAdminPhone,
      instagram: superAdminInstagram,
      isActive: true,
      isSuperAdmin: true,
    },
    create: {
      adminId: 'ADMIN001',
      fullName: superAdminName,
      email: superAdminEmail,
      phone: superAdminPhone,
      whatsapp: superAdminPhone,
      instagram: superAdminInstagram,
      loginMethod: superAdminEmail ? 'GOOGLE' : 'PHONE', // Use Google if email provided, otherwise phone
      registrationStatus: 'APPROVED',
      isActive: true,
      isSuperAdmin: true,
      approvedAt: new Date(),
      approvedBy: 'system',
    },
  });

  // Create sample staff
  const sampleStaff = await prisma.staff.upsert({
    where: { staffId: 'STF001' },
    update: {},
    create: {
      staffId: 'STF001',
      fullName: 'Made Wirawan',
      email: 'made@summerpartycanggu.com',
      phone: '+62 812-2345-6789',
      whatsapp: '+62 812-2345-6789',
      instagram: 'made_spc_staff',
      loginMethod: 'PHONE',
      registrationStatus: 'APPROVED',
      isActive: true,
      approvedAt: new Date(),
      approvedBy: superAdmin.id,
    },
  });

  // Create sample users sequentially to handle referral relationships
  const firstUser = await prisma.user.upsert({
    where: { userId: 'SP123456' },
    update: {},
    create: {
      userId: 'SP123456',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+62 812-3456-7890',
      whatsapp: '+62 812-3456-7890',
      instagram: 'johndoe_bali',
      loginMethod: 'GOOGLE',
      isRSVP: true,
      rsvpAt: new Date(),
      referralCode: 'REF123456',
    },
  });

  const secondUser = await prisma.user.upsert({
    where: { userId: 'SP789012' },
    update: {},
    create: {
      userId: 'SP789012',
      fullName: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      phone: '+62 812-4567-8901',
      whatsapp: '+62 812-4567-8901',
      instagram: 'sarah_surfs',
      loginMethod: 'PHONE',
      isRSVP: true,
      rsvpAt: new Date(),
      referralCode: 'REF789012',
      referredBy: firstUser.id, // Use the actual database ID, not userId
    },
  });

  const sampleUsers = [firstUser, secondUser];

  // Create sample expenses
  const sampleExpenses = await Promise.all([
    prisma.expense.create({
      data: {
        expenseId: 'EXP001',
        customerId: 'SP123456',
        customerName: 'John Doe',
        customerInstagram: 'johndoe_bali',
        amount: 250000, // IDR 250,000
        description: 'Food & Beverages',
        category: 'Food & Beverages',
        staffId: sampleStaff.id,
        userId: sampleUsers[0]?.id,
        timestamp: new Date('2024-01-15T14:30:00'),
      },
    }),
    prisma.expense.create({
      data: {
        expenseId: 'EXP002',
        customerId: 'SP789012',
        customerName: 'Sarah Wilson',
        customerInstagram: 'sarah_surfs',
        amount: 150000, // IDR 150,000
        description: 'Merchandise',
        category: 'Merchandise',
        staffId: sampleStaff.id,
        userId: sampleUsers[1]?.id,
        timestamp: new Date('2024-01-15T15:45:00'),
      },
    }),
  ]);

  console.log('✅ Database seeded successfully!');
  console.log({
    eventConfig: eventConfig.name,
    superAdmin: superAdmin.fullName,
    staff: sampleStaff.fullName,
    users: sampleUsers.length,
    expenses: sampleExpenses.length,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });