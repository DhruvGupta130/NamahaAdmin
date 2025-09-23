import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import { AddUserModal } from "@/components/AddUserModal";
import { AddBannerModal } from "@/components/AddBannerModal";

const adminUsers = [
  {
    id: 1,
    name: "Sreedhar Setti",
    phone: "+91 9640 93 93 91",
    email: "sreedhar@gmail.com",
    role: "Admin",
    username: "sreedhar@gmail.com",
    password: "#########",
    active: true
  },
  {
    id: 2,
    name: "Ramana",
    phone: "+91 9640 93 93 91",
    email: "sreedhar@gmail.com",
    role: "Delivery Agent",
    username: "ramana@gmail.com",
    password: "Namaha@2326^",
    active: true
  }
];

const banners = [
  {
    id: 1,
    title: "Banner Title",
    subtitle: "Banner sub text",
    image: "/api/placeholder/300/150",
    active: true
  }
];

const appSections = [
  { title: "Explore Plans", subtitle: "See all subscriptions", icon: "📱" },
  { title: "My Orders", subtitle: "No order", icon: "📦" },
  { title: "Decoration", subtitle: "See all subscriptions", icon: "🎨" },
  { title: "Photography", subtitle: "For Pooja", icon: "📸" },
  { title: "Namaha Pooja Store", subtitle: "Pooja Essentials & Kites | Ritual Items", icon: "🏪" }
];

export default function Settings() {
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addBannerOpen, setAddBannerOpen] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState<{[key: number]: boolean}>({});

  const togglePasswordVisibility = (userId: number) => {
    setPasswordVisible(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      <Tabs defaultValue="admin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="admin" className="text-sm">Admin</TabsTrigger>
          <TabsTrigger value="mobile" className="text-sm">Mobile App</TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Admin Users</h2>
                <Button onClick={() => setAddUserOpen(true)} className="bg-primary hover:bg-primary/90">
                  + Add User
                </Button>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader className="bg-accent/50">
                    <TableRow>
                      <TableHead className="font-medium">#</TableHead>
                      <TableHead className="font-medium">Customers Name</TableHead>
                      <TableHead className="font-medium">Role</TableHead>
                      <TableHead className="font-medium">User name</TableHead>
                      <TableHead className="font-medium">Password</TableHead>
                      <TableHead className="font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.phone}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "Admin" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">
                              {passwordVisible[user.id] ? user.password : "•".repeat(user.password.length)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => togglePasswordVisibility(user.id)}
                              className="h-6 w-6"
                            >
                              {passwordVisible[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch checked={user.active} />
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Mobile App Banners</h2>
                <Button onClick={() => setAddBannerOpen(true)} className="bg-primary hover:bg-primary/90">
                  + Add Banner
                </Button>
              </div>

              <div className="grid gap-6">
                {/* User Banner */}
                <div className="bg-gradient-to-r from-pink-400 to-red-400 rounded-lg p-6 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-sm opacity-90 mb-1">Namaste!</div>
                    <div className="text-2xl font-bold">Sreedhar!</div>
                  </div>
                </div>

                {/* Banner Section */}
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground">
                    <div className="font-medium">Your Banner</div>
                    <div className="text-sm">Will Come Here</div>
                  </div>

                  {banners.map((banner) => (
                    <div key={banner.id} className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold">{banner.title}</div>
                        <div className="text-sm opacity-90">{banner.subtitle}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={banner.active} />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* App Sections */}
                <div className="grid grid-cols-2 gap-4">
                  {appSections.map((section, index) => (
                    <div key={index} className="bg-secondary/20 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-2">{section.icon}</div>
                      <div className="font-medium text-sm">{section.title}</div>
                      <div className="text-xs text-muted-foreground">{section.subtitle}</div>
                    </div>
                  ))}
                </div>

                {/* Welcome Offer */}
                <div className="bg-gradient-to-r from-pink-400 to-red-400 rounded-lg p-6 text-white relative">
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    First Get 3 Days FREE
                  </div>
                  <div className="mt-4">
                    <div className="text-xl font-bold">Welcome Offer</div>
                    <div className="text-sm opacity-90">
                      Get a taste of Pooja Masala.{" "}
                      <br />
                      Get 3 days of free flowers{" "}
                      <br />
                      with your first month's subscription.*
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddUserModal open={addUserOpen} onOpenChange={setAddUserOpen} />
      <AddBannerModal open={addBannerOpen} onOpenChange={setAddBannerOpen} />
    </div>
  );
}