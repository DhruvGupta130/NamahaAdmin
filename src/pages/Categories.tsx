import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { AddVarietyModal } from "@/components/AddVarietyModal";
import { AddCategoryModal } from "@/components/AddCategoryModal";
import api from "@/lib/api"; // your axios instance
import { toast } from "@/components/ui/sonner";

export default function Categories() {
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [varieties, setVarieties] = useState<string[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);
  const [showAddVarietyModal, setShowAddVarietyModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, varRes] = await Promise.all([
          api.get("/public/product/category"),
          api.get("/public/product/variety")
        ]);
        setCategories(catRes.data.data || []);
        setVarieties(varRes.data.data || []);
      } catch (err: any) {
        toast.error("Failed to load categories or varieties");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addCategory = async (name: string) => {
    try {
      const res = await api.post("/admin/product/category", null, { params: { category: name } });
      if (res.data.status === "CREATED") {
        setCategories(prev => [...prev, name]);
        toast.success(res.data.message || "Category added!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add category");
    }
  };

  const addVariety = async (name: string) => {
    try {
      const res = await api.post("/admin/product/variety", null, { params: { variety: name } });
      if (res.data.status === "CREATED") {
        setVarieties(prev => [...prev, name]);
        toast.success(res.data?.message || "Variety added!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add variety");
    }
  };

  const deleteCategory = async (name: string) => {
    try {
      const res = await api.delete("/admin/product/category", { params: { category: name } });
      if (res.data.status === "OK") {
        setCategories(prev => prev.filter(c => c !== name));
        toast.success(res.data?.message || "Category deleted!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  const deleteVariety = async (name: string) => {
    try {
      const res = await api.delete("/admin/product/variety", { params: { variety: name } });
      if (res.data.status === "OK") {
        setVarieties(prev => prev.filter(v => v !== name));
        toast.success("Variety deleted!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete variety");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">All Categories</h2>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading categories...</div>
          ) : (
            <>
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <Card key={index} className="bg-secondary/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="text-foreground font-medium">{category}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteCategory(category)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={() => setShowAddCategoryModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                + Add Category
              </Button>
            </>
          )}
        </div>

        {/* Varieties */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">All Variety</h2>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading varieties...</div>
          ) : (
            <>
              <div className="space-y-3">
                {varieties.map((variety, index) => (
                  <Card key={index} className="bg-secondary/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="text-foreground font-medium">{variety}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteVariety(variety)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={() => setShowAddVarietyModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                + Add Variety
              </Button>
            </>
          )}
        </div>
      </div>

      <AddCategoryModal
        open={showAddCategoryModal}
        onOpenChange={setShowAddCategoryModal}
        onCategoryAdded={addCategory}
      />

      <AddVarietyModal
        open={showAddVarietyModal}
        onOpenChange={setShowAddVarietyModal}
        onVarietyAdded={addVariety}
      />
    </div>
  );
}