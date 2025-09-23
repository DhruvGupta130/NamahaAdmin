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

interface AddCategoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCategoryAdded: (category: string) => void; // callback to update parent state
}

export function AddCategoryModal({ open, onOpenChange, onCategoryAdded }: AddCategoryModalProps) {
    const [categoryTitle, setCategoryTitle] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryTitle.trim()) return;

        setLoading(true);
        try {
            const res = await api.post("/admin/product/category", null, { params: { category: categoryTitle } });

            if (res.data.status === "CREATED") {
                toast.success("Category added successfully!");
                onCategoryAdded(categoryTitle.toUpperCase()); // update parent state
                setCategoryTitle("");
                onOpenChange(false);
            } else {
                toast.error(res.data.message || "Failed to add category");
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
                    <DialogTitle className="text-xl font-semibold">Add Category</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="categoryTitle">Category Title *</Label>
                        <Input
                            id="categoryTitle"
                            value={categoryTitle}
                            onChange={(e) => setCategoryTitle(e.target.value.trimStart())}
                            placeholder="Enter category title"
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