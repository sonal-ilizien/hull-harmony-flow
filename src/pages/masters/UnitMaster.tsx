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


interface Unit {
  id: number;
  name: string;
  code?: string;
  description?: string;
  active: string;
  createdBy: string;
  created_on: string;
}



const UnitMaster = () => {



  const { toast } = useToast();

  const [units, setUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const columns: Column<Unit>[] = [
  { header: "Unit Name", accessor: "name" },
  { header: "code", accessor: "code" },
  {
      header: "Status",
      accessor: "active",
      render: (row) => (
        <Badge variant={row.active === "1" ? "default" : "secondary"}>
          {row.active === "1" ? "Active" : "Inactive"}
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
}

];
  // Fetch units from API
  const fetchUnits = async (pageNum: number = 1) => {
    try {
      const res = await get(`/master/units/?page=${pageNum}`);

      setUnits(res.results || []);
      setTotalPages(Math.ceil(res.count / 10));
    } catch (err) {
      console.error("Failed to fetch units", err);
      toast({
        title: "Error",
        description: "Failed to fetch units",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUnits(page);
  }, [page]);

  // Save / Update
  const handleSave = (formData: any) => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Unit name is required",
        variant: "destructive",
      });
      return;
    }

    if (editingUnit) {
      setUnits((prev) =>
        prev.map((unit) =>
          unit.id === editingUnit.id ? { ...unit, ...formData } : unit
        )
      );
      toast({ title: "Success", description: "Unit updated successfully" });
    } else {
      const newUnit: Unit = {
        id: Date.now(), // temporary id
        name: formData.name,
        code: formData.code,
        description: formData.description,
        active: formData.status || "Active",
        createdBy: "Admin",
        created_on: new Date().toISOString(),
      };
      setUnits((prev) => [...prev, newUnit]);
      toast({ title: "Success", description: "Unit created successfully" });
    }

    setIsDialogOpen(false);
    setEditingUnit(null);
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this unit?")) {
      setUnits((prev) => prev.filter((unit) => unit.id !== id));
      toast({
        title: "Success",
        description: "Unit deleted successfully",
      });
    }
  };

  // Filter by search
  const filteredUnits = units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Unit Master</h1>
          <p className="text-muted-foreground">
            Manage organizational units and commands
          </p>
        </div>

        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingUnit ? "Edit Unit" : "Add Unit"}
          description="Fill out the details below"
          fields={[
            { name: "name", label: "Unit Name", type: "text", required: true },
            { name: "code", label: "Unit Code", type: "text" },
            { name: "description", label: "Description", type: "textarea" },
            {
              name: "status",
              label: "Status",
              type: "dropdown",
              options: [
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ],
            },
          ]}
          onSubmit={handleSave}
          initialValues={units}
          trigger={
            <Button
              onClick={() => {
                setEditingUnit(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
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
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Units Table */}
      <Card>
        <CardHeader>
          <CardTitle>Units</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredUnits} rowsPerPage={10} />
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

export default UnitMaster;
