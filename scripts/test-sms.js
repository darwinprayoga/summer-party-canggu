/**
 * Test script to verify Twilio SMS configuration
 * Run with: node scripts/test-sms.js
 *
 * Make sure to set your environment variables first:
 * TWILIO_ACCOUNT_SID=ACbd0de7dae892ee818c033161fc86b5d1
 * TWILIO_AUTH_TOKEN=89c80fd098e75fdf63b365ad73a62ae3
 * TWILIO_SMS_SID=VAb14c56e36e9502ba6482e15e757faced
 * TWILIO_DEV_PHONE_NUMBER=+6282243019049
 */

const twilio = require('twilio');

async function testTwilioConfig() {
  console.log('🧪 Testing Twilio SMS Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing'}`);
  console.log(`TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`TWILIO_SMS_SID: ${process.env.TWILIO_SMS_SID ? '✅ Set' : '❌ Missing'}`);
  console.log(`TWILIO_DEV_PHONE_NUMBER: ${process.env.TWILIO_DEV_PHONE_NUMBER ? '✅ Set' : '❌ Missing'}\n`);

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log('❌ Missing required Twilio credentials');
    return;
  }

  try {
    // Initialize Twilio client
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // Test 1: Verify account credentials
    console.log('🔐 Testing Account Credentials...');
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log(`✅ Account verified: ${account.friendlyName} (${account.status})\n`);

    // Test 2: Check SID type and configuration
    console.log('🔍 Analyzing SMS SID Configuration...');
    const smsSid = process.env.TWILIO_SMS_SID;

    if (smsSid) {
      if (smsSid.startsWith('MG')) {
        console.log('📱 SMS SID Type: Messaging Service (MG)');
        try {
          const messagingService = await client.messaging.services(smsSid).fetch();
          console.log(`✅ Messaging Service found: ${messagingService.friendlyName}`);
        } catch (error) {
          console.log(`❌ Messaging Service error: ${error.message}`);
        }
      } else if (smsSid.startsWith('VA')) {
        console.log('🔐 SMS SID Type: Verify Service (VA)');
        console.log('⚠️  Note: Verify Services are for verification flows, not direct messaging');
        console.log('💡 Recommendation: Use TWILIO_PHONE_NUMBER for direct SMS sending');
      } else if (smsSid.startsWith('+')) {
        console.log('📞 SMS SID Type: Phone Number');
        console.log(`✅ Using phone number: ${smsSid}`);
      } else {
        console.log('❓ SMS SID Type: Unknown format');
      }
    }

    console.log('');

    // Test 3: List available phone numbers
    console.log('📞 Available Phone Numbers:');
    try {
      const phoneNumbers = await client.incomingPhoneNumbers.list({ limit: 5 });
      if (phoneNumbers.length > 0) {
        phoneNumbers.forEach(number => {
          console.log(`  ✅ ${number.phoneNumber} (${number.friendlyName || 'No name'})`);
        });
      } else {
        console.log('  ⚠️  No phone numbers found');
      }
    } catch (error) {
      console.log(`  ❌ Error fetching phone numbers: ${error.message}`);
    }

    console.log('');

    // Test 4: Test SMS sending (to dev number only)
    if (process.env.TWILIO_DEV_PHONE_NUMBER) {
      console.log('📱 Testing SMS Sending (Dev Mode)...');
      const testMessage = `🧪 Test SMS from Summer Party Canggu\nTimestamp: ${new Date().toISOString()}\nThis is a test message.`;

      try {
        let result;

        if (smsSid && smsSid.startsWith('MG')) {
          // Use Messaging Service
          result = await client.messages.create({
            body: testMessage,
            messagingServiceSid: smsSid,
            to: process.env.TWILIO_DEV_PHONE_NUMBER,
          });
        } else if (process.env.TWILIO_PHONE_NUMBER) {
          // Use phone number
          result = await client.messages.create({
            body: testMessage,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.TWILIO_DEV_PHONE_NUMBER,
          });
        } else if (smsSid && smsSid.startsWith('+')) {
          // Use SMS SID as phone number
          result = await client.messages.create({
            body: testMessage,
            from: smsSid,
            to: process.env.TWILIO_DEV_PHONE_NUMBER,
          });
        } else {
          console.log('❌ No valid SMS sending configuration found');
          console.log('💡 Please set either:');
          console.log('   - TWILIO_SMS_SID (Messaging Service MG...)');
          console.log('   - TWILIO_PHONE_NUMBER (Your Twilio phone number)');
          return;
        }

        console.log(`✅ SMS sent successfully!`);
        console.log(`📋 Message SID: ${result.sid}`);
        console.log(`📱 Status: ${result.status}`);
        console.log(`📞 To: ${result.to}`);
        console.log(`🕐 Sent: ${result.dateCreated}`);

      } catch (error) {
        console.log(`❌ SMS sending failed: ${error.message}`);
        console.log(`🔍 Error Code: ${error.code}`);
        console.log(`📄 Error Details: ${error.moreInfo || 'No additional info'}`);
      }
    } else {
      console.log('⚠️  Skipping SMS test - TWILIO_DEV_PHONE_NUMBER not set');
    }

  } catch (error) {
    console.log(`❌ Twilio test failed: ${error.message}`);
    if (error.code) {
      console.log(`🔍 Error Code: ${error.code}`);
    }
  }

  console.log('\n🏁 Test completed');
}

// Run the test
testTwilioConfig().catch(console.error);