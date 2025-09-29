import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import api from "@/lib/api";
import { DiscountType, PurchaseType } from "@/lib/constants";
import dayjs from "dayjs";

type OfferForm = {
  title: string;
  description: string;
  couponCode: string;
  minOrderAmount: string;
  discount: string;
  discountType: keyof typeof DiscountType | "";
  purchaseType: keyof typeof PurchaseType | "";
  validFrom: string;
  validUntil: string;
};

const initialForm: OfferForm = {
  title: "",
  description: "",
  couponCode: "",
  minOrderAmount: "",
  discount: "",
  discountType: "",
  purchaseType: "",
  validFrom: "",
  validUntil: "",
};

export default function CreateOfferModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState<OfferForm>(initialForm);
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof OfferForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    // Basic validation
    if (
      !form.title ||
      !form.couponCode ||
      !form.minOrderAmount ||
      !form.discount ||
      !form.discountType ||
      !form.purchaseType ||
      !form.validFrom ||
      !form.validUntil
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (dayjs(form.validUntil).isBefore(dayjs(form.validFrom))) {
      toast.error("Valid Until must be after Valid From");
      return;
    }

    const payload = {
      ...form,
      minOrderAmount: Number(form.minOrderAmount),
      discount: Number(form.discount),
      validFrom: dayjs(`${form.validFrom}T00:00:00`).toISOString(),
      validUntil: dayjs(`${form.validUntil}T23:59:59`).toISOString(),
    };

    try {
      setLoading(true);
      await api.post("/admin/offer/create", payload);
      toast.success("Offer created successfully");
      setForm(initialForm);
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="space-y-4 max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Offer</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="border border-orange-400 border-2 rounded-md focus:border-none"
              required
            />
          </div>

          <div>
            <Label htmlFor="couponCode">Coupon Code *</Label>
            <Input
              id="couponCode"
              value={form.couponCode.toUpperCase()}
              onChange={(e) => updateField("couponCode", e.target.value)}
              className="border border-orange-400 border-2 rounded-md focus:border-none"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Optional"
              className="border border-orange-400 border-2 rounded-md focus:border-none"
            />
          </div>

          <div>
            <Label>Minimum Order Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => updateField("minOrderAmount", e.target.value)}
                className="border border-orange-400 border-2 rounded-md focus:border-none pl-7"
                required
              />
            </div>
          </div>

          <div>
            <Label>Discount *</Label>
            <Input
              type="number"
              value={form.discount}
              onChange={(e) => updateField("discount", e.target.value)}
              className="border border-orange-400 border-2 rounded-md focus:border-none"
              required
            />
          </div>

          <div>
            <Label>Discount Type *</Label>
            <Select
              value={form.discountType}
              onValueChange={(val) => updateField("discountType", val)}
            >
              <SelectTrigger className="border border-orange-400 border-2 rounded-md focus:border-none">
                <SelectValue placeholder="Select Discount Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DiscountType).map((dt) => (
                  <SelectItem key={dt} value={dt}>
                    {dt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Purchase Type *</Label>
            <Select
              value={form.purchaseType}
              onValueChange={(val) => updateField("purchaseType", val)}
            >
              <SelectTrigger className="border border-orange-400 border-2 rounded-md focus:border-none">
                <SelectValue placeholder="Select Purchase Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PurchaseType).map((ot) => (
                  <SelectItem key={ot} value={ot}>
                    {ot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Valid From *</Label>
            <Input
              type="date"
              value={form.validFrom}
              onChange={(e) => updateField("validFrom", e.target.value)}
              className="border border-orange-400 border-2 rounded-md focus:border-none"
              required
            />
          </div>

          <div>
            <Label>Valid Until *</Label>
            <Input
              type="date"
              value={form.validUntil}
              onChange={(e) => updateField("validUntil", e.target.value)}
              className="border border-orange-400 border-2 rounded-md focus:border-none"
              required
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Offer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}