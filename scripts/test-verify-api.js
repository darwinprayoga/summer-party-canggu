/**
 * Test script for Twilio Verify API functionality
 * Run with: node scripts/test-verify-api.js
 */

const twilio = require('twilio');

// Your credentials for testing
const credentials = {
  TWILIO_ACCOUNT_SID: 'ACbd0de7dae892ee818c033161fc86b5d1',
  TWILIO_AUTH_TOKEN: '89c80fd098e75fdf63b365ad73a62ae3',
  TWILIO_SMS_SID: 'VAb14c56e36e9502ba6482e15e757faced',
  TWILIO_DEV_PHONE_NUMBER: '+6282243019049'
};

async function testTwilioVerifyAPI() {
  console.log('🧪 Testing Twilio Verify API for OTP...\n');

  try {
    // Initialize Twilio client
    const client = twilio(credentials.TWILIO_ACCOUNT_SID, credentials.TWILIO_AUTH_TOKEN);

    console.log('🔐 Testing Verify Service...');

    // Test 1: Send verification
    console.log('📱 Step 1: Sending verification to your phone...');

    const verification = await client.verify.v2
      .services(credentials.TWILIO_SMS_SID)
      .verifications
      .create({
        to: credentials.TWILIO_DEV_PHONE_NUMBER,
        channel: 'sms'
      });

    console.log(`✅ Verification sent!`);
    console.log(`📋 Verification SID: ${verification.sid}`);
    console.log(`📱 Status: ${verification.status}`);
    console.log(`📞 To: ${verification.to}`);
    console.log(`🕐 Date Created: ${verification.dateCreated}`);

    if (verification.status === 'pending') {
      console.log('\n🎉 SUCCESS! Your Twilio Verify setup is working perfectly!');
      console.log('📱 You should receive an SMS with a verification code shortly.');
      console.log('\n💡 To test verification:');
      console.log('1. Check your phone for the SMS');
      console.log('2. Note down the verification code');
      console.log('3. You can then test verification through your app\'s OTP verification endpoint');

      console.log('\n📝 Integration Notes:');
      console.log('- Your VA SID is perfect for OTP verification');
      console.log('- The SMS service will now use Twilio Verify API automatically');
      console.log('- Better delivery rates and security than custom SMS');
      console.log('- No need to purchase phone numbers for OTP verification');
    } else {
      console.log(`⚠️ Unexpected status: ${verification.status}`);
    }

  } catch (error) {
    console.log(`❌ Twilio Verify API test failed: ${error.message}`);
    console.log(`🔍 Error Code: ${error.code}`);

    if (error.code === 20003) {
      console.log('💡 This error means the phone number format is invalid');
      console.log(`📞 Phone number used: ${credentials.TWILIO_DEV_PHONE_NUMBER}`);
      console.log('💡 Make sure the phone number is in E.164 format (+country_code_number)');
    } else if (error.code === 60200) {
      console.log('💡 This means the phone number is not verified on your trial account');
      console.log('💡 Go to https://console.twilio.com/us1/develop/phone-numbers/manage/verified to add it');
    }
  }

  console.log('\n🏁 Test completed');
}

// Run the test
testTwilioVerifyAPI().catch(console.error);