"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Save, Mail, AlertTriangle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { DataTable, Column } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { get } from "@/lib/api";

// Types
interface HullSurvey {
  id: number;
  quarter: string;
  date_of_survey: string;
  ship: number;
  reporting_officer: string;
  return_delayed: boolean;
  entire_ship_surveyed: boolean;
  email_sent_delayed: boolean;
  email_sent_incomplete: boolean;
  created_at: string;
  updated_at: string;
  status: "Delayed" | "Incomplete" | "Complete"; // <-- here
}


interface Ship {
  id: number;
  name: string;
}

interface Defect {
  id: number;
  description: string;
  status: "Resolved" | "Unresolved";
  markings: string[];
  compartment: string; // This will store compartment ID as string
  remarks?: string;
  isEditing?: boolean;
  isSaved?: boolean;
  survey_id: number;
  created_at: string;
}

// Constants
const QUARTERS = ["31 Mar", "30 Jun", "30 Sep", "31 Dec"];
const MARKINGS = ["Rust", "Cracks", "Pits", "Corrosion", "Undulation"];

interface Compartment {
  id: number;
  name: string;
}

interface QuarterlyHullSurveyTransactionProps {
  surveys: HullSurvey[];
  defects: Defect[];
  ships: Ship[];
  onSurveysChange: (surveys: HullSurvey[]) => void;
  onDefectsChange: (defects: Defect[]) => void;
}

