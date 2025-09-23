// Normalize phone number to international format for comparison
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, '');

  // If it starts with 0, replace with +62 (Indonesia)
  if (normalized.startsWith('0')) {
    normalized = '+62' + normalized.substring(1);
  }

  // If it doesn't start with +, assume it's missing country code
  if (!normalized.startsWith('+')) {
    // For Indonesian numbers, add +62
    normalized = '+62' + normalized;
  }

  return normalized;
}

// Check if two phone numbers are the same after normalization
export function arePhoneNumbersEqual(phone1: string, phone2: string): boolean {
  return normalizePhoneNumber(phone1) === normalizePhoneNumber(phone2);
}