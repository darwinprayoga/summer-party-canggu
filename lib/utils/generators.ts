import { prisma } from '@/lib/database';

export class IDGenerator {
  static async generateUserId(): Promise<string> {
    let userId: string;
    let exists = true;

    do {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      userId = `SP${randomNum}`;

      const existingUser = await prisma.user.findUnique({
        where: { userId },
      });

      exists = !!existingUser;
    } while (exists);

    return userId;
  }

  static async generateStaffId(): Promise<string> {
    const staffCount = await prisma.staff.count();
    return `STF${String(staffCount + 1).padStart(3, '0')}`;
  }

  static async generateAdminId(): Promise<string> {
    const adminCount = await prisma.admin.count();
    return `ADM${String(adminCount + 1).padStart(3, '0')}`;
  }

  static async generateExpenseId(): Promise<string> {
    const expenseCount = await prisma.expense.count();
    return `EXP${String(expenseCount + 1).padStart(3, '0')}`;
  }

  static generateReferralCode(instagram: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const cleanInstagram = instagram.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `${cleanInstagram}_${timestamp}`.toUpperCase();
  }
}

export function generateQRCodeData(userId: string): string {
  return JSON.stringify({
    userId,
    type: 'USER_ID',
    timestamp: Date.now(),
  });
}