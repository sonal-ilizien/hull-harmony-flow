"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Save, FileText, AlertTriangle, CheckCircle, Clock, Ship, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { DataTable, Column } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// Types
interface DockingCheckoffList {
  id: number;
  vessel_name: string;
  vessel_id: number;
  docking_purpose: string;
  docking_version: string;
  vessel_length: number;
  vessel_beam: number;
  vessel_draught: number;
  stability_list: number;
  stability_trim: number;
  metacentric_height: number;
  weight_changes: number;
  entry_direction: "Bow First" | "Stern First";
  overhang_flight_deck: number;
  overhang_sponsons: number;
  overhang_walkways: number;
  overhang_platforms: number;
  underwater_projections: string[];
  dock_blocks_height: number;
  interference_objects: string[];
  clearance_requirements: string[];
  clearance_above_vessel: string[];
  ship_lift_depth: number;
  water_depth_blocks: number;
  water_depth_basin: number;
  tidal_constraints: string;
  floating_dock_depth: number;
  shape_blocks_matching: boolean;
  working_envelope: string;
  refitting_authority: string;
  command_hq: string;
  status: "Draft" | "Command Review" | "IHQ Review" | "Approved" | "Archived";
  created_at: string;
  updated_at: string;
  archived_until?: string;
}

interface Vessel {
  id: number;
  name: string;
}

// Constants
const DOCKING_PURPOSES = [
  "Routine Maintenance",
  "Major Overhaul", 
  "Emergency Repair",
  "Inspection",
  "Modification",
  "Refit"
];

const UNDERWATER_PROJECTIONS = [
  "Sonar Domes/Transducers",
  "Anodes/Electrodes (Cathodic Protection)",
  "Propellers",
  "Water Jet Ducts",
  "Voith Schneider Units",
  "Stabilizers",
  "Bilge Keels",
  "Skegs",
  "Bulbous Bow",
  "Hydroplanes",
  "Submarine Lower Rudder",
  "Speed Distance Probes"
];

const INTERFERENCE_OBJECTS = [
  "High Cradle Blocks",
  "Docking Towers",
  "Trestles",
  "Dock Bottom Obstructions",
  "Other Vessels"
];

const CLEARANCE_REQUIREMENTS = [
  "Propeller Removal",
  "Shaft Removal", 
  "Rudder Removal",
  "Sonar Removal",
  "Stabilizer Removal",
  "Submarine Hydroplanes/Fins Removal",
  "Staging and Scaffolding Erection",
  "Mast Removal",
  "Periscope Removal"
];

const COMMAND_HQS = [
  "Western Naval Command",
  "Eastern Naval Command", 
  "Southern Naval Command",
  "Northern Naval Command",
  "Andaman & Nicobar Command"
];

const REFITTING_AUTHORITIES = [
  "Mazagon Dock Shipbuilders Limited",
  "Garden Reach Shipbuilders & Engineers",
  "Cochin Shipyard Limited",
  "Hindustan Shipyard Limited",
  "Goa Shipyard Limited",
  "Larsen & Toubro Shipyard"
];

interface DockingCheckoffListsTransactionProps {
  checkoffLists: DockingCheckoffList[];
  vessels: Vessel[];
  onCheckoffListsChange: (checkoffLists: DockingCheckoffList[]) => void;
}

