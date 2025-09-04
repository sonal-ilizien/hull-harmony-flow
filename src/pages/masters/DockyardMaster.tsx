import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column } from "@/components/ui/table";
import { DynamicFormDialog, FieldConfig } from "@/components/DynamicFormDialog";
import { get, post, put, del } from "@/lib/api";

interface Dockyard {
  id: number;
  name: string;
  location: string;
  capacity: string;
  facilities: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

const DockyardMaster = () => {
  const { toast } = useToast();
  const [dockyards, setDockyards] = useState<Dockyard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDockyard, setEditingDockyard] = useState<Dockyard | null>(null);

  // ✅ Table columns
  const columns: Column<Dockyard>[] = [
    { header: "Name", accessor: "name" },
    { header: "Location", accessor: "location" },
    { header: "Capacity", accessor: "capacity" },
    {
      header: "Facilities",
      accessor: "facilities",
      render: (row) => (
        <span className="truncate max-w-xs" title={row.facilities}>
          {row.facilities || "-"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <Badge variant={row.status === "Active" ? "default" : "secondary"}>
          {row.status}
        </Badge>
      ),
    },
    { header: "Created By", accessor: "createdBy" },
    { header: "Created Date", accessor: "createdAt" },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex justify-end gap-2">
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

  // ✅ Form fields
  const fields: FieldConfig[] = [
    { name: "name", label: "Dockyard Name", type: "text", required: true },
    { name: "location", label: "Location", type: "text", required: true },
    {
      name: "capacity",
      label: "Capacity & Capabilities",
      type: "text",
    },
    {
      name: "facilities",
      label: "Facilities & Services",
      type: "textarea",
    },
    {
      name: "status",
      label: "Status",
      type: "dropdown",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
      required: true,
    },
  ];

  // ✅ Fetch dockyards
  const fetchDockyards = async () => {
    setLoading(true);
    try {
      const data = await get("master/dockyards/");
      setDockyards(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch dockyards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDockyards();
  }, []);

  // ✅ Save (Create / Update)
  const handleSave = async (formData: any) => {
    try {
      if (editingDockyard) {
        const updated = await put(
          `master/dockyards/${editingDockyard.id}/`,
          formData
        );
        setDockyards((prev) =>
          prev.map((d) => (d.id === editingDockyard.id ? updated : d))
        );
        toast({ title: "Success", description: "Dockyard updated successfully" });
      } else {
        const created = await post("master/dockyards/", formData);
        setDockyards((prev) => [...prev, created]);
        toast({ title: "Success", description: "Dockyard created successfully" });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save dockyard",
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
      setEditingDockyard(null);
    }
  };

  // ✅ Edit
  const handleEdit = (dockyard: Dockyard) => {
    setEditingDockyard(dockyard);
    setIsDialogOpen(true);
  };

  // ✅ Delete
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this dockyard?")) {
      try {
        await del(`master/dockyards/${id}/`);
        setDockyards((prev) => prev.filter((d) => d.id !== id));
        toast({
          title: "Success",
          description: "Dockyard deleted successfully",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete dockyard",
          variant: "destructive",
        });
      }
    }
  };

  // ✅ Search
  const filteredDockyards = dockyards.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dockyard Master</h1>
          <p className="text-muted-foreground">
            Manage dockyards and shipbuilding facilities
          </p>
        </div>
        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingDockyard ? "Edit Dockyard" : "Add New Dockyard"}
          description={
            editingDockyard
              ? "Update dockyard information"
              : "Create a new dockyard facility"
          }
          fields={fields}
          onSubmit={handleSave}
          initialValues={editingDockyard || {}}
          trigger={
            <Button
              className="bg-gradient-primary"
              onClick={() => setEditingDockyard(null)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Dockyard
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
              placeholder="Search dockyards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dockyards ({filteredDockyards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredDockyards} rowsPerPage={5} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DockyardMaster;
