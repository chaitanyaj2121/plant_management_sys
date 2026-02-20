import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import PlantSetup from "./components/PlantSetup";
import Sidebar from "./components/Sidebar";
import DepartmentSetup from "./components/DepartmentSetup";
import WorkCenterSetup from "./components/WorkCenterSetup";
import CostCenterSetup from "./components/CostCenterSetup";

const App = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <main className="min-w-0 flex-1 p-4 sm:p-5">
          <Routes>
            <Route path="/" element={<Navigate to="/plant" replace />} />
            <Route path="/plant" element={<PlantSetup />} />
            <Route path="/department" element={<DepartmentSetup />} />
            <Route path="/work-center" element={<WorkCenterSetup />} />
            <Route path="/cost-center" element={<CostCenterSetup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
