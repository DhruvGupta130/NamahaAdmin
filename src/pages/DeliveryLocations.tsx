import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { toast } from "@/components/ui/sonner"; // optional toast notifications
import { AddDeliveryLocationModal } from "@/components/AddDeliveryLocationModal"; // we'll create this

import api from "@/lib/api"; // your axios instance

export interface ServiceAreaDto {
    id: number;
    name: string;
    city: string;
    state: string;
    pinCode: string;
    latitude: number;
    longitude: number;
    radiusKm: number;
    deliveryCharge: number;
    active: boolean;
}

export function DeliveryLocations() {
    const [deliveryLocations, setDeliveryLocations] = useState<ServiceAreaDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<ServiceAreaDto | null>(null);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10); // or whatever default
    const [totalPages, setTotalPages] = useState(0);

    // Fetch all delivery locations
    useEffect(() => {
        const fetchDeliveryLocations = async () => {
            setLoading(true);
            try {
                const res = await api.get("/admin/service/areas", { params: { pageNumber: page, pageSize } });
                setDeliveryLocations(res.data?.data?.content || []);
                setTotalPages(res.data?.data?.page.totalPages || 0);
            } catch (err: any) {
                toast.error("Failed to fetch delivery locations");
            } finally {
                setLoading(false);
            }
        };
        fetchDeliveryLocations();
    }, [page]);

    // Delete a delivery location
    const deleteLocation = async (id: number) => {
        try {
            await api.delete(`/admin/service/areas/${id}`);
            setDeliveryLocations((prev) => prev.filter((loc) => loc.id !== id));
            toast.success("Location deleted!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete location");
        }
    };

    // Open modal for editing
    const editLocation = (location: ServiceAreaDto) => {
        setEditingLocation(location);
        setModalOpen(true);
    };

    // Callback after adding/updating location
    const onLocationSaved = (location: ServiceAreaDto) => {
        if (editingLocation) {
            // Update
            setDeliveryLocations((prev) =>
                prev.map((loc) => (loc.id === location.id ? location : loc))
            );
        } else {
            // Add new
            setDeliveryLocations((prev) => [...prev, location]);
        }
        setModalOpen(false);
        setEditingLocation(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Delivery Locations</h2>
                <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setModalOpen(true)}
                >
                    + Add Location
                </Button>
            </div>

            {loading ? (
                <p className="text-muted-foreground">Loading locations...</p>
            ) : (
                <div className="space-y-3">
                        {deliveryLocations.map((location) => (
                            <Card key={location.id} className="bg-secondary/30 border-orange-400 border-2">
                                <CardContent className="p-4 flex flex-col gap-3">
                                    {/* Top Row: Name + Actions */}
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-foreground">
                                            {location.name}
                                        </h3>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => editLocation(location)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => deleteLocation(location.id)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground">
                                        <div>
                                            <span className="font-medium text-foreground">City:</span>{" "}
                                            {location.city}
                                        </div>
                                        <div>
                                            <span className="font-medium text-foreground">State:</span>{" "}
                                            {location.state}
                                        </div>
                                        <div>
                                            <span className="font-medium text-foreground">Pincode:</span>{" "}
                                            {location.pinCode}
                                        </div>
                                        <div>
                                            <span className="font-medium text-foreground">Latitude:</span>{" "}
                                            {location.latitude}
                                        </div>
                                        <div>
                                            <span className="font-medium text-foreground">Longitude:</span>{" "}
                                            {location.longitude}
                                        </div>
                                        <div>
                                            <span className="font-medium text-foreground">Radius:</span>{" "}
                                            {location.radiusKm} km
                                        </div>
                                        <div>
                                            <span className="font-medium text-foreground">Delivery Charge:</span>{" "}
                                            ₹{location.deliveryCharge}
                                        </div>
                                        <div>
                                            <span className="font-medium text-foreground">Status:</span>{" "}
                                            {location.active ? (
                                                <span className="text-green-600 font-semibold">Active</span>
                                            ) : (
                                                <span className="text-red-600 font-semibold">Inactive</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {deliveryLocations.length === 0 && (
                            <p className="text-center py-4 text-muted-foreground">
                                No delivery locations found.
                            </p>
                        )}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-4">
                                <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                                <span className="self-center">Page {page + 1} of {totalPages}</span>
                                <Button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                            </div>
                        )}
                </div>
            )}

            <AddDeliveryLocationModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                location={editingLocation}
                onLocationSaved={onLocationSaved}
            />
        </div>
    );
}