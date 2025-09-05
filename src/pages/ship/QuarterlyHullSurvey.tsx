"use client"

import { useState, useEffect } from "react";
import { get } from "@/lib/api";
import QuarterlyHullSurveyTransaction from "./QuarterlyHullSurveyTransaction";

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
  status: "Delayed" | "Incomplete" | "Complete";
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
  compartment: string;
  remarks?: string;
  isEditing?: boolean;
  isSaved?: boolean;
  survey_id: number;
  created_at: string;
}

interface Report {
  id: number;
  survey_id: number;
  title: string;
  generated_at: string;
  file_path: string;
  type: "PDF" | "EXCEL";
}

// Constants
const QUARTERS = ["31 Mar", "30 Jun", "30 Sep", "31 Dec"];
const MARKINGS = ["Rust", "Cracks", "Pits", "Corrosion", "Undulation"];
const COMPARTMENTS = ["Tanks", "Engine Room", "Deck", "Other"];

const MOCK_SURVEYS: HullSurvey[] = [
  { 
    id: 1, 
    quarter: "31 Mar", 
    date_of_survey: "2025-03-25", 
    ship: 1, 
    reporting_officer: "Lt. Sharma", 
    return_delayed: false, 
    entire_ship_surveyed: true, 
    email_sent_delayed: false, 
    email_sent_incomplete: false,
    created_at: "2025-03-25T10:00:00Z",
    updated_at: "2025-03-25T10:00:00Z",
    status: "Complete"
  },
  { 
    id: 2, 
    quarter: "30 Jun", 
    date_of_survey: "2025-06-28", 
    ship: 2, 
    reporting_officer: "Lt. Kumar", 
    return_delayed: true, 
    entire_ship_surveyed: false, 
    email_sent_delayed: true, 
    email_sent_incomplete: true,
    created_at: "2025-06-28T14:30:00Z",
    updated_at: "2025-06-28T14:30:00Z",
    status: "Delayed"
  },
];

const MOCK_DEFECTS: Defect[] = [
  { 
    id: 1, 
    description: "Rust on deck", 
    status: "Unresolved", 
    markings: ["Rust"], 
    compartment: "1", // Will be updated when compartments are fetched
    remarks: "Needs urgent repair", 
    isSaved: true,
    survey_id: 1,
    created_at: "2025-03-25T10:15:00Z"
  },
  { 
    id: 2, 
    description: "Cracks in engine room", 
    status: "Resolved", 
    markings: ["Cracks"], 
    compartment: "2", // Will be updated when compartments are fetched
    remarks: "Repaired last week", 
    isSaved: true,
    survey_id: 1,
    created_at: "2025-03-25T10:20:00Z"
  },
];

const MOCK_REPORTS: Report[] = [
  {
    id: 1,
    survey_id: 1,
    title: "Q1 2025 Hull Survey Report - INS Alpha",
    generated_at: "2025-03-25T11:00:00Z",
    file_path: "/reports/q1-2025-hull-survey-ins-alpha.pdf",
    type: "PDF"
  },
  {
    id: 2,
    survey_id: 2,
    title: "Q2 2025 Hull Survey Report - INS Beta",
    generated_at: "2025-06-28T15:00:00Z",
    file_path: "/reports/q2-2025-hull-survey-ins-beta.pdf",
    type: "PDF"
  }
];

const QuarterlyHullSurvey = () => {
  const [surveys, setSurveys] = useState<HullSurvey[]>(MOCK_SURVEYS);
  const [defects, setDefects] = useState<Defect[]>(MOCK_DEFECTS);
  const [ships, setShips] = useState<Ship[]>([]);

  // Fetch ships from API
  const fetchShips = async () => {
    try {
      const res = await get("/master/vessels/");
      setShips(res.results || res.data || []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchShips();
  }, []);

  return (
    <div className="space-y-6">
      <QuarterlyHullSurveyTransaction
        surveys={surveys}
        defects={defects}
        ships={ships}
        onSurveysChange={setSurveys}
        onDefectsChange={setDefects}
      />
    </div>
  );
};

export default QuarterlyHullSurvey;
