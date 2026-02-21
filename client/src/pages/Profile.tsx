import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Building2, Save, Globe, Phone, MapPin } from "lucide-react";

export default function Profile() {
  const { data: business, isLoading, refetch } = trpc.business.get.useQuery();
  const upsert = trpc.business.upsert.useMutation({
    onSuccess: () => {
      toast.success("Business profile saved successfully");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name ?? "",
        description: business.description ?? "",
        website: business.website ?? "",
        phone: business.phone ?? "",
        address: business.address ?? "",
      });
    }
  }, [business]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Business name is required");
      return;
    }
    upsert.mutate(form);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 py-2">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Business Profile</h1>
          <p className="text-muted-foreground mt-1">
            Your business information is displayed on the customer review page.
          </p>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-xl flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent" />
              Business Details
            </CardTitle>
            <CardDescription>
              Fill in your business information. This will appear on your review collection page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Business Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Bella's Café"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers a bit about your business..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="(555) 123-4567"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://yourbusiness.com"
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Address
                </Label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, State 12345"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="h-11"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={upsert.isPending || isLoading}
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {upsert.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Profile
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {business && (
          <Card className="border-border shadow-sm bg-secondary/40">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">Your review page URL</p>
              <p className="font-mono text-sm text-primary font-medium break-all">
                {window.location.origin}/review/{business.slug}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
