/**
 * Stripe subscription products and pricing configuration.
 * These are the tier definitions for ReviewCollect.
 *
 * To create products in Stripe:
 * 1. Go to https://dashboard.stripe.com/products
 * 2. Create two products: "ReviewCollect Starter" and "ReviewCollect Pro"
 * 3. Add monthly recurring prices to each
 * 4. Copy the Price IDs (price_xxx) and paste them below
 */

export const STRIPE_PRODUCTS = {
  STARTER: {
    name: "Starter",
    priceUsd: 29,
    description: "Perfect for small businesses starting to collect reviews",
    features: [
      "Unlimited QR codes",
      "Basic review collection",
      "Up to 5 active campaigns",
      "Email support",
    ],
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "", // Set via env var
  },
  PRO: {
    name: "Pro",
    priceUsd: 79,
    description: "Advanced features for growing businesses",
    features: [
      "Everything in Starter",
      "Advanced analytics dashboard",
      "Email notifications to customers",
      "Custom branding (logo, colors)",
      "Unlimited campaigns",
      "Priority support",
    ],
    priceId: process.env.STRIPE_PRO_PRICE_ID || "", // Set via env var
  },
};

export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  STARTER: "starter",
  PRO: "pro",
} as const;

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS];

/**
 * Feature access based on subscription tier.
 * Returns true if the tier has access to the feature.
 */
export function hasFeature(tier: SubscriptionTier, feature: string): boolean {
  const features: Record<SubscriptionTier, Set<string>> = {
    free: new Set([]),
    starter: new Set(["unlimited_qr", "basic_reviews", "campaigns_5"]),
    pro: new Set([
      "unlimited_qr",
      "basic_reviews",
      "campaigns_unlimited",
      "advanced_analytics",
      "email_notifications",
      "custom_branding",
    ]),
  };
  return features[tier]?.has(feature) ?? false;
}
