import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import api from "@/lib/api";
import CreateOfferModal from "@/components/CreateOfferModal";
import { DiscountType, PurchaseType } from "@/lib/constants";

type Offer = {
  id: string;
  title: string;
  couponCode: string;
  minOrderAmount: number;
  discount: number;
  discountType: keyof typeof DiscountType | "";
  purchaseType: keyof typeof PurchaseType | "";
  validFrom: string;
  validUntil: string;
  active: boolean;
};

type PageMeta = {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
};

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [page, setPage] = useState<PageMeta>({ size: 10, number: 0, totalElements: 0, totalPages: 0 });
  const [togglingOfferId, setTogglingOfferId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOffers = async (pageNumber = 0, pageSize = 10, searchKeyword = "") => {
    setLoading(true);
    try {
      const res = await api.get("/admin/offer/get", { params: { pageNumber, pageSize, keyword: searchKeyword } });
      setOffers(res.data.data.content || []);
      setPage(res.data.data.page);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch offers");
    } finally {
      setLoading(false);
    }
  };

  const toggleOfferStatus = async (offerId: string) => {
    setTogglingOfferId(offerId);
    const updatedOffers = offers.map((o) => (o.id === offerId ? { ...o, active: !o.active } : o));
    setOffers(updatedOffers);

    try {
      await api.patch(`/admin/offer/status/${offerId}`);
      toast.success("Offer status updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update offer status");
      setOffers(offers); // rollback
    } finally {
      setTogglingOfferId(null);
    }
  };

  useEffect(() => {
    fetchOffers(page.number, page.size, appliedKeyword);
  }, [appliedKeyword, page.number, page.size]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Offers</h1>
        <Button onClick={() => setIsModalOpen(true)}>Create Offer</Button>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="w-full">
          <Input
            placeholder="Search offers by title or coupon code"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage((prev) => ({ ...prev, number: 0 }));
                setAppliedKeyword(keyword.trim());
              }
            }}
            disabled={loading}
            className="border border-orange-400 border-2 rounded-md focus:border-none"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading offers...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-accent/50">
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Valid From</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer, index) => (
                    <TableRow key={offer.id}>
                      <TableCell>{index + 1 + page.number * page.size}</TableCell>
                      <TableCell>{offer.title}</TableCell>
                      <TableCell>{offer.couponCode}</TableCell>
                      <TableCell>{offer.minOrderAmount}</TableCell>
                      <TableCell>
                        {offer.discount} {offer.discountType === "PERCENTAGE" ? "%" : "₹"}
                      </TableCell>
                      <TableCell>{offer.purchaseType}</TableCell>
                      <TableCell>{new Date(offer.validFrom).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(offer.validUntil).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Switch
                          checked={offer.active}
                          onCheckedChange={() => toggleOfferStatus(offer.id)}
                          disabled={togglingOfferId === offer.id}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {offers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                        No offers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <Button
          onClick={() => setPage((prev) => ({ ...prev, number: Math.max(prev.number - 1, 0) }))}
          disabled={page.number === 0 || loading}
        >
          Prev
        </Button>
        <span>Page {page.number + 1} of {page.totalPages}</span>
        <Button
          onClick={() => setPage((prev) => ({ ...prev, number: Math.min(prev.number + 1, page.totalPages - 1) }))}
          disabled={page.number + 1 >= page.totalPages || loading}
        >
          Next
        </Button>
      </div>
      {isModalOpen && (<CreateOfferModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setPage((prev) => ({ ...prev, number: 0 }));
          setAppliedKeyword("");
          fetchOffers(0, page.size, "");
        }}
      />)}
    </div>
  );
}