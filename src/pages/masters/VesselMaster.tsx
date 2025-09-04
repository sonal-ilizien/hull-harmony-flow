import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Ship } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column } from "@/components/ui/table";
import { DynamicFormDialog, FieldConfig } from "@/components/DynamicFormDialog";
import { get, post, put, del } from "@/lib/api";

interface Vessel {
  id: number;
  name: string;
  classOfVessel: string;
  vesselType: string;
  command: string;
  dockyard: string;
  yearOfBuild?: number;
  yearOfDelivery?: number;
  status: string;
  createdBy: string;
  createdAt: string;
}

const VesselMaster = () => {
  const { toast } = useToast();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);

  // ✅ Table columns
  const columns: Column<Vessel>[] = [
    { header: "Name", accessor: "name" },
    { header: "Class", accessor: "classOfVessel" },
    {
      header: "Type",
      accessor: "vesselType",
      render: (row) => <Badge variant="outline">{row.vesselType}</Badge>,
    },
    { header: "Command", accessor: "command" },
    { header: "Dockyard", accessor: "dockyard" },
    { header: "Year Built", accessor: "yearOfBuild" },
    { header: "Year Delivered", accessor: "yearOfDelivery" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <Badge variant={row.status === "Active" ? "default" : "secondary"}>
          {row.status}
        </Badge>
      ),
    },
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

  // ✅ Form fields (dropdowns will later come from APIs instead of static arrays)
  const fields: FieldConfig[] = [
    { name: "name", label: "Vessel Name", type: "text", required: true },
    {
      name: "classOfVessel",
      label: "Class of Vessel",
      type: "dropdown",
      options: [
        { label: "Vikrant Class", value: "Vikrant Class" },
        { label: "Kolkata Class", value: "Kolkata Class" },
        { label: "Delhi Class", value: "Delhi Class" },
        { label: "Rajput Class", value: "Rajput Class" },
        { label: "Shivalik Class", value: "Shivalik Class" },
      ],
      required: true,
    },
    {
      name: "vesselType",
      label: "Vessel Type",
      type: "dropdown",
      options: [
        { label: "Aircraft Carrier", value: "Aircraft Carrier" },
        { label: "Destroyer", value: "Destroyer" },
        { label: "Frigate", value: "Frigate" },
        { label: "Corvette", value: "Corvette" },
        { label: "Submarine", value: "Submarine" },
        { label: "Support Vessel", value: "Support Vessel" },
      ],
      required: true,
    },
    {
      name: "command",
      label: "Command",
      type: "dropdown",
      options: [
        { label: "Eastern Naval Command", value: "Eastern Naval Command" },
        { label: "Western Naval Command", value: "Western Naval Command" },
        { label: "Southern Naval Command", value: "Southern Naval Command" },
      ],
      required: true,
    },
    {
      name: "dockyard",
      label: "Dockyard",
      type: "dropdown",
      options: [
        { label: "Cochin Shipyard", value: "Cochin Shipyard" },
        { label: "Mazagon Dock", value: "Mazagon Dock" },
        { label: "Garden Reach Shipyard", value: "Garden Reach Shipyard" },
        { label: "Goa Shipyard", value: "Goa Shipyard" },
      ],
    },
    {
      name: "yearOfBuild",
      label: "Year of Build",
      type: "number",
    },
    {
      name: "yearOfDelivery",
      label: "Year of Delivery",
      type: "number",
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

  // ✅ Fetch vessels
  const fetchVessels = async () => {
    setLoading(true);
    try {
      const data = await get("master/vessels/");
      setVessels(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch vessels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  // ✅ Save (Create / Update)
  const handleSave = async (formData: any) => {
    try {
      if (editingVessel) {
        const updated = await put(
          `master/vessels/${editingVessel.id}/`,
          formData
        );
        setVessels((prev) =>
          prev.map((v) => (v.id === editingVessel.id ? updated : v))
        );
        toast({ title: "Success", description: "Vessel updated successfully" });
      } else {
        const created = await post("master/vessels/", formData);
        setVessels((prev) => [...prev, created]);
        toast({ title: "Success", description: "Vessel created successfully" });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save vessel",
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
      setEditingVessel(null);
    }
  };

  // ✅ Edit
  const handleEdit = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setIsDialogOpen(true);
  };

  // ✅ Delete
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this vessel?")) {
      try {
        await del(`master/vessels/${id}/`);
        setVessels((prev) => prev.filter((v) => v.id !== id));
        toast({ title: "Success", description: "Vessel deleted successfully" });
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete vessel",
          variant: "destructive",
        });
      }
    }
  };

  // ✅ Search
  const filteredVessels = vessels.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.classOfVessel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.command.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
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
          title={editingVessel ? "Edit Vessel" : "Add New Vessel"}
          description={
            editingVessel
              ? "Update vessel information"
              : "Create a new vessel record"
          }
          fields={fields}
          onSubmit={handleSave}
          initialValues={editingVessel || {}}
          trigger={
            <Button
              className="bg-gradient-primary"
              onClick={() => setEditingVessel(null)}
            >
              <Plus className="h-4 w-4 mr-2" />
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
          <CardTitle>Vessels ({filteredVessels.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredVessels} rowsPerPage={5} />
        </CardContent>
      </Card>
    </div>
  );
};

export default VesselMaster;
