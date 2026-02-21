import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  createCampaign,
  createReview,
  deleteCampaign,
  getActiveCampaignByBusinessId,
  getBusinessBySlug,
  getBusinessByUserId,
  getCampaignById,
  getCampaignsByBusinessId,
  getReviewsByBusinessId,
  getReviewStats,
  markReviewAsWinner,
  updateCampaign,
  upsertBusiness,
  getSubscriptionByUserId,
  updateUserStripeCustomerId,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { subscriptionRouter } from "./routers-subscription";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  return `${base}-${nanoid(6)}`;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  subscription: subscriptionRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Business ───────────────────────────────────────────────────────────────
  business: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getBusinessByUserId(ctx.user.id);
    }),

    upsert: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          description: z.string().optional(),
          website: z.string().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getBusinessByUserId(ctx.user.id);
        const slug = existing?.slug ?? generateSlug(input.name);
        return upsertBusiness({
          userId: ctx.user.id,
          slug,
          name: input.name,
          description: input.description ?? null,
          website: input.website ?? null,
          phone: input.phone ?? null,
          address: input.address ?? null,
        });
      }),

    getPublic: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const business = await getBusinessBySlug(input.slug);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        const campaign = await getActiveCampaignByBusinessId(business.id);
        return { business, campaign: campaign ?? null };
      }),
  }),

  // ─── Campaigns ──────────────────────────────────────────────────────────────
  campaign: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) return [];
      return getCampaignsByBusinessId(business.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          incentiveTitle: z.string().optional(),
          incentiveDescription: z.string().optional(),
          incentiveValue: z.number().optional(),
          isActive: z.enum(["yes", "no"]).default("yes"),
          startsAt: z.number().optional(),
          endsAt: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await getBusinessByUserId(ctx.user.id);
        if (!business) throw new TRPCError({ code: "BAD_REQUEST", message: "Set up your business profile first" });
        return createCampaign({
          businessId: business.id,
          title: input.title,
          incentiveTitle: input.incentiveTitle ?? null,
          incentiveDescription: input.incentiveDescription ?? null,
          incentiveValue: input.incentiveValue ? String(input.incentiveValue) : null,
          isActive: input.isActive,
          startsAt: input.startsAt ? new Date(input.startsAt) : null,
          endsAt: input.endsAt ? new Date(input.endsAt) : null,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).max(255).optional(),
          incentiveTitle: z.string().optional(),
          incentiveDescription: z.string().optional(),
          incentiveValue: z.number().optional(),
          isActive: z.enum(["yes", "no"]).optional(),
          startsAt: z.number().optional().nullable(),
          endsAt: z.number().optional().nullable(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await getBusinessByUserId(ctx.user.id);
        if (!business) throw new TRPCError({ code: "BAD_REQUEST", message: "Business not found" });
        const campaign = await getCampaignById(input.id);
        if (!campaign || campaign.businessId !== business.id)
          throw new TRPCError({ code: "FORBIDDEN" });
        const { id, ...rest } = input;
        return updateCampaign(id, {
          ...rest,
          incentiveValue: rest.incentiveValue !== undefined ? String(rest.incentiveValue) : undefined,
          startsAt: rest.startsAt !== undefined ? (rest.startsAt ? new Date(rest.startsAt) : null) : undefined,
          endsAt: rest.endsAt !== undefined ? (rest.endsAt ? new Date(rest.endsAt) : null) : undefined,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const business = await getBusinessByUserId(ctx.user.id);
        if (!business) throw new TRPCError({ code: "BAD_REQUEST" });
        const campaign = await getCampaignById(input.id);
        if (!campaign || campaign.businessId !== business.id)
          throw new TRPCError({ code: "FORBIDDEN" });
        await deleteCampaign(input.id);
        return { success: true };
      }),
  }),

  // ─── Reviews ────────────────────────────────────────────────────────────────
  review: router({
    submit: publicProcedure
      .input(
        z.object({
          slug: z.string(),
          customerName: z.string().min(1).max(255),
          customerEmail: z.string().email(),
          customerPhone: z.string().optional(),
          rating: z.number().int().min(1).max(5),
          feedback: z.string().optional(),
          campaignId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const business = await getBusinessBySlug(input.slug);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        const review = await createReview({
          businessId: business.id,
          campaignId: input.campaignId ?? null,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone ?? null,
          rating: input.rating,
          feedback: input.feedback ?? null,
        });
        // Notify business owner
        try {
          await notifyOwner({
            title: `New ${input.rating}★ review for ${business.name}`,
            content: `${input.customerName} left a ${input.rating}-star review: "${input.feedback ?? "No feedback"}"`,
          });
        } catch (_) { /* non-critical */ }
        return { success: true, reviewId: review.id };
      }),

    list: protectedProcedure
      .input(
        z.object({
          rating: z.number().int().min(1).max(5).optional(),
          search: z.string().optional(),
          limit: z.number().int().max(200).default(50),
          offset: z.number().int().default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        const business = await getBusinessByUserId(ctx.user.id);
        if (!business) return { reviews: [], stats: { total: 0, avgRating: 0, byRating: {} } };
        const [reviewList, stats] = await Promise.all([
          getReviewsByBusinessId(business.id, input),
          getReviewStats(business.id),
        ]);
        return { reviews: reviewList, stats };
      }),

    markWinner: protectedProcedure
      .input(z.object({ reviewId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const business = await getBusinessByUserId(ctx.user.id);
        if (!business) throw new TRPCError({ code: "BAD_REQUEST" });
        await markReviewAsWinner(input.reviewId);
        return { success: true };
      }),

    exportCsv: protectedProcedure
      .input(z.object({ rating: z.number().int().min(1).max(5).optional() }))
      .query(async ({ ctx, input }) => {
        const business = await getBusinessByUserId(ctx.user.id);
        if (!business) return { csv: "" };
        const reviewList = await getReviewsByBusinessId(business.id, { rating: input.rating, limit: 10000 });
        const header = "ID,Name,Email,Phone,Rating,Feedback,Winner,Submitted At\n";
        const rows = reviewList
          .map((r) =>
            [
              r.id,
              `"${r.customerName}"`,
              r.customerEmail,
              r.customerPhone ?? "",
              r.rating,
              `"${(r.feedback ?? "").replace(/"/g, '""')}"`,
              r.isWinner === "yes" ? "Yes" : "No",
              new Date(r.submittedAt).toISOString(),
            ].join(",")
          )
          .join("\n");
        return { csv: header + rows, businessName: business.name };
      }),
  }),
});

export type AppRouter = typeof appRouter;
