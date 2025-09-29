import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { AxiosResponse } from "axios";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    location: any | null;
    onLocationSaved: (location: any) => void;
}

export function AddDeliveryLocationModal({
    open,
    onOpenChange,
    location,
    onLocationSaved,
}: Props) {
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pinCode, setPinCode] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [radiusKm, setRadiusKm] = useState("");
    const [deliveryCharge, setDeliveryCharge] = useState("");
    const [active, setActive] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (location) {
            setName(location.name);
            setCity(location.city);
            setState(location.state);
            setPinCode(location.pinCode);
            setLatitude(location.latitude.toString());
            setLongitude(location.longitude.toString());
            setRadiusKm(location.radiusKm.toString());
            setDeliveryCharge(location.deliveryCharge.toString());
            setActive(location.active);
        } else {
            setName("");
            setCity("");
            setState("");
            setPinCode("");
            setLatitude("");
            setLongitude("");
            setRadiusKm("");
            setDeliveryCharge("");
            setActive(true);
        }
    }, [location]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                name,
                city,
                state,
                pinCode,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                radiusKm: parseFloat(radiusKm),
                deliveryCharge: parseFloat(deliveryCharge),
                active,
            };

            let res: AxiosResponse<any, any, {}>;
            if (location) {
                res = await api.put(`/admin/service/areas/${location.id}`, payload);
            } else {
                res = await api.post("/admin/service/areas", payload);
            }

            onLocationSaved(res.data.data || payload);

            setName("");
            setCity("");
            setState("");
            setPinCode("");
            setLatitude("");
            setLongitude("");
            setRadiusKm("");
            setDeliveryCharge("");
            setActive(true);
            
            toast.success(`Location ${location ? "updated" : "added"} successfully`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save location");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-6 space-y-6">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        {location ? "Edit" : "Add"} Delivery Location
                    </DialogTitle>
                </DialogHeader>

                {/* Form Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} className="border border-orange-400 border-2 rounded-md focus:border-none"/>
                    </div>

                    <div className="space-y-2">
                        <Label>City</Label>
                        <Input value={city} onChange={(e) => setCity(e.target.value)} className="border border-orange-400 border-2 rounded-md focus:border-none"/>
                    </div>

                    <div className="space-y-2">
                        <Label>State</Label>
                        <Input value={state} onChange={(e) => setState(e.target.value)} className="border border-orange-400 border-2 rounded-md focus:border-none"/>
                    </div>

                    <div className="space-y-2">
                        <Label>Pincode</Label>
                        <Input
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value)}
                            className="border border-orange-400 border-2 rounded-md focus:border-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Latitude</Label>
                        <Input
                            type="number"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            className="border border-orange-400 border-2 rounded-md focus:border-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Longitude</Label>
                        <Input
                            type="number"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            className="border border-orange-400 border-2 rounded-md focus:border-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Radius (Km)</Label>
                        <Input
                            type="number"
                            value={radiusKm}
                            onChange={(e) => setRadiusKm(e.target.value)}
                            className="border border-orange-400 border-2 rounded-md focus:border-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Delivery Charge</Label>
                        <Input
                            type="number"
                            value={deliveryCharge}
                            onChange={(e) => setDeliveryCharge(e.target.value)}
                            className="border border-orange-400 border-2 rounded-md focus:border-none"
                        />
                    </div>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-3">
                        <Label htmlFor="active">Active</Label>
                        <Switch id="active" checked={active} onCheckedChange={setActive} className="data-[state=unchecked]:bg-gray-300"/>
                    </div>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}