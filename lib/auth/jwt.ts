import jwt from 'jsonwebtoken';

export interface JWTPayload {
  id: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  email?: string;
  phone?: string;
  userId?: string; // For user tokens (custom user ID)
  staffId?: string; // For staff tokens (custom staff ID)
  adminId?: string; // For admin tokens (custom admin ID)
  type?: 'temp' | 'full'; // temp for phone verification, full for complete auth
  existingUserId?: string; // For existing user verification
  existingStaffId?: string; // For existing staff verification
  existingAdminId?: string; // For existing admin verification
}

export class JWTService {
  private static getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    return secret;
  }

  static sign(payload: JWTPayload, expiresIn?: string): string {
    return jwt.sign(payload, this.getSecret(), {
      expiresIn: expiresIn || process.env.JWT_EXPIRE || '7d',
    });
  }

  static verify(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.getSecret()) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw new Error('Token verification failed');
    }
  }

  static signTempToken(payload: Omit<JWTPayload, 'type'>): string {
    return this.sign({ ...payload, type: 'temp' }, '30m');
  }

  static signFullToken(payload: Omit<JWTPayload, 'type'>): string {
    return this.sign({ ...payload, type: 'full' });
  }

  static verifyTempToken(token: string): JWTPayload {
    const payload = this.verify(token);
    if (payload.type !== 'temp') {
      throw new Error('Invalid token type');
    }
    return payload;
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1] || null;
}