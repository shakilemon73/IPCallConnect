import {
  users,
  contacts,
  callHistory,
  transactions,
  callRates,
  type User,
  type UpsertUser,
  type Contact,
  type InsertContact,
  type CallHistory,
  type InsertCallHistory,
  type Transaction,
  type InsertTransaction,
  type CallRate,
  type InsertCallRate,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  updateUserBalance(userId: string, amount: string): Promise<User>;
  updateUserTwilioIdentity(userId: string, identity: string): Promise<User>;
  
  // Contact operations
  getContacts(userId: string): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: string): Promise<void>;
  searchContacts(userId: string, query: string): Promise<Contact[]>;
  
  // Call history operations
  getCallHistory(userId: string, limit?: number): Promise<CallHistory[]>;
  createCallHistory(callHistory: InsertCallHistory): Promise<CallHistory>;
  updateCallHistory(id: string, callHistory: Partial<InsertCallHistory>): Promise<CallHistory>;
  
  // Transaction operations
  getTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Call rate operations
  getCallRates(): Promise<CallRate[]>;
  getCallRateByPrefix(prefix: string): Promise<CallRate | undefined>;
  createCallRate(callRate: InsertCallRate): Promise<CallRate>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async updateUserBalance(userId: string, amount: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        balance: sql`${users.balance} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserTwilioIdentity(userId: string, identity: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        twilioIdentity: identity,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Contact operations
  async getContacts(userId: string): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .where(eq(contacts.userId, userId))
      .orderBy(contacts.name);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact> {
    const [updatedContact] = await db
      .update(contacts)
      .set(contact)
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact;
  }

  async deleteContact(id: string): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  async searchContacts(userId: string, query: string): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.userId, userId),
          sql`${contacts.name} ILIKE ${`%${query}%`} OR ${contacts.phone} ILIKE ${`%${query}%`}`
        )
      )
      .orderBy(contacts.name);
  }

  // Call history operations
  async getCallHistory(userId: string, limit: number = 50): Promise<CallHistory[]> {
    return await db
      .select()
      .from(callHistory)
      .where(eq(callHistory.userId, userId))
      .orderBy(desc(callHistory.createdAt))
      .limit(limit);
  }

  async createCallHistory(callHistoryData: InsertCallHistory): Promise<CallHistory> {
    const [newCallHistory] = await db
      .insert(callHistory)
      .values(callHistoryData)
      .returning();
    return newCallHistory;
  }

  async updateCallHistory(id: string, callHistoryData: Partial<InsertCallHistory>): Promise<CallHistory> {
    const [updatedCallHistory] = await db
      .update(callHistory)
      .set(callHistoryData)
      .where(eq(callHistory.id, id))
      .returning();
    return updatedCallHistory;
  }

  // Transaction operations
  async getTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  // Call rate operations
  async getCallRates(): Promise<CallRate[]> {
    return await db
      .select()
      .from(callRates)
      .where(eq(callRates.isActive, true))
      .orderBy(callRates.prefix);
  }

  async getCallRateByPrefix(prefix: string): Promise<CallRate | undefined> {
    // Find the most specific matching prefix
    const [rate] = await db
      .select()
      .from(callRates)
      .where(
        and(
          eq(callRates.isActive, true),
          sql`${prefix} LIKE ${callRates.prefix} || '%'`
        )
      )
      .orderBy(sql`LENGTH(${callRates.prefix}) DESC`)
      .limit(1);
    return rate;
  }

  async createCallRate(callRate: InsertCallRate): Promise<CallRate> {
    const [newCallRate] = await db
      .insert(callRates)
      .values(callRate)
      .returning();
    return newCallRate;
  }
}

export const storage = new DatabaseStorage();
