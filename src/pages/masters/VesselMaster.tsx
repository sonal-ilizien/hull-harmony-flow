import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Ship } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [vessels, setVessels] = useState<Vessel[]>([
    { 
      id: 1, 
      name: "INS Vikrant", 
      classOfVessel: "Vikrant Class", 
      vesselType: "Aircraft Carrier",
      command: "Western Naval Command",
      dockyard: "Cochin Shipyard",
      yearOfBuild: 2013,
      yearOfDelivery: 2022,
      status: "Active", 
      createdBy: "Admin", 
      createdAt: "2024-01-15" 
    },
    { 
      id: 2, 
      name: "INS Kolkata", 
      classOfVessel: "Kolkata Class", 
      vesselType: "Destroyer",
      command: "Western Naval Command",
      dockyard: "Mazagon Dock",
      yearOfBuild: 2006,
      yearOfDelivery: 2014,
      status: "Active", 
      createdBy: "Admin", 
      createdAt: "2024-01-15" 
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    classOfVessel: "",
    vesselType: "",
    command: "",
    dockyard: "",
    yearOfBuild: "",
    yearOfDelivery: "",
    status: "Active"
  });
  
  const { toast } = useToast();

  // Mock data for dropdowns
  const classOfVessels = ["Vikrant Class", "Kolkata Class", "Delhi Class", "Rajput Class", "Shivalik Class"];
  const vesselTypes = ["Aircraft Carrier", "Destroyer", "Frigate", "Corvette", "Submarine", "Support Vessel"];
  const commands = ["Eastern Naval Command", "Western Naval Command", "Southern Naval Command"];
  const dockyards = ["Cochin Shipyard", "Mazagon Dock", "Garden Reach Shipyard", "Goa Shipyard"];

  const filteredVessels = vessels.filter(vessel =>
    vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vessel.classOfVessel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vessel.command.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.name.trim() || !formData.classOfVessel || !formData.vesselType || !formData.command) {
      toast({
        title: "Validation Error",
        description: "Name, Class, Type, and Command are required fields",
        variant: "destructive",
      });
      return;
    }

    const vesselData = {
      ...formData,
      yearOfBuild: formData.yearOfBuild ? parseInt(formData.yearOfBuild) : undefined,
      yearOfDelivery: formData.yearOfDelivery ? parseInt(formData.yearOfDelivery) : undefined,
    };

    if (editingVessel) {
      setVessels(prev => prev.map(vessel => 
        vessel.id === editingVessel.id 
          ? { ...vessel, ...vesselData }
          : vessel
      ));
      toast({
        title: "Success",
        description: "Vessel updated successfully",
      });
    } else {
      const newVessel: Vessel = {
        id: Math.max(...vessels.map(v => v.id)) + 1,
        ...vesselData,
        createdBy: "Current User",
        createdAt: new Date().toISOString().split('T')[0]
      };
      setVessels(prev => [...prev, newVessel]);
      toast({
        title: "Success", 
        description: "Vessel created successfully",
      });
    }

    setIsDialogOpen(false);
    setEditingVessel(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      classOfVessel: "",
      vesselType: "",
      command: "",
      dockyard: "",
      yearOfBuild: "",
      yearOfDelivery: "",
      status: "Active"
    });
  };

  const handleEdit = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setFormData({
      name: vessel.name,
      classOfVessel: vessel.classOfVessel,
      vesselType: vessel.vesselType,
      command: vessel.command,
      dockyard: vessel.dockyard,
      yearOfBuild: vessel.yearOfBuild?.toString() || "",
      yearOfDelivery: vessel.yearOfDelivery?.toString() || "",
      status: vessel.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this vessel?")) {
      setVessels(prev => prev.filter(vessel => vessel.id !== id));
      toast({
        title: "Success",
        description: "Vessel deleted successfully",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Vessel Master</h1>
          <p className="text-muted-foreground">Manage naval vessels and their specifications</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingVessel(null);
                resetForm();
              }}
              className="bg-gradient-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vessel
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                {editingVessel ? "Edit Vessel" : "Add New Vessel"}
              </DialogTitle>
              <DialogDescription>
                {editingVessel ? "Update vessel information" : "Create a new naval vessel record"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Vessel Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter vessel name (e.g., INS Vikrant)"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="classOfVessel">Class of Vessel *</Label>
                <Select value={formData.classOfVessel} onValueChange={(value) => setFormData({...formData, classOfVessel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vessel class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOfVessels.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="vesselType">Vessel Type *</Label>
                <Select value={formData.vesselType} onValueChange={(value) => setFormData({...formData, vesselType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vessel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vesselTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="command">Command *</Label>
                <Select value={formData.command} onValueChange={(value) => setFormData({...formData, command: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select command" />
                  </SelectTrigger>
                  <SelectContent>
                    {commands.map((cmd) => (
                      <SelectItem key={cmd} value={cmd}>{cmd}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dockyard">Dockyard</Label>
                <Select value={formData.dockyard} onValueChange={(value) => setFormData({...formData, dockyard: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dockyard" />
                  </SelectTrigger>
                  <SelectContent>
                    {dockyards.map((yard) => (
                      <SelectItem key={yard} value={yard}>{yard}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="yearOfBuild">Year of Build</Label>
                <Input
                  id="yearOfBuild"
                  type="number"
                  min="1900"
                  max="2030"
                  value={formData.yearOfBuild}
                  onChange={(e) => setFormData({...formData, yearOfBuild: e.target.value})}
                  placeholder="YYYY"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="yearOfDelivery">Year of Delivery</Label>
                <Input
                  id="yearOfDelivery"
                  type="number"
                  min="1900"
                  max="2030"
                  value={formData.yearOfDelivery}
                  onChange={(e) => setFormData({...formData, yearOfDelivery: e.target.value})}
                  placeholder="YYYY"
                />
              </div>
              
              <div className="col-span-2 flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {editingVessel ? "Update" : "Create"}
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
              placeholder="Search vessels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vessels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vessels ({filteredVessels.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Command</TableHead>
                <TableHead>Dockyard</TableHead>
                <TableHead>Year Built</TableHead>
                <TableHead>Year Delivered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVessels.map((vessel) => (
                <TableRow key={vessel.id}>
                  <TableCell className="font-medium">{vessel.name}</TableCell>
                  <TableCell>{vessel.classOfVessel}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{vessel.vesselType}</Badge>
                  </TableCell>
                  <TableCell>{vessel.command}</TableCell>
                  <TableCell>{vessel.dockyard || "-"}</TableCell>
                  <TableCell>{vessel.yearOfBuild || "-"}</TableCell>
                  <TableCell>{vessel.yearOfDelivery || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={vessel.status === "Active" ? "default" : "secondary"}>
                      {vessel.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(vessel)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(vessel.id)}
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

export default VesselMaster;