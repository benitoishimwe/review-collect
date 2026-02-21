import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { Trophy, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, DollarSign } from "lucide-react";
type Campaign = {
  id: number;
  businessId: number;
  title: string;
  incentiveTitle: string | null;
  incentiveDescription: string | null;
  incentiveValue: string | null;
  isActive: "yes" | "no";
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type CampaignForm = {
  title: string;
  incentiveTitle: string;
  incentiveDescription: string;
  incentiveValue: string;
  isActive: "yes" | "no";
};

const emptyForm: CampaignForm = {
  title: "",
  incentiveTitle: "",
  incentiveDescription: "",
  incentiveValue: "",
  isActive: "yes",
};

export default function Campaigns() {
  const utils = trpc.useUtils();
  const { data: campaigns, isLoading } = trpc.campaign.list.useQuery();
  const { data: business } = trpc.business.get.useQuery();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState<CampaignForm>(emptyForm);

  const create = trpc.campaign.create.useMutation({
    onSuccess: () => {
      toast.success("Campaign created successfully");
      utils.campaign.list.invalidate();
      setOpen(false);
      setForm(emptyForm);
    },
    onError: (err) => toast.error(err.message),
  });

  const update = trpc.campaign.update.useMutation({
    onSuccess: () => {
      toast.success("Campaign updated");
      utils.campaign.list.invalidate();
      setOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteCampaign = trpc.campaign.delete.useMutation({
    onSuccess: () => {
      toast.success("Campaign deleted");
      utils.campaign.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({
      title: c.title,
      incentiveTitle: c.incentiveTitle ?? "",
      incentiveDescription: c.incentiveDescription ?? "",
      incentiveValue: c.incentiveValue ? String(c.incentiveValue) : "",
      isActive: c.isActive,
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      incentiveTitle: form.incentiveTitle || undefined,
      incentiveDescription: form.incentiveDescription || undefined,
      incentiveValue: form.incentiveValue ? parseFloat(form.incentiveValue) : undefined,
      isActive: form.isActive,
    };
    if (editing) {
      update.mutate({ id: editing.id, ...payload });
    } else {
      create.mutate(payload);
    }
  };

  const toggleActive = (c: Campaign) => {
    update.mutate({ id: c.id, isActive: c.isActive === "yes" ? "no" : "yes" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 py-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary">Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Configure incentives and giveaways to motivate customers to leave reviews.
            </p>
          </div>
          <Button
            onClick={openCreate}
            disabled={!business}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" /> New Campaign
          </Button>
        </div>

        {!business && (
          <Card className="border-border bg-amber-50 border-amber-200">
            <CardContent className="p-4 text-sm text-amber-800">
              Please set up your business profile before creating campaigns.
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="border-border shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif font-semibold text-lg text-primary truncate">
                          {campaign.title}
                        </h3>
                        <Badge
                          variant={campaign.isActive === "yes" ? "default" : "secondary"}
                          className={campaign.isActive === "yes" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : ""}
                        >
                          {campaign.isActive === "yes" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {campaign.incentiveTitle && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Trophy className="w-4 h-4 text-accent" />
                          <span className="font-medium text-foreground">{campaign.incentiveTitle}</span>
                          {campaign.incentiveValue && (
                            <span className="text-muted-foreground">· ${Number(campaign.incentiveValue).toFixed(0)} value</span>
                          )}
                        </div>
                      )}
                      {campaign.incentiveDescription && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {campaign.incentiveDescription}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleActive(campaign)}
                        title={campaign.isActive === "yes" ? "Deactivate" : "Activate"}
                      >
                        {campaign.isActive === "yes" ? (
                          <ToggleRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(campaign)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("Delete this campaign?")) deleteCampaign.mutate({ id: campaign.id });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border border-dashed">
            <CardContent className="p-12 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-serif text-lg font-semibold text-primary mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Create your first campaign to start incentivizing customer reviews.
              </p>
              <Button onClick={openCreate} disabled={!business} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Create Campaign
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editing ? "Edit Campaign" : "New Campaign"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Name <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="e.g. Summer Review Drive"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incentiveTitle" className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Incentive / Prize Title
              </Label>
              <Input
                id="incentiveTitle"
                placeholder="e.g. Win $500 Gift Card"
                value={form.incentiveTitle}
                onChange={(e) => setForm((f) => ({ ...f, incentiveTitle: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incentiveValue" className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Prize Value ($)
              </Label>
              <Input
                id="incentiveValue"
                type="number"
                min="0"
                step="0.01"
                placeholder="500.00"
                value={form.incentiveValue}
                onChange={(e) => setForm((f) => ({ ...f, incentiveValue: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incentiveDescription">Incentive Description</Label>
              <Textarea
                id="incentiveDescription"
                placeholder="Leave a review and be entered to win a $500 gift card! Winner announced monthly."
                value={form.incentiveDescription}
                onChange={(e) => setForm((f) => ({ ...f, incentiveDescription: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <Label>Status</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForm((f) => ({ ...f, isActive: f.isActive === "yes" ? "no" : "yes" }))}
                className={form.isActive === "yes" ? "border-emerald-300 text-emerald-700 bg-emerald-50" : ""}
              >
                {form.isActive === "yes" ? "Active" : "Inactive"}
              </Button>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={create.isPending || update.isPending}
                className="bg-primary text-primary-foreground"
              >
                {create.isPending || update.isPending ? "Saving..." : editing ? "Save Changes" : "Create Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
