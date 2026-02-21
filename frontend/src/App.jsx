import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import PlantSetup from "./components/PlantSetup";
import Sidebar from "./components/Sidebar";
import DepartmentSetup from "./components/DepartmentSetup";
import WorkCenterSetup from "./components/WorkCenterSetup";
import CostCenterSetup from "./components/CostCenterSetup";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import { getAuthToken } from "./api/client";

const ProtectedApp = () => {
  if (!getAuthToken()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-5">
        <Routes>
          <Route path="/" element={<Navigate to="/plant" replace />} />
          <Route path="/plant" element={<PlantSetup />} />
          <Route path="/department" element={<DepartmentSetup />} />
          <Route path="/work-center" element={<WorkCenterSetup />} />
          <Route path="/cost-center" element={<CostCenterSetup />} />
          <Route path="*" element={<Navigate to="/plant" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            getAuthToken() ? (
              <Navigate to="/plant" replace />
            ) : (
              <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <LoginPage />
              </div>
            )
          }
        />
        <Route
          path="/signup"
          element={
            getAuthToken() ? (
              <Navigate to="/plant" replace />
            ) : (
              <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <SignupPage />
              </div>
            )
          }
        />
        <Route path="/*" element={<ProtectedApp />} />
      </Routes>
    </Router>
  );
};

export default App;
