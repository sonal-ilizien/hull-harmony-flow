import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Save, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column } from "@/components/ui/table";
import { get, post, put, del } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HvacTrial {
  id: number;
  ship: string;
  date_of_trials: string;
  place_of_trials: string;
  document_no: string;
  occasion_of_trials: string;
  authority_for_trials: string;
}

interface AirFlow {
  id: number;
  compartment: string;
  served_by: string;
  no_of_ducts: number;
  duct_area?: number;
  air_flow?: number;
  flow_rate_at_duct?: number;
  design_air_flow_rate?: number;
  measured_air_flow_rate?: number;
  observations?: string;
  remarks?: string;
  isEditing?: boolean;
  hvac_trial?: number;
}

interface MachineryAirFlow extends AirFlow {}

const PLACE_CHOICES = [
  "Mumbai",
  "Visakhapatnam",
  "Kochi",
  "Karwar",
  "Sri Vijayapuram",
  "Porbandar",
  "Okha",
];

const OCCASION_CHOICES = [
  { value: "Pre-Refit", label: "Pre-Refit Trials" },
  { value: "End-Refit", label: "End of Refit Trials" },
  { value: "Surprise", label: "Surprise Checks" },
  { value: "Audit", label: "HVAC Audit" },
];

const OBSERVATIONS_CHOICES = [
  "Sub-optimal air flow",
  "Non-ops",
  "Nil",
  "Others"
];

const REMARKS_CHOICES = [
  "SAT",
  "SAT with observations",
  "UNSAT"
];

