import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC5db3589c60fdf72b2ec5b3db440e1680';
const authToken = process.env.TWILIO_AUTH_TOKEN || '39d19f8cf0a24f6334d539130de7d07e';
const apiKey = process.env.TWILIO_API_KEY || 'SK3883f257ea1b07e763b927bf6eab255f';
const apiSecret = process.env.TWILIO_API_SECRET || 'qv3vnzCNAFqZZyoqPqGNh8qEoo32FSmj';
const appSid = process.env.TWILIO_APP_SID || 'APb03a8d98f217b599f3fc73e07c3e4db6';
const verifySid = process.env.TWILIO_VERIFY_SID || 'VA123456789'; // You'll need to create this

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
