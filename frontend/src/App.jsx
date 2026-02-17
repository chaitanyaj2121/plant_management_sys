import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import PlantSetup from "./components/PlantSetup";

const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePlantAdded = (plant) => {
    setShowModal(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Router>
      <div style={{ display: "flex" }}>
        <div
          style={{
            width: "200px",
            padding: "15px",
            borderRight: "1px solid #000000",
            height: "100vh",
          }}
        >
          <h3>Menu</h3>
          <nav
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <Link to="/plant">Plant</Link>
            <Link to="/department">Department</Link>
            <Link to="/work-culture">Work Culture</Link>
            <Link to="/cost-center">Cost Center</Link>
          </nav>
        </div>

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
