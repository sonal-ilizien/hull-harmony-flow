import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Unit {
  id: number;
  name: string;
  description?: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

const UnitMaster = () => {
  const [units, setUnits] = useState<Unit[]>([
    { id: 1, name: "Eastern Naval Command", description: "ENC Headquarters", status: "Active", createdBy: "Admin", createdAt: "2024-01-15" },
    { id: 2, name: "Western Naval Command", description: "WNC Headquarters", status: "Active", createdBy: "Admin", createdAt: "2024-01-15" },
    { id: 3, name: "Southern Naval Command", description: "SNC Headquarters", status: "Active", createdBy: "Admin", createdAt: "2024-01-15" }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active"
  });
  
  const { toast } = useToast();

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Unit name is required",
        variant: "destructive",
      });
      return;
    }

    if (editingUnit) {
      setUnits(prev => prev.map(unit => 
        unit.id === editingUnit.id 
          ? { ...unit, ...formData }
          : unit
      ));
      toast({
        title: "Success",
        description: "Unit updated successfully",
      });
    } else {
      const newUnit: Unit = {
        id: Math.max(...units.map(u => u.id)) + 1,
        ...formData,
        createdBy: "Current User",
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUnits(prev => [...prev, newUnit]);
      toast({
        title: "Success", 
        description: "Unit created successfully",
      });
    }

    setIsDialogOpen(false);
    setEditingUnit(null);
    setFormData({ name: "", description: "", status: "Active" });
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      description: unit.description || "",
      status: unit.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this unit?")) {
      setUnits(prev => prev.filter(unit => unit.id !== id));
      toast({
        title: "Success",
        description: "Unit deleted successfully",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Unit Master</h1>
          <p className="text-muted-foreground">Manage organizational units and commands</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingUnit(null);
                setFormData({ name: "", description: "", status: "Active" });
              }}
              className="bg-gradient-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUnit ? "Edit Unit" : "Add New Unit"}</DialogTitle>
              <DialogDescription>
                {editingUnit ? "Update unit information" : "Create a new organizational unit"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Unit Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter unit name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter unit description"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {editingUnit ? "Update" : "Create"}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
          <CardTitle>Units ({filteredUnits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.description || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={unit.status === "Active" ? "default" : "secondary"}>
                      {unit.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{unit.createdBy}</TableCell>
                  <TableCell>{unit.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(unit)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(unit.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default UnitMaster;