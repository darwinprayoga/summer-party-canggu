/**
 * International Phone Number Test Examples
 *
 * This file demonstrates the comprehensive international phone number support
 * using libphonenumber-js library with Twilio SMS service.
 *
 * Run this in your browser console or Node.js to test validation.
 */

import { SMSService } from './sms';

export const PHONE_TEST_EXAMPLES = {
  // Indonesian Numbers (Bali event focus)
  indonesian: [
    '0812-3456-7890',     // Local format
    '+62812-3456-7890',   // International format
    '62812-3456-7890',    // Without + sign
    '812-3456-7890',      // Without country code
    '08123456789',        // No dashes
    '+62 812 3456 7890',  // With spaces
  ],

  // United States
  unitedStates: [
    '+1-555-123-4567',
    '(555) 123-4567',
    '555-123-4567',
    '5551234567',
    '+1 555 123 4567',
  ],

  // United Kingdom
  unitedKingdom: [
    '+44-20-7946-0958',
    '020 7946 0958',
    '+44 20 7946 0958',
    '02079460958',
  ],

  // Australia
  australia: [
    '+61-2-1234-5678',
    '02 1234 5678',
    '+61 2 1234 5678',
    '0212345678',
  ],

  // Singapore
  singapore: [
    '+65-6123-4567',
    '6123 4567',
    '+65 6123 4567',
    '61234567',
  ],

  // Malaysia
  malaysia: [
    '+60-3-1234-5678',
    '03-1234 5678',
    '+60 3 1234 5678',
    '0312345678',
  ],

  // Thailand
  thailand: [
    '+66-2-123-4567',
    '02-123-4567',
    '+66 2 123 4567',
    '021234567',
  ],

  // Vietnam
  vietnam: [
    '+84-24-3456-7890',
    '024 3456 7890',
    '+84 24 3456 7890',
    '02434567890',
  ],

  // Philippines
  philippines: [
    '+63-2-8123-4567',
    '02-8123-4567',
    '+63 2 8123 4567',
    '0281234567',
  ],

  // Japan
  japan: [
    '+81-3-1234-5678',
    '03-1234-5678',
    '+81 3 1234 5678',
    '0312345678',
  ],

  // Germany
  germany: [
    '+49-30-12345678',
    '030 12345678',
    '+49 30 12345678',
    '03012345678',
  ],

  // Invalid examples
  invalid: [
    '123',           // Too short
    '123456789012345678', // Too long
    'abc-def-ghij',  // Letters
    '+999-123-4567', // Invalid country code
    '',              // Empty
    '+',             // Just plus
  ],
};

/**
 * Test function to validate all phone number examples
 */
export function testPhoneValidation() {
  console.log('🌍 International Phone Number Validation Test\n');

  Object.entries(PHONE_TEST_EXAMPLES).forEach(([country, phones]) => {
    console.log(`\n📱 Testing ${country.charAt(0).toUpperCase() + country.slice(1)} Numbers:`);

    phones.forEach(phone => {
      const isValid = SMSService.validatePhoneNumber(phone);
      const countryInfo = SMSService.getCountryInfo(phone);
      const formatted = SMSService.getFormattedPhoneDisplay(phone);

      console.log(`  ${isValid ? '✅' : '❌'} ${phone}`);
      console.log(`     → Country: ${countryInfo.countryName} (${countryInfo.country})`);
      console.log(`     → Formatted: ${formatted}`);
    });
  });

  return 'Test completed! Check console output above.';
}

/**
 * Test SMS sending with different formats
 */
export async function testSMSSending() {
  console.log('\n📤 SMS Format Test (Development Mode)\n');

  const testNumbers = [
    '+62812-3456-7890',  // Indonesia
    '+1-555-123-4567',   // US
    '+44-20-7946-0958',  // UK
    '+65-6123-4567',     // Singapore
  ];

  for (const phone of testNumbers) {
    try {
      const countryInfo = SMSService.getCountryInfo(phone);
      console.log(`\n🚀 Sending test OTP to ${phone}`);
      console.log(`   Country: ${countryInfo.countryName}`);

      // Note: This would actually send SMS in production
      // In development, it logs to console or uses dev phone number
      const result = await SMSService.sendOTP(phone, '123456');
      console.log(`   Result: ${result ? '✅ Success' : '❌ Failed'}`);

    } catch (error) {
      console.log(`   Result: ❌ Error - ${error}`);
    }
  }

  return 'SMS test completed!';
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testPhoneValidation = testPhoneValidation;
  (window as any).testSMSSending = testSMSSending;
  (window as any).PHONE_TEST_EXAMPLES = PHONE_TEST_EXAMPLES;

  console.log('📞 Phone validation test functions loaded!');
  console.log('Run testPhoneValidation() to test all formats');
  console.log('Run testSMSSending() to test SMS delivery');
}