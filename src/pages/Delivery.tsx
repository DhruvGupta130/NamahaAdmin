import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
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

const deliveries = [
  {
    id: 1,
    product: "Yellow Chamanthi",
    weight: "50 gm",
    address: "Aakriti Esta - A 705\nTellapur, Hyderabad, Telangana...",
    mapLink: "Click to view map",
    customerName: "Sreedhar Setti",
    phone: "+91 9640 93 93 91",
    deliverySlot: "Morning\n5 AM to 8:30",
    status: "Delivery Pending",
    statusColor: "destructive"
  },
  {
    id: 2,
    product: "Yellow Chamanthi", 
    weight: "50 gm",
    address: "Aakriti Esta - A 705\nTellapur, Hyderabad, Telangana...",
    mapLink: "Click to view map",
    customerName: "Sreedhar Setti",
    phone: "+91 9640 93 93 91",
    deliverySlot: "Morning\n5 AM to 8:30",
    status: "Delivery Pending",
    statusColor: "destructive"
  },
  {
    id: 3,
    product: "Yellow Chamanthi",
    weight: "50 gm", 
    address: "Aakriti Esta - A 705\nTellapur, Hyderabad, Telangana...",
    mapLink: "Click to view map",
    customerName: "Sreedhar Setti",
    phone: "+91 9640 93 93 91",
    deliverySlot: "Morning\n5 AM to 8:30",
    status: "Delivery Pending",
    statusColor: "success"
  }
];

export default function Delivery() {
  const [loading, setLoading] = useState(false);
  const [deliveryLocations, setDeliveryLocations] = useState<string[]>([]);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);

  useEffect(() => {
    const fetchDeliveryLocations = async () => {
      setLoading(true);
      try {
        const res = await api.get("/service/areas"); // Your API endpoint
        if (res.data && res.data.data) {
          // Assuming API returns array of service area names
          const locations = res.data.data.map(
            (area: any) => `${area.name} up to ${area.radiusKm} km`
          );
          setDeliveryLocations(locations);
        }
      } catch (err) {
        console.error("Failed to fetch delivery locations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryLocations();
  }, []);

  return (
    <div className="space-y-10">
      <Tabs defaultValue="deliveries" className="w-full">
        <TabsList className="grid w-full grid-cols-2 space-y-2 md:space-y-0 md:grid-cols-2 mb-6">
          <TabsTrigger value="deliveries" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Deliveries
          </TabsTrigger>
          <TabsTrigger value="delivery-locations" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">Delivery Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries" className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Filter by Date</label>
              <Button variant="outline" className="w-full justify-start text-left">
                15 Sep 2025 Today
              </Button>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground">Filter by Status</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Delivery Pending" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Delivery Pending</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground">Filter by slot</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Morning 5 AM to 8:30" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning 5 AM to 8:30</SelectItem>
                  <SelectItem value="afternoon">Afternoon 2 PM to 6 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground">Search by product</label>
              <Input placeholder="Search name" />
            </div>
          </div>

          {/* Deliveries Table */}
          <Card>
            <CardContent className="p-0">
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
                    {deliveries.map((delivery) => (
                      <tr key={delivery.id} className="border-t border-border">
                        <td className="p-4">{delivery.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <div className="w-8 h-8 bg-yellow-400 rounded-full"></div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{delivery.product}</div>
                              <div className="text-sm text-muted-foreground">{delivery.weight}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="text-sm text-foreground whitespace-pre-line">{delivery.address}</div>
                            <div className="text-sm text-blue-600 hover:underline cursor-pointer">{delivery.mapLink}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">{delivery.customerName}</div>
                            <div className="text-sm text-muted-foreground">{delivery.phone}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-foreground whitespace-pre-line">{delivery.deliverySlot}</div>
                        </td>
                        <td className="p-4">
                          <Badge className={delivery.statusColor === "destructive" ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"}>
                            {delivery.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button variant="outline" size="sm" className="text-primary border-primary">
                            {delivery.id === 3 ? "Delivered" : "Make as Delivered"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery-slots" className="space-y-6">
          <div className="bg-secondary/30 rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Delivery slots will be managed here</p>
          </div>
        </TabsContent>

        <TabsContent value="delivery-locations" className="space-y-6">
          <DeliveryLocations />
        </TabsContent>
      </Tabs>
    </div>
  );
}