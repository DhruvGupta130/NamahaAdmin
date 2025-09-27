import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import api from "@/lib/api";
import { DiscountType, OfferType } from "@/lib/constants";
import dayjs from "dayjs";

export default function CreateOfferModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState<keyof typeof DiscountType | null>(null);
  const [offerType, setOfferType] = useState<keyof typeof OfferType | null>(null);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const handleSubmit = async () => {
    if (!title || !couponCode || !minOrderAmount || !discount || !discountType || !offerType || !validFrom || !validUntil) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      title,
      description,
      couponCode,
      minOrderAmount: Number(minOrderAmount),
      discount: Number(discount),
      discountType,
      offerType,
      validFrom: dayjs(validFrom).toISOString(),
      validUntil: dayjs(validUntil).toISOString(),
    };

    try {
      setLoading(true);
      await api.post("/admin/offer/create", payload);
      toast.success("Offer created successfully");
      onClose();
      onSuccess?.();
      // reset form
      setTitle("");
      setDescription("");
      setCouponCode("");
      setMinOrderAmount("");
      setDiscount("");
      setDiscountType(null);
      setOfferType(null);
      setValidFrom("");
      setValidUntil("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button>Create Offer</Button>
      </DialogTrigger>
      <DialogContent className="space-y-4 max-w-2xl">
        <DialogHeader>Create New Offer</DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <Label>Coupon Code *</Label>
            <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <Label>Minimum Order Amount *</Label>
            <Input type="number" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} />
          </div>

          <div>
            <Label>Discount *</Label>
            <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>

          <div>
            <Label>Discount Type *</Label>
            <Select value={discountType || ""} onValueChange={(val) => setDiscountType(val as keyof typeof DiscountType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Discount Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DiscountType).map((dt) => (
                  <SelectItem key={dt} value={dt}>{dt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Offer Type *</Label>
            <Select value={offerType || ""} onValueChange={(val) => setOfferType(val as keyof typeof OfferType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Offer Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OfferType).map((ot) => (
                  <SelectItem key={ot} value={ot}>{ot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Valid From *</Label>
            <Input type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
          </div>

          <div>
            <Label>Valid Until *</Label>
            <Input type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
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