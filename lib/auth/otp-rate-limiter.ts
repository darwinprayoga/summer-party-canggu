import { prisma } from '@/lib/database'

interface RateLimitResult {
  allowed: boolean
  remainingAttempts: number
  cooldownUntil?: Date
  nextResendAt?: Date
  message: string
}

export class OtpRateLimiter {
  private static readonly MAX_ATTEMPTS = 5
  private static readonly RESEND_INTERVAL_MS = 60 * 1000 // 1 minute
  private static readonly COOLDOWN_PERIOD_MS = 60 * 60 * 1000 // 1 hour

  static async checkRateLimit(phone: string, purpose: string = 'LOGIN'): Promise<RateLimitResult> {
    const now = new Date()

    // Find the most recent OTP record for this phone and purpose
    const latestOtp = await prisma.otpCode.findFirst({
      where: {
        phone,
        purpose,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!latestOtp) {
      // No previous OTP, allowed to send
      return {
        allowed: true,
        remainingAttempts: this.MAX_ATTEMPTS - 1,
        message: 'OTP can be sent'
      }
    }

    // Check if in cooldown period
    if (latestOtp.cooldownUntil && latestOtp.cooldownUntil > now) {
      const cooldownMinutes = Math.ceil((latestOtp.cooldownUntil.getTime() - now.getTime()) / (1000 * 60))
      return {
        allowed: false,
        remainingAttempts: 0,
        cooldownUntil: latestOtp.cooldownUntil,
        message: `Too many attempts. Try again in ${cooldownMinutes} minutes.`
      }
    }

    // Check if minimum resend interval has passed
    const timeSinceLastAttempt = now.getTime() - latestOtp.lastAttempt.getTime()
    if (timeSinceLastAttempt < this.RESEND_INTERVAL_MS) {
      const secondsUntilNext = Math.ceil((this.RESEND_INTERVAL_MS - timeSinceLastAttempt) / 1000)
      const nextResendAt = new Date(latestOtp.lastAttempt.getTime() + this.RESEND_INTERVAL_MS)

      return {
        allowed: false,
        remainingAttempts: Math.max(0, this.MAX_ATTEMPTS - latestOtp.attemptCount),
        nextResendAt,
        message: `Please wait ${secondsUntilNext} seconds before requesting another code.`
      }
    }

    // Check if max attempts reached
    if (latestOtp.attemptCount >= this.MAX_ATTEMPTS) {
      // Set cooldown period
      const cooldownUntil = new Date(now.getTime() + this.COOLDOWN_PERIOD_MS)

      await prisma.otpCode.update({
        where: { id: latestOtp.id },
        data: { cooldownUntil }
      })

      return {
        allowed: false,
        remainingAttempts: 0,
        cooldownUntil,
        message: 'Maximum attempts exceeded. Try again in 1 hour.'
      }
    }

    // Allowed to resend, increment attempt count
    return {
      allowed: true,
      remainingAttempts: this.MAX_ATTEMPTS - latestOtp.attemptCount - 1,
      message: 'OTP can be sent'
    }
  }

  static async recordAttempt(phone: string, purpose: string = 'LOGIN'): Promise<void> {
    const now = new Date()

    // Find the most recent OTP record for this phone and purpose
    const latestOtp = await prisma.otpCode.findFirst({
      where: {
        phone,
        purpose,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (latestOtp && !latestOtp.cooldownUntil) {
      // Update existing record
      await prisma.otpCode.update({
        where: { id: latestOtp.id },
        data: {
          attemptCount: latestOtp.attemptCount + 1,
          lastAttempt: now
        }
      })
    }
    // If no latest OTP or in cooldown, new OTP record will be created with attemptCount: 1
  }

  static async resetAttempts(phone: string, purpose: string = 'LOGIN'): Promise<void> {
    // Reset attempts after successful verification
    await prisma.otpCode.updateMany({
      where: {
        phone,
        purpose,
        isUsed: false
      },
      data: {
        attemptCount: 0,
        cooldownUntil: null
      }
    })
  }

  static async cleanupExpiredOtps(): Promise<void> {
    const now = new Date()

    // Delete expired OTPs and those past cooldown
    await prisma.otpCode.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          {
            cooldownUntil: { lt: now },
            isUsed: true
          }
        ]
      }
    })
  }
}