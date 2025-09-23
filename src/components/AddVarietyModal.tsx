import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "@/components/ui/sonner";

interface AddVarietyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVarietyAdded: (variety: string) => void; // callback to update parent state
}

export function AddVarietyModal({ open, onOpenChange, onVarietyAdded }: AddVarietyModalProps) {
  const [varietyTitle, setVarietyTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!varietyTitle.trim()) return;

    setLoading(true);
    try {
      const res = await api.post("/admin/product/variety", null, { params: { variety: varietyTitle } });
      if (res.data.status === "CREATED") {
        toast.success("Variety added successfully!");
        onVarietyAdded(varietyTitle.toUpperCase()); // update parent state
        setVarietyTitle("");
        onOpenChange(false);
      } else {
        toast.error(res.data.message || "Failed to add variety");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Variety</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="varietyTitle">Variety Title *</Label>
            <Input
              id="varietyTitle"
              value={varietyTitle}
              onChange={(e) => setVarietyTitle(e.target.value.trimStart())}
              placeholder="Enter variety title"
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}