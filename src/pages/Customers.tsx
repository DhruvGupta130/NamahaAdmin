import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

const customersData = [
  {
    id: 1,
    name: "Sreedhar Setti",
    phone: "+91 9640 93 93 91",
    email: "sreedhar@gmail.com",
    address: "Aakriti Esta - A 705",
    fullAddress: "Tellapur, Hyderabad, Telangana...",
    orders: 23,
    subscriptionRevenue: "₹899",
    totalRevenue: "₹8,999"
  },
  {
    id: 2,
    name: "Sreedhar Setti",
    phone: "+91 9640 93 93 91",
    email: "sreedhar@gmail.com",
    address: "Aakriti Esta - A 705",
    fullAddress: "Tellapur, Hyderabad, Telangana...",
    orders: 23,
    subscriptionRevenue: "₹899",
    totalRevenue: "₹8,999"
  },
  {
    id: 3,
    name: "Sreedhar Setti",
    phone: "+91 9640 93 93 91",
    email: "sreedhar@gmail.com",
    address: "Aakriti Esta - A 705",
    fullAddress: "Tellapur, Hyderabad, Telangana...",
    orders: 23,
    subscriptionRevenue: "₹899",
    totalRevenue: "₹8,999"
  }
];

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customerType, setCustomerType] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">You can see all Customers</h2>
            
            <div className="flex gap-4 mb-6">
              <div className="w-64">
                <label className="block text-sm font-medium mb-2">Filter by customer type</label>
                <Select value={customerType} onValueChange={setCustomerType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="premium">Premium Customers</SelectItem>
                    <SelectItem value="regular">Regular Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-64">
                <label className="block text-sm font-medium mb-2">Search by name</label>
                <Input
                  placeholder="Search name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader className="bg-accent/50">
                <TableRow>
                  <TableHead className="font-medium">#</TableHead>
                  <TableHead className="font-medium">Customers Name</TableHead>
                  <TableHead className="font-medium">Address</TableHead>
                  <TableHead className="font-medium">Number of orders</TableHead>
                  <TableHead className="font-medium">Subscription Revenue</TableHead>
                  <TableHead className="font-medium">Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customersData.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.address}</div>
                        <div className="text-sm text-muted-foreground">{customer.fullAddress}</div>
                        <button className="text-primary text-sm hover:underline">
                          Click to view map
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{customer.orders}</TableCell>
                    <TableCell className="text-center">{customer.subscriptionRevenue}</TableCell>
                    <TableCell className="text-center">{customer.totalRevenue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}