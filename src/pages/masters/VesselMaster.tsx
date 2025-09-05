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

interface Vessel {
  id: number;
  name: string;
  code: string;
  classofvessel: { id: number; name: string } | null;
  vesseltype: { id: number; name: string } | null;
  yard: { id: number; name: string } | null;
  command: { id: number; name: string } | null;
  year_of_build?: number;
  year_of_delivery?: number;
  active: number;
  created_on: string;
  created_by: number;
}

const VesselMaster = () => {
  const { toast } = useToast();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Table columns
  const columns: Column<Vessel>[] = [
    { header: "Name", accessor: "name" },
    { header: "Code", accessor: "code" },
    {
      header: "Class",
      accessor: "classofvessel",
      render: (row) => row.classofvessel?.name || "-",
    },
    {
      header: "Type",
      accessor: "vesseltype",
      render: (row) => row.vesseltype?.name || "-",
    },
    {
      header: "Command",
      accessor: "command",
      render: (row) => row.command?.name || "-",
    },
    {
      header: "Dockyard",
      accessor: "yard",
      render: (row) => row.yard?.name || "-",
    },
    { header: "Year Built", accessor: "year_of_build" },
    { header: "Year Delivered", accessor: "year_of_delivery" },
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

  // Form fields
  const fields: FieldConfig[] = [
    { name: "name", label: "Vessel Name", type: "text", required: true },
    { name: "code", label: "Vessel Code", type: "text" },
    {
      name: "classofvessel",
      label: "Class of Vessel",
      type: "dropdown",
      options: [], // TODO: Populate dynamically if needed
      required: true,
    },
    {
      name: "vesseltype",
      label: "Vessel Type",
      type: "dropdown",
      options: [],
      required: true,
    },
    {
      name: "command",
      label: "Command",
      type: "dropdown",
      options: [],
      required: true,
    },
    {
      name: "yard",
      label: "Dockyard",
      type: "dropdown",
      options: [],
    },
    {
      name: "year_of_build",
      label: "Year of Build",
      type: "number",
    },
    {
      name: "year_of_delivery",
      label: "Year of Delivery",
      type: "number",
    },
    {
      name: "active",
      label: "Status",
      type: "dropdown",
      options: [
        { label: "Active", value: "1" },
        { label: "Inactive", value: "0" },
      ],
      required: true,
    },
  ];

  // Fetch vessels with pagination
  const fetchVessels = async (pageNum: number = 1) => {
    try {
      const res = await get(`/master/vessels/?page=${pageNum}`);
      setVessels(res.results || []);
      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch vessels",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchVessels(page);
  }, [page]);

  // Save / Update
  const handleSave = async (formData: any) => {
    const payload = {
      ...formData,
      active: formData.active === "1" || formData.active === 1 ? 1 : 0,
    };
    try {
      if (editingVessel) {
        await put(`/master/vessels/${editingVessel.id}/`, payload);
        toast({ title: "Success", description: "Vessel updated successfully" });
      } else {
        await post(`/master/vessels/`, payload);
        toast({ title: "Success", description: "Vessel created successfully" });
      }
      fetchVessels(page);
      setIsDialogOpen(false);
      setEditingVessel(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save vessel",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setIsDialogOpen(true);
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this vessel?")) {
      try {
        await del(`/master/vessels/${id}/`);
        setVessels((prev) => prev.filter((v) => v.id !== id));
        toast({
          title: "Success",
          description: "Vessel deleted successfully",
        });
        fetchVessels(page);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete vessel",
          variant: "destructive",
        });
      }
    }
  };

  // Search
  const filteredVessels = vessels.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.classofvessel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.command?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Vessel Master</h1>
          <p className="text-muted-foreground">
            Manage naval vessels and their specifications
          </p>
        </div>
        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingVessel ? "Edit Vessel" : "Add Vessel"}
          description="Fill out the details below"
          fields={fields}
          onSubmit={handleSave}
          initialValues={
            editingVessel
              ? {
                  ...editingVessel,
                  active: editingVessel.active === 1 ? "1" : "0",
                }
              : {}
          }
          trigger={
            <Button
              onClick={() => {
                setEditingVessel(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Vessel
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
              placeholder="Search vessels..."
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
          <CardTitle>Vessels</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredVessels} rowsPerPage={10} />
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

export default VesselMaster;
