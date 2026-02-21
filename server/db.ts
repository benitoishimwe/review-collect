import { eq, and, or, like, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  businesses,
  campaigns,
  InsertBusiness,
  InsertCampaign,
  InsertReview,
  InsertSubscription,
  InsertUser,
  reviews,
  subscriptions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Businesses ───────────────────────────────────────────────────────────────

export async function getBusinessByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businesses).where(eq(businesses.userId, userId)).limit(1);
  return result[0];
}

export async function getBusinessBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);
  return result[0];
}

export async function upsertBusiness(data: InsertBusiness) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getBusinessByUserId(data.userId);
  if (existing) {
    await db.update(businesses).set({ ...data, updatedAt: new Date() }).where(eq(businesses.userId, data.userId));
    return (await getBusinessByUserId(data.userId))!;
  } else {
    await db.insert(businesses).values(data);
    return (await getBusinessByUserId(data.userId))!;
  }
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export async function getCampaignsByBusinessId(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).where(eq(campaigns.businessId, businessId)).orderBy(desc(campaigns.createdAt));
}

export async function getActiveCampaignByBusinessId(businessId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.businessId, businessId), eq(campaigns.isActive, "yes")))
    .orderBy(desc(campaigns.createdAt))
    .limit(1);
  return result[0];
}

export async function getCampaignById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return result[0];
}

export async function createCampaign(data: InsertCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(campaigns).values(data);
  const result = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.businessId, data.businessId))
    .orderBy(desc(campaigns.createdAt))
    .limit(1);
  return result[0]!;
}

export async function updateCampaign(id: number, data: Partial<InsertCampaign>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(campaigns).set({ ...data, updatedAt: new Date() }).where(eq(campaigns.id, id));
  return getCampaignById(id);
}

export async function deleteCampaign(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(campaigns).where(eq(campaigns.id, id));
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(reviews).values(data);
  const result = await db
    .select()
    .from(reviews)
    .where(eq(reviews.businessId, data.businessId))
    .orderBy(desc(reviews.submittedAt))
    .limit(1);
  return result[0]!;
}

export async function getReviewsByBusinessId(
  businessId: number,
  opts?: { rating?: number; search?: string; limit?: number; offset?: number }
) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(reviews.businessId, businessId)];
  if (opts?.rating) conditions.push(eq(reviews.rating, opts.rating));
  if (opts?.search) {
    conditions.push(
      or(
        like(reviews.customerName, `%${opts.search}%`),
        like(reviews.customerEmail, `%${opts.search}%`)
      )!
    );
  }
  return db
    .select()
    .from(reviews)
    .where(and(...conditions))
    .orderBy(desc(reviews.submittedAt))
    .limit(opts?.limit ?? 100)
    .offset(opts?.offset ?? 0);
}

export async function getReviewStats(businessId: number) {
  const db = await getDb();
  if (!db) return { total: 0, avgRating: 0, byRating: {} };
  const all = await db.select().from(reviews).where(eq(reviews.businessId, businessId));
  const total = all.length;
  const avgRating = total > 0 ? all.reduce((s, r) => s + r.rating, 0) / total : 0;
  const byRating: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  all.forEach((r) => { byRating[r.rating] = (byRating[r.rating] ?? 0) + 1; });
  return { total, avgRating: Math.round(avgRating * 10) / 10, byRating };
}

export async function markReviewAsWinner(reviewId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reviews).set({ isWinner: "yes" }).where(eq(reviews.id, reviewId));
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(subscriptions).values(data);
  return db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, data.stripeSubscriptionId)).limit(1).then(r => r[0]);
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId)).limit(1);
  return result[0];
}

export async function getSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(desc(subscriptions.createdAt)).limit(1);
  return result[0];
}

export async function updateSubscription(stripeSubscriptionId: string, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscriptions).set({ ...data, updatedAt: new Date() }).where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
  return getSubscriptionByStripeId(stripeSubscriptionId);
}

export async function updateUserStripeCustomerId(userId: number, stripeCustomerId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ stripeCustomerId, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function updateBusinessSubscriptionTier(businessId: number, tier: "free" | "starter" | "pro", stripeSubscriptionId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const analyticsEnabled = tier === "pro" ? 1 : 0;
  const emailNotificationsEnabled = tier === "pro" ? 1 : 0;
  const customBrandingEnabled = tier === "pro" ? 1 : 0;
  await db.update(businesses).set({
    subscriptionTier: tier,
    stripeSubscriptionId: stripeSubscriptionId || null,
    analyticsEnabled,
    emailNotificationsEnabled,
    customBrandingEnabled,
    updatedAt: new Date(),
  }).where(eq(businesses.id, businessId));
}
