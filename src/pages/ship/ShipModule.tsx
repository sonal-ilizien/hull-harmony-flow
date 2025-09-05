"use client"

import { Routes, Route, Navigate } from "react-router-dom";
import ShipDashboard from "./ShipDashboard";
import ShipReports from "./ShipReports";
import QuarterlyHullSurvey from "./QuarterlyHullSurvey";
import HvacTrialForm from "../hvac/HvacTrialForm";

const ShipModule = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/ship/dashboard" replace />} />
      <Route path="dashboard" element={<ShipDashboard />} />
      <Route path="transaction" element={<div className="p-8 text-center text-muted-foreground">Transaction overview coming soon...</div>} />
      <Route path="survey" element={<QuarterlyHullSurvey />} />
      <Route path="hvac" element={<HvacTrialForm />} />
      <Route path="reports" element={<ShipReports />} />
    </Routes>
  );
};

export default ShipModule;
