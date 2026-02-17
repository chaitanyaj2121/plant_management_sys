import React, { useEffect, useState } from "react";
import axios from "axios";

const PlantList = () => {
  const [plants, setPlants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPlants(currentPage);
  }, [currentPage]);

  const fetchPlants = async (page) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/plants?page=${page}`,
      );
      setPlants(response.data.plants);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/delete_plant/${id}`);
      fetchPlants(currentPage);
    } catch (error) {
      console.error("Error deleting plant:", error);
    }
  };

  return (
    <div>
      <ul>
        {plants.map((plant) => (
          <li key={plant.id}>
            {plant.name} - {plant.des} - {plant.code}
            <button onClick={() => handleDelete(plant.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PlantList;
