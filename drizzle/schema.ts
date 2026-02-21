import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
} from "drizzle-orm/mysql-core";

// ─── Users (auth) ────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }), // Stripe customer ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Businesses ──────────────────────────────────────────────────────────────
export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK → users.id
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(), // used in QR URL
  description: text("description"),
  website: varchar("website", { length: 512 }),
  phone: varchar("phone", { length: 32 }),
  address: text("address"),
  logoUrl: varchar("logoUrl", { length: 1024 }),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "starter", "pro"]).default("free").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }), // Stripe subscription ID
  customBrandingEnabled: int("customBrandingEnabled").default(0).notNull(), // 1 = enabled (Pro)
  analyticsEnabled: int("analyticsEnabled").default(0).notNull(), // 1 = enabled (Pro)
  emailNotificationsEnabled: int("emailNotificationsEnabled").default(0).notNull(), // 1 = enabled (Pro)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

// ─── Campaigns (incentive / giveaway settings) ───────────────────────────────
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(), // FK → businesses.id
  title: varchar("title", { length: 255 }).notNull(),
  incentiveTitle: varchar("incentiveTitle", { length: 255 }), // e.g. "Win $500 Gift Card"
  incentiveDescription: text("incentiveDescription"),
  incentiveValue: decimal("incentiveValue", { precision: 10, scale: 2 }),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes").notNull(),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(), // FK → businesses.id
  campaignId: int("campaignId"), // nullable FK → campaigns.id
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 32 }),
  rating: int("rating").notNull(), // 1–5
  feedback: text("feedback"),
  isWinner: mysqlEnum("isWinner", ["yes", "no"]).default("no").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ─── Subscriptions (billing history) ──────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK → users.id
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  stripePriceId: varchar("stripePriceId", { length: 255 }).notNull(),
  tier: mysqlEnum("tier", ["starter", "pro"]).notNull(),
  status: mysqlEnum("status", ["active", "past_due", "canceled", "unpaid"]).notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  canceledAt: timestamp("canceledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
