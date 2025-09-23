import { Card, CardContent } from "@/components/ui/card";

const revenueMetrics = [
  { title: "Total Revenue", value: "₹0.00", subtitle: "" },
  { title: "Earned Platform Fee", value: "₹0.00", subtitle: "" },
  { title: "Donations Revised", value: "₹0.00", subtitle: "" },
  { title: "Total Customers", value: "₹0.00", subtitle: "" },
];

const salesMetrics = [
  { title: "Total Sales", value: "₹0.00", subtitle: "" },
  { title: "Total Orders", value: "₹0.00", subtitle: "" },
  { title: "Number or Subscriptions", value: "₹0.00", subtitle: "" },
  { title: "Average order value", value: "₹0.00", subtitle: "" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Total Revenue Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Total Revenue</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {revenueMetrics.map((metric, index) => (
            <Card key={index} className="bg-secondary/50">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sales Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Sales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {salesMetrics.map((metric, index) => (
            <Card key={index} className="bg-secondary/50">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}