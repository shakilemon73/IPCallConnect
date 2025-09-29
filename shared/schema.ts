import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone").unique(),
  nid: varchar("nid"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  twilioIdentity: varchar("twilio_identity"),
  isVerified: boolean("is_verified").default(false),
  language: varchar("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  phone: varchar("phone").notNull(),
  isVoiceLinkUser: boolean("is_voice_link_user").default(false),
  avatar: varchar("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const callHistory = pgTable("call_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  contactName: text("contact_name"),
  phoneNumber: varchar("phone_number").notNull(),
  callType: varchar("call_type").notNull(), // 'outgoing', 'incoming', 'missed'
  callCategory: varchar("call_category").notNull(), // 'voice', 'video', 'pstn'
  duration: integer("duration").default(0), // in seconds
  cost: decimal("cost", { precision: 8, scale: 2 }).default("0.00"),
  status: varchar("status").notNull(), // 'completed', 'failed', 'busy', 'no_answer'
  twilioCallSid: varchar("twilio_call_sid"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // 'recharge', 'call_deduction'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  paymentMethod: varchar("payment_method"), // 'bkash', 'nagad', 'card'
  referenceId: varchar("reference_id"),
  status: varchar("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const callRates = pgTable("call_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryCode: varchar("country_code").notNull(),
  prefix: varchar("prefix").notNull(),
  description: text("description").notNull(),
  ratePerMinute: decimal("rate_per_minute", { precision: 6, scale: 4 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertCallHistorySchema = createInsertSchema(callHistory).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertCallRateSchema = createInsertSchema(callRates).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertCallHistory = z.infer<typeof insertCallHistorySchema>;
export type CallHistory = typeof callHistory.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertCallRate = z.infer<typeof insertCallRateSchema>;
export type CallRate = typeof callRates.$inferSelect;

// Phone verification schema
export const phoneVerificationSchema = z.object({
  phone: z.string().regex(/^\+880[1-9]\d{8}$/, "Invalid Bangladesh phone number"),
  nid: z.string().min(10).max(17),
});

export const otpVerificationSchema = z.object({
  phone: z.string(),
  otp: z.string().length(6),
});
