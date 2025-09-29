import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "@/components/ui/sonner";

type Customer = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  orders: number;
  subscriptionRevenue: number;
  totalRevenue: number;
  active?: boolean;
};

type PageMeta = {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState(""); // only applied on Enter
  const [page, setPage] = useState<PageMeta>({ size: 10, number: 0, totalElements: 0, totalPages: 0 });
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Fetch customers from API
  const fetchCustomers = async (pageNumber = 0, pageSize = 10, keyword = "") => {
    setLoading(true);
    try {
      const res = await api.get("/admin/user/customer", { params: { pageNumber, pageSize, keyword } });
      setCustomers(res.data.data.content || []);
      setPage(res.data.data.page);
    } catch (err) {
      console.error("Failed to fetch customers", err);
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  // Toggle active status
  const toggleUserActive = async (userId: string) => {
    setTogglingUserId(userId);
    const updatedUsers = customers.map(user =>
      user.id === userId ? { ...user, active: !user.active } : user
    );
    setCustomers(updatedUsers);

    try {
      await api.patch(`/admin/user/update/${userId}`);
      toast.success("User status updated successfully");
    } catch (err) {
      console.error("Failed to update user status", err);
      toast.error("Failed to update user status");
      setCustomers(customers); // rollback
    } finally {
      setTogglingUserId(null);
    }
  };

  // Initial load + reload on appliedSearch/page
  useEffect(() => {
    fetchCustomers(page.number, page.size, appliedSearch);
  }, [appliedSearch, page.number, page.size]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(prev => ({ ...prev, number: 0 })); // reset to first page on search
      setAppliedSearch(searchTerm.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium mb-2">Search by name/email/mobile</label>
              <Input
                placeholder="Search customers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                disabled={loading}
                className="border border-orange-400 border-2 rounded-md focus:border-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">Loading customers...</div>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader className="bg-accent/50">
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Subscription Amount</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer, index) => (
                    <TableRow key={customer.id}>
                      <TableCell>{index + 1 + page.number * page.size}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.mobile}</TableCell>
                      <TableCell>{customer.orders ?? 0}</TableCell>
                      <TableCell>₹{customer.subscriptionRevenue ?? 0}</TableCell>
                      <TableCell>₹{customer.totalRevenue ?? 0}</TableCell>
                      <TableCell>
                        <Switch
                          className="data-[state=unchecked]:bg-gray-200"
                          checked={customer.active ?? true}
                          onCheckedChange={() => toggleUserActive(customer.id)}
                          disabled={togglingUserId === customer.id}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {customers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {page.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              disabled={page.number === 0 || loading}
              onClick={() => setPage(prev => ({ ...prev, number: prev.number - 1 }))}
            >
              Prev
            </Button>
            <span>Page {page.number + 1} of {page.totalPages}</span>
            <Button
              disabled={page.number + 1 >= page.totalPages || loading}
              onClick={() => setPage(prev => ({ ...prev, number: prev.number + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}