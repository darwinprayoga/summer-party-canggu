import { z } from 'zod';
import { validateInternationalPhone } from '@/lib/utils/phone-validation';

// Auth schemas
export const phoneLoginSchema = z.object({
  phone: z.string()
    .min(1, 'Phone number is required')
    .refine(validateInternationalPhone, {
      message: 'Please enter a valid phone number (e.g., +1-555-123-4567, +62812-3456-7890, 0812-3456-7890)',
    }),
});

export const verifyOtpSchema = z.object({
  phone: z.string()
    .min(1, 'Phone number is required')
    .refine(validateInternationalPhone, {
      message: 'Invalid phone number format',
    }),
  code: z.string()
    .length(6, 'OTP code must be 6 digits')
    .regex(/^\d{6}$/, 'OTP code must contain only numbers'),
});

export const googleLoginSchema = z.object({
  token: z.string().min(1, 'Google token is required'),
});

// User registration schema
export const userRegistrationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional().refine((phone) => {
    if (!phone) return true; // Optional field
    return validateInternationalPhone(phone);
  }, { message: 'Invalid phone number format' }),
  whatsapp: z.string()
    .min(1, 'WhatsApp number is required')
    .refine(validateInternationalPhone, {
      message: 'Please enter a valid WhatsApp number',
    }),
  instagram: z.string()
    .min(1, 'Instagram username is required')
    .max(50)
    .regex(/^[a-zA-Z0-9._]+$/, 'Instagram username can only contain letters, numbers, dots, and underscores'),
  loginMethod: z.enum(['PHONE', 'GOOGLE', 'INSTAGRAM']),
  referralCode: z.string().optional(),
});

// Staff registration schema
export const staffRegistrationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional().refine((phone) => {
    if (!phone) return true; // Optional field
    return validateInternationalPhone(phone);
  }, { message: 'Invalid phone number format' }),
  whatsapp: z.string()
    .min(1, 'WhatsApp number is required')
    .refine(validateInternationalPhone, {
      message: 'Please enter a valid WhatsApp number',
    }),
  instagram: z.string()
    .min(1, 'Instagram username is required')
    .max(50)
    .regex(/^[a-zA-Z0-9._]+$/, 'Instagram username can only contain letters, numbers, dots, and underscores'),
  loginMethod: z.enum(['PHONE', 'GOOGLE', 'INSTAGRAM']),
});

// Admin registration schema
export const adminRegistrationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional().refine((phone) => {
    if (!phone) return true; // Optional field
    return validateInternationalPhone(phone);
  }, { message: 'Invalid phone number format' }),
  whatsapp: z.string()
    .min(1, 'WhatsApp number is required')
    .refine(validateInternationalPhone, {
      message: 'Please enter a valid WhatsApp number',
    }),
  instagram: z.string()
    .min(1, 'Instagram username is required')
    .max(50)
    .regex(/^[a-zA-Z0-9._]+$/, 'Instagram username can only contain letters, numbers, dots, and underscores'),
  loginMethod: z.enum(['PHONE', 'GOOGLE', 'INSTAGRAM']),
});

// Expense creation schema
export const createExpenseSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerInstagram: z.string().min(1, 'Customer Instagram is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  description: z.string().max(200).optional(), // Description is now optional
  category: z.string().optional(),
  photoUrl: z.string().min(1, 'Photo is required'), // Photo is now required
});

// Expense update schema
export const updateExpenseSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0').optional(),
  description: z.string().min(1, 'Description is required').max(200).optional(),
  category: z.string().optional(),
});

// Event configuration update schema
export const updateEventConfigSchema = z.object({
  name: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  time: z.string().min(1).optional(),
  venue: z.string().min(1).optional(),
  description: z.string().optional(),
  maxCapacity: z.number().min(1).optional(),
  bannerImage: z.string().url().optional(),
  eventHighlights: z.array(z.string()).optional(),
  mainPageAnnouncement: z.string().optional(),
  customerPageAnnouncement: z.string().optional(),
  instagramHandle: z.string().optional(),
  whatsappNumber: z.string().optional(),
  allowRSVP: z.boolean().optional(),
  allowReferrals: z.boolean().optional(),
  referralCommissionRate: z.number().min(0).max(1).optional(),
});

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    role: 'USER' | 'STAFF' | 'ADMIN';
    fullName: string;
    email?: string;
    phone?: string;
    instagram: string;
  };
}

export interface UserStats {
  totalExpenses: number;
  totalEarnings: number;
  referralCount: number;
  rank: number;
}

export interface LeaderboardEntry {
  userId: string;
  instagram: string;
  fullName: string;
  totalExpenses: number;
  rank: number;
}

export interface ReferralStats {
  totalEarnings: number;
  totalReferrals: number;
  referralDetails: Array<{
    userId: string;
    instagram: string;
    fullName: string;
    totalExpenses: number;
    earnings: number;
  }>;
}

// Query parameters
export const paginationSchema = z.object({
  page: z.string().transform(Number).refine(n => n > 0, 'Page must be positive').optional().default('1'),
  limit: z.string().transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional().default('10'),
});

export const expenseQuerySchema = z.object({
  ...paginationSchema.shape,
  search: z.string().optional(),
  category: z.string().optional(),
  staffId: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const userQuerySchema = z.object({
  ...paginationSchema.shape,
  search: z.string().optional(),
  role: z.enum(['USER', 'STAFF', 'ADMIN']).optional(),
  isActive: z.string().transform(Boolean).optional(),
  registrationStatus: z.enum(['PENDING', 'APPROVED', 'DENIED']).optional(),
});

// Utility types
export type CreateExpenseData = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseData = z.infer<typeof updateExpenseSchema>;
export type UserRegistrationData = z.infer<typeof userRegistrationSchema>;
export type StaffRegistrationData = z.infer<typeof staffRegistrationSchema>;
export type AdminRegistrationData = z.infer<typeof adminRegistrationSchema>;
export type UpdateEventConfigData = z.infer<typeof updateEventConfigSchema>;