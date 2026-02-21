import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Star, Download, Trophy, Search, Filter, MessageSquare } from "lucide-react";

export default function Reviews() {
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const queryInput = useMemo(() => ({
    rating: ratingFilter !== "all" ? parseInt(ratingFilter) : undefined,
    search: debouncedSearch || undefined,
    limit: 100,
    offset: 0,
  }), [ratingFilter, debouncedSearch]);

  const { data, isLoading, refetch } = trpc.review.list.useQuery(queryInput);
  const markWinner = trpc.review.markWinner.useMutation({
    onSuccess: () => {
      toast.success("Winner marked!");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const exportQuery = trpc.review.exportCsv.useQuery(
    { rating: ratingFilter !== "all" ? parseInt(ratingFilter) : undefined },
    { enabled: false }
  );

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const handleExport = async () => {
    const result = await exportQuery.refetch();
    if (!result.data?.csv) {
      toast.error("No reviews to export");
      return;
    }
    const blob = new Blob([result.data.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.data.businessName ?? "reviews"}-reviews.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Reviews exported");
  };

  const reviews = data?.reviews ?? [];
  const stats = data?.stats;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 py-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary">Reviews</h1>
            <p className="text-muted-foreground mt-1">
              {stats?.total ?? 0} total reviews · {stats?.avgRating ?? 0}★ average
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            className="shrink-0 border-border"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats bar */}
        {stats && stats.total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[5, 4, 3, 2, 1].map((r) => {
              const count = (stats.byRating as Record<number, number>)[r] ?? 0;
              return (
                <button
                  key={r}
                  onClick={() => setRatingFilter(ratingFilter === String(r) ? "all" : String(r))}
                  className={`rounded-xl p-3 text-center border transition-all ${
                    ratingFilter === String(r)
                      ? "border-accent bg-accent/10"
                      : "border-border bg-white hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="font-semibold text-sm text-foreground">{r}</span>
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="font-serif text-xl font-bold text-primary">{count}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-full sm:w-40 h-10">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              {[5, 4, 3, 2, 1].map((r) => (
                <SelectItem key={r} value={String(r)}>
                  {r} Star{r !== 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reviews list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <Card key={review.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full navy-gradient flex items-center justify-center shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {review.customerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{review.customerName}</p>
                          {review.isWinner === "yes" && (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                              <Trophy className="w-3 h-3 mr-1" /> Winner
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{review.customerEmail}</p>
                        {review.customerPhone && (
                          <p className="text-sm text-muted-foreground">{review.customerPhone}</p>
                        )}
                        {review.feedback && (
                          <p className="text-sm text-foreground mt-2 leading-relaxed">{review.feedback}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.submittedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`}
                          />
                        ))}
                      </div>
                      {review.isWinner !== "yes" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-muted-foreground hover:text-yellow-600"
                          onClick={() => markWinner.mutate({ reviewId: review.id })}
                        >
                          <Trophy className="w-3 h-3 mr-1" /> Mark Winner
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border border-dashed">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-serif text-lg font-semibold text-primary mb-2">No reviews yet</h3>
              <p className="text-muted-foreground text-sm">
                {search || ratingFilter !== "all"
                  ? "No reviews match your current filters."
                  : "Share your QR code with customers to start collecting reviews."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
