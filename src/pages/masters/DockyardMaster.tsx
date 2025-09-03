import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [dockyards, setDockyards] = useState<Dockyard[]>([
    { 
      id: 1, 
      name: "Cochin Shipyard Limited", 
      location: "Kochi, Kerala",
      capacity: "Large vessels up to 300m",
      facilities: "Dry dock, Wet dock, Repair facilities",
      status: "Active", 
      createdBy: "Admin", 
      createdAt: "2024-01-15" 
    },
    { 
      id: 2, 
      name: "Mazagon Dock Shipbuilders", 
      location: "Mumbai, Maharashtra",
      capacity: "Naval vessels, Submarines", 
      facilities: "Construction, Repair, Refit",
      status: "Active", 
      createdBy: "Admin", 
      createdAt: "2024-01-15" 
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDockyard, setEditingDockyard] = useState<Dockyard | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    facilities: "",
    status: "Active"
  });
  
  const { toast } = useToast();

  const filteredDockyards = dockyards.filter(dockyard =>
    dockyard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dockyard.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.name.trim() || !formData.location.trim()) {
      toast({
        title: "Validation Error",
        description: "Dockyard name and location are required",
        variant: "destructive",
      });
      return;
    }

    if (editingDockyard) {
      setDockyards(prev => prev.map(dockyard => 
        dockyard.id === editingDockyard.id 
          ? { ...dockyard, ...formData }
          : dockyard
      ));
      toast({
        title: "Success",
        description: "Dockyard updated successfully",
      });
    } else {
      const newDockyard: Dockyard = {
        id: Math.max(...dockyards.map(d => d.id)) + 1,
        ...formData,
        createdBy: "Current User",
        createdAt: new Date().toISOString().split('T')[0]
      };
      setDockyards(prev => [...prev, newDockyard]);
      toast({
        title: "Success", 
        description: "Dockyard created successfully",
      });
    }

    setIsDialogOpen(false);
    setEditingDockyard(null);
    setFormData({ name: "", location: "", capacity: "", facilities: "", status: "Active" });
  };

  const handleEdit = (dockyard: Dockyard) => {
    setEditingDockyard(dockyard);
    setFormData({
      name: dockyard.name,
      location: dockyard.location,
      capacity: dockyard.capacity,
      facilities: dockyard.facilities,
      status: dockyard.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this dockyard?")) {
      setDockyards(prev => prev.filter(dockyard => dockyard.id !== id));
      toast({
        title: "Success",
        description: "Dockyard deleted successfully",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dockyard Master</h1>
          <p className="text-muted-foreground">Manage dockyards and shipbuilding facilities</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingDockyard(null);
                setFormData({ name: "", location: "", capacity: "", facilities: "", status: "Active" });
              }}
              className="bg-gradient-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Dockyard
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {editingDockyard ? "Edit Dockyard" : "Add New Dockyard"}
              </DialogTitle>
              <DialogDescription>
                {editingDockyard ? "Update dockyard information" : "Create a new dockyard facility"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Dockyard Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter dockyard name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Enter location (City, State)"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="capacity">Capacity & Capabilities</Label>
                <Input
                  id="capacity"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  placeholder="Describe vessel capacity and size limits"
                />
              </div>
              
              <div>
                <Label htmlFor="facilities">Facilities & Services</Label>
                <Textarea
                  id="facilities"
                  value={formData.facilities}
                  onChange={(e) => setFormData({...formData, facilities: e.target.value})}
                  placeholder="Describe available facilities (dry dock, repair, construction, etc.)"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {editingDockyard ? "Update" : "Create"}
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
              placeholder="Search dockyards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dockyards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dockyards ({filteredDockyards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Facilities</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDockyards.map((dockyard) => (
                <TableRow key={dockyard.id}>
                  <TableCell className="font-medium">{dockyard.name}</TableCell>
                  <TableCell>{dockyard.location}</TableCell>
                  <TableCell>{dockyard.capacity || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate" title={dockyard.facilities}>
                    {dockyard.facilities || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={dockyard.status === "Active" ? "default" : "secondary"}>
                      {dockyard.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{dockyard.createdBy}</TableCell>
                  <TableCell>{dockyard.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(dockyard)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(dockyard.id)}
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

export default DockyardMaster;