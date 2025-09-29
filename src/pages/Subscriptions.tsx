import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import api from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
}

interface Address {
  house: string;
  street: string;
  area?: string;
  city: string;
  pinCode: string;
  directions?: string;
}

interface Slot {
  name: string;
  startTime: string;
  endTime: string;
}

interface Item {
  id: string;
  product: {
    id: string;
    title: string;
    images?: string[];
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Subscription {
  id: string;
  status: string;
  startAt: string;
  endAt: string;
  slot: Slot;
  user: User;
  address: Address;
  couponCode?: string;
  totalAmount: number;
  discountedAmount: number;
  items: Item[];
}

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/subscriptions", {
          params: { pageNumber: page, pageSize },
        });
        setSubscriptions(res.data?.data?.content || []);
        setTotalPages(res.data?.data?.page.totalPages || 0);
      } catch {
        toast.error("Failed to fetch subscriptions");
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, [page]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground">Customer Subscriptions</h2>

      {loading ? (
        <p className="text-muted-foreground">Loading subscriptions...</p>
      ) : subscriptions.length === 0 ? (
        <div className="bg-muted/20 rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No subscriptions available.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {subscriptions.map((sub) => (
              <Card
                key={sub.id}
                className="bg-white shadow-lg border border-gray-200 rounded-xl hover:shadow-2xl transition-all duration-300"
              >
                <CardContent className="p-6 flex flex-col gap-6">

                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">
                      Subscription ID: <span className="text-gray-900">{sub.id.slice(0, 8)}</span>
                    </h3>
                    <Badge
                      className="px-3 py-1 text-xs uppercase"
                      variant={
                        sub.status === "ACTIVE"
                          ? "default"
                          : sub.status === "CANCELLED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {sub.status}
                    </Badge>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4 text-sm flex flex-col gap-1">
                    <p><span className="font-semibold">Name:</span> {sub.user.name}</p>
                    <p><span className="font-semibold">Mobile:</span> {sub.user.mobile}</p>
                    <p><span className="font-semibold">Email:</span> {sub.user.email}</p>
                    <p><span className="font-semibold">Role:</span> {sub.user.role}</p>
                  </div>

                  {/* Items */}
                  <div className="text-sm">
                    <h4 className="font-semibold mb-2 text-gray-700">Items</h4>
                    <div className="divide-y rounded-lg border border-gray-200 overflow-hidden">
                      {sub.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between px-3 py-2 bg-gray-50">
                          <div className="flex items-center gap-3">
                            {item.product.images?.[0] ? (
                              <img src={item.product.images[0]} alt={item.product.title} className="w-12 h-12 object-cover rounded" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Image</div>
                            )}
                            <span className="text-gray-800">{item.product.title} × {item.quantity}</span>
                          </div>
                          <span className="font-semibold text-gray-900">₹{item.totalPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Schedule & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-700">Schedule</h4>
                      <p>{sub.slot.name} ({sub.slot.startTime} – {sub.slot.endTime})</p>
                      <p>{new Date(sub.startAt).toLocaleDateString()} → {new Date(sub.endAt).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-700">Address</h4>
                      <p>{sub.address.house}, {sub.address.street}{sub.address.area ? `, ${sub.address.area}` : ''}, {sub.address.city} - {sub.address.pinCode}</p>
                      {sub.address.directions && <p className="text-gray-500 text-xs italic">{sub.address.directions}</p>}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="bg-gray-50 rounded-lg p-4 text-sm flex flex-col gap-1 border border-gray-200">
                    <p className="font-semibold text-gray-800">Total: <span className="text-gray-900">₹{sub.totalAmount}</span></p>
                    <p className="font-semibold text-gray-800">Discounted: <span className="text-green-600">₹{sub.discountedAmount}</span></p>
                    {sub.couponCode && <p className="font-semibold text-gray-800">Coupon: <span className="text-gray-900">{sub.couponCode}</span></p>}
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <span className="self-center text-sm text-gray-700">Page {page + 1} of {totalPages}</span>
              <Button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}