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
      alert("Plant added Successfully!");
    } catch (error) {
      console.error("Error adding plant:", error);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Description:
        </label>
        <input
          type="text"
          name="des"
          value={formData.des}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Code:</label>
        <input
          type="number"
          name="code"
          value={formData.code}
          onChange={handleChange}
          required
          disabled={loading}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
      >
        {loading ? "Adding..." : "Add Plant"}
      </button>
    </form>
  );
};

export default PlantForm;
