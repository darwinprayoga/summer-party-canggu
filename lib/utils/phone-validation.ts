// Client-side phone validation utility (without Twilio dependency)
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

export function validateInternationalPhone(phone: string, country?: CountryCode): boolean {
  try {
    // Use auto-detection if no country provided
    const defaultCountry = country || detectCountryFromPhone(phone) || 'ID';

    // Use libphonenumber-js for comprehensive validation
    return isValidPhoneNumber(phone, defaultCountry);
  } catch (error) {
    // Fallback validation for edge cases
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 7 && cleaned.length <= 15;
  }
}

export function detectCountryFromPhone(phone: string): CountryCode | null {
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

export function formatPhoneNumber(phone: string, defaultCountry: CountryCode = 'ID'): string {
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