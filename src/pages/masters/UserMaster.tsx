import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable, Column } from "@/components/ui/table";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DynamicFormDialog } from "@/components/DynamicFormDialog";
import { get, post, put, del } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  loginname: string;
  email: string;
  role_name: string;
  status: number; // 1 = Active, 2 = Inactive
  
}

const UserMaster = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const columns: Column<User>[] = [
    { header: "Username", accessor: "loginname" },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role_name" }, // or "role"
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <Badge variant={row.status === 1 ? "default" : "secondary"}>
          {row.status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEdit(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Fetch users from API
const fetchUsers = async (pageNum: number = 1) => {
  try {
    const res = await get(`/api/auth/users/?page=${pageNum}&order_by=-loginname`);

    // Access the actual array
    setUsers(res.results?.data || []);

    setTotalPages(Math.ceil((res.count || 0) / 10));
  } catch (err) {
    toast({
      title: "Error",
      description: "Failed to fetch users",
      variant: "destructive",
    });
  }
};

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  // Save / Update API
  const handleSave = async (formData: any) => {
    if (!formData.username?.trim()) {
      toast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      username: formData.username,
      email: formData.email,
      role: formData.role,
      active: formData.status === "Active" ? 1 : 2,
    };

    try {
      if (editingUser) {
        const payloadWithId = { ...payload, id: editingUser.id };
        await put(`/api/auth/users/`, payloadWithId);
        toast({ title: "Success", description: "User updated successfully" });
      } else {
        await post(`/api/auth/users/`, payload);
        toast({ title: "Success", description: "User created successfully" });
      }

      fetchUsers(page);
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save user",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  // Delete API
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const payload = { id: id, delete: true };
        await del(`/api/auth/users/`, payload);
        setUsers((prev) => prev.filter((user) => user.id !== id));
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
      }
    }
  };

  // Filter by search
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) =>
        user.loginname.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">User Master</h1>
          <p className="text-muted-foreground">
            Manage users and roles
          </p>
        </div>

        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingUser ? "Edit User" : "Add User"}
          description="Fill out the details below"
          fields={[
            { name: "username", label: "Username", type: "text", required: true },
            { name: "email", label: "Email", type: "text" },
            { name: "role", label: "Role", type: "text" },
            {
              name: "status",
              label: "Active",
              type: "checkbox",
              required: false,
            },
          ]}
          onSubmit={handleSave}
          initialValues={
            editingUser
              ? {
                  username: editingUser.loginname,
                  email: editingUser.email,
                  role: editingUser.role_name,
                  status: editingUser.status === 1 ? "Active" : "Inactive",
                }
              : {}
          }
          trigger={
            <Button
              onClick={() => {
                setEditingUser(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          }
        />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredUsers} rowsPerPage={10} />
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default UserMaster;