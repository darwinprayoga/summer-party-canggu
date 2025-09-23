import twilio from 'twilio';
import { parsePhoneNumber, isValidPhoneNumber, formatPhoneNumber, CountryCode } from 'libphonenumber-js';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export class SMSService {
  private static validateConfig(): { isValid: boolean; error?: string } {
    if (!process.env.TWILIO_ACCOUNT_SID) {
      return { isValid: false, error: 'TWILIO_ACCOUNT_SID environment variable is required' };
    }
    if (!process.env.TWILIO_AUTH_TOKEN) {
      return { isValid: false, error: 'TWILIO_AUTH_TOKEN environment variable is required' };
    }
    if (!process.env.TWILIO_SMS_SID) {
      return { isValid: false, error: 'TWILIO_SMS_SID environment variable is required' };
    }

    return { isValid: true };
  }

  private static formatPhoneNumber(phone: string, defaultCountry: CountryCode = 'ID'): string {
    try {
      // Try to parse the phone number
      const phoneNumber = parsePhoneNumber(phone, defaultCountry);

      if (phoneNumber && phoneNumber.isValid()) {
        // Return in international format (E.164)
        return phoneNumber.format('E.164');
      }

      // Fallback: if parsing fails, try basic formatting for Indonesian numbers
      const cleaned = phone.replace(/\D/g, '');

      if (cleaned.startsWith('62')) {
        return `+${cleaned}`;
      }

      if (cleaned.startsWith('0') && defaultCountry === 'ID') {
        return `+62${cleaned.substring(1)}`;
      }

      // If no country code and looks like a valid length, assume default country
      if (cleaned.length >= 7 && cleaned.length <= 15) {
        if (defaultCountry === 'ID') {
          return `+62${cleaned}`;
        }
        return `+${cleaned}`;
      }

      return phone; // Return original if can't format
    } catch (error) {
      console.warn('Phone number formatting failed:', error);
      return phone;
    }
  }

  static async sendOTP(phone: string, code: string, country?: CountryCode): Promise<boolean> {
    try {
      const configValidation = this.validateConfig();

      if (!configValidation.isValid) {
        console.warn(`⚠️  Twilio configuration issue: ${configValidation.error}`);

        // In development, just log and continue
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔐 DEV MODE - OTP for ${phone}: ${code}`);
          console.log('📱 SMS not sent due to configuration issues, but OTP available for testing');
          return true; // Return success for testing
        }

        throw new Error(configValidation.error || 'Twilio configuration invalid');
      }

      // Use provided country or auto-detect, defaulting to Indonesia for Bali event
      const defaultCountry = country || this.detectCountryFromPhone(phone) || 'ID';
      const formattedPhone = this.formatPhoneNumber(phone, defaultCountry);

      // In development, use dev phone number if provided
      const targetPhone = process.env.NODE_ENV === 'development' && process.env.TWILIO_DEV_PHONE_NUMBER
        ? process.env.TWILIO_DEV_PHONE_NUMBER
        : formattedPhone;

      // Check if we should use Twilio Verify API (recommended for OTP)
      if (process.env.TWILIO_SMS_SID && process.env.TWILIO_SMS_SID.startsWith('VA')) {
        // Use Twilio Verify API - this is the recommended approach for OTP verification
        console.log('📱 Using Twilio Verify API for OTP verification');

        const verification = await twilioClient.verify.v2
          .services(process.env.TWILIO_SMS_SID)
          .verifications
          .create({
            to: targetPhone,
            channel: 'sms'
          });

        if (process.env.NODE_ENV === 'development') {
          console.log(`📱 Verify OTP sent to ${targetPhone}`);
          console.log(`📋 Verification SID: ${verification.sid}`);
          console.log(`📱 Status: ${verification.status}`);
          console.log('💡 Use the verifyOTPWithTwilio method to verify the code');
        }

        return verification.status === 'pending';
      }

      // Fallback to direct SMS for custom OTP (if using Messaging Service or phone number)
      const message = `Your Summer Party Canggu verification code is: ${code}\n\nThis code will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.\n\nIf you didn't request this code, please ignore this message.`;

      let result;

      if (process.env.TWILIO_SMS_SID && process.env.TWILIO_SMS_SID.startsWith('MG')) {
        // Use Messaging Service SID (starts with MG)
        result = await twilioClient.messages.create({
          body: message,
          messagingServiceSid: process.env.TWILIO_SMS_SID,
          to: targetPhone,
        });
      } else {
        // Use phone number directly
        const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_SMS_SID;
        if (!fromNumber) {
          throw new Error('For custom OTP, please provide either TWILIO_SMS_SID (Messaging Service) or TWILIO_PHONE_NUMBER');
        }

        result = await twilioClient.messages.create({
          body: message,
          from: fromNumber,
          to: targetPhone,
        });
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 SMS sent to ${targetPhone}: ${code}`);
        console.log(`📋 Twilio Message SID: ${result.sid}`);
      }

      return result.status === 'queued' || result.status === 'sent';

    } catch (error: any) {
      console.error('❌ Twilio SMS Error:', error);

      // In development, log the OTP anyway for testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 DEV MODE - OTP for ${phone}: ${code}`);
        console.log('📱 SMS service failed, but OTP available for testing');
        return true; // Return success in dev mode for testing
      }

      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  static async verifyOTPWithTwilio(phone: string, code: string, country?: CountryCode): Promise<boolean> {
    try {
      // Only use Twilio Verify API if we have a Verify Service SID
      if (!process.env.TWILIO_SMS_SID || !process.env.TWILIO_SMS_SID.startsWith('VA')) {
        throw new Error('Twilio Verify API requires a Verify Service SID (starts with VA)');
      }

      const defaultCountry = country || this.detectCountryFromPhone(phone) || 'ID';
      const formattedPhone = this.formatPhoneNumber(phone, defaultCountry);

      // In development, use dev phone number if provided
      const targetPhone = process.env.NODE_ENV === 'development' && process.env.TWILIO_DEV_PHONE_NUMBER
        ? process.env.TWILIO_DEV_PHONE_NUMBER
        : formattedPhone;

      const verificationCheck = await twilioClient.verify.v2
        .services(process.env.TWILIO_SMS_SID)
        .verificationChecks
        .create({
          to: targetPhone,
          code: code
        });

      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Verification check for ${targetPhone}: ${verificationCheck.status}`);
        console.log(`📋 Verification SID: ${verificationCheck.sid}`);
      }

      return verificationCheck.status === 'approved';

    } catch (error: any) {
      console.error('❌ Twilio Verify Error:', error);

      // In development, be more permissive for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 DEV MODE - Verification failed, but continuing for testing');
        return false; // Return false so it falls back to database verification
      }

      return false;
    }
  }


  static validatePhoneNumber(phone: string, country?: CountryCode): boolean {
    try {
      // Use auto-detection if no country provided
      const defaultCountry = country || this.detectCountryFromPhone(phone) || 'ID';

      // Use libphonenumber-js for comprehensive validation
      return isValidPhoneNumber(phone, defaultCountry);
    } catch (error) {
      // Fallback validation for edge cases
      const cleaned = phone.replace(/\D/g, '');
      return cleaned.length >= 7 && cleaned.length <= 15;
    }
  }

  static detectCountryFromPhone(phone: string): CountryCode | null {
    try {
      const phoneNumber = parsePhoneNumber(phone);
      return phoneNumber?.country || null;
    } catch (error) {
      // Auto-detect based on common patterns
      const cleaned = phone.replace(/\D/g, '');

      if (cleaned.startsWith('1')) return 'US';
      if (cleaned.startsWith('44')) return 'GB';
      if (cleaned.startsWith('61')) return 'AU';
      if (cleaned.startsWith('65')) return 'SG';
      if (cleaned.startsWith('60')) return 'MY';
      if (cleaned.startsWith('66')) return 'TH';
      if (cleaned.startsWith('84')) return 'VN';
      if (cleaned.startsWith('63')) return 'PH';
      if (cleaned.startsWith('62') || cleaned.startsWith('0')) return 'ID';

      return null;
    }
  }

  static getFormattedPhoneDisplay(phone: string, country?: CountryCode): string {
    try {
      const defaultCountry = country || this.detectCountryFromPhone(phone) || 'ID';
      const phoneNumber = parsePhoneNumber(phone, defaultCountry);

      if (phoneNumber && phoneNumber.isValid()) {
        // Return in national format for better readability
        return phoneNumber.formatNational();
      }

      // Fallback to original phone if parsing fails
      return phone;
    } catch (error) {
      return phone;
    }
  }

  static getCountryInfo(phone: string): { country: CountryCode | null; countryName: string } {
    try {
      const phoneNumber = parsePhoneNumber(phone);
      const country = phoneNumber?.country || null;

      const countryNames: Record<string, string> = {
        'ID': 'Indonesia',
        'US': 'United States',
        'GB': 'United Kingdom',
        'AU': 'Australia',
        'SG': 'Singapore',
        'MY': 'Malaysia',
        'TH': 'Thailand',
        'VN': 'Vietnam',
        'PH': 'Philippines',
        'JP': 'Japan',
        'KR': 'South Korea',
        'CN': 'China',
        'IN': 'India',
        'CA': 'Canada',
        'DE': 'Germany',
        'FR': 'France',
        'IT': 'Italy',
        'ES': 'Spain',
        'NL': 'Netherlands',
        'BE': 'Belgium',
        'CH': 'Switzerland',
        'AT': 'Austria',
        'SE': 'Sweden',
        'NO': 'Norway',
        'DK': 'Denmark',
        'FI': 'Finland',
        'NZ': 'New Zealand',
        'ZA': 'South Africa',
        'BR': 'Brazil',
        'MX': 'Mexico',
        'AR': 'Argentina',
        'CL': 'Chile',
        'CO': 'Colombia',
        'PE': 'Peru',
        'UY': 'Uruguay',
        'PY': 'Paraguay',
        'BO': 'Bolivia',
        'EC': 'Ecuador',
        'VE': 'Venezuela',
      };

      return {
        country,
        countryName: country ? countryNames[country] || country : 'Unknown'
      };
    } catch (error) {
      return { country: null, countryName: 'Unknown' };
    }
  }
}