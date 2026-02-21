import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { QrCode, Star, Trophy, BarChart3, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  const features = [
    {
      icon: QrCode,
      title: "Instant QR Codes",
      description: "Generate a unique QR code for your business in seconds. Display it at your counter, on receipts, or anywhere customers can see it.",
    },
    {
      icon: Star,
      title: "Effortless Reviews",
      description: "Customers scan, fill a simple form, and submit their review in under a minute — no app download or account required.",
    },
    {
      icon: Trophy,
      title: "Incentive Campaigns",
      description: "Boost participation by offering giveaways and prizes. Configure your incentive once and watch reviews pour in.",
    },
    {
      icon: BarChart3,
      title: "Powerful Dashboard",
      description: "View, filter, and export all your reviews. Track ratings over time and identify your happiest customers.",
    },
  ];

  const steps = [
    { number: "01", title: "Create your account", description: "Sign up and set up your business profile in minutes." },
    { number: "02", title: "Configure your campaign", description: "Set your incentive — e.g., 'Enter to win $500' — to motivate customers." },
    { number: "03", title: "Display your QR code", description: "Print or display your unique QR code anywhere customers will see it." },
    { number: "04", title: "Collect & manage reviews", description: "Watch reviews come in and manage them from your dashboard." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg navy-gradient flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            </div>
            <span className="font-serif font-semibold text-lg text-primary">ReviewCollect</span>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              isAuthenticated ? (
                <Button onClick={() => navigate("/dashboard")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => window.location.href = getLoginUrl()} className="text-primary">
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started Free
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04]" style={{ background: "oklch(0.22 0.065 265)", transform: "translate(30%, -20%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ background: "oklch(0.72 0.14 75)", transform: "translate(-30%, 30%)" }} />
        </div>

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm font-medium text-accent-foreground mb-8">
              <Sparkles className="w-4 h-4 text-gold" style={{ color: "oklch(0.72 0.14 75)" }} />
              <span style={{ color: "oklch(0.72 0.14 75)" }}>The smarter way to collect reviews</span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight mb-6">
              Turn Every Customer Into a{" "}
              <span style={{ color: "oklch(0.72 0.14 75)" }}>5-Star Review</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              Give your local business a QR code. Customers scan it, leave a review, and enter your giveaway — all in under a minute. No app required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
              onClick={handleGetStarted}
            className="text-base px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                Start Collecting Reviews
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12 border-border"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                See How It Works
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              {[
                { value: "QR Code", label: "Instant Setup" },
                { value: "No App", label: "Required" },
                { value: "100%", label: "Free to Start" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "oklch(0.72 0.14 75)" }} />
                  <span><strong className="text-foreground">{item.value}</strong> {item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
              <div className="navy-gradient p-8 flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">Business Dashboard</p>
                  <h3 className="font-serif text-white text-2xl font-semibold">Bella's Café</h3>
                  <div className="flex items-center gap-1 mt-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-white/80 text-sm ml-2">4.8 average · 124 reviews</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 flex flex-col items-center gap-2">
                  <div className="w-24 h-24 grid grid-cols-6 gap-0.5">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-[1px]"
                        style={{
                          background: [0,1,4,5,6,11,12,17,18,23,24,25,26,29,30,35].includes(i)
                            ? "oklch(0.22 0.065 265)"
                            : "oklch(0.95 0.008 85)",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Scan to Review</span>
                </div>
              </div>
              <div className="bg-white p-6 grid grid-cols-3 gap-4">
                {[
                  { label: "This Month", value: "47", sub: "reviews" },
                  { label: "Avg Rating", value: "4.8", sub: "out of 5" },
                  { label: "Active Campaign", value: "Win $500", sub: "giveaway" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 rounded-xl bg-secondary">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="font-serif text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-secondary/40">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A complete review collection system built specifically for local businesses.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl navy-gradient flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-primary mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From sign-up to your first review in under 10 minutes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            {steps.map((step, i) => (
              <div key={step.number} className="relative text-center">
                <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
                  <span className="font-serif font-bold text-white text-lg">{i + 1}</span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-primary mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 navy-gradient">
        <div className="container text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Grow Your Reputation?
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Join hundreds of local businesses using ReviewCollect to build trust and attract new customers.
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="text-base px-10 h-14 gold-gradient text-white border-0 hover:opacity-90 shadow-xl shadow-black/20"
          >
            Get Your QR Code Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-white">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded navy-gradient flex items-center justify-center">
              <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
            </div>
            <span className="font-serif font-semibold text-primary">ReviewCollect</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2025 ReviewCollect. Built for local businesses.</p>
        </div>
      </footer>
    </div>
  );
}
