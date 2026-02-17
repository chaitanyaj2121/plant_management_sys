import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";

import PlantForm from "./components/PlantForm";
import PlantList from "./components/PlantList";

const Sidebar = () => {
  return (
    <div
      style={{
        width: "200px",
        background: "#f4f4f4",
        padding: "10px",
        height: "100vh",
      }}
    >
      <h3>Navigation</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        <li>
          <Link to="/plant">Plant</Link>
        </li>
        <li>
          <Link to="/department">Department</Link>
        </li>
        <li>
          <Link to="/work-culture">Work Culture</Link>
        </li>
        <li>
          <Link to="/cost-center">Cost Center</Link>
        </li>
      </ul>
    </div>
  );
};

const PlantSetup = () => {
  const handlePlantAdded = (newPlant) => {
    console.log("New plant added:", newPlant);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Plant</h2>
      <PlantForm onPlantAdded={handlePlantAdded} />
      <h3>All Plants</h3>
      <PlantList />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "20px" }}>
          <Routes>
            <Route path="/plant" element={<PlantSetup />} />
            <Route
              path="/department"
              element={<div>Department Placeholder</div>}
            />
            <Route
              path="/work-culture"
              element={<div>Work Culture Placeholder</div>}
            />
            <Route
              path="/cost-center"
              element={<div>Cost Center Placeholder</div>}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
