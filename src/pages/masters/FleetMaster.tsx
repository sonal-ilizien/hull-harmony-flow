import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Fleet {
  id: string;
  name: string;
  code: string;
  command: string;
  vesselCount: number;
  status: "active" | "inactive";
  description: string;
  createdAt: string;
}

const FleetMaster = () => {
  const { toast } = useToast();
  const [fleets, setFleets] = useState<Fleet[]>([
    {
      id: "1",
      name: "Eastern Fleet",
      code: "EF",
      command: "Eastern Naval Command",
      vesselCount: 45,
      status: "active",
      description: "Fleet operations in the Eastern region",
      createdAt: "2024-01-15"
    },
    {
      id: "2", 
      name: "Western Fleet",
      code: "WF",
      command: "Western Naval Command",
      vesselCount: 52,
      status: "active",
      description: "Fleet operations in the Western region",
      createdAt: "2024-01-15"
    },
    {
      id: "3",
      name: "Southern Fleet",
      code: "SF", 
      command: "Southern Naval Command",
      vesselCount: 38,
      status: "active",
      description: "Fleet operations in the Southern region",
      createdAt: "2024-01-20"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFleet, setEditingFleet] = useState<Fleet | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    command: string;
    status: "active" | "inactive";
    description: string;
  }>({
    name: "",
    code: "",
    command: "",
    status: "active",
    description: ""
  });

  const filteredFleets = fleets.filter(fleet =>
    fleet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fleet.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fleet.command.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.name || !formData.code || !formData.command) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (editingFleet) {
      setFleets(prev => prev.map(fleet => 
        fleet.id === editingFleet.id 
          ? { ...fleet, ...formData, vesselCount: fleet.vesselCount }
          : fleet
      ));
      toast({
        title: "Success",
        description: "Fleet updated successfully"
      });
    } else {
      const newFleet: Fleet = {
        id: Date.now().toString(),
        ...formData,
        vesselCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setFleets(prev => [...prev, newFleet]);
      toast({
        title: "Success",
        description: "Fleet created successfully"
      });
    }

    setIsDialogOpen(false);
    setEditingFleet(null);
              setFormData({ name: "", code: "", command: "", status: "active", description: "" });
  };

  const handleEdit = (fleet: Fleet) => {
    setEditingFleet(fleet);
    setFormData({
      name: fleet.name,
      code: fleet.code,
      command: fleet.command,
      status: fleet.status,
      description: fleet.description
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setFleets(prev => prev.filter(fleet => fleet.id !== id));
    toast({
      title: "Success", 
      description: "Fleet deleted successfully"
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fleet Master</h1>
          <p className="text-muted-foreground mt-2">Manage fleet configurations and details</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="naval" onClick={() => {
              setEditingFleet(null);
              setFormData({ name: "", code: "", command: "", status: "active", description: "" });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fleet
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingFleet ? "Edit Fleet" : "Add New Fleet"}</DialogTitle>
              <DialogDescription>
                {editingFleet ? "Update fleet information" : "Create a new fleet configuration"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Fleet Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter fleet name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Fleet Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="Enter fleet code (e.g., EF)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="command">Command *</Label>
                <Select 
                  value={formData.command} 
                  onValueChange={(value) => setFormData({...formData, command: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select command" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eastern Naval Command">Eastern Naval Command</SelectItem>
                    <SelectItem value="Western Naval Command">Western Naval Command</SelectItem>
                    <SelectItem value="Southern Naval Command">Southern Naval Command</SelectItem>
                    <SelectItem value="Naval Headquarters">Naval Headquarters</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: "active" | "inactive") => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter fleet description"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="naval" onClick={handleSave} className="flex-1">
                  {editingFleet ? "Update" : "Create"}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fleets by name, code, or command..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fleet Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Fleet List</CardTitle>
          <CardDescription>
            Total: {filteredFleets.length} fleets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fleet Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Command</TableHead>
                <TableHead>Vessels</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFleets.map((fleet) => (
                <TableRow key={fleet.id}>
                  <TableCell className="font-medium">{fleet.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{fleet.code}</Badge>
                  </TableCell>
                  <TableCell>{fleet.command}</TableCell>
                  <TableCell>{fleet.vesselCount}</TableCell>
                  <TableCell>
                    <Badge variant={fleet.status === "active" ? "default" : "secondary"}>
                      {fleet.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{fleet.createdAt}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(fleet)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(fleet.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FleetMaster;