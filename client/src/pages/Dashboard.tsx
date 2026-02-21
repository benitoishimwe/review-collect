import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, Trophy, QrCode, ArrowRight, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: business } = trpc.business.get.useQuery();
  const { data: reviewData } = trpc.review.list.useQuery({ limit: 5, offset: 0 });
  const { data: campaigns } = trpc.campaign.list.useQuery();

  const stats = reviewData?.stats;
  const activeCampaign = campaigns?.find((c) => c.isActive === "yes");

  const statCards = [
    {
      title: "Total Reviews",
      value: stats?.total ?? 0,
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Average Rating",
      value: stats?.avgRating ? `${stats.avgRating}★` : "—",
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Active Campaign",
      value: activeCampaign ? activeCampaign.incentiveTitle ?? activeCampaign.title : "None",
      icon: Trophy,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      truncate: true,
    },
    {
      title: "QR Code Status",
      value: business ? "Active" : "Setup Required",
      icon: QrCode,
      color: business ? "text-primary" : "text-muted-foreground",
      bg: business ? "bg-primary/10" : "bg-muted",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 py-2">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">
            {business ? `Welcome back` : "Welcome to ReviewCollect"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {business
              ? `Managing reviews for ${business.name}`
              : "Get started by setting up your business profile."}
          </p>
        </div>

        {/* Setup prompt */}
        {!business && (
          <div className="rounded-2xl navy-gradient p-6 text-white flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-semibold mb-1">Complete Your Setup</h2>
              <p className="text-white/70 text-sm">
                Set up your business profile to generate your QR code and start collecting reviews.
              </p>
            </div>
            <Button
              onClick={() => navigate("/dashboard/profile")}
              className="gold-gradient text-white border-0 hover:opacity-90 shrink-0"
            >
              Set Up Profile <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.title} className="border-border shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{card.title}</p>
                    <p className={`font-serif text-2xl font-bold text-primary ${card.truncate ? "truncate" : ""}`}>
                      {card.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0 ml-3`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rating breakdown */}
        {stats && stats.total > 0 && (
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Rating Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = (stats.byRating as Record<number, number>)[rating] ?? 0;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16 shrink-0">
                      <span className="text-sm font-medium text-foreground">{rating}</span>
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gold-gradient rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Recent reviews */}
        {reviewData && reviewData.reviews.length > 0 && (
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="font-serif text-lg">Recent Reviews</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/reviews")} className="text-accent">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {reviewData.reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                  <div className="w-9 h-9 rounded-full navy-gradient flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-semibold">{review.customerName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm text-foreground truncate">{review.customerName}</p>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.feedback && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{review.feedback}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "View QR Code", path: "/dashboard/qrcode", icon: QrCode },
            { label: "Manage Campaigns", path: "/dashboard/campaigns", icon: Trophy },
            { label: "All Reviews", path: "/dashboard/reviews", icon: MessageSquare },
          ].map((action) => (
            <Button
              key={action.path}
              variant="outline"
              className="h-14 gap-3 border-border hover:bg-secondary"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="w-5 h-5 text-primary" />
              <span className="font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
