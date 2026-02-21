import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { QrCode, Download, Copy, ExternalLink, Share2 } from "lucide-react";
import { useLocation } from "wouter";

export default function QRCodePage() {
  const { data: business, isLoading } = trpc.business.get.useQuery();
  const [, navigate] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  const reviewUrl = business
    ? `${window.location.origin}/review/${business.slug}`
    : "";

  useEffect(() => {
    if (!business || !canvasRef.current) return;

    // Generate QR code using a canvas-based approach
    const generateQR = async () => {
      try {
        const QRCodeLib = await import("qrcode");
        await QRCodeLib.default.toCanvas(canvasRef.current!, reviewUrl, {
          width: 280,
          margin: 2,
          color: {
            dark: "#1a1f3a",
            light: "#ffffff",
          },
          errorCorrectionLevel: "H",
        });
        setQrGenerated(true);
      } catch (err) {
        console.error("QR generation error:", err);
      }
    };

    generateQR();
  }, [business, reviewUrl]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `${business?.name ?? "review"}-qr-code.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    toast.success("QR code downloaded");
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(reviewUrl);
    toast.success("Review link copied to clipboard");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 py-2">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">QR Code</h1>
          <p className="text-muted-foreground mt-1">
            Display this QR code in your business so customers can scan and leave reviews.
          </p>
        </div>

        {isLoading ? (
          <div className="h-96 rounded-2xl bg-muted animate-pulse" />
        ) : !business ? (
          <Card className="border-border border-dashed">
            <CardContent className="p-12 text-center">
              <QrCode className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-serif text-lg font-semibold text-primary mb-2">
                Set Up Your Profile First
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                You need to create your business profile before generating a QR code.
              </p>
              <Button
                onClick={() => navigate("/dashboard/profile")}
                className="bg-primary text-primary-foreground"
              >
                Create Business Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* QR Code Card */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-8 flex flex-col items-center gap-6">
                {/* QR Code display */}
                <div className="relative">
                  <div className="p-4 bg-white rounded-2xl shadow-lg border border-border">
                    <canvas ref={canvasRef} className="block rounded-lg" />
                  </div>
                  {!qrGenerated && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Business name */}
                <div className="text-center">
                  <p className="font-serif text-xl font-semibold text-primary">{business.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">Scan to leave a review</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!qrGenerated}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCopyUrl}
                    className="flex-1 border-border"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* URL display */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-accent" />
                  Share Your Review Link
                </CardTitle>
                <CardDescription>
                  You can also share this URL directly with customers via email, SMS, or social media.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary border border-border">
                  <p className="font-mono text-sm text-primary flex-1 min-w-0 truncate">{reviewUrl}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={handleCopyUrl}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-border"
                  onClick={() => window.open(reviewUrl, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview Review Page
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-border bg-secondary/40 shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-serif font-semibold text-primary mb-3">Tips for Displaying Your QR Code</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-0.5">·</span>
                    Print and laminate it for your counter, tables, or register area.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-0.5">·</span>
                    Add it to your receipts or invoices with a short message.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-0.5">·</span>
                    Include it in follow-up emails to customers after their visit.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-0.5">·</span>
                    Post it on your social media profiles with your incentive offer.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