const DockingCheckoffListsTransaction = ({ 
  checkoffLists, 
  vessels, 
  onCheckoffListsChange 
}: DockingCheckoffListsTransactionProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCheckoff, setEditingCheckoff] = useState<DockingCheckoffList | null>(null);

  const [checkoffForm, setCheckoffForm] = useState({
    vessel_id: "",
    docking_purpose: "",
    docking_version: "",
    vessel_length: "",
    vessel_beam: "",
    vessel_draught: "",
    stability_list: "",
    stability_trim: "",
    metacentric_height: "",
    weight_changes: "",
    entry_direction: "Bow First" as "Bow First" | "Stern First",
    overhang_flight_deck: "",
    overhang_sponsons: "",
    overhang_walkways: "",
    overhang_platforms: "",
    underwater_projections: [] as string[],
    dock_blocks_height: "",
    interference_objects: [] as string[],
    clearance_requirements: [] as string[],
    clearance_above_vessel: [] as string[],
    ship_lift_depth: "",
    water_depth_blocks: "",
    water_depth_basin: "",
    tidal_constraints: "",
    floating_dock_depth: "",
    shape_blocks_matching: false,
    working_envelope: "",
    refitting_authority: "",
    command_hq: "",
    status: "Draft" as "Draft" | "Command Review" | "IHQ Review" | "Approved" | "Archived"
  });


  const handleOpenNewCheckoff = () => {
    setEditingCheckoff(null);
    setCheckoffForm({
      vessel_id: "",
      docking_purpose: "",
      docking_version: "",
      vessel_length: "",
      vessel_beam: "",
      vessel_draught: "",
      stability_list: "",
      stability_trim: "",
      metacentric_height: "",
      weight_changes: "",
      entry_direction: "Bow First",
      overhang_flight_deck: "",
      overhang_sponsons: "",
      overhang_walkways: "",
      overhang_platforms: "",
      underwater_projections: [],
      dock_blocks_height: "",
      interference_objects: [],
      clearance_requirements: [],
      clearance_above_vessel: [],
      ship_lift_depth: "",
      water_depth_blocks: "",
      water_depth_basin: "",
      tidal_constraints: "",
      floating_dock_depth: "",
      shape_blocks_matching: false,
      working_envelope: "",
      refitting_authority: "",
      command_hq: "",
      status: "Draft"
    });
    setIsDialogOpen(true);
  };

  const handleCheckoffSave = () => {
    const vessel = vessels.find(v => v.id === parseInt(checkoffForm.vessel_id));
    const checkoffData: DockingCheckoffList = {
      id: editingCheckoff?.id || Date.now(),
      vessel_name: vessel?.name || `Vessel ${checkoffForm.vessel_id}`,
      vessel_id: parseInt(checkoffForm.vessel_id) || 0,
      docking_purpose: checkoffForm.docking_purpose,
      docking_version: checkoffForm.docking_version,
      vessel_length: parseFloat(checkoffForm.vessel_length) || 0,
      vessel_beam: parseFloat(checkoffForm.vessel_beam) || 0,
      vessel_draught: parseFloat(checkoffForm.vessel_draught) || 0,
      stability_list: parseFloat(checkoffForm.stability_list) || 0,
      stability_trim: parseFloat(checkoffForm.stability_trim) || 0,
      metacentric_height: parseFloat(checkoffForm.metacentric_height) || 0,
      weight_changes: parseFloat(checkoffForm.weight_changes) || 0,
      entry_direction: checkoffForm.entry_direction,
      overhang_flight_deck: parseFloat(checkoffForm.overhang_flight_deck) || 0,
      overhang_sponsons: parseFloat(checkoffForm.overhang_sponsons) || 0,
      overhang_walkways: parseFloat(checkoffForm.overhang_walkways) || 0,
      overhang_platforms: parseFloat(checkoffForm.overhang_platforms) || 0,
      underwater_projections: checkoffForm.underwater_projections,
      dock_blocks_height: parseFloat(checkoffForm.dock_blocks_height) || 0,
      interference_objects: checkoffForm.interference_objects,
      clearance_requirements: checkoffForm.clearance_requirements,
      clearance_above_vessel: checkoffForm.clearance_above_vessel,
      ship_lift_depth: parseFloat(checkoffForm.ship_lift_depth) || 0,
      water_depth_blocks: parseFloat(checkoffForm.water_depth_blocks) || 0,
      water_depth_basin: parseFloat(checkoffForm.water_depth_basin) || 0,
      tidal_constraints: checkoffForm.tidal_constraints,
      floating_dock_depth: parseFloat(checkoffForm.floating_dock_depth) || 0,
      shape_blocks_matching: checkoffForm.shape_blocks_matching,
      working_envelope: checkoffForm.working_envelope,
      refitting_authority: checkoffForm.refitting_authority,
      command_hq: checkoffForm.command_hq,
      status: checkoffForm.status,
      created_at: editingCheckoff?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      archived_until: editingCheckoff?.archived_until
    };
    
    if (editingCheckoff) {
      onCheckoffListsChange(checkoffLists.map(c => (c.id === editingCheckoff.id ? checkoffData : c)));
      toast({
        title: "Check-off List Updated",
        description: "Check-off list has been successfully updated",
        duration: 3000,
      });
    } else {
      onCheckoffListsChange([...checkoffLists, checkoffData]);
      toast({
        title: "Check-off List Created",
        description: "New check-off list has been created successfully",
        duration: 3000,
      });
    }
    setIsDialogOpen(false);
  };

  const handleDeleteCheckoff = (checkoffId: number) => {
    onCheckoffListsChange(checkoffLists.filter(c => c.id !== checkoffId));
    toast({
      title: "Check-off List Deleted",
      description: "Check-off list has been successfully deleted",
      duration: 3000,
    });
  };

  const handleStatusChange = (checkoffId: number, newStatus: DockingCheckoffList['status']) => {
    onCheckoffListsChange(checkoffLists.map(c => 
      c.id === checkoffId ? { ...c, status: newStatus, updated_at: new Date().toISOString() } : c
    ));
    toast({
      title: "Status Updated",
      description: `Check-off list status changed to ${newStatus}`,
      duration: 3000,
    });
  };

  // Checkoff lists columns
  const checkoffColumns: Column<DockingCheckoffList>[] = [
    { header: "Vessel", accessor: "vessel_name" },
    { header: "Purpose", accessor: "docking_purpose" },
    { header: "Version", accessor: "docking_version" },
    { header: "Refitting Authority", accessor: "refitting_authority" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => {
        const statusConfig = {
          "Draft": { variant: "outline" as const, icon: FileText, color: "text-white" },
          "Command Review": { variant: "secondary" as const, icon: Clock, color: "text-white" },
          "IHQ Review": { variant: "secondary" as const, icon: AlertTriangle, color: "text-orange-600" },
          "Approved": { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
          "Archived": { variant: "outline" as const, icon: FileText, color: "text-gray-500" }
        };
        
        const config = statusConfig[row.status];
        const Icon = config.icon;
        
        return (
          <Badge variant={config.variant} className={`${config.color} flex items-center gap-1`}>
            <Icon className="h-3 w-3" />
            {row.status}
          </Badge>
        );
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingCheckoff(row);
              setCheckoffForm({
                vessel_id: row.vessel_id.toString(),
                docking_purpose: row.docking_purpose,
                docking_version: row.docking_version,
                vessel_length: row.vessel_length.toString(),
                vessel_beam: row.vessel_beam.toString(),
                vessel_draught: row.vessel_draught.toString(),
                stability_list: row.stability_list.toString(),
                stability_trim: row.stability_trim.toString(),
                metacentric_height: row.metacentric_height.toString(),
                weight_changes: row.weight_changes.toString(),
                entry_direction: row.entry_direction,
                overhang_flight_deck: row.overhang_flight_deck.toString(),
                overhang_sponsons: row.overhang_sponsons.toString(),
                overhang_walkways: row.overhang_walkways.toString(),
                overhang_platforms: row.overhang_platforms.toString(),
                underwater_projections: row.underwater_projections,
                dock_blocks_height: row.dock_blocks_height.toString(),
                interference_objects: row.interference_objects,
                clearance_requirements: row.clearance_requirements,
                clearance_above_vessel: row.clearance_above_vessel,
                ship_lift_depth: row.ship_lift_depth.toString(),
                water_depth_blocks: row.water_depth_blocks.toString(),
                water_depth_basin: row.water_depth_basin.toString(),
                tidal_constraints: row.tidal_constraints,
                floating_dock_depth: row.floating_dock_depth.toString(),
                shape_blocks_matching: row.shape_blocks_matching,
                working_envelope: row.working_envelope,
                refitting_authority: row.refitting_authority,
                command_hq: row.command_hq,
                status: row.status
              });
              setIsDialogOpen(true);
            }}
          >
            <Edit className="mr-1 h-3 w-3" />
            Edit
          </Button>
          {row.status === "Draft" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleStatusChange(row.id, "Command Review")}
            >
              <Clock className="mr-1 h-3 w-3" />
              Submit
            </Button>
          )}
          {row.status === "Command Review" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleStatusChange(row.id, "IHQ Review")}
            >
              <AlertTriangle className="mr-1 h-3 w-3" />
              Forward to IHQ
            </Button>
          )}
          {row.status === "IHQ Review" && (
            <Button
              size="sm"
              variant="default"
              onClick={() => handleStatusChange(row.id, "Approved")}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Approve
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteCheckoff(row.id)}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Docking Check-off Lists</CardTitle>
            <Button onClick={handleOpenNewCheckoff}>
              <Plus className="mr-2 h-4 w-4" /> New Check-off List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={checkoffColumns} data={checkoffLists} />
        </CardContent>
      </Card>

      {/* Check-off List Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-[#1a2746] to-[#223366] p-4 text-white">
            <DialogTitle>{editingCheckoff ? "Edit Check-off List" : "New Check-off List"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 p-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vessel_id">Vessel</Label>
                  <Select value={checkoffForm.vessel_id} onValueChange={(val) => setCheckoffForm(f => ({ ...f, vessel_id: val }))}>
                    <SelectTrigger><SelectValue placeholder="Select Vessel" /></SelectTrigger>
                    <SelectContent>
                      {vessels.map(vessel => (
                        <SelectItem key={vessel.id} value={vessel.id.toString()}>
                          {vessel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docking_purpose">Docking Purpose</Label>
                  <Select value={checkoffForm.docking_purpose} onValueChange={(val) => setCheckoffForm(f => ({ ...f, docking_purpose: val }))}>
                    <SelectTrigger><SelectValue placeholder="Select Purpose" /></SelectTrigger>
                    <SelectContent>
                      {DOCKING_PURPOSES.map(purpose => (
                        <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docking_version">Docking Version</Label>
                  <Input 
                    value={checkoffForm.docking_version} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, docking_version: e.target.value }))} 
                    placeholder="e.g., v2.1" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entry_direction">Entry Direction</Label>
                  <Select value={checkoffForm.entry_direction} onValueChange={(val) => setCheckoffForm(f => ({ ...f, entry_direction: val as "Bow First" | "Stern First" }))}>
                    <SelectTrigger><SelectValue placeholder="Select Direction" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bow First">Bow First</SelectItem>
                      <SelectItem value="Stern First">Stern First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Vessel Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vessel Dimensions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vessel_length">Length (m)</Label>
                  <Input 
                    type="number"
                    value={checkoffForm.vessel_length} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, vessel_length: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vessel_beam">Beam (m)</Label>
                  <Input 
                    type="number"
                    value={checkoffForm.vessel_beam} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, vessel_beam: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vessel_draught">Draught (m)</Label>
                  <Input 
                    type="number"
                    value={checkoffForm.vessel_draught} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, vessel_draught: e.target.value }))} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stability Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stability Parameters</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stability_list">List (degrees)</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={checkoffForm.stability_list} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, stability_list: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stability_trim">Trim (degrees)</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={checkoffForm.stability_trim} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, stability_trim: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metacentric_height">Metacentric Height (m)</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={checkoffForm.metacentric_height} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, metacentric_height: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_changes">Weight Changes (tons)</Label>
                  <Input 
                    type="number"
                    value={checkoffForm.weight_changes} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, weight_changes: e.target.value }))} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Overhang Measurements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overhang Measurements (m)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="overhang_flight_deck">Flight Deck</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={checkoffForm.overhang_flight_deck} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, overhang_flight_deck: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overhang_sponsons">Sponsons</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={checkoffForm.overhang_sponsons} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, overhang_sponsons: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overhang_walkways">Walkways</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={checkoffForm.overhang_walkways} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, overhang_walkways: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overhang_platforms">Platforms</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={checkoffForm.overhang_platforms} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, overhang_platforms: e.target.value }))} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Underwater Projections */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Underwater Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {UNDERWATER_PROJECTIONS.map(projection => (
                    <div key={projection} className="flex items-center space-x-2">
                      <Checkbox
                        id={projection}
                        checked={checkoffForm.underwater_projections.includes(projection)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCheckoffForm(f => ({
                              ...f,
                              underwater_projections: [...f.underwater_projections, projection]
                            }));
                          } else {
                            setCheckoffForm(f => ({
                              ...f,
                              underwater_projections: f.underwater_projections.filter(p => p !== projection)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={projection} className="text-sm">{projection}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dock and Water Depths */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dock and Water Depths (m)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dock_blocks_height">Dock Blocks Height</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={checkoffForm.dock_blocks_height} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, dock_blocks_height: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ship_lift_depth">Ship Lift Depth</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={checkoffForm.ship_lift_depth} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, ship_lift_depth: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="water_depth_blocks">Water Depth to Blocks</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={checkoffForm.water_depth_blocks} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, water_depth_blocks: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="water_depth_basin">Water Depth in Basin</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={checkoffForm.water_depth_basin} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, water_depth_basin: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floating_dock_depth">Floating Dock Depth</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={checkoffForm.floating_dock_depth} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, floating_dock_depth: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tidal_constraints">Tidal Constraints</Label>
                  <Input 
                    value={checkoffForm.tidal_constraints} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, tidal_constraints: e.target.value }))} 
                    placeholder="e.g., High tide required for entry"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Authorities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Authorities</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refitting_authority">Refitting Authority</Label>
                  <Select value={checkoffForm.refitting_authority} onValueChange={(val) => setCheckoffForm(f => ({ ...f, refitting_authority: val }))}>
                    <SelectTrigger><SelectValue placeholder="Select Refitting Authority" /></SelectTrigger>
                    <SelectContent>
                      {REFITTING_AUTHORITIES.map(authority => (
                        <SelectItem key={authority} value={authority}>{authority}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="command_hq">Command HQ</Label>
                  <Select value={checkoffForm.command_hq} onValueChange={(val) => setCheckoffForm(f => ({ ...f, command_hq: val }))}>
                    <SelectTrigger><SelectValue placeholder="Select Command HQ" /></SelectTrigger>
                    <SelectContent>
                      {COMMAND_HQS.map(hq => (
                        <SelectItem key={hq} value={hq}>{hq}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Additional Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shape_blocks_matching"
                    checked={checkoffForm.shape_blocks_matching}
                    onCheckedChange={(checked) => setCheckoffForm(f => ({ ...f, shape_blocks_matching: !!checked }))}
                  />
                  <Label htmlFor="shape_blocks_matching">Shape blocks matching with ship's contour</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="working_envelope">Working Envelope</Label>
                  <Input 
                    value={checkoffForm.working_envelope} 
                    onChange={(e) => setCheckoffForm(f => ({ ...f, working_envelope: e.target.value }))} 
                    placeholder="e.g., Single vessel docking"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCheckoffSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Check-off List
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DockingCheckoffListsTransaction;
