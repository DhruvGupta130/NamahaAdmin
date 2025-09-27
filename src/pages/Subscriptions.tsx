import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import api from "@/lib/api";
import { SubscriptionStatus } from "@/lib/constants";

interface Address {
  house: string;
  street: string;
  city: string;
  pinCode: string;
}

interface Slot {
  name: string;
  startTime: string;
  endTime: string;
}

interface Offer {
  title: string;
  couponCode: string;
  discount: number;
  discountType: "FLAT" | "PERCENTAGE";
}

interface Subscription {
  id: string;
  productTitle: string;
  productImage?: string;
  productPrice: number;
  status: keyof typeof SubscriptionStatus;
  address: Address;
  slot: Slot;
  offer?: Offer;
  startAt: string;
  endAt: string;
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
        const res = await api.get("/admin/subscriptions", { params: { pageNumber: page, pageSize } });
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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Customer Subscriptions</h2>

      {loading ? (
        <p className="text-muted-foreground">Loading subscriptions...</p>
      ) : subscriptions.length === 0 ? (
        <div className="bg-secondary/30 rounded-lg p-12 text-center">
          <p className="text-muted-foreground">No subscriptions available.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {subscriptions.map((sub) => (
              <Card key={sub.id} className="bg-secondary/30 hover:shadow-md transition">
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {sub.productImage && (
                        <img
                          src={sub.productImage}
                          alt={sub.productTitle}
                          className="w-12 h-12 rounded-lg object-cover border"
                        />
                      )}
                      <h3 className="text-lg font-semibold text-foreground">{sub.productTitle}</h3>
                      <span className="text-sm text-muted-foreground">₹{sub.productPrice}</span>
                    </div>
                    <Badge variant={sub.status === "ACTIVE" ? "default" : "secondary"}>
                      {sub.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">Slot:</span>{" "}
                      {sub.slot.name} ({sub.slot.startTime} – {sub.slot.endTime})
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Duration:</span>{" "}
                      {new Date(sub.startAt).toLocaleDateString()} → {new Date(sub.endAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Address:</span>{" "}
                      {sub.address.house}, {sub.address.street}, {sub.address.city} - {sub.address.pinCode}
                    </div>
                    {sub.offer && (
                      <div>
                        <span className="font-medium text-foreground">Offer:</span>{" "}
                        {sub.offer.title} ({sub.offer.couponCode}) - {sub.offer.discount}
                        {sub.offer.discountType === "PERCENTAGE" ? "%" : "₹"}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-2 pt-6 mb-10">
            <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <span className="self-center text-sm">Page {page + 1} of {totalPages}</span>
            <Button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
}