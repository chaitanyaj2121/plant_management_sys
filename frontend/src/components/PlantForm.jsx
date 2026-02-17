import React, { useState } from "react";
import axios from "axios";

const PlantForm = ({ onPlantAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    des: "",
    code: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:4000/api/plants",
        formData,
      );
      onPlantAdded(response.data);
      setFormData({ name: "", des: "", code: "" });
    } catch (error) {
      console.error("Error adding plant:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label>Description:</label>
        <input
          type="text"
          name="des"
          value={formData.des}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label>Code:</label>
        <input
          type="number"
          name="code"
          value={formData.code}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Plant"}
      </button>
    </form>
  );
};

export default PlantForm;
