import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { TwilioService } from "./twilioService";
import { phoneVerificationSchema, otpVerificationSchema } from "@shared/schema";
import { z } from "zod";

const twilioService = new TwilioService();

interface WebSocketWithUserId extends WebSocket {
  userId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize default call rates
  await initializeCallRates();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Phone verification for registration
  app.post('/api/auth/verify-phone', async (req, res) => {
    try {
      const { phone, nid } = phoneVerificationSchema.parse(req.body);
      
      // Check if phone already exists
      const existingUser = await storage.getUserByPhone(phone);
      if (existingUser) {
        return res.status(400).json({ message: "Phone number already registered" });
      }

      // Send OTP via Twilio
      const verification = await twilioService.sendOTP(phone);
      
      res.json({ 
        message: "OTP sent successfully",
        verificationSid: verification.sid 
      });
    } catch (error) {
      console.error("Phone verification error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  // OTP verification and user creation
  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { phone, otp } = otpVerificationSchema.parse(req.body);
      
      // Verify OTP with Twilio
      const verificationCheck = await twilioService.verifyOTP(phone, otp);
      
      if (verificationCheck.status !== 'approved') {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Create user if verification successful
      const userData = {
        phone,
        isVerified: true,
        twilioIdentity: `user_${Date.now()}`,
      };

      const user = await storage.upsertUser(userData);
      
      // Generate Twilio access token
      const accessToken = twilioService.generateAccessToken(user.twilioIdentity!);
      
      res.json({ 
        message: "Phone verified successfully",
        user,
        twilioToken: accessToken
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  // Twilio access token generation
  app.get('/api/twilio/token', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.twilioIdentity) {
        return res.status(400).json({ message: "User not properly configured" });
      }

      const accessToken = twilioService.generateAccessToken(user.twilioIdentity);
      res.json({ token: accessToken });
    } catch (error) {
      console.error("Token generation error:", error);
      res.status(500).json({ message: "Failed to generate token" });
    }
  });

  // Contacts API
  app.get('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Get contacts error:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, phone } = req.body;
      
      // Check if contact phone is a VoiceLink user
      const voiceLinkUser = await storage.getUserByPhone(phone);
      
      const contact = await storage.createContact({
        userId,
        name,
        phone,
        isVoiceLinkUser: !!voiceLinkUser,
      });
      
      res.json(contact);
    } catch (error) {
      console.error("Create contact error:", error);
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.get('/api/contacts/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.query.q as string;
      
      if (!query) {
        return res.json([]);
      }
      
      const contacts = await storage.searchContacts(userId, query);
      res.json(contacts);
    } catch (error) {
      console.error("Search contacts error:", error);
      res.status(500).json({ message: "Failed to search contacts" });
    }
  });

  // Call history API
  app.get('/api/call-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const callHistory = await storage.getCallHistory(userId, limit);
      res.json(callHistory);
    } catch (error) {
      console.error("Get call history error:", error);
      res.status(500).json({ message: "Failed to fetch call history" });
    }
  });

  // Call initiation
  app.post('/api/calls/initiate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { to, callType } = req.body; // callType: 'voice', 'video', 'pstn'
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let callSid;
      let estimatedCost = "0.00";

      if (callType === 'pstn') {
        // Check balance for PSTN calls
        const rate = await storage.getCallRateByPrefix(to);
        if (rate) {
          estimatedCost = rate.ratePerMinute;
          if (parseFloat(user.balance) < parseFloat(estimatedCost)) {
            return res.status(400).json({ message: "Insufficient balance" });
          }
        }
        
        // Initiate PSTN call via Twilio
        callSid = await twilioService.initiateCall(user.twilioIdentity!, to);
      }

      // Record call history
      await storage.createCallHistory({
        userId,
        phoneNumber: to,
        callType: 'outgoing',
        callCategory: callType,
        status: 'initiated',
        twilioCallSid: callSid,
      });

      res.json({ 
        message: "Call initiated",
        callSid,
        estimatedCost 
      });
    } catch (error) {
      console.error("Call initiation error:", error);
      res.status(500).json({ message: "Failed to initiate call" });
    }
  });

  // Call rates API
  app.get('/api/call-rates', async (req, res) => {
    try {
      const rates = await storage.getCallRates();
      res.json(rates);
    } catch (error) {
      console.error("Get call rates error:", error);
      res.status(500).json({ message: "Failed to fetch call rates" });
    }
  });

  app.get('/api/call-rates/calculate', async (req, res) => {
    try {
      const number = req.query.number as string;
      if (!number) {
        return res.json({ rate: "0.00", description: "Unknown" });
      }

      const rate = await storage.getCallRateByPrefix(number);
      res.json({
        rate: rate?.ratePerMinute || "0.35",
        description: rate?.description || "Bangladesh Mobile",
      });
    } catch (error) {
      console.error("Calculate rate error:", error);
      res.status(500).json({ message: "Failed to calculate rate" });
    }
  });

  // Transactions API
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Recharge wallet
  app.post('/api/wallet/recharge', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, paymentMethod } = req.body;
      
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // In a real implementation, integrate with bKash/Nagad/Stripe here
      // For now, simulate successful payment
      
      // Update user balance
      await storage.updateUserBalance(userId, amount);
      
      // Record transaction
      await storage.createTransaction({
        userId,
        type: 'recharge',
        amount,
        description: `Recharge via ${paymentMethod}`,
        paymentMethod,
        status: 'completed',
      });

      const updatedUser = await storage.getUser(userId);
      res.json({ 
        message: "Recharge successful",
        newBalance: updatedUser?.balance 
      });
    } catch (error) {
      console.error("Recharge error:", error);
      res.status(500).json({ message: "Failed to process recharge" });
    }
  });

  // Twilio webhooks
  app.post('/api/webhooks/twilio/call-status', async (req, res) => {
    try {
      const { CallSid, CallStatus, CallDuration, From, To } = req.body;
      
      // Find call history record
      const callHistoryRecords = await storage.getCallHistory("", 1000); // TODO: Optimize this query
      const callRecord = callHistoryRecords.find(call => call.twilioCallSid === CallSid);
      
      if (callRecord) {
        const duration = parseInt(CallDuration) || 0;
        let cost = "0.00";
        
        if (duration > 0 && callRecord.callCategory === 'pstn') {
          const rate = await storage.getCallRateByPrefix(callRecord.phoneNumber);
          if (rate) {
            cost = (parseFloat(rate.ratePerMinute) * (duration / 60)).toFixed(2);
            
            // Deduct cost from user balance
            await storage.updateUserBalance(callRecord.userId, `-${cost}`);
            
            // Record deduction transaction
            await storage.createTransaction({
              userId: callRecord.userId,
              type: 'call_deduction',
              amount: `-${cost}`,
              description: `Call to ${callRecord.phoneNumber}`,
            });
          }
        }
        
        // Update call history
        await storage.updateCallHistory(callRecord.id, {
          duration,
          cost,
          status: CallStatus === 'completed' ? 'completed' : 'failed',
        });
      }
      
      res.sendStatus(200);
    } catch (error) {
      console.error("Webhook error:", error);
      res.sendStatus(500);
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocketWithUserId, req) => {
    console.log('WebSocket connection established');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'authenticate' && data.userId) {
          ws.userId = data.userId;
          ws.send(JSON.stringify({ type: 'authenticated', success: true }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // Function to broadcast to specific user
  function broadcastToUser(userId: string, message: any) {
    wss.clients.forEach((client: WebSocketWithUserId) => {
      if (client.readyState === WebSocket.OPEN && client.userId === userId) {
        client.send(JSON.stringify(message));
      }
    });
  }

  return httpServer;
}

async function initializeCallRates() {
  try {
    const existingRates = await storage.getCallRates();
    if (existingRates.length === 0) {
      // Initialize Bangladesh call rates
      await storage.createCallRate({
        countryCode: "BD",
        prefix: "+880",
        description: "Bangladesh Mobile",
        ratePerMinute: "0.35",
      });
      
      await storage.createCallRate({
        countryCode: "BD",
        prefix: "+8801",
        description: "Bangladesh Mobile",
        ratePerMinute: "0.35",
      });
      
      console.log("Initialized default call rates");
    }
  } catch (error) {
    console.error("Failed to initialize call rates:", error);
  }
}
