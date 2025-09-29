import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";
import { AddBannerModal } from "@/components/AddBannerModal";
import { UserModal } from "@/components/UserModal";

const banners = [
  { id: 1, title: "Banner Title", subtitle: "Banner sub text", image: "/api/placeholder/300/150", active: true },
];

const appSections = [
  { title: "Explore Plans", subtitle: "See all subscriptions", icon: "📱" },
  { title: "My Orders", subtitle: "No order", icon: "📦" },
  { title: "Decoration", subtitle: "See all subscriptions", icon: "🎨" },
  { title: "Photography", subtitle: "For Pooja", icon: "📸" },
  { title: "Namaha Pooja Store", subtitle: "Pooja Essentials & Kites | Ritual Items", icon: "🏪" },
];

type User = {
  id: string;
  email: string;
  mobile: string;
  role: string;
  name: string;
  username: string;
  active?: boolean;
};

type PageMeta = { size: number; number: number; totalElements: number; totalPages: number; };

export default function Settings() {
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [addBannerOpen, setAddBannerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState<PageMeta>({ size: 10, number: 0, totalElements: 0, totalPages: 0 });

  const [loading, setLoading] = useState(false); // loading state for fetching users
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null); // loading state for toggle

  const fetchUsers = async (pageNumber = 0, pageSize = 10) => {
    try {
      setLoading(true);
      const res = await api.get("/admin/user/get", { params: { pageNumber, pageSize } });
      setUsers(res.data.data.content || []);
      setPage(res.data.data.page);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserActive = async (userId: string) => {
    setTogglingUserId(userId);
    const updatedUsers = users.map(user => user.id === userId ? { ...user, active: !user.active } : user);
    setUsers(updatedUsers);
    try {
      await api.patch(`/admin/user/update/${userId}`);
    } catch (err) {
      console.error("Failed to update user status", err);
      setUsers(users); // rollback
    } finally {
      setTogglingUserId(null);
    }
  };

  useEffect(() => { fetchUsers(page.number, page.size); }, []);

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

        {/* Admin Users */}
        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Admin Users</h2>
                <Button
                  onClick={() => { setSelectedUser(undefined); setUserModalOpen(true); }}
                  className="bg-primary hover:bg-primary/90"
                >
                  + Add User
                </Button>
              </div>

              <div className="rounded-lg border">
                {loading ? (
                  <div className="p-6 text-center">Loading users...</div>
                ) : (
                  <Table>
                    <TableHeader className="bg-accent/50">
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, index) => (
                        <TableRow key={user.id}>
                          <TableCell>{index + 1 + page.number * page.size}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.mobile}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.active ?? true}
                                onCheckedChange={() => toggleUserActive(user.id)}
                                disabled={togglingUserId === user.id}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary"
                                onClick={() => { setSelectedUser(user); setUserModalOpen(true); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                  </Table>
                )}
              </div>

              {/* Pagination */}
              {page.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button disabled={page.number === 0 || loading} onClick={() => fetchUsers(page.number - 1, page.size)}>Prev</Button>
                  <span>Page {page.number + 1} of {page.totalPages}</span>
                  <Button disabled={page.number + 1 >= page.totalPages || loading} onClick={() => fetchUsers(page.number + 1, page.size)}>Next</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile App */}
        <TabsContent value="mobile" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Mobile App Banners</h2>
                <Button onClick={() => setAddBannerOpen(true)} className="bg-primary hover:bg-primary/90">+ Add Banner</Button>
              </div>
              {/* ... banners content unchanged ... */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UserModal
        open={userModalOpen}
        onOpenChange={setUserModalOpen}
        user={selectedUser}
        onSuccess={() => fetchUsers(page.number, page.size)}
      />
      <AddBannerModal open={addBannerOpen} onOpenChange={setAddBannerOpen} />
    </div>
  );
}