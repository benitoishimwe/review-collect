/**
 * Subscription router - handles Stripe checkout and subscription management
 * This is a separate file to keep routers.ts organized.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import Stripe from "stripe";
import { STRIPE_PRODUCTS } from "./stripe-products";
import { getSubscriptionByUserId } from "./db";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const subscriptionRouter = router({
  getPricing: publicProcedure.query(() => {
    return {
      starter: {
        name: STRIPE_PRODUCTS.STARTER.name,
        price: STRIPE_PRODUCTS.STARTER.priceUsd,
        description: STRIPE_PRODUCTS.STARTER.description,
        features: STRIPE_PRODUCTS.STARTER.features,
      },
      pro: {
        name: STRIPE_PRODUCTS.PRO.name,
        price: STRIPE_PRODUCTS.PRO.priceUsd,
        description: STRIPE_PRODUCTS.PRO.description,
        features: STRIPE_PRODUCTS.PRO.features,
      },
    };
  }),

  createCheckoutSession: protectedProcedure
    .input(z.object({ tier: z.enum(["starter", "pro"]) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.email) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Email required" });
      }

      const priceId =
        input.tier === "starter"
          ? STRIPE_PRODUCTS.STARTER.priceId
          : STRIPE_PRODUCTS.PRO.priceId;

      if (!priceId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe price not configured",
        });
      }

      const session = await stripe.checkout.sessions.create({
        customer_email: ctx.user.email,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${ctx.req.headers.origin}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ctx.req.headers.origin}/dashboard/billing`,
        metadata: {
          user_id: ctx.user.id.toString(),
          tier: input.tier,
        },
      });

      if (!session.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }

      return { checkoutUrl: session.url };
    }),

  getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
    return getSubscriptionByUserId(ctx.user.id);
  }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await getSubscriptionByUserId(ctx.user.id);
    if (!subscription) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No active subscription found",
      });
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    return { success: true };
  }),
});
