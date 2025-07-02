import { pgTable, text, serial, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  patientName: text("patient_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  reason: text("reason").notNull(),
  outcome: text("outcome").notNull(), // 'Booked', 'Transferred', 'No Action'
  needsAttention: boolean("needs_attention").notNull().default(false),
  attentionReason: text("attention_reason"), // 'Approval pending', 'ID failed', etc.
  transcript: jsonb("transcript").$type<TranscriptEntry[]>().notNull(),
  aiDecisions: text("ai_decisions").array().notNull().default([]),
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'completed'
  appointmentType: text("appointment_type"),
  appointmentDateTime: text("appointment_date_time"),
  doctor: text("doctor"),
  dob: text("dob"),
});

export type TranscriptEntry = {
  timestamp: string;
  speaker: 'AI Assistant' | 'Patient';
  message: string;
  keywords?: string[];
};

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCallSchema = createInsertSchema(calls).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Call = typeof calls.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;
