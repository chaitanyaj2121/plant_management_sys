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
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />

        <div style={{ flex: 1, padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Navigate to="/plant" replace />} />
            <Route path="/plant" element={<PlantSetup />} />
            <Route path="/department" element={<DepartmentSetup />} />
            <Route path="/work-center" element={<WorkCenterSetup />} />
            <Route path="/cost-center" element={<CostCenterSetup />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
