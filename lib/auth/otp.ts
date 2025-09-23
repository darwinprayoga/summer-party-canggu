import { prisma } from '@/lib/database';
import { SMSService } from '@/lib/utils/sms';

export class OTPService {
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOTP(phone: string, purpose: string = 'LOGIN'): Promise<string> {
    // Validate phone number format
    if (!SMSService.validatePhoneNumber(phone)) {
      throw new Error('Invalid phone number format');
    }

    // Check if we're using Twilio Verify API (VA SID) for OTP verification
    const isUsingTwilioVerify = process.env.TWILIO_SMS_SID && process.env.TWILIO_SMS_SID.startsWith('VA');

    let code: string;

    if (isUsingTwilioVerify) {
      // Use Twilio Verify API - Twilio generates and manages the OTP
      console.log('📱 Using Twilio Verify API for OTP generation and delivery');

      try {
        // Twilio Verify API handles OTP generation, storage, and SMS delivery
        const success = await SMSService.sendOTP(phone, ''); // Empty code - Twilio generates it
        if (!success) {
          throw new Error('Twilio Verify API returned failure status');
        }

        // For Twilio Verify API, we use a placeholder code in our database
        // The actual verification happens through Twilio's service
        code = 'TWILIO_VERIFY';

        console.log('✅ OTP sent via Twilio Verify API - no database storage needed');

      } catch (error: any) {
        console.error('Failed to send OTP via Twilio Verify API:', error);

        // In development, just log for testing
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔐 DEV MODE - Twilio Verify failed, generating fallback OTP`);
          code = this.generateOTP();
          console.log(`🔐 DEV MODE - Fallback OTP for ${phone}: ${code}`);
        } else {
          throw new Error('Failed to send OTP via Twilio Verify');
        }
      }
    } else {
      // Generate our own OTP for custom SMS or database-only verification
      code = this.generateOTP();

      // Send OTP via custom SMS
      try {
        const success = await SMSService.sendOTP(phone, code);
        if (!success) {
          throw new Error('SMS service returned failure status');
        }
      } catch (error: any) {
        console.error('Failed to send OTP via SMS:', error);

        // In development, just log the OTP for testing
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔐 DEV MODE - OTP for ${phone}: ${code}`);
          console.log('📱 SMS service failed, but OTP saved to database for testing');
          // Don't throw error in dev mode to allow testing
        } else {
          throw new Error('Failed to send OTP');
        }
      }
    }

    // Save OTP to database (even for Twilio Verify as a backup/audit trail)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + Number(process.env.OTP_EXPIRE_MINUTES) || 10);

    await prisma.otpCode.create({
      data: {
        code,
        phone,
        purpose,
        expiresAt,
      },
    });

    return code;
  }

  static async verifyOTP(phone: string, code: string, purpose: string = 'LOGIN'): Promise<boolean> {
    // Check if we're using Twilio Verify API
    const isUsingTwilioVerify = process.env.TWILIO_SMS_SID && process.env.TWILIO_SMS_SID.startsWith('VA');

    if (isUsingTwilioVerify) {
      // Use Twilio Verify API for verification
      try {
        const twilioVerified = await SMSService.verifyOTPWithTwilio(phone, code);

        // Mark any related database record as used (for audit trail)
        await prisma.otpCode.updateMany({
          where: {
            phone,
            purpose,
            isUsed: false,
            expiresAt: { gt: new Date() },
          },
          data: {
            isUsed: true,
            usedAt: new Date(),
          },
        });

        if (twilioVerified) {
          console.log('✅ OTP verified via Twilio Verify API');
          return true;
        } else {
          console.log('❌ OTP verification failed via Twilio Verify API');
          return false;
        }
      } catch (error: any) {
        console.error('❌ Twilio Verify API error:', error);
        return false;
      }
    }

    // Database verification (used for custom OTP when not using Twilio Verify)
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone,
        code,
        purpose,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return false;
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    console.log('✅ OTP verified via database');
    return true;
  }

  static async cleanupExpiredOTPs(): Promise<void> {
    await prisma.otpCode.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isUsed: true },
        ],
      },
    });
  }
}