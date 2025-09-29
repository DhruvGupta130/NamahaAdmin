import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { DeliveryLocations } from "./DeliveryLocations";
import { toast } from "@/components/ui/sonner";

export default function Delivery() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [slot, setSlot] = useState<string>("ALL");
  const [inputKeyword, setInputKeyword] = useState("");
  const [keyword, setKeyword] = useState("");
  const pageSize = 10;

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/deliveries", {
        params: {
          pageNumber,
          pageSize,
          slot: slot === "ALL" ? "" : slot,
          status: status === "ALL" ? "" : status,
          keyword,
        },
      });
      setDeliveries(res.data.data.content || []);
      setTotalPages(res.data.data.page.totalPages || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [status, slot, keyword, pageNumber]);

  const handleUpdateStatus = async (id: string, newStatus: "DELIVERED" | "CANCELLED") => {
    try {
      setLoading(true);
      await api.patch(`/admin/delivery/status/${id}`, null, { params: { status: newStatus } });
      setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
      toast.success(`Delivery marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update delivery");
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr: any) => {
    if (!addr) return "";
    return [addr.house, addr.street, addr.area, addr.city, addr.state, addr.country, addr.pinCode]
      .filter(Boolean)
      .join(", ");
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500 text-white";
      case "DELIVERED":
        return "bg-green-600 text-white";
      case "CANCELLED":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="deliveries" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="deliveries" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Deliveries
          </TabsTrigger>
          <TabsTrigger value="delivery-locations" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Delivery Locations
          </TabsTrigger>
        </TabsList>

        {/* Deliveries Tab */}
        <TabsContent value="deliveries" className="space-y-6">

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Filter by Status</label>
              <Select value={status || "ALL"} onValueChange={setStatus}>
                <SelectTrigger className="border border-orange-400 rounded-md focus:border-none">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Filter by Slot</label>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger className="border border-orange-400 rounded-md focus:border-none">
                  <SelectValue placeholder="All slots" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Slots</SelectItem>
                  <SelectItem value="MORNING">Morning 5 AM - 8 AM</SelectItem>
                  <SelectItem value="EVENING">Evening 5 PM - 8 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground">Search by Product or Customer</label>
              <Input
                placeholder="Enter keyword"
                value={inputKeyword}
                onChange={(e) => setInputKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setKeyword(inputKeyword); setPageNumber(0); } }}
                className="border border-orange-400 rounded-md focus:border-none"
              />
            </div>
          </div>

          {/* Delivery Cards */}
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading deliveries...</div>
          ) : deliveries.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-secondary/20 rounded-lg">No deliveries found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {deliveries.map((delivery) => (
                <Card key={delivery.id} className="shadow-md hover:shadow-lg transition border border-gray-200">
                  <CardContent className="space-y-4 p-5">

                    {/* Header: Customer & Status */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-lg">{delivery.customerName}</div>
                        <div className="text-sm text-muted-foreground">{delivery.customerMobile}</div>
                      </div>
                      <Badge className={getStatusBadgeColor(delivery.status)}>
                        {delivery.status}
                      </Badge>
                    </div>

                    {/* Products */}
                    <div className="space-y-2">
                      {delivery.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 border-b border-gray-200 pb-2">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            {item.product.images?.[0] && <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-contain rounded" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.product.title}</span>
                            <span className="text-sm text-muted-foreground">{item.quantity} × ₹{item.unitPrice}</span>
                            <span className="text-sm font-semibold">₹{item.totalPrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Address & Slot */}
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div><span className="font-medium text-foreground">Address:</span> {formatAddress(delivery.address)}</div>
                      {delivery.address?.directions && <div className="italic text-xs">Directions: {delivery.address.directions}</div>}
                      <div><span className="font-medium text-foreground">Slot:</span> {delivery.scheduledAt?.name} ({delivery.scheduledAt?.startTime} - {delivery.scheduledAt?.endTime})</div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={delivery.status === "DELIVERED" || delivery.status === "CANCELLED"}
                        onClick={() => handleUpdateStatus(delivery.id, "DELIVERED")}
                        className="text-green-600 border-green-600"
                      >
                        {delivery.status === "DELIVERED" ? "Delivered" : "Mark as Delivered"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={delivery.status === "CANCELLED" || delivery.status === "DELIVERED"}
                        onClick={() => handleUpdateStatus(delivery.id, "CANCELLED")}
                        className="text-red-600 border-red-600"
                      >
                        {delivery.status === "CANCELLED" ? "Cancelled" : "Cancel"}
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button onClick={() => setPageNumber((p) => Math.max(p - 1, 0))} disabled={pageNumber === 0 || loading}>
                Previous
              </Button>
              <span className="self-center">Page {pageNumber + 1} of {totalPages}</span>
              <Button onClick={() => setPageNumber((p) => Math.min(p + 1, totalPages - 1))} disabled={pageNumber + 1 >= totalPages || loading}>
                Next
              </Button>
            </div>
          )}

        </TabsContent>

        <TabsContent value="delivery-locations">
          <DeliveryLocations />
        </TabsContent>
      </Tabs>
    </div>
  );
}