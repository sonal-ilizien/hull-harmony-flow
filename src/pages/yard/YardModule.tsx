"use client"

import { Routes, Route, Navigate } from "react-router-dom";
import YardDashboard from "./YardDashboard";
import YardReports from "./YardReports";
import DockingCheckoffLists from "./DockingCheckoffLists";

const YardModule = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/yard/dashboard" replace />} />
      <Route path="dashboard" element={<YardDashboard />} />
      <Route path="transaction" element={<div className="p-8 text-center text-muted-foreground">Transaction overview coming soon...</div>} />
      <Route path="docking" element={<DockingCheckoffLists />} />
      <Route path="reports" element={<YardReports />} />
    </Routes>
  );
};

export default YardModule;
