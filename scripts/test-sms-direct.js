/**
 * Test script to verify Twilio SMS configuration
 * Run with: node scripts/test-sms-direct.js
 */

const twilio = require('twilio');

// Your credentials for testing
const credentials = {
  TWILIO_ACCOUNT_SID: 'ACbd0de7dae892ee818c033161fc86b5d1',
  TWILIO_AUTH_TOKEN: '89c80fd098e75fdf63b365ad73a62ae3',
  TWILIO_SMS_SID: 'VAb14c56e36e9502ba6482e15e757faced',
  TWILIO_DEV_PHONE_NUMBER: '+6282243019049'
};

async function testTwilioConfig() {
  console.log('🧪 Testing Twilio SMS Configuration...\n');

  // Check credentials
  console.log('📋 Credentials:');
  console.log(`TWILIO_ACCOUNT_SID: ${credentials.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing'}`);
  console.log(`TWILIO_AUTH_TOKEN: ${credentials.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`TWILIO_SMS_SID: ${credentials.TWILIO_SMS_SID ? '✅ Set' : '❌ Missing'}`);
  console.log(`TWILIO_DEV_PHONE_NUMBER: ${credentials.TWILIO_DEV_PHONE_NUMBER ? '✅ Set' : '❌ Missing'}\n`);

  if (!credentials.TWILIO_ACCOUNT_SID || !credentials.TWILIO_AUTH_TOKEN) {
    console.log('❌ Missing required Twilio credentials');
    return;
  }

  try {
    // Initialize Twilio client
    const client = twilio(credentials.TWILIO_ACCOUNT_SID, credentials.TWILIO_AUTH_TOKEN);

    // Test 1: Verify account credentials
    console.log('🔐 Testing Account Credentials...');
    const account = await client.api.accounts(credentials.TWILIO_ACCOUNT_SID).fetch();
    console.log(`✅ Account verified: ${account.friendlyName} (${account.status})\n`);

    // Test 2: Check SID type and configuration
    console.log('🔍 Analyzing SMS SID Configuration...');
    const smsSid = credentials.TWILIO_SMS_SID;

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
        console.log('💡 For direct SMS, you need either:');
        console.log('   - A Messaging Service SID (starts with MG)');
        console.log('   - A Twilio phone number (starts with +)');
        try {
          const verifyService = await client.verify.services(smsSid).fetch();
          console.log(`✅ Verify Service found: ${verifyService.friendlyName}`);
          console.log(`📋 Service Status: ${verifyService.status}`);
        } catch (error) {
          console.log(`❌ Verify Service error: ${error.message}`);
        }
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
        console.log(`\n💡 You can use any of these numbers as TWILIO_PHONE_NUMBER for SMS sending`);
      } else {
        console.log('  ⚠️  No phone numbers found');
        console.log('  💡 You may need to purchase a phone number from Twilio Console');
      }
    } catch (error) {
      console.log(`  ❌ Error fetching phone numbers: ${error.message}`);
    }

    console.log('');

    // Test 4: Test SMS sending (to dev number only)
    if (credentials.TWILIO_DEV_PHONE_NUMBER) {
      console.log('📱 Testing SMS Sending (Dev Mode)...');
      const testMessage = `🧪 Test SMS from Summer Party Canggu\nTimestamp: ${new Date().toISOString()}\nThis is a test message.`;

      console.log('🔍 Attempting to send SMS...');

      // Try using a phone number from the account
      try {
        const phoneNumbers = await client.incomingPhoneNumbers.list({ limit: 1 });
        if (phoneNumbers.length > 0) {
          const fromNumber = phoneNumbers[0].phoneNumber;
          console.log(`📞 Using phone number: ${fromNumber}`);

          const result = await client.messages.create({
            body: testMessage,
            from: fromNumber,
            to: credentials.TWILIO_DEV_PHONE_NUMBER,
          });

          console.log(`✅ SMS sent successfully!`);
          console.log(`📋 Message SID: ${result.sid}`);
          console.log(`📱 Status: ${result.status}`);
          console.log(`📞 To: ${result.to}`);
          console.log(`📞 From: ${result.from}`);
          console.log(`🕐 Sent: ${result.dateCreated}`);

        } else {
          console.log('❌ No phone numbers available for sending SMS');
          console.log('💡 Please purchase a phone number from Twilio Console first');
        }

      } catch (error) {
        console.log(`❌ SMS sending failed: ${error.message}`);
        console.log(`🔍 Error Code: ${error.code}`);
        console.log(`📄 Error Details: ${error.moreInfo || 'No additional info'}`);

        if (error.code === 21608) {
          console.log('💡 This error means the phone number is not verified or doesn\'t exist');
        } else if (error.code === 21614) {
          console.log('💡 This error means the destination number is not a valid mobile number');
        }
      }
    } else {
      console.log('⚠️  Skipping SMS test - TWILIO_DEV_PHONE_NUMBER not set');
    }

  } catch (error) {
    console.log(`❌ Twilio test failed: ${error.message}`);
    if (error.code) {
      console.log(`🔍 Error Code: ${error.code}`);
    }
    if (error.status === 401) {
      console.log('💡 This usually means invalid Account SID or Auth Token');
    }
  }

  console.log('\n🏁 Test completed');

  console.log('\n📝 Summary and Recommendations:');
  console.log('1. Your TWILIO_SMS_SID (VA...) is a Verify Service, not for direct messaging');
  console.log('2. For the SMS service in your app, you need either:');
  console.log('   - Set TWILIO_PHONE_NUMBER to one of your purchased numbers');
  console.log('   - Or create a Messaging Service (MG...) in Twilio Console');
  console.log('3. Your current SMS service code will handle both options automatically');
}

// Run the test
testTwilioConfig().catch(console.error);