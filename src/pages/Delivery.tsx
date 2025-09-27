import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import api from "@/lib/api";
import { DeliveryLocations } from "./DeliveryLocations";
import { toast } from "@/components/ui/sonner";

export default function Delivery() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // filters
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
      console.error("Failed to fetch deliveries:", err);
      toast.error("Failed to fetch deliveries");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDeliveries();
  }, [status, slot, keyword, pageNumber]);

  const handleUpdateStatus = async (id: string | number, status: "DELIVERED" | "CANCELLED") => {
    try {
      setLoading(true);

      await api.patch(`/admin/delivery/status/${id}`, null, {
        params: { status },
      });

      setDeliveries((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d))
      );

      toast.success(`Delivery marked as ${status}`);
    } catch (err) {
      console.error("Failed to update delivery:", err);
      toast.error("Failed to update delivery");
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr: any) => {
    if (!addr) return "";
    return [
      addr.house,
      addr.street,
      addr.area,
      addr.city,
      addr.state,
      addr.country,
      addr.pinCode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="space-y-10">
      <Tabs defaultValue="deliveries" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger
            value="deliveries"
            className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Deliveries
          </TabsTrigger>
          <TabsTrigger
            value="delivery-locations"
            className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Delivery Locations
          </TabsTrigger>
        </TabsList>

        {/* Deliveries tab */}
        <TabsContent value="deliveries" className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Filter by Status
              </label>
              <Select value={status || "ALL"} onValueChange={setStatus}>
                <SelectTrigger>
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
              <label className="text-sm font-medium text-foreground">
                Filter by slot
              </label>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="All slots" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Slots</SelectItem>
                  <SelectItem value="MORNING">Morning 5 AM to 8 AM</SelectItem>
                  <SelectItem value="EVENING">Evening 5 PM to 8 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Search by product or customer
              </label>
              <Input
                placeholder="Search name"
                value={inputKeyword}
                onChange={(e) => setInputKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setKeyword(inputKeyword); // trigger the API call
                    setPageNumber(0); // optional: reset to first page
                  }
                }}
              />
            </div>
          </div>

          {/* Deliveries Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading deliveries...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left p-4 font-medium text-foreground">#</th>
                        <th className="text-left p-4 font-medium text-foreground">Product</th>
                        <th className="text-left p-4 font-medium text-foreground">Delivery Address</th>
                        <th className="text-left p-4 font-medium text-foreground">Customer name</th>
                        <th className="text-left p-4 font-medium text-foreground">Delivery Slot</th>
                        <th className="text-left p-4 font-medium text-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!deliveries || deliveries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            No deliveries found
                          </td>
                        </tr>
                      ) : (
                        deliveries.map((delivery) => (
                          <tr key={delivery.id} className="border-t border-border">
                            <td className="p-4">{delivery.id}</td>

                            {/* Product */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                  {delivery.product.images?.[0] && (
                                    <img
                                      src={delivery.product.images[0]}
                                      alt={delivery.product.title}
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span>{delivery.product.title}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {delivery.product.weightInGrams}gm
                                  </span>
                                  <span className="text-sm text-muted-foreground">₹{delivery.finalPrice}</span>
                                </div>
                              </div>
                            </td>

                            {/* Address */}
                            <td className="p-4">
                              <div className="space-y-1">
                                <div className="text-sm text-foreground whitespace-pre-line">
                                  {formatAddress(delivery.address)}
                                </div>
                                {delivery.mapLink && (
                                  <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                                    {delivery.mapLink}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Customer */}
                            <td className="p-4">
                              <div className="space-y-1">
                                <div className="font-medium text-foreground">
                                  {delivery.customerName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {delivery.phone}
                                </div>
                              </div>
                            </td>

                            {/* Slot */}
                            <td className="p-4">
                              <div className="text-sm">
                                {delivery.scheduledAt?.name} ({delivery.scheduledAt?.startTime} - {delivery.scheduledAt?.endTime})
                              </div>
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              <Badge
                                className={
                                  delivery.status === "Delivery Pending"
                                    ? "bg-destructive text-destructive-foreground"
                                    : "bg-success text-success-foreground"
                                }
                              >
                                {delivery.status}
                              </Badge>
                            </td>

                            {/* Actions */}
                            <td className="p-4 flex gap-2 items-center justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-primary border-primary"
                                disabled={delivery.status === "DELIVERED"}
                                onClick={() => handleUpdateStatus(delivery.id, "DELIVERED")}
                              >
                                Deliver
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive border-destructive"
                                disabled={delivery.status === "CANCELLED"}
                                onClick={() => handleUpdateStatus(delivery.id, "CANCELLED")}
                              >
                                Cancel
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <Button
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 0))}
              disabled={pageNumber === 0 || loading}
            >
              Previous
            </Button>
            <span className="self-center">
              Page {pageNumber + 1} of {totalPages}
            </span>
            <Button
              onClick={() => setPageNumber((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={pageNumber + 1 >= totalPages || loading}
            >
              Next
            </Button>
          </div>
        </TabsContent>

        {/* Delivery Locations tab */}
        <TabsContent value="delivery-locations" className="space-y-6">
          <DeliveryLocations />
        </TabsContent>
      </Tabs>
    </div>
  );
}