const HvacTrialForm = () => {
  const { toast } = useToast();

  // main state
  const [trials, setTrials] = useState<HvacTrial[]>([]);
  const [airFlows, setAirFlows] = useState<AirFlow[]>([]);
  const [machineryFlows, setMachineryFlows] = useState<MachineryAirFlow[]>([]);
  const [ships, setShips] = useState<{ id: number; name: string }[]>([]);
  const [compartments, setCompartments] = useState<{ id: number; name: string }[]>([]);

  const [isTrialDialogOpen, setIsTrialDialogOpen] = useState(false);
  const [editingTrial, setEditingTrial] = useState<HvacTrial | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [trialForm, setTrialForm] = useState({
    ship: "",
    date_of_trials: "",
    place_of_trials: "",
    document_no: "",
    occasion_of_trials: "",
    authority_for_trials: "",
  });

  const [airFlowForm, setAirFlowForm] = useState<AirFlow>({
    id: -1,
    compartment: "",
    served_by: "",
    no_of_ducts: 0,
    observations: "",
    remarks: "",
  });

  const [machineryForm, setMachineryForm] = useState<MachineryAirFlow>({
    id: -1,
    compartment: "",
    served_by: "",
    no_of_ducts: 0,
    observations: "",
    remarks: "",
  });

  // ---------------- API calls ----------------
const fetchTrials = async () => {
  try {
    const res = await get("/shipmodule/trials/?page=1");

    // Ensure we always set an array
    const trialsData = res?.results ?? res?.data ?? res ?? [];
    setTrials(Array.isArray(trialsData) ? trialsData : []);
  } catch {
    toast({
      title: "Error",
      description: "Failed to load trials",
      variant: "destructive",
    });
  }
};


  const fetchShips = async () => {
    try {
      const res = await get("/master/vessels/");
      // earlier responses used res.results — adapt if needed
      setShips(res.results || res.data || []);
    } catch {
      /* ignore */
    }
  };

  const fetchCompartments = async () => {
    try {
      const res = await get("/master/compartments/");
      setCompartments(res.results || res.data || []);
    } catch {
      /* ignore */
    }
  };

  const fetchMeasurements = async (trialId: number) => {
    try {
      const air = await get(`/shipmodule/ac-measurements/?hvac_trial=${trialId}`);
      const mach = await get(`/shipmodule/machinery-measurements/?hvac_trial=${trialId}`);
      setAirFlows(air || []);
      setMachineryFlows(mach || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load measurements",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTrials();
    fetchShips();
    fetchCompartments();
  }, []);

  // ---------------- Trial handlers ----------------
  const handleTrialSave = async () => {
    try {
      let trial: HvacTrial;
      if (editingTrial) {
        trial = await put(`/shipmodule/trials/${editingTrial.id}/`, trialForm);
        setTrials((prev) =>
          prev.map((t) => (t.id === editingTrial.id ? trial : t))
        );
        setEditingTrial(trial);
      } else {
        trial = await post("/shipmodule/trials/", trialForm);
        setTrials((prev) => [...prev, trial]);
        setEditingTrial(trial);
      }
      await fetchMeasurements(trial.id);
      toast({ title: "Success", description: "Trial saved. You can now add measurements." });
    } catch {
      toast({
        title: "Error",
        description: "Save failed",
        variant: "destructive",
      });
    }
  };

  // ---------------- Air Flow handlers ----------------
  const handleAirFlowChange = (
    id: number,
    field: keyof AirFlow,
    value: any
  ) => {
    setAirFlows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const saveAirFlowRow = async (row: AirFlow) => {
    try {
      if (row.id && row.id > 0) {
        // Existing row → PUT
        const updated = await put(`/shipmodule/ac-measurements/${row.id}/`, row);
        setAirFlows((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
        toast({ title: "Saved", description: "Air Flow updated" });
      } else {
        // New row → POST
        const payload = { ...row };
        delete payload.isEditing;
        delete payload.id; // remove temporary -1 ID
        const created = await post("/shipmodule/ac-measurements/", payload);
        // Replace the temporary row with the created one
        setAirFlows((prev) => [
          ...prev.filter((r) => r.id !== -1), // remove the temporary row
          { ...created, isEditing: false },
        ]);
        toast({ title: "Added", description: "Air Flow added" });
      }
    } catch {
      toast({
        title: "Error",
        description: "Save failed",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteAirFlow = async (id: number) => {
    if (!confirm("Delete this air flow measurement?")) return;
    try {
      await del(`/shipmodule/ac-measurements/${id}/`);
      setAirFlows((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Deleted", description: "Air Flow removed" });
    } catch {
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive",
      });
    }
  };

  const handleAirFlowSaveNew = async () => {
    try {
      const newRow: AirFlow = {
        id: -1,
        compartment: "",
        served_by: "",
        no_of_ducts: 0,
        observations: "",
        remarks: "",
        isEditing: true,
        hvac_trial: editingTrial!.id,
      };
      setAirFlows((prev) => [...prev, newRow]);
      toast({ title: "New row added - click Save to persist" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add new row",
        variant: "destructive",
      });
    }
  };

  // ---------------- Machinery handlers ----------------
  const handleMachineryChange = (
    id: number,
    field: keyof MachineryAirFlow,
    value: any
  ) => {
    setMachineryFlows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const saveMachineryRow = async (row: MachineryAirFlow) => {
    try {
      if (row.id && row.id > 0) {
        // Existing row → PUT
        const updated = await put(`/shipmodule/machinery-measurements/${row.id}/`, row);
        setMachineryFlows((prev) =>
          prev.map((r) => (r.id === row.id ? updated : r))
        );
        toast({ title: "Saved", description: "Machinery updated" });
      } else {
        // New row → POST
        const payload = { ...row };
        delete payload.isEditing;
        delete payload.id; // remove temporary -1 ID
        const created = await post("/shipmodule/machinery-measurements/", payload);
        setMachineryFlows((prev) => [
          ...prev.filter((r) => r.id !== -1), // remove temporary row
          { ...created, isEditing: false },
        ]);
        toast({ title: "Added", description: "Machinery added" });
      }
    } catch {
      toast({
        title: "Error",
        description: "Save failed",
        variant: "destructive",
      });
    }
  };
  

  const handleDeleteMachinery = async (id: number) => {
    if (!confirm("Delete this machinery measurement?")) return;
    try {
      await del(`/shipmodule/machinery-measurements/${id}/`);
      setMachineryFlows((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Deleted", description: "Machinery removed" });
    } catch {
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive",
      });
    }
  };

  const handleMachinerySaveNew = async () => {
    try {
      const newRow: MachineryAirFlow = {
        id: -1,
        compartment: "",
        served_by: "",
        no_of_ducts: 0,
        observations: "",
        remarks: "",
        isEditing: true,
        hvac_trial: editingTrial!.id,
      };
      setMachineryFlows((prev) => [...prev, newRow]);
      toast({ title: "New row added - click Save to persist" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add new row",
        variant: "destructive",
      });
    }
  };

  // ---------------- Edit trial ----------------
  const handleEdit = (trial: HvacTrial) => {
    setEditingTrial(trial);
    // populate trial form
    setTrialForm({
      ship: trial.ship?.toString() || "",
      date_of_trials: trial.date_of_trials,
      place_of_trials: trial.place_of_trials,
      document_no: trial.document_no,
      occasion_of_trials: trial.occasion_of_trials,
      authority_for_trials: trial.authority_for_trials,
    });
    fetchMeasurements(trial.id);
    setIsTrialDialogOpen(true);
  };

  const handleOpenNewTrial = () => {
    setEditingTrial(null);
    setTrialForm({
      ship: "",
      date_of_trials: "",
      place_of_trials: "",
      document_no: "",
      occasion_of_trials: "",
      authority_for_trials: "",
    });
    setAirFlows([]);
    setMachineryFlows([]);
    setIsTrialDialogOpen(true);
  };

  // ---------------- Columns (render inputs in cells) ----------------
  const trialColumns: Column<HvacTrial>[] = [
    { 
      header: "Ship", 
      accessor: "ship",
      render: (row) => {
        const ship = ships.find(s => s.id.toString() === row.ship?.toString());
        return ship?.name || row.ship || "";
      }
    },
    { header: "Date", accessor: "date_of_trials" },
    { header: "Place", accessor: "place_of_trials" },
    { header: "Document No", accessor: "document_no" },
    { header: "Occasion", accessor: "occasion_of_trials" },
    { header: "Authority", accessor: "authority_for_trials" },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="icon" onClick={() => handleEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={async () => {
              if (!confirm("Delete this trial?")) return;
              try {
                await del(`/shipmodule/trials/${row.id}/`);
                setTrials((p) => p.filter((t) => t.id !== row.id));
                toast({ title: "Deleted", description: "Trial removed" });
              } catch {
                toast({
                  title: "Error",
                  description: "Delete failed",
                  variant: "destructive",
                });
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const airFlowColumns: Column<AirFlow>[] = [
    {
      header: "Ser No",
      accessor: "id",
      render: (row) => (
        <div className="w-16 text-center">
          {airFlows.findIndex((r) => r.id === row.id) + 1}
        </div>
      ),
    },
    {
      header: "Served by ATU/ HE/ AHU/ FCU",
      accessor: "served_by",
      render: (row) => (
        <Input
          className="w-40"
          value={row.served_by || ""}
          onChange={(e) =>
            handleAirFlowChange(row.id, "served_by", e.target.value)
          }
        />
      ),
    },
    {
      header: "Compartment Name",
      accessor: "compartment",
      render: (row) => {
        const selectedCompartment = compartments.find(c => c.id.toString() === row.compartment?.toString());
        return (
          <Select
            value={row.compartment || ""}
            onValueChange={(val) =>
              handleAirFlowChange(row.id, "compartment", val)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Compartment">
                {selectedCompartment?.name || "Select Compartment"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {compartments.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      header: "No of Ducts",
      accessor: "no_of_ducts",
      render: (row) => (
        <Input
          className="w-24"
          type="number"
          value={String(row.no_of_ducts ?? "")}
          onChange={(e) =>
            handleAirFlowChange(row.id, "no_of_ducts", Number(e.target.value))
          }
        />
      ),
    },
    {
      header: "Duct Area (m²)",
      accessor: "duct_area",
      render: (row) => (
        <Input
          className="w-28"
          type="number"
          value={String(row.duct_area ?? "")}
          onChange={(e) =>
            handleAirFlowChange(row.id, "duct_area", Number(e.target.value))
          }
        />
      ),
    },
    {
      header: "Air Flow (m/s)",
      accessor: "air_flow",
      render: (row) => (
        <Input
          className="w-28"
          type="number"
          value={String(row.air_flow ?? "")}
          onChange={(e) =>
            handleAirFlowChange(row.id, "air_flow", Number(e.target.value))
          }
        />
      ),
    },
    {
      header: "Flow Rate at Duct (m³/hr)",
      accessor: "flow_rate_at_duct",
      render: (row) => (
        <Input
          className="w-36"
          type="number"
          value={String(row.flow_rate_at_duct ?? "")}
          onChange={(e) =>
            handleAirFlowChange(
              row.id,
              "flow_rate_at_duct",
              Number(e.target.value)
            )
          }
        />
      ),
    },
    {
      header: "Design Value",
      accessor: "design_air_flow_rate",
      render: (row) => (
        <Input
          className="w-28"
          type="number"
          value={String(row.design_air_flow_rate ?? "")}
          onChange={(e) =>
            handleAirFlowChange(
              row.id,
              "design_air_flow_rate",
              Number(e.target.value)
            )
          }
        />
      ),
    },
    {
      header: "Measured Value",
      accessor: "measured_air_flow_rate",
      render: (row) => (
        <Input
          className="w-28"
          type="number"
          value={String(row.measured_air_flow_rate ?? "")}
          onChange={(e) =>
            handleAirFlowChange(
              row.id,
              "measured_air_flow_rate",
              Number(e.target.value)
            )
          }
        />
      ),
    },
    {
      header: "Observations",
      accessor: "observations",
      render: (row) => (
        <Select
          value={row.observations || ""}
          onValueChange={(val) =>
            handleAirFlowChange(row.id, "observations", val)
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Observation" />
          </SelectTrigger>
          <SelectContent>
            {OBSERVATIONS_CHOICES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      header: "Remarks",
      accessor: "remarks",
      render: (row) => (
        <Select
          value={row.remarks || ""}
          onValueChange={(val) =>
            handleAirFlowChange(row.id, "remarks", val)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Remark" />
          </SelectTrigger>
          <SelectContent>
            {REMARKS_CHOICES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex gap-1 w-32">
          <Button 
            size="sm" 
            variant={row.isEditing ? "default" : "outline"}
            onClick={() => {
              if (row.isEditing) {
                saveAirFlowRow(row);
                handleAirFlowChange(row.id, "isEditing", false);
              } else {
                handleAirFlowChange(row.id, "isEditing", true);
              }
            }}
          >
            {row.isEditing ? <Save className="mr-1 h-3 w-3" /> : <Edit className="mr-1 h-3 w-3" />}
            {row.isEditing ? "Save" : "Edit"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteAirFlow(row.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  const machineryColumns: Column<MachineryAirFlow>[] = [
    {
      header: "Ser No",
      accessor: "id",
      render: (row) => (
        <div className="w-16 text-center">
          {machineryFlows.findIndex((r) => r.id === row.id) + 1}
        </div>
      ),
    },
    {
      header: "Served by ATU/ HE/ AHU/ FCU",
      accessor: "served_by",
      render: (row) => (
        <Input
          className="w-40"
          value={row.served_by || ""}
          onChange={(e) =>
            handleMachineryChange(row.id, "served_by", e.target.value)
          }
        />
      ),
    },
    {
      header: "Compartment Name",
      accessor: "compartment",
      render: (row) => {
        const selectedCompartment = compartments.find(c => c.id.toString() === row.compartment?.toString());
        return (
          <Select
            value={row.compartment || ""}
            onValueChange={(val) =>
              handleMachineryChange(row.id, "compartment", val)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Compartment">
                {selectedCompartment?.name || "Select Compartment"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {compartments.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      header: "No of Ducts",
      accessor: "no_of_ducts",
      render: (row) => (
        <Input
          className="w-24"
          type="number"
          value={String(row.no_of_ducts ?? "")}
          onChange={(e) =>
            handleMachineryChange(row.id, "no_of_ducts", Number(e.target.value))
          }
        />
      ),
    },
    {
      header: "Duct Area (m²)",
      accessor: "duct_area",
      render: (row) => (
        <Input
          className="w-28"
          type="number"
          value={String(row.duct_area ?? "")}
          onChange={(e) =>
            handleMachineryChange(row.id, "duct_area", Number(e.target.value))
          }
        />
      ),
    },
    {
      header: "Air Flow (m/s)",
      accessor: "air_flow",
      render: (row) => (
        <Input
          className="w-28"
          type="number"
          value={String(row.air_flow ?? "")}
          onChange={(e) =>
            handleMachineryChange(row.id, "air_flow", Number(e.target.value))
          }
        />
      ),
    },
    {
      header: "Flow Rate at Duct (m³/hr)",
      accessor: "flow_rate_at_duct",
      render: (row) => (
        <Input
          className="w-36"
          type="number"
          value={String(row.flow_rate_at_duct ?? "")}
          onChange={(e) =>
            handleMachineryChange(
              row.id,
              "flow_rate_at_duct",
              Number(e.target.value)
            )
          }
        />
      ),
    },
    {
      header: "Design Value",
      accessor: "design_air_flow_rate",
      render: (row) => (
        <Input
          className="w-28"
          type="number"
          value={String(row.design_air_flow_rate ?? "")}
          onChange={(e) =>
            handleMachineryChange(
              row.id,
              "design_air_flow_rate",
              Number(e.target.value)
            )
          }
        />
      ),
    },
    {
      header: "Measured Value",
      accessor: "measured_air_flow_rate",
      render: (row) => (
        <Input
          className="w-28"
          type="number"
          value={String(row.measured_air_flow_rate ?? "")}
          onChange={(e) =>
            handleMachineryChange(
              row.id,
              "measured_air_flow_rate",
              Number(e.target.value)
            )
          }
        />
      ),
    },
    {
      header: "Observations",
      accessor: "observations",
      render: (row) => (
        <Select
          value={row.observations || ""}
          onValueChange={(val) =>
            handleMachineryChange(row.id, "observations", val)
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Observation" />
          </SelectTrigger>
          <SelectContent>
            {OBSERVATIONS_CHOICES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      header: "Remarks",
      accessor: "remarks",
      render: (row) => (
        <Select
          value={row.remarks || ""}
          onValueChange={(val) =>
            handleMachineryChange(row.id, "remarks", val)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Remark" />
          </SelectTrigger>
          <SelectContent>
            {REMARKS_CHOICES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex gap-1 w-32">
          <Button 
            size="sm" 
            variant={row.isEditing ? "default" : "outline"}
            onClick={() => {
              if (row.isEditing) {
                saveMachineryRow(row);
                handleMachineryChange(row.id, "isEditing", false);
              } else {
                handleMachineryChange(row.id, "isEditing", true);
              }
            }}
          >
            {row.isEditing ? <Save className="mr-1 h-3 w-3" /> : <Edit className="mr-1 h-3 w-3" />}
            {row.isEditing ? "Save" : "Edit"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteMachinery(row.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  // ---------------- UI ----------------
  const filtered = trials.filter((t) => {
    const ship = ships.find(s => s.id.toString() === t.ship?.toString());
    const shipName = ship?.name || "";
    return shipName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">HVAC Trials</h1>

        <Dialog open={isTrialDialogOpen} onOpenChange={setIsTrialDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNewTrial}>
              <Plus className="mr-2 h-4 w-4" /> Add Trial
            </Button>
          </DialogTrigger>

          <DialogContent className="w-11/12 max-w-6xl rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
            <DialogHeader className="bg-gradient-to-r from-[#1a2746] to-[#223366] p-4 text-white">
              <DialogTitle>
                {editingTrial ? "Edit Trial" : "Add Trial"}
              </DialogTitle>
              <DialogDescription className="text-white">
                Enter trial details and add measurements
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {/* 2-column trial form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm mb-1 block">Ship</label>
                  <Select
                    value={trialForm.ship}
                    onValueChange={(val) =>
                      setTrialForm({ ...trialForm, ship: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Ship" />
                    </SelectTrigger>
                    <SelectContent>
                      {ships.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString() }>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm mb-1 block">Date of Trials</label>
                  <Input
                    type="date"
                    value={trialForm.date_of_trials}
                    onChange={(e) =>
                      setTrialForm({
                        ...trialForm,
                        date_of_trials: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Place</label>
                  <Select
                    value={trialForm.place_of_trials}
                    onValueChange={(val) =>
                      setTrialForm({ ...trialForm, place_of_trials: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Place" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLACE_CHOICES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm mb-1 block">Document No</label>
                  <Input
                    value={trialForm.document_no}
                    onChange={(e) =>
                      setTrialForm({
                        ...trialForm,
                        document_no: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Occasion</label>
                  <Select
                    value={trialForm.occasion_of_trials}
                    onValueChange={(val) =>
                      setTrialForm({ ...trialForm, occasion_of_trials: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      {OCCASION_CHOICES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm mb-1 block">Authority</label>
                  <Input
                    value={trialForm.authority_for_trials}
                    onChange={(e) =>
                      setTrialForm({
                        ...trialForm,
                        authority_for_trials: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Save Trial Button */}
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={handleTrialSave}
                  disabled={!trialForm.ship || !trialForm.date_of_trials || !trialForm.place_of_trials}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="mr-2 h-4 w-4" /> Save Trial
                </Button>
              </div>

              {/* Air Flow Table */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Air Flow Measurements</CardTitle>
                    <Button 
                      onClick={handleAirFlowSaveNew} 
                      disabled={!editingTrial}
                      className="ml-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </div>
                  {!editingTrial && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Please save the trial first before adding measurements
                    </p>
                  )}
                </CardHeader>
                <CardContent className="px-4 py-2">
                  <DataTable
                    columns={airFlowColumns}
                    data={airFlows}
                    rowsPerPage={5}
                    className="min-w-[1400px]"
                  />
                  {/* Add new Air Flow Row - Hidden form */}
                  <div className="hidden">
                    <div>
                      <label className="text-sm mb-1 block">Compartment</label>
                      <Select
                        value={airFlowForm.compartment}
                        onValueChange={(val) =>
                          setAirFlowForm({
                            ...airFlowForm,
                            compartment: val,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Compartment" />
                        </SelectTrigger>
                        <SelectContent>
                          {compartments.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">Served By</label>
                      <Input
                        value={airFlowForm.served_by}
                        onChange={(e) =>
                          setAirFlowForm({
                            ...airFlowForm,
                            served_by: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">No. of Ducts</label>
                      <Input
                        type="number"
                        value={String(airFlowForm.no_of_ducts)}
                        onChange={(e) =>
                          setAirFlowForm({
                            ...airFlowForm,
                            no_of_ducts: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">Duct Area</label>
                      <Input
                        type="number"
                        value={airFlowForm.duct_area || ""}
                        onChange={(e) =>
                          setAirFlowForm({
                            ...airFlowForm,
                            duct_area: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">Air Flow</label>
                      <Input
                        type="number"
                        value={airFlowForm.air_flow || ""}
                        onChange={(e) =>
                          setAirFlowForm({
                            ...airFlowForm,
                            air_flow: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">
                        Flow Rate at Duct
                      </label>
                      <Input
                        type="number"
                        value={airFlowForm.flow_rate_at_duct || ""}
                        onChange={(e) =>
                          setAirFlowForm({
                            ...airFlowForm,
                            flow_rate_at_duct: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">
                        Design Air Flow
                      </label>
                      <Input
                        type="number"
                        value={airFlowForm.design_air_flow_rate || ""}
                        onChange={(e) =>
                          setAirFlowForm({
                            ...airFlowForm,
                            design_air_flow_rate: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">
                        Measured Air Flow
                      </label>
                      <Input
                        type="number"
                        value={airFlowForm.measured_air_flow_rate || ""}
                        onChange={(e) =>
                          setAirFlowForm({
                            ...airFlowForm,
                            measured_air_flow_rate: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="flex gap-2 ml-auto col-span-full">
                      <Button onClick={handleAirFlowSaveNew}>
                        <Plus className="mr-2" /> Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Machinery Table */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Machinery Air Flow Measurements</CardTitle>
                    <Button 
                      onClick={handleMachinerySaveNew} 
                      disabled={!editingTrial}
                      className="ml-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </div>
                  {!editingTrial && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Please save the trial first before adding measurements
                    </p>
                  )}
                </CardHeader>
                <CardContent className="px-4 py-2">
                  <DataTable
                    columns={machineryColumns}
                    data={machineryFlows}
                    rowsPerPage={5}
                    className="min-w-[1400px]"
                  />

                  {/* Add new Machinery Row - Hidden form */}
                  <div className="hidden">
                    <div>
                      <label className="text-sm mb-1 block">Compartment</label>
                      <Select
                        value={machineryForm.compartment}
                        onValueChange={(val) =>
                          setMachineryForm({
                            ...machineryForm,
                            compartment: val,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Compartment" />
                        </SelectTrigger>
                        <SelectContent>
                          {compartments.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">Served By</label>
                      <Input
                        value={machineryForm.served_by}
                        onChange={(e) =>
                          setMachineryForm({
                            ...machineryForm,
                            served_by: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">No. of Ducts</label>
                      <Input
                        type="number"
                        value={String(machineryForm.no_of_ducts)}
                        onChange={(e) =>
                          setMachineryForm({
                            ...machineryForm,
                            no_of_ducts: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">Duct Area</label>
                      <Input
                        type="number"
                        value={machineryForm.duct_area || ""}
                        onChange={(e) =>
                          setMachineryForm({
                            ...machineryForm,
                            duct_area: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">Air Flow</label>
                      <Input
                        type="number"
                        value={machineryForm.air_flow || ""}
                        onChange={(e) =>
                          setMachineryForm({
                            ...machineryForm,
                            air_flow: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">
                        Flow Rate at Duct
                      </label>
                      <Input
                        type="number"
                        value={machineryForm.flow_rate_at_duct || ""}
                        onChange={(e) =>
                          setMachineryForm({
                            ...machineryForm,
                            flow_rate_at_duct: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">
                        Design Air Flow
                      </label>
                      <Input
                        type="number"
                        value={machineryForm.design_air_flow_rate || ""}
                        onChange={(e) =>
                          setMachineryForm({
                            ...machineryForm,
                            design_air_flow_rate: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">
                        Measured Air Flow
                      </label>
                      <Input
                        type="number"
                        value={machineryForm.measured_air_flow_rate || ""}
                        onChange={(e) =>
                          setMachineryForm({
                            ...machineryForm,
                            measured_air_flow_rate: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="flex gap-2 ml-auto col-span-full">
                      <Button onClick={handleMachinerySaveNew}>
                        <Plus className="mr-2" /> Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4 flex justify-end gap-2">
                <Button 
                  onClick={() => {
                    setIsTrialDialogOpen(false);
                    setEditingTrial(null);
                    setTrialForm({
                      ship: "",
                      date_of_trials: "",
                      place_of_trials: "",
                      document_no: "",
                      occasion_of_trials: "",
                      authority_for_trials: "",
                    });
                    setAirFlows([]);
                    setMachineryFlows([]);
                  }}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Trials table */}
      <Card>
        <CardHeader>
          <CardTitle>Trials</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <DataTable columns={trialColumns} data={filtered} rowsPerPage={10} />
        </CardContent>
      </Card>
    </div>
  );
};

export default HvacTrialForm;
