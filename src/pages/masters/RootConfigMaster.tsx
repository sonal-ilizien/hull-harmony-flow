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

interface RootConfig {
  id: number;
  key: string;
  value: string;
  active: number; // 1 = Active, 2 = Inactive
}

const RootConfigMaster = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<RootConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<RootConfig | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const columns: Column<RootConfig>[] = [
    { header: "Key", accessor: "key" },
    { header: "Value", accessor: "value" },
    {
      header: "Status",
      accessor: "active",
      render: (row) => (
        <Badge variant={row.active === 1 ? "default" : "secondary"}>
          {row.active === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => handleEdit(row)}>
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

  const fetchConfigs = async (pageNum: number = 1) => {
    try {
      const res = await get(`/config/root-configs/?page=${pageNum}`); // <-- updated endpoint
      setConfigs(res.results || []);
      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch root configs",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchConfigs(page);
  }, [page]);

  const handleSave = async (formData: any) => {
    if (!formData.key?.trim()) {
      toast({
        title: "Validation Error",
        description: "Key is required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      key: formData.key,
      value: formData.value,
      active: formData.status === "Active" ? 1 : 2,
    };

    try {
      if (editingConfig) {
        const payloadWithId = { ...payload, id: editingConfig.id };
        await put(`/config/root-configs/`, payloadWithId); // <-- updated endpoint
        toast({ title: "Success", description: "Root Config updated successfully" });
      } else {
        await post(`/config/root-configs/`, payload); // <-- updated endpoint
        toast({ title: "Success", description: "Root Config created successfully" });
      }

      fetchConfigs(page);
      setIsDialogOpen(false);
      setEditingConfig(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save root config",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (config: RootConfig) => {
    setEditingConfig(config);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this config?")) {
      try {
        const payload = { id: id, delete: true };
        await del(`/config/root-configs/`, payload); // <-- updated endpoint
        setConfigs((prev) => prev.filter((c) => c.id !== id));
        toast({
          title: "Success",
          description: "Root Config deleted successfully",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete root config",
          variant: "destructive",
        });
      }
    }
  };

  const filteredConfigs = configs.filter((c) =>
    c.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Root Config Master</h1>
          <p className="text-muted-foreground">
            Manage root configuration settings
          </p>
        </div>
        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingConfig ? "Edit Root Config" : "Add Root Config"}
          description="Fill out the details below"
          fields={[
            { name: "key", label: "Key", type: "text", required: true },
            { name: "value", label: "Value", type: "text" },
            {
              name: "status",
              label: "Active",
              type: "checkbox",
              required: false,
            },
          ]}
          onSubmit={handleSave}
          initialValues={
            editingConfig
              ? {
                  key: editingConfig.key,
                  value: editingConfig.value,
                  status: editingConfig.active === 1 ? "Active" : "Inactive",
                }
              : {}
          }
          trigger={
            <Button
              onClick={() => {
                setEditingConfig(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Root Config
            </Button>
          }
        />
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search configs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Root Configs</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredConfigs} rowsPerPage={10} />
        </CardContent>
      </Card>
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

export default RootConfigMaster;