const QuarterlyHullSurveyTransaction = ({
  surveys,
  defects,
  ships,
  onSurveysChange,
  onDefectsChange,
}: QuarterlyHullSurveyTransactionProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<HullSurvey | null>(null);
  const [compartments, setCompartments] = useState<Compartment[]>([]);

  // Fetch compartments from API
  const fetchCompartments = async () => {
    try {
      const res = await get("/master/compartments/");
      setCompartments(res.results || res.data || []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchCompartments();
  }, []);

  const [surveyForm, setSurveyForm] = useState({
    quarter: "",
    date_of_survey: "",
    ship: "",
    reporting_officer: "",
    return_delayed: false,
    entire_ship_surveyed: true,
    email_sent_delayed: false,
    email_sent_incomplete: false,
    status: "Complete",
  });

  const [defectForm, setDefectForm] = useState<Defect>({
    id: -1,
    description: "",
    status: "Unresolved",
    markings: [],
    compartment: "",
    survey_id: 0,
    created_at: new Date().toISOString(),
  });
  const [editingDefectId, setEditingDefectId] = useState<number | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedDefects = localStorage.getItem('quarterlyHullSurveyDefects');
    if (savedDefects) {
      try {
        const parsedDefects = JSON.parse(savedDefects);
        onDefectsChange(parsedDefects);
      } catch (error) {
        console.error('Error loading defects from localStorage:', error);
      }
    }
  }, []);

  // Save defects to localStorage whenever defects change
  useEffect(() => {
    if (defects.length > 0) {
      localStorage.setItem('quarterlyHullSurveyDefects', JSON.stringify(defects));
    }
  }, [defects]);

  // ---- Survey Handlers ----
  const handleOpenNewSurvey = () => {
    setEditingSurvey(null);
    setSurveyForm({
      quarter: "",
      date_of_survey: "",
      ship: "",
      reporting_officer: "",
      return_delayed: false,
      entire_ship_surveyed: true,
      email_sent_delayed: false,
      email_sent_incomplete: false,
      status: "Complete",
    });
    onDefectsChange([]);
    setIsDialogOpen(true);
  };

  const handleSurveySave = () => {
    const surveyData: HullSurvey = {
      id: editingSurvey?.id || Date.now(),
      quarter: surveyForm.quarter,
      date_of_survey: surveyForm.date_of_survey,
      ship: parseInt(surveyForm.ship) || 0,
      reporting_officer: surveyForm.reporting_officer,
      return_delayed: surveyForm.return_delayed,
      entire_ship_surveyed: surveyForm.entire_ship_surveyed,
      email_sent_delayed: surveyForm.email_sent_delayed,
      email_sent_incomplete: surveyForm.email_sent_incomplete,
      created_at: editingSurvey?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "Complete",
    };

    if (editingSurvey) {
      onSurveysChange(surveys.map((s) => (s.id === editingSurvey.id ? surveyData : s)));
      toast({ title: "Survey Updated", description: "Survey updated successfully", duration: 3000 });
    } else {
      // For new surveys, update any defects that were added to use the new survey ID
      const newSurveyId = surveyData.id;
      const updatedDefects = defects.map(defect => 
        defect.survey_id === Date.now() ? { ...defect, survey_id: newSurveyId } : defect
      );
      onDefectsChange(updatedDefects);
      
      onSurveysChange([...surveys, surveyData]);
      setEditingSurvey(surveyData);
      toast({ title: "Survey Created", description: "New survey created successfully", duration: 3000 });
    }
    setIsDialogOpen(false);
  };

  const handleDeleteSurvey = (surveyId: number) => {
    onSurveysChange(surveys.filter((s) => s.id !== surveyId));
    onDefectsChange(defects.filter((d) => d.survey_id !== surveyId));
    toast({ title: "Survey Deleted", description: "Survey deleted successfully", duration: 3000 });
  };

  const handleForwardToAuthorities = (surveyId: number) => {
    const authorities = ["MoD(N)/DNA", "Refitting Authority", "HITU", "INSMA"];
    toast({
      title: "Survey Forwarded",
      description: `Survey forwarded to ${authorities.join(", ")}`,
      duration: 3000,
    });
  };

  const handleSendDelayedEmail = (surveyId: number) => {
    toast({
      title: "Email Sent",
      description: "Delayed return email sent to authorities",
      duration: 3000,
    });
    onSurveysChange(
      surveys.map((s) => (s.id === surveyId ? { ...s, email_sent_delayed: true } : s))
    );
  };

  const handleSendIncompleteEmail = (surveyId: number) => {
    toast({
      title: "Email Sent",
      description: "Incomplete survey email sent to authorities",
      duration: 3000,
    });
    onSurveysChange(
      surveys.map((s) => (s.id === surveyId ? { ...s, email_sent_incomplete: true } : s))
    );
  };

  // ---- Defect Handlers ----
  const handleAddNewDefect = () => {
    // If editing an existing survey, use its ID
    // If creating a new survey, use a temporary ID that will be updated when survey is saved
    const surveyId = editingSurvey?.id || Date.now();
    
    const newDefect = {
      ...defectForm,
      id: Date.now(),
      isEditing: true,
      isSaved: false,
      survey_id: surveyId,
      created_at: new Date().toISOString(),
    };
    onDefectsChange([...defects, newDefect]);
    
    // Reset defect form for next use
    setDefectForm({
      id: -1,
      description: "",
      status: "Unresolved",
      markings: [],
      compartment: "",
      survey_id: 0,
      created_at: new Date().toISOString(),
    });
    
    toast({ title: "Defect Added", description: "New defect added to the survey", duration: 2000 });
  };

  const handleDefectChange = (id: number, field: keyof Defect, value: any) => {
    onDefectsChange(defects.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const saveDefectRow = (row: Defect) => {
    handleDefectChange(row.id, "isEditing", false);
    handleDefectChange(row.id, "isSaved", true);
    toast({ title: "Defect Saved", description: "Defect saved successfully", duration: 2000 });
  };

  const editDefectRow = (row: Defect) => handleDefectChange(row.id, "isEditing", true);

  const handleDeleteDefect = (id: number) => {
    onDefectsChange(defects.filter((d) => d.id !== id));
    toast({ title: "Defect Deleted", description: "Defect deleted successfully", duration: 2000 });
  };

  const handleDefectEdit = (defectId: number) => {
    setEditingDefectId(defectId);
    onDefectsChange(
      defects.map((d) =>
        d.id === defectId ? { ...d, isEditing: true, isSaved: false } : d
      )
    );
  };

  const handleDefectSave = (defectId: number) => {
    setEditingDefectId(null);
    onDefectsChange(
      defects.map((d) =>
        d.id === defectId ? { ...d, isEditing: false, isSaved: true } : d
      )
    );
    toast({ title: "Defect Saved", description: "Defect saved successfully", duration: 2000 });
  };

  // ---- Defect Table Columns ----
  const defectColumns: Column<Defect>[] = [
    {
      header: "Description",
      accessor: "description",
      render: (row) => 
        editingDefectId === row.id ? (
          <Input
            className="border-2 border-blue-600 focus:border-blue-800 hover:border-blue-700"
            value={row.description}
            onChange={(e) => handleDefectChange(row.id, "description", e.target.value)}
            placeholder="Enter description"
          />
        ) : (
          <span className={`p-2 text-sm ${row.status === "Unresolved" ? "text-red-600" : ""}`}>
            {row.description}
          </span>
        ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => 
        editingDefectId === row.id ? (
          <Select value={row.status} onValueChange={(val) => handleDefectChange(row.id, "status", val)}>
            <SelectTrigger className="border-2 border-blue-600 focus:border-blue-800 hover:border-blue-700">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Unresolved">Unresolved</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              row.status === "Resolved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {row.status}
          </span>
        ),
    },
    {
      header: "Markings",
      accessor: "markings",
      render: (row) => 
        editingDefectId === row.id ? (
          <div className="flex-1 flex flex-wrap gap-1 items-center min-h-[40px] border-2 border-blue-600 focus:border-blue-800 hover:border-blue-700 rounded-md p-2">
            {row.markings.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {row.markings.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs"
                  >
                    {m}
                    <button
                      type="button"
                      className="ml-1 text-blue-600 hover:text-blue-800"
                      onClick={() => handleDefectChange(row.id, "markings", row.markings.filter(mark => mark !== m))}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <Select
              value=""
              onValueChange={(val) => {
                if (val && !row.markings.includes(val)) {
                  handleDefectChange(row.id, "markings", [...row.markings, val]);
                }
              }}
            >
              <SelectTrigger className="border-2 border-blue-600 focus:border-blue-800 hover:border-blue-700">
                <SelectValue placeholder="Add marking..." />
              </SelectTrigger>
              <SelectContent>
                {MARKINGS.filter((m) => !row.markings.includes(m)).map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1 p-2">
            {row.markings.length > 0 ? (
              row.markings.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs"
                >
                  {m}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No markings</span>
            )}
          </div>
        ),
    },
    {
      header: "Compartment",
      accessor: "compartment",
      render: (row) => 
        editingDefectId === row.id ? (
          <Select value={row.compartment} onValueChange={(val) => handleDefectChange(row.id, "compartment", val)}>
            <SelectTrigger className="border-2 border-blue-600 focus:border-blue-800 hover:border-blue-700">
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
        ) : (
          <span className="p-2 text-sm">
            {compartments.find(c => c.id.toString() === row.compartment)?.name || row.compartment || "Not specified"}
          </span>
        ),
    },
    {
      header: "Remarks",
      accessor: "remarks",
      render: (row) => 
        editingDefectId === row.id ? (
          <Input
            className="border-2 border-blue-600 focus:border-blue-800 hover:border-blue-700"
            value={row.remarks || ""}
            onChange={(e) => handleDefectChange(row.id, "remarks", e.target.value)}
            placeholder="Enter remarks"
          />
        ) : (
          <span className="p-2 text-sm">{row.remarks || "No remarks"}</span>
        ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex gap-2">
          {editingDefectId === row.id ? (
            <Button size="sm" variant="default" onClick={() => handleDefectSave(row.id)}>
              <Save className="mr-1 h-3 w-3" /> Save
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => handleDefectEdit(row.id)}>
              <Edit className="mr-1 h-3 w-3" /> Edit
            </Button>
          )}
          <Button size="sm" variant="destructive" onClick={() => handleDeleteDefect(row.id)}>
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
        </div>
      ),
    },
  ];

  // ---- Survey Columns ----
  const surveyColumns: Column<HullSurvey>[] = [
    { header: "Quarter", accessor: "quarter" },
    { header: "Date", accessor: "date_of_survey" },
    {
      header: "Ship",
      accessor: "ship",
      render: (row) => ships.find((s) => s.id === row.ship)?.name || `Ship ${row.ship}`,
    },
    { header: "Reporting Officer", accessor: "reporting_officer" },
    {
      header: "Status",
      accessor: "quarter",
      render: (row) => (
        <div className="flex gap-1">
          {row.return_delayed && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="mr-1 h-3 w-3" /> Delayed
            </Badge>
          )}
          {!row.entire_ship_surveyed && (
            <Badge variant="outline" className="text-xs">
              <AlertTriangle className="mr-1 h-3 w-3" /> Incomplete
            </Badge>
          )}
          {!row.return_delayed && row.entire_ship_surveyed && (
            <Badge variant="default" className="text-xs">
              <CheckCircle className="mr-1 h-3 w-3" /> Complete
            </Badge>
          )}
        </div>
      ),
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
              setEditingSurvey(row);
              setSurveyForm({
                quarter: row.quarter,
                date_of_survey: row.date_of_survey,
                ship: row.ship.toString(),
                reporting_officer: row.reporting_officer,
                return_delayed: row.return_delayed,
                entire_ship_surveyed: row.entire_ship_surveyed,
                email_sent_delayed: row.email_sent_delayed,
                email_sent_incomplete: row.email_sent_incomplete,
                status: row.status,
              });
              setIsDialogOpen(true);
            }}
          >
            <Edit className="mr-1 h-3 w-3" /> Edit
          </Button>
          {row.return_delayed && !row.email_sent_delayed && (
            <Button size="sm" variant="destructive" onClick={() => handleSendDelayedEmail(row.id)}>
              <Mail className="mr-1 h-3 w-3" /> Email Delayed
            </Button>
          )}
          {!row.entire_ship_surveyed && !row.email_sent_incomplete && (
            <Button size="sm" variant="destructive" onClick={() => handleSendIncompleteEmail(row.id)}>
              <Mail className="mr-1 h-3 w-3" /> Email Incomplete
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => handleForwardToAuthorities(row.id)}>
            <Mail className="mr-1 h-3 w-3" /> Forward
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDeleteSurvey(row.id)}>
            <Trash2 className="mr-1 h-3 w-3" /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Survey Records</CardTitle>
          <Button onClick={handleOpenNewSurvey}>
            <Plus className="mr-2 h-4 w-4" /> New Survey
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={surveyColumns} data={surveys} />
        </CardContent>
      </Card>

      {/* Survey Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-[#1a2746] to-[#223366] p-4 text-white">
            <DialogTitle>{editingSurvey ? "Edit Survey" : "New Survey"}</DialogTitle>
          </DialogHeader>

          {/* Survey Form */}
          <Card className="mb-4">
            <CardContent className="grid grid-cols-2 gap-4 p-4">
              <div className="space-y-2">
                <Label>Quarter</Label>
                <Select value={surveyForm.quarter} onValueChange={(val) => setSurveyForm(f => ({ ...f, quarter: val }))}>
                  <SelectTrigger className="border-2 border-blue-600 focus:border-blue-800 hover:border-blue-700">
                    <SelectValue placeholder="Select Quarter" />
                  </SelectTrigger>
                  <SelectContent>{QUARTERS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date of Survey</Label>
                <Input
                  type="date"
                  className="border-2 border-blue-600 focus:border-blue-800 hover:border-blue-700"
                  value={surveyForm.date_of_survey}
                  onChange={(e) => setSurveyForm(f => ({ ...f, date_of_survey: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Ship</Label>
                <Select value={surveyForm.ship} onValueChange={(val) => setSurveyForm(f => ({ ...f, ship: val }))}>
                  <SelectTrigger className="border-2 border-blue-600 focus:border-blue-800 hover:border-blue-700">
                    <SelectValue placeholder="Select Ship" />
                  </SelectTrigger>
                  <SelectContent>
                    {ships.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reporting Officer</Label>
                <Input
                  className="border-2 border-blue-600 focus:border-blue-800 hover:border-blue-700"
                  value={surveyForm.reporting_officer}
                  onChange={(e) => setSurveyForm(f => ({ ...f, reporting_officer: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Defect Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Defects & Observations</CardTitle>
              <Button onClick={handleAddNewDefect}>
                <Plus className="mr-2 h-4 w-4" /> Add Defect
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable columns={defectColumns} data={defects.filter(d => d.survey_id === editingSurvey?.id)} />
            </CardContent>
          </Card>

          {/* Dialog Footer */}
          <DialogFooter className="flex justify-between mt-4">
            <div className="flex gap-2">
              {surveyForm.return_delayed && !surveyForm.email_sent_delayed && (
                <Button variant="destructive" onClick={() => handleSendDelayedEmail(editingSurvey?.id || 0)}>
                  <Mail className="mr-2 h-4 w-4" /> Send Delayed Email
                </Button>
              )}
              {!surveyForm.entire_ship_surveyed && !surveyForm.email_sent_incomplete && (
                <Button variant="destructive" onClick={() => handleSendIncompleteEmail(editingSurvey?.id || 0)}>
                  <Mail className="mr-2 h-4 w-4" /> Send Incomplete Email
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSurveySave}>Save Draft</Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleSurveySave();
                  handleForwardToAuthorities(editingSurvey?.id || Date.now());
                }}
              >
                <Mail className="mr-2 h-4 w-4" /> Forward to Authorities
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuarterlyHullSurveyTransaction;
