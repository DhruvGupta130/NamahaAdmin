import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "@/components/ui/sonner";

interface DashboardStats {
  totalRevenue: number;
  subscriptionRevenue: number;
  totalUsers: number;
  activeUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/dashboard/stats");
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const revenueMetrics = [
    { title: "Total Revenue", value: stats ? `₹${stats.totalRevenue}` : "₹0.00" },
    { title: "Subscription Revenue", value: stats ? `₹${stats.subscriptionRevenue}` : "₹0.00" },
    { title: "Total Customers", value: stats ? stats.totalUsers : 0 },
    { title: "Active Customers", value: stats ? stats.activeUsers : 0 },
  ];

  const salesMetrics = [
    { title: "Total Subscriptions", value: stats ? stats.totalSubscriptions : 0 },
    { title: "Active Subscriptions", value: stats ? stats.activeSubscriptions : 0 },
    { title: "Average Revenue per Subscription", value: stats && stats.totalSubscriptions
        ? `₹${(stats.totalRevenue / stats.totalSubscriptions).toFixed(2)}`
        : "₹0.00"
    },
    { title: "Unused Metric", value: "-" }, // placeholder, you can add more if needed
  ];

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
                  <p className="text-2xl font-bold text-foreground">{loading ? "Loading..." : metric.value}</p>
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
                  <p className="text-2xl font-bold text-foreground">{loading ? "Loading..." : metric.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}