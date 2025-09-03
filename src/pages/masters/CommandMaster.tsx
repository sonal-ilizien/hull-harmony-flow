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

interface Command {
  id: number;
  name: string;
  code: string;
  headquarters: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

const CommandMaster = () => {
  const [commands, setCommands] = useState<Command[]>([
    { id: 1, name: "Eastern Naval Command", code: "ENC", headquarters: "Visakhapatnam", status: "Active", createdBy: "Admin", createdAt: "2024-01-15" },
    { id: 2, name: "Western Naval Command", code: "WNC", headquarters: "Mumbai", status: "Active", createdBy: "Admin", createdAt: "2024-01-15" },
    { id: 3, name: "Southern Naval Command", code: "SNC", headquarters: "Kochi", status: "Active", createdBy: "Admin", createdAt: "2024-01-15" }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    headquarters: "",
    status: "Active"
  });
  
  const { toast } = useToast();

  const filteredCommands = commands.filter(command =>
    command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.headquarters.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "Validation Error",
        description: "Command name and code are required",
        variant: "destructive",
      });
      return;
    }

    if (editingCommand) {
      setCommands(prev => prev.map(command => 
        command.id === editingCommand.id 
          ? { ...command, ...formData }
          : command
      ));
      toast({
        title: "Success",
        description: "Command updated successfully",
      });
    } else {
      const newCommand: Command = {
        id: Math.max(...commands.map(c => c.id)) + 1,
        ...formData,
        createdBy: "Current User",
        createdAt: new Date().toISOString().split('T')[0]
      };
      setCommands(prev => [...prev, newCommand]);
      toast({
        title: "Success", 
        description: "Command created successfully",
      });
    }

    setIsDialogOpen(false);
    setEditingCommand(null);
    setFormData({ name: "", code: "", headquarters: "", status: "Active" });
  };

  const handleEdit = (command: Command) => {
    setEditingCommand(command);
    setFormData({
      name: command.name,
      code: command.code,
      headquarters: command.headquarters,
      status: command.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this command?")) {
      setCommands(prev => prev.filter(command => command.id !== id));
      toast({
        title: "Success",
        description: "Command deleted successfully",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Command Master</h1>
          <p className="text-muted-foreground">Manage naval commands and their headquarters</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingCommand(null);
                setFormData({ name: "", code: "", headquarters: "", status: "Active" });
              }}
              className="bg-gradient-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Command
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCommand ? "Edit Command" : "Add New Command"}</DialogTitle>
              <DialogDescription>
                {editingCommand ? "Update command information" : "Create a new naval command"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Command Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter command name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="code">Command Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="Enter command code (e.g., ENC)"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="headquarters">Headquarters</Label>
                <Input
                  id="headquarters"
                  value={formData.headquarters}
                  onChange={(e) => setFormData({...formData, headquarters: e.target.value})}
                  placeholder="Enter headquarters location"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {editingCommand ? "Update" : "Create"}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Headquarters</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommands.map((command) => (
                <TableRow key={command.id}>
                  <TableCell className="font-medium">{command.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{command.code}</Badge>
                  </TableCell>
                  <TableCell>{command.headquarters || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={command.status === "Active" ? "default" : "secondary"}>
                      {command.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{command.createdBy}</TableCell>
                  <TableCell>{command.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(command)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(command.id)}
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

export default CommandMaster;