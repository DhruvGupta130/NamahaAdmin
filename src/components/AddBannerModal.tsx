import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Upload } from "lucide-react";

interface AddBannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBannerModal({ open, onOpenChange }: AddBannerModalProps) {
  const [formData, setFormData] = useState({
    bannerTitle: "",
    subTitle: "",
    backgroundImage: null as File | null,
    linkToProduct: "",
    linkTab: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Adding banner:", formData);
    onOpenChange(false);
    setFormData({
      bannerTitle: "",
      subTitle: "",
      backgroundImage: null,
      linkToProduct: "",
      linkTab: ""
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, backgroundImage: file }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Add Product</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bannerTitle">Banner Title *</Label>
            <Input
              id="bannerTitle"
              value={formData.bannerTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, bannerTitle: e.target.value }))}
              placeholder="Enter banner title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subTitle">Sub Title *</Label>
            <Input
              id="subTitle"
              value={formData.subTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subTitle: e.target.value }))}
              placeholder="Enter sub title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Background Image</Label>
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />
              <label htmlFor="imageUpload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-primary font-medium">Upload Image*</div>
                {formData.backgroundImage && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {formData.backgroundImage.name}
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Link to product</Label>
              <Select 
                value={formData.linkToProduct} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, linkToProduct: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select form dropdown" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product1">Product 1</SelectItem>
                  <SelectItem value="product2">Product 2</SelectItem>
                  <SelectItem value="product3">Product 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Link Tab</Label>
              <Select 
                value={formData.linkTab} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, linkTab: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select form dropdown" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="categories">Categories</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}