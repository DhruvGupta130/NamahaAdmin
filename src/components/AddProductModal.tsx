import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { compressImageToMaxSize } from "@/lib/compress";
import { set } from "date-fns";

interface Product {
  id: number;
  title: string;
  images: string[];
  description: string;
  weightInGrams: number;
  variety: string;
  category: string;
  subscriptionPrice?: number;
  durationInDays?: number;
  isSubscription?: boolean;
  oneTimePrice?: number;
  isOneTime?: boolean;
}

interface ProductForm {
  id?: number;
  title: string;
  description: string;
  category: string;
  variety: string;
  oneTimePrice: number;
  weightInGrams: number;
  subscriptionPrice: number;
  durationInDays: number;
  images?: string[];
}

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  onSave?: (form: ProductForm) => void;
}

export function AddProductModal({ open, onOpenChange, product, onSave }: AddProductModalProps) {
  const [isOneTime, setIsOneTime] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubscription, setIsSubscription] = useState<boolean>(true);
  const [varieties, setVarieties] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // fetching categories/varieties
  const [uploading, setUploading] = useState<boolean>(false); // image uploading
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null); // deleting image
  const [productData, setProductData] = useState<ProductForm>({
    title: "",
    description: "",
    category: "",
    variety: "",
    oneTimePrice: 0,
    weightInGrams: 0,
    subscriptionPrice: 0,
    durationInDays: 0,
    images: [],
  });

  // Populate form if editing
  useEffect(() => {
    if (product) {
      setProductData({
        id: product.id,
        title: product.title,
        description: product.description,
        category: product.category,
        variety: product.variety,
        oneTimePrice: product.oneTimePrice || 0,
        weightInGrams: product.weightInGrams || 0,
        subscriptionPrice: product.subscriptionPrice || 0,
        durationInDays: product.durationInDays || 0,
        images: product.images || [],
      });
      setIsOneTime(!!product.isOneTime);
      setIsSubscription(!!product.isSubscription);
    } else {
      setProductData({
        title: "",
        description: "",
        category: "",
        variety: "",
        oneTimePrice: 0,
        weightInGrams: 0,
        subscriptionPrice: 0,
        durationInDays: 0,
        images: [],
      });
      setIsOneTime(true);
      setIsSubscription(true);
    }
  }, [product, open]);

  // Fetch categories and varieties
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, varRes] = await Promise.all([
          api.get("/public/product/category"),
          api.get("/public/product/variety"),
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

  const handleDelete = async (img: string, index: number) => {
    setDeletingIndex(index);
    try {
      await api.delete("/file/delete-image", {
        params: {
          publicId: img.split("/").pop().replace(/\.[^/.]+$/, "")
        }
      });
      setProductData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== index) }));
      toast.success("Image removed successfully");
    } catch (err: any) {
      toast.error("Failed to remove image");
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    const compressedFile = await compressImageToMaxSize(file, 200);
    formData.append("file", compressedFile);
    try {
      const res = await api.post("/file/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProductData(prev => ({ ...prev, images: [...(prev.images || []), res.data.data] }));
      toast.success("Image uploaded successfully");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOneTime && !isSubscription) {
      toast.error("Please select at least one pricing option (One-Time or Subscription)");
      return;
    }
    const payload: ProductForm = {
      ...productData,
      oneTimePrice: isOneTime ? productData.oneTimePrice : null,
      subscriptionPrice: isSubscription ? productData.subscriptionPrice : null,
      durationInDays: isSubscription ? productData.durationInDays : null,
    };
    if (isOneTime && (!payload.oneTimePrice || !payload.weightInGrams)) {
      toast.error("Please provide valid one-time price and weight");
      return;
    }
    if (isSubscription && (!payload.subscriptionPrice || !payload.durationInDays)) {
      toast.error("Please provide valid subscription price and duration");
      return;
    }
    if (!payload.title.trim()) {
      toast.error("Product title is required");
      return;
    }
    if (!payload.category.trim()) {
      toast.error("Please select a category");
      return;
    }
    if (!payload.variety.trim()) {
      toast.error("Please select a variety");
      return;
    }
    if ((isOneTime || isSubscription) && payload.images?.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }
    onSave?.(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {product ? "Edit Product" : "Add Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Upload Section */}
          <div className="grid grid-cols-3 gap-4">
            {productData.images?.map((img, index) => (
              <div key={index} className="relative border rounded-lg p-2">
                <img src={img} alt={`Product ${index}`} className="w-full h-32 object-cover rounded-md" />
                <button
                  type="button"
                  onClick={() => handleDelete(img, index)}
                  disabled={deletingIndex === index}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  {deletingIndex === index ? "..." : "×"}
                </button>
              </div>
            ))}

            {productData.images.length < 3 && (
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer">
                <Upload className="w-8 h-8 mb-2 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  {uploading ? "Uploading..." : "Upload Image"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUpload(e.target.files[0]);
                    }
                  }}
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={productData.title}
                onChange={(e) =>
                  setProductData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="description">Product description</Label>
              <Textarea
                id="description"
                value={productData.description}
                onChange={(e) =>
                  setProductData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={productData.category}
                  onValueChange={(value) =>
                    setProductData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category, index) => (
                      <SelectItem key={index} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Variety</Label>
                <Select
                  value={productData.variety}
                  onValueChange={(value) =>
                    setProductData((prev) => ({ ...prev, variety: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Variety" />
                  </SelectTrigger>
                  <SelectContent>
                    {varieties.map((variety, index) => (
                      <SelectItem key={index} value={variety}>
                        {variety}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* One-Time Price */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>One-Time Price</Label>
              <Switch checked={isOneTime} onCheckedChange={setIsOneTime} />
            </div>
            {isOneTime && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>* Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      value={productData.oneTimePrice || ""}
                      onChange={(e) =>
                        setProductData((prev) => ({ ...prev, oneTimePrice: Number(e.target.value) }))
                      }
                      className="pl-7" // add padding to prevent overlap with ₹
                    />
                  </div>
                </div>
                <div>
                  <Label>Weight (gm)</Label>
                  <Input
                    value={productData.weightInGrams || ""}
                    onChange={(e) =>
                      setProductData((prev) => ({ ...prev, weightInGrams: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Subscription Price */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Subscription Details</Label>
              <Switch
                checked={isSubscription}
                onCheckedChange={setIsSubscription}
              />
            </div>
            {isSubscription && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>* Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      value={productData.subscriptionPrice || ""}
                        onChange={(e) =>
                        setProductData((prev) => ({ ...prev, subscriptionPrice: Number(e.target.value) }))
                      }
                      className="pl-7" // add padding to prevent overlap with ₹
                    />
                  </div>
                </div>
                <div>
                  <Label>Duration (Days)</Label>
                  <Input
                    value={productData.durationInDays || ""}
                    onChange={(e) =>
                      setProductData((prev) => ({ ...prev, durationInDays: Number(e.target.value) }))
                    }
                  />
                </div>
                <div>
                  <Label>Weight (gm)</Label>
                  <Input
                    value={productData.weightInGrams || ""}
                    onChange={(e) =>
                      setProductData((prev) => ({ ...prev, weightInGrams: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || uploading || deletingIndex !== null}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              {product ? "Update" : "Add"} Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}