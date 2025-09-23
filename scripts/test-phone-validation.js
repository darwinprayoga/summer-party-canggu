/**
 * Test script for international phone validation
 * Run with: node scripts/test-phone-validation.js
 */

const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');

// Test cases
const testCases = [
  // Indonesian
  { phone: '0812-3456-7890', country: 'ID', expected: true },
  { phone: '+62812-3456-7890', country: 'ID', expected: true },
  { phone: '62812-3456-7890', country: 'ID', expected: true },

  // US
  { phone: '+1-555-123-4567', country: 'US', expected: true },
  { phone: '(555) 123-4567', country: 'US', expected: true },
  { phone: '555-123-4567', country: 'US', expected: true },

  // UK
  { phone: '+44-20-7946-0958', country: 'GB', expected: true },
  { phone: '020 7946 0958', country: 'GB', expected: true },

  // Singapore
  { phone: '+65-6123-4567', country: 'SG', expected: true },
  { phone: '6123 4567', country: 'SG', expected: true },

  // Invalid
  { phone: '123', country: null, expected: false },
  { phone: 'abc-def-ghij', country: null, expected: false },
  { phone: '', country: null, expected: false },
];

function testValidation() {
  console.log('🌍 International Phone Validation Test\n');

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ phone, country, expected }, index) => {
    try {
      const isValid = isValidPhoneNumber(phone, country);
      const phoneNumber = parsePhoneNumber(phone, country);

      const result = isValid === expected ? '✅ PASS' : '❌ FAIL';

      console.log(`Test ${index + 1}: ${result}`);
      console.log(`  Phone: ${phone}`);
      console.log(`  Country: ${country || 'auto-detect'}`);
      console.log(`  Expected: ${expected ? 'valid' : 'invalid'}`);
      console.log(`  Actual: ${isValid ? 'valid' : 'invalid'}`);

      if (phoneNumber && phoneNumber.isValid()) {
        console.log(`  Detected Country: ${phoneNumber.country}`);
        console.log(`  E.164 Format: ${phoneNumber.format('E.164')}`);
        console.log(`  National Format: ${phoneNumber.formatNational()}`);
      }

      console.log('');

      if (isValid === expected) passed++;
      else failed++;

    } catch (error) {
      console.log(`Test ${index + 1}: ❌ ERROR`);
      console.log(`  Phone: ${phone}`);
      console.log(`  Error: ${error.message}`);
      console.log('');
      failed++;
    }
  });

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  console.log(`Success rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
}

// Run the test
testValidation();