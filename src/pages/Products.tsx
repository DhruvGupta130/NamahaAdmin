import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash } from "lucide-react";
import { AddProductModal } from "@/components/AddProductModal";
import api from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { AxiosResponse } from "axios";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  oneTimePrice: number;
  weightInGrams: number;
  subscriptionPrice: number;
  images?: string[];
}

export default function Products() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10); // or whatever default
  const [totalPages, setTotalPages] = useState(0);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/public/product/category");
      setCategories(res.data?.data || []);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { pageNumber: page, pageSize };
      if (selectedCategory !== "ALL") params.category = selectedCategory;
      const res = await api.get("/admin/product/all", { params });
      setTotalPages(res.data?.data?.page.totalPages || 0);
      setProducts(res.data.data.content || []);
    } catch (err: any) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory]);

  // Delete product
  const deleteProduct = async (id: number) => {
    try {
      const res = await api.delete(`/admin/product/delete/${id}`);
      if (res.data.status === 'OK') {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success(res.data.data?.message || "Product deleted successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  };

  // Handle saving from modal
  const handleSave = async (productForm: ProductForm) => {
    setLoading(true);
    console.log(productForm);
    try {
      let response: AxiosResponse<any, any, {}>;
      if (editProduct?.id) {
        // Update existing product
        response = await api.put(`/admin/product/update/${editProduct.id}`, productForm);
        toast.success(response.data?.message || "Product updated successfully!");
      } else {
        // Add new product
        response = await api.post("/admin/product/create", productForm);
        toast.success(response.data?.message || "Product added successfully!");
      }

      if (response.data.status === "OK" || response.data.status === "CREATED") {
        await fetchProducts();
        setShowAddModal(false);
        setEditProduct(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">All Products</h1>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          + Add Product
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs
        value={selectedCategory}
        onValueChange={(v) => {
          setPage(0);
          setSelectedCategory(v);
        }}
      >
        <TabsList className="flex flex-wrap justify-start gap-2 bg-secondary/30 p-2 rounded-xl">
          <TabsTrigger value="ALL">All</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading products...</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-foreground">#</th>
                    <th className="text-left p-4 font-medium text-foreground">Product</th>
                    <th className="text-left p-4 font-medium text-foreground">Subscription</th>
                    <th className="text-left p-4 font-medium text-foreground">One-Time</th>
                    <th className="text-left p-4 font-medium text-foreground">Category</th>
                    <th className="text-left p-4 font-medium text-foreground">Variety</th>
                    <th className="text-left p-4 font-medium text-foreground">Type</th>
                    <th className="text-left p-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, idx) => (
                    <tr key={product.id} className="border-t border-border">
                      <td className="p-4">{idx + 1}</td>
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-yellow-400 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{product.title}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-foreground">
                          {product.isSubscription ? `₹${product.subscriptionPrice}` : "-"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.isSubscription ? `${product.subscriptionUnits} ${product.subscriptionType}` : null}
                        </div>
                      </td>
                       <td className="p-4">
                        <div className="font-medium text-foreground">
                          {product.isOneTime ? `₹${product.oneTimePrice}` : "-"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.isOneTime ? `${product.oneTimeUnits} ${product.oneTimeType}` : null}
                        </div>
                      </td>
                      <td className="p-4">{product.category}</td>
                      <td className="p-4">{product.variety}</td>
                      <td className="p-4">
                        {product.isSubscription && product.isOneTime
                          ? "Subscription & One-Time"
                          : product.isSubscription
                            ? "Subscription"
                            : product.isOneTime
                              ? "One-Time"
                              : "-"}
                      </td>
                      <td className="p-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary"
                          onClick={() => setEditProduct(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-4 mb-10">
                    <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                    <span className="self-center">Page {page + 1} of {totalPages}</span>
                    <Button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Product Modal */}
      <AddProductModal
        open={showAddModal || !!editProduct}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setEditProduct(null);
          }
        }}
        product={editProduct || undefined}
        onSave={handleSave}
      />
    </div>
  );
}