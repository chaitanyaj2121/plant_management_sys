import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import PlantSetup from "./components/PlantSetup";
import Sidebar from "./components/Sidebar";

const App = () => {
  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ flex: 1, padding: "20px" }}>
          <Routes>
            <Route path="/plant" element={<PlantSetup />} />
            <Route path="/department" element={<div>Department</div>} />
            <Route path="/work-culture" element={<div>Work Culture</div>} />
            <Route path="/cost-center" element={<div>Cost Center</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
