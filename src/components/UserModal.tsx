import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { set } from "date-fns";

type User = {
  id?: string;
  name: string;
  email: string;
  mobile: string; // stores +91XXXXXXXXXX
  role: string;
  active?: boolean;
};

type UserModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSuccess?: () => void;
};

export function UserModal({ open, onOpenChange, user, onSuccess }: UserModalProps) {
  const [form, setForm] = useState<User>({
    name: "",
    email: "",
    mobile: "", // only the 10-digit number
    role: "DELIVERY",
    active: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // remove +91 when showing in input
      const mobileWithoutPrefix = user.mobile.replace(/^\+91/, "");
      setForm({ ...user, mobile: mobileWithoutPrefix });
    } else {
      setForm({ name: "", email: "", mobile: "", role: "DELIVERY", active: true });
    }
  }, [user]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // prepend +91 before sending to API
      const payload = { ...form, mobile: `+91${form.mobile}` };
      await api.post(`/admin/user/create`, payload);
      onOpenChange(false);
      onSuccess?.();
      setForm({ name: "", email: "", mobile: "", role: "DELIVERY", active: true });
    } catch (err) {
      console.error("Failed to save user", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? "Update User" : "Add User"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground select-none">
              +91
            </span>
            <Input
              placeholder="Mobile"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/, "") })}
              className="rounded-l-none"
              maxLength={10}
            />
          </div>
          <Select
            value={form.role}
            onValueChange={(val) => setForm({ ...form, role: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
              <SelectItem value="DELIVERY">DELIVERY</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : user ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}