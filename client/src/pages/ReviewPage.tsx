import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Star, Trophy, Building2, Phone, Globe, MapPin, Loader2 } from "lucide-react";

export default function ReviewPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [, navigate] = useLocation();

  const { data, isLoading, error } = trpc.business.getPublic.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    feedback: "",
  });

  const submit = trpc.review.submit.useMutation({
    onSuccess: () => {
      navigate(`/review/${slug}/success`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (!form.customerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!form.customerEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }
    submit.mutate({
      slug: slug ?? "",
      ...form,
      rating,
      campaignId: data?.campaign?.id,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold text-primary mb-2">Business Not Found</h1>
          <p className="text-muted-foreground">
            This review link is invalid or the business no longer exists.
          </p>
        </div>
      </div>
    );
  }

  const { business, campaign } = data;
  const displayRating = hoverRating || rating;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="navy-gradient py-10 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">{business.name}</h1>
          {business.description && (
            <p className="text-white/70 text-sm leading-relaxed">{business.description}</p>
          )}
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            {business.address && (
              <span className="flex items-center gap-1.5 text-white/60 text-xs">
                <MapPin className="w-3.5 h-3.5" /> {business.address}
              </span>
            )}
            {business.phone && (
              <span className="flex items-center gap-1.5 text-white/60 text-xs">
                <Phone className="w-3.5 h-3.5" /> {business.phone}
              </span>
            )}
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white/60 text-xs hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5" /> Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Incentive banner */}
      {campaign && campaign.incentiveTitle && (
        <div className="gold-gradient py-4 px-4">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <Trophy className="w-6 h-6 text-white shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">{campaign.incentiveTitle}</p>
              {campaign.incentiveDescription && (
                <p className="text-white/80 text-xs mt-0.5">{campaign.incentiveDescription}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-border p-6 md:p-8">
          <h2 className="font-serif text-2xl font-bold text-primary mb-1">Leave a Review</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Your feedback helps {business.name} improve and serve you better.
            {campaign?.incentiveTitle && " Plus, you'll be entered to win!"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">
                Your Rating <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= displayRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                {displayRating > 0 && (
                  <span className="text-sm font-medium text-muted-foreground ml-2">
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][displayRating]}
                  </span>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Smith"
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.customerEmail}
                  onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={form.customerPhone}
                  onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-sm font-medium">
                  Your Review <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Tell us about your experience..."
                  value={form.feedback}
                  onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submit.isPending}
              className="w-full h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              {submit.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span>
                  Submit Review
                  {campaign?.incentiveTitle ? " & Enter Giveaway" : ""}
                </span>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By submitting, you agree to allow {business.name} to use your review for marketing purposes.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
