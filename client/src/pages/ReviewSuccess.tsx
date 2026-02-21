import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useParams, useLocation } from "wouter";
import { Star, Trophy, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ReviewSuccess() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [, navigate] = useLocation();

  const { data } = trpc.business.getPublic.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  const business = data?.business;
  const campaign = data?.campaign;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top navy bar */}
      <div className="navy-gradient h-2" />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Success icon */}
          <div className="relative inline-flex mb-8">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full gold-gradient flex items-center justify-center shadow-lg">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
          </div>

          <h1 className="font-serif text-3xl font-bold text-primary mb-3">
            Thank You!
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed mb-2">
            Your review for{" "}
            <span className="font-semibold text-foreground">{business?.name ?? "the business"}</span>{" "}
            has been submitted successfully.
          </p>

          {campaign?.incentiveTitle && (
            <div className="mt-6 p-5 rounded-2xl gold-gradient text-white">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-6 h-6" />
                <span className="font-serif font-semibold text-lg">You're Entered!</span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                {campaign.incentiveDescription ??
                  `You've been entered into the ${campaign.incentiveTitle} giveaway. Good luck!`}
              </p>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <p className="text-sm text-muted-foreground">
              Your feedback helps {business?.name ?? "this business"} serve customers better.
              We truly appreciate you taking the time.
            </p>

            <Button
              variant="outline"
              onClick={() => navigate(`/review/${slug}`)}
              className="border-border"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Review Page
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center border-t border-border">
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded navy-gradient flex items-center justify-center">
            <Star className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300" />
          </div>
          <span className="font-serif text-sm font-semibold text-primary">ReviewCollect</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Powered by ReviewCollect</p>
      </div>
    </div>
  );
}
