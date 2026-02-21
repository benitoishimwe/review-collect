import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Zap } from "lucide-react";

export default function Pricing() {
  const { data: pricing, isLoading } = trpc.subscription.getPricing.useQuery();
  const { data: currentSub } = trpc.subscription.getCurrentSubscription.useQuery();
  const checkout = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-bold text-primary mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Starter Tier */}
          <Card className="border-border shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">{pricing?.starter.name}</CardTitle>
              <CardDescription>{pricing?.starter.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <span className="font-serif text-4xl font-bold text-primary">
                  ${pricing?.starter.price}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <ul className="space-y-3">
                {pricing?.starter.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => checkout.mutate({ tier: "starter" })}
                disabled={checkout.isPending || currentSub?.tier === "starter"}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {currentSub?.tier === "starter" ? "Current Plan" : "Get Started"}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="border-accent shadow-lg hover:shadow-xl transition-shadow relative">
            <div className="absolute -top-3 right-6">
              <Badge className="bg-accent text-accent-foreground">
                <Zap className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">{pricing?.pro.name}</CardTitle>
              <CardDescription>{pricing?.pro.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <span className="font-serif text-4xl font-bold text-primary">
                  ${pricing?.pro.price}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <ul className="space-y-3">
                {pricing?.pro.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => checkout.mutate({ tier: "pro" })}
                disabled={checkout.isPending || currentSub?.tier === "pro"}
                className="w-full bg-gradient-to-r from-accent to-accent/80 text-white hover:from-accent/90 hover:to-accent/70"
              >
                {currentSub?.tier === "pro" ? "Current Plan" : "Upgrade to Pro"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Free Tier Info */}
        <Card className="border-border bg-secondary/40">
          <CardContent className="p-6">
            <h3 className="font-serif font-semibold text-lg text-primary mb-2">
              Start Free
            </h3>
            <p className="text-muted-foreground">
              All businesses start with our free tier. No credit card required. Collect unlimited reviews and manage basic campaigns.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
