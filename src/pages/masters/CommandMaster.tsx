import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column } from "@/components/ui/table";
import { DynamicFormDialog, FieldConfig } from "@/components/DynamicFormDialog";
import { get, post, put, del } from "@/lib/api";

interface Command {
  id: number;
  name: string;
  code: string;
  active: string;
  created_on: string;
}

const CommandMaster = () => {
  const { toast } = useToast();
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Table columns
  const columns: Column<Command>[] = [
    { header: "Name", accessor: "name" },
    {
      header: "Code",
      accessor: "code",
      render: (row) => <Badge variant="outline">{row.code}</Badge>,
    },
    {
      header: "Status",
      accessor: "active",
      render: (row) => (
        <Badge variant={row.active === "1" ? "default" : "secondary"}>
          {row.active === "1" ? "Active" : "Inactive"}
        </Badge>

      ),
    },
    
    { header: "Created Date", accessor: "created_on" },
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

  // Form fields
  const fields: FieldConfig[] = [
    { name: "name", label: "Command Name", type: "text", required: true },
    { name: "code", label: "Command Code", type: "text", required: true },
    
    {
      name: "status",
      label: "Status",
      type: "dropdown", // ✅ fix
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
      required: true,
    },
  ];


  // Fetch data
  const fetchCommands = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const res = await get(`/master/units/?page=${pageNum}`);

      setCommands(res.results || []);
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
    fetchCommands();
  }, []);

  // Save (Create/Update)
  const handleSave = async (formData: any) => {
    try {
      if (editingCommand) {
        const updated = await put(`master/commands/${editingCommand.id}/`, formData);
        setCommands((prev) => prev.map((c) => (c.id === editingCommand.id ? updated : c)));
        toast({ title: "Success", description: "Command updated successfully" });
      } else {
        const created = await post("master/commands/", formData);
        setCommands((prev) => [...prev, created]);
        toast({ title: "Success", description: "Command created successfully" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save command", variant: "destructive" });
    } finally {
      setIsDialogOpen(false);
      setEditingCommand(null);
    }
  };

  // Edit
  const handleEdit = (command: Command) => {
    setEditingCommand(command);
    setIsDialogOpen(true);
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this command?")) {
      try {
        await del(`master/commands/${id}/`);
        setCommands((prev) => prev.filter((c) => c.id !== id));
        toast({ title: "Success", description: "Command deleted successfully" });
      } catch {
        toast({ title: "Error", description: "Failed to delete command", variant: "destructive" });
      }
    }
  };

  // Filter search
  const filteredCommands = commands.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Command Master</h1>
          <p className="text-muted-foreground">Manage naval commands and their headquarters</p>
        </div>
        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingCommand ? "Edit Command" : "Add New Command"}
          description={editingCommand ? "Update command information" : "Create a new naval command"}
          fields={fields}
          onSubmit={handleSave}
          initialValues={editingCommand || {}}
          trigger={
            <Button
              className="bg-gradient-primary"
              onClick={() => {
                setEditingCommand(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Command
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
              placeholder="Search commands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Commands Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commands ({filteredCommands.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredCommands} rowsPerPage={10} />
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

export default CommandMaster;
