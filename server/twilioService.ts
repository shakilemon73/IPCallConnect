import twilio from 'twilio';

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in environment variables');
}

if (!process.env.TWILIO_API_KEY || !process.env.TWILIO_API_SECRET) {
  throw new Error('TWILIO_API_KEY and TWILIO_API_SECRET must be set in environment variables');
}

const accountSid: string = process.env.TWILIO_ACCOUNT_SID;
const authToken: string = process.env.TWILIO_AUTH_TOKEN;
const apiKey: string = process.env.TWILIO_API_KEY;
const apiSecret: string = process.env.TWILIO_API_SECRET;
const appSid = process.env.TWILIO_APP_SID;
const verifySid = process.env.TWILIO_VERIFY_SID;

const client = twilio(accountSid, authToken);
const { AccessToken } = twilio.jwt;
const { VoiceGrant } = AccessToken;

export class TwilioService {
  // Generate Twilio Access Token for Voice SDK
  generateAccessToken(identity: string): string {
    const accessToken = new AccessToken(
      accountSid,
      apiKey,
      apiSecret,
      { identity }
    );

    const grant = new VoiceGrant({
      outgoingApplicationSid: appSid,
      incomingAllow: true,
    });

    accessToken.addGrant(grant);
    
    return accessToken.toJwt();
  }

  // Send OTP for phone verification
  async sendOTP(phoneNumber: string) {
    try {
      if (!verifySid) {
        throw new Error('TWILIO_VERIFY_SID is not configured');
      }
      const verification = await client.verify.v2
        .services(verifySid)
        .verifications
        .create({
          to: phoneNumber,
          channel: 'sms',
        });
      
      return verification;
    } catch (error) {
      console.error('Failed to send OTP:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(phoneNumber: string, code: string) {
    try {
      if (!verifySid) {
        throw new Error('TWILIO_VERIFY_SID is not configured');
      }
      const verificationCheck = await client.verify.v2
        .services(verifySid)
        .verificationChecks
        .create({
          to: phoneNumber,
          code: code,
        });
      
      return verificationCheck;
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      throw error;
    }
  }

  // Initiate outbound call to PSTN
  async initiateCall(fromIdentity: string, toNumber: string): Promise<string> {
    try {
      const call = await client.calls.create({
        to: toNumber,
        from: '+1234567890', // Your Twilio phone number
        twiml: `<Response><Dial callerId="+1234567890">${toNumber}</Dial></Response>`,
        statusCallback: `${process.env.BASE_URL || 'https://your-domain.com'}/api/webhooks/twilio/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
      });
      
      return call.sid;
    } catch (error) {
      console.error('Failed to initiate call:', error);
      throw error;
    }
  }

  // Get call details
  async getCall(callSid: string) {
    try {
      const call = await client.calls(callSid).fetch();
      return call;
    } catch (error) {
      console.error('Failed to fetch call:', error);
      throw error;
    }
  }

  // End call
  async endCall(callSid: string) {
    try {
      const call = await client.calls(callSid).update({ status: 'completed' });
      return call;
    } catch (error) {
      console.error('Failed to end call:', error);
      throw error;
    }
  }
}
