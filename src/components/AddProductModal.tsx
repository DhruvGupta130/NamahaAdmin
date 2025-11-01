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
  variety: string;
  category: string;
  isOneTime?: boolean;
  oneTimeUnits?: number;
  oneTimeType?: string;
  oneTimePrice: number;
  isSubscription?: boolean;
  subscriptionUnits?: number;
  subscriptionType?: string;
  subscriptionPrice: number;
}

interface ProductForm {
  id?: number;
  title: string;
  description: string;
  category: string;
  variety: string;
  oneTimeUnits?: number;
  oneTimeType?: string;
  oneTimePrice: number;
  subscriptionUnits?: number;
  subscriptionType?: string;
  subscriptionPrice: number;
  images?: string[];
}

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  onSave?: (form: ProductForm) => void;
}

const UNIT_TYPES = ["GMS", "KGS", "BUNCHES", "PIECES", "ML"];

export function AddProductModal({ open, onOpenChange, product, onSave }: AddProductModalProps) {
  const [isOneTime, setIsOneTime] = useState<boolean>(true);
  const [isSubscription, setIsSubscription] = useState<boolean>(true);
  const [varieties, setVarieties] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // fetching categories/varieties
  const [uploading, setUploading] = useState<boolean>(false); // image uploading
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null); // deleting image
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productData, setProductData] = useState<ProductForm>({
    title: "",
    description: "",
    category: "",
    variety: "",
    oneTimeUnits: 0,
    oneTimeType: "GMS",
    oneTimePrice: 0,
    subscriptionUnits: 0,
    subscriptionType: "GMS",
    subscriptionPrice: 0,
    images: [],
  });

  // Load categories and varieties
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
      } catch {
        toast.error("Failed to load categories or varieties");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (product) {
      setProductData({
        id: product.id,
        title: product.title,
        description: product.description,
        category: product.category,
        variety: product.variety,
        oneTimeUnits: product.oneTimeUnits || 0,
        oneTimeType: product.oneTimeType || "GMS",
        oneTimePrice: product.oneTimePrice || 0,
        subscriptionUnits: product.subscriptionUnits || 0,
        subscriptionType: product.subscriptionType || "GMS",
        subscriptionPrice: product.subscriptionPrice || 0,
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
        oneTimeUnits: 0,
        oneTimeType: "GMS",
        oneTimePrice: 0,
        subscriptionUnits: 0,
        subscriptionType: "GMS",
        subscriptionPrice: 0,
        images: [],
      });
      setIsOneTime(true);
      setIsSubscription(true);
    }
  }, [product, open]);

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
    if (!productData.title.trim() || !productData.category || !productData.variety) {
      toast.error("Please fill all required fields");
      return;
    }
    const payload: ProductForm = {
      ...productData,
      oneTimePrice: isOneTime ? productData.oneTimePrice : null,
      subscriptionPrice: isSubscription ? productData.subscriptionPrice : null,
    };
    if (isOneTime && (!payload.oneTimePrice || !payload.oneTimeUnits || payload.oneTimeUnits <= 0 || !payload.oneTimeType)) {
      toast.error("Please provide valid one-time price and units");
      return;
    }
    if (isSubscription && (!payload.subscriptionPrice || !payload.subscriptionUnits || payload.subscriptionUnits <= 0 || !payload.subscriptionType)) {
      toast.error("Please provide valid subscription price and units");
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
                className="border-orange-400 border-2 rounded-md focus:border-none"
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
                className="border-orange-400 border-2 rounded-md focus:border-none"
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
                  <SelectTrigger className="border-orange-400 border-2 rounded-md focus:border-none">
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
                  <SelectTrigger className="border-orange-400 border-2 rounded-md focus:border-none">
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
              <Switch 
                checked={isOneTime}
                onCheckedChange={setIsOneTime}
                className="data-[state=unchecked]:bg-gray-300"
              />
            </div>
            {isOneTime && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Units</Label>
                  <Input
                    type="number"
                    value={productData.oneTimeUnits || ""}
                    onChange={(e) =>
                      setProductData((p) => ({ ...p, oneTimeUnits: +e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Unit Type</Label>
                  <Select
                    value={productData.oneTimeType}
                    onValueChange={(v) =>
                      setProductData((p) => ({ ...p, oneTimeType: v }))
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {UNIT_TYPES.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      value={productData.oneTimePrice || ""}
                      onChange={(e) =>
                        setProductData((prev) => ({ ...prev, oneTimePrice: Number(e.target.value) }))
                      }
                      className="border-orange-400 border-2 rounded-md focus:border-none pl-7" // add padding to prevent overlap with ₹
                    />
                  </div>
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
                className="data-[state=unchecked]:bg-gray-300"
              />
            </div>
            {isSubscription && (
              <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Units</Label>
                <Input
                  type="number"
                  value={productData.subscriptionUnits || ""}
                  onChange={(e) =>
                    setProductData((p) => ({ ...p, subscriptionUnits: +e.target.value }))
                  }
                />
              </div>
              <div>
              <Label>Unit Type</Label>
                  <Select
                    value={productData.subscriptionType}
                    onValueChange={(v) =>
                      setProductData((p) => ({ ...p, subscriptionType: v }))
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {UNIT_TYPES.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    value={productData.subscriptionPrice || ""}
                    onChange={(e) =>
                      setProductData((p) => ({ ...p, subscriptionPrice: +e.target.value }))
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