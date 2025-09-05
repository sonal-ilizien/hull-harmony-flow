"use client"

import { useState, useEffect } from "react";
import { get } from "@/lib/api";
import DockingCheckoffListsTransaction from "./DockingCheckoffListsTransaction";

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

interface DockingReport {
  id: number;
  checkoff_id: number;
  title: string;
  generated_at: string;
  file_path: string;
  type: "PDF" | "EXCEL";
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

// Mock Data
const MOCK_CHECKOFF_LISTS: DockingCheckoffList[] = [
  {
    id: 1,
    vessel_name: "INS Vikrant",
    vessel_id: 1,
    docking_purpose: "Major Overhaul",
    docking_version: "v2.1",
    vessel_length: 262,
    vessel_beam: 62,
    vessel_draught: 8.4,
    stability_list: 0.5,
    stability_trim: 0.2,
    metacentric_height: 2.1,
    weight_changes: 1500,
    entry_direction: "Bow First",
    overhang_flight_deck: 12.5,
    overhang_sponsons: 3.2,
    overhang_walkways: 1.8,
    overhang_platforms: 2.1,
    underwater_projections: ["Propellers", "Stabilizers", "Bilge Keels"],
    dock_blocks_height: 2.5,
    interference_objects: ["High Cradle Blocks"],
    clearance_requirements: ["Propeller Removal", "Staging and Scaffolding Erection"],
    clearance_above_vessel: ["Mast Removal"],
    ship_lift_depth: 15.2,
    water_depth_blocks: 12.8,
    water_depth_basin: 14.5,
    tidal_constraints: "High tide required for entry",
    floating_dock_depth: 18.0,
    shape_blocks_matching: true,
    working_envelope: "Single vessel docking",
    refitting_authority: "Cochin Shipyard Limited",
    command_hq: "Southern Naval Command",
    status: "Approved",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-20T14:30:00Z",
    archived_until: "2027-01-20T14:30:00Z"
  },
  {
    id: 2,
    vessel_name: "INS Delhi",
    vessel_id: 2,
    docking_purpose: "Routine Maintenance",
    docking_version: "v1.8",
    vessel_length: 163,
    vessel_beam: 17,
    vessel_draught: 6.2,
    stability_list: 0.3,
    stability_trim: 0.1,
    metacentric_height: 1.8,
    weight_changes: 800,
    entry_direction: "Stern First",
    overhang_flight_deck: 0,
    overhang_sponsons: 1.5,
    overhang_walkways: 1.2,
    overhang_platforms: 0.8,
    underwater_projections: ["Propellers", "Bilge Keels", "Skegs"],
    dock_blocks_height: 2.0,
    interference_objects: [],
    clearance_requirements: ["Propeller Removal", "Rudder Removal"],
    clearance_above_vessel: [],
    ship_lift_depth: 12.0,
    water_depth_blocks: 10.5,
    water_depth_basin: 12.2,
    tidal_constraints: "No tidal constraints",
    floating_dock_depth: 15.0,
    shape_blocks_matching: true,
    working_envelope: "Single vessel docking",
    refitting_authority: "Mazagon Dock Shipbuilders Limited",
    command_hq: "Western Naval Command",
    status: "Command Review",
    created_at: "2025-01-18T09:15:00Z",
    updated_at: "2025-01-22T11:45:00Z"
  }
];

const MOCK_REPORTS: DockingReport[] = [
  {
    id: 1,
    checkoff_id: 1,
    title: "Docking Check-off List - INS Vikrant - Major Overhaul",
    generated_at: "2025-01-20T15:00:00Z",
    file_path: "/reports/docking-checkoff-ins-vikrant-major-overhaul.pdf",
    type: "PDF"
  },
  {
    id: 2,
    checkoff_id: 2,
    title: "Docking Check-off List - INS Delhi - Routine Maintenance",
    generated_at: "2025-01-22T12:00:00Z",
    file_path: "/reports/docking-checkoff-ins-delhi-routine-maintenance.pdf",
    type: "PDF"
  }
];

const DockingCheckoffLists = () => {
  const [checkoffLists, setCheckoffLists] = useState<DockingCheckoffList[]>(MOCK_CHECKOFF_LISTS);
  const [vessels, setVessels] = useState<Vessel[]>([]);

  // Fetch vessels from API
  const fetchVessels = async () => {
    try {
      const res = await get("/master/vessels/");
      setVessels(res.results || res.data || []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedCheckoffLists = localStorage.getItem('dockingCheckoffLists');
    if (savedCheckoffLists) {
      try {
        const parsedCheckoffLists = JSON.parse(savedCheckoffLists);
        setCheckoffLists(parsedCheckoffLists);
      } catch (error) {
        console.error('Error loading check-off lists from localStorage:', error);
      }
    }
  }, []);

  // Save check-off lists to localStorage whenever they change
  useEffect(() => {
    if (checkoffLists.length > 0) {
      localStorage.setItem('dockingCheckoffLists', JSON.stringify(checkoffLists));
    }
  }, [checkoffLists]);

  return (
    <div className="space-y-6">
      <DockingCheckoffListsTransaction
        checkoffLists={checkoffLists}
        vessels={vessels}
        onCheckoffListsChange={setCheckoffLists}
      />
    </div>
  );
};

export default DockingCheckoffLists;
