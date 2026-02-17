import React, { useState } from "react";
import PlantForm from "./PlantForm";
import PlantList from "./PlantList";

const PlantSetup = () => {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePlantAdded = () => {
    setShowModal(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      {/* Header bar with Add button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
          borderBottom: "1px solid #ddd",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>Plant Setup</h2>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          + Add Plant
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "8px",
              width: "400px",
              position: "relative",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Add Plant</h3>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "14px",
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            <PlantForm onPlantAdded={handlePlantAdded} />
          </div>
        </div>
      )}

      {/* Plant List */}
      <PlantList key={refreshKey} />
    </div>
  );
};

export default PlantSetup;
