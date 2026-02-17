import React, { useEffect, useState } from "react";
import axios from "axios";

const PlantList = () => {
  const [plants, setPlants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlants(currentPage);
  }, [currentPage]);

  const fetchPlants = async (page) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:4000/api/plants?page=${page}`,
      );
      setPlants(response.data.plants);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching plants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:4000/api/plants/${id}`);
      fetchPlants(currentPage);
    } catch (error) {
      console.error("Error deleting plant:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Loading plants...</p>}
      {!loading && (
        <>
          <ul className="mx-auto mt-8 space-y-4">
            {plants.map((plant) => (
              <li
                key={plant.id}
                className="flex items-center justify-between bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition duration-300 border border-gray-100"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {plant.name}
                  </h3>
                  <p className="text-sm text-gray-600">{plant.des}</p>
                  <span className="inline-block text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-md">
                    Code: {plant.code}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(plant.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-300 transform hover:scale-105 active:scale-95"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <div className="relative flex items-center justify-between w-full mt-4">
            {/* previous button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="inline-flex items-center text-body bg-neutral-secondary-medium border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading shadow-xs font-medium leading-5 rounded-base text-sm px-3 py-2"
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {/* center text */}
            <span className="absolute left-1/2 -translate-x-1/2 text-sm text-body">
              Showing Page{" "}
              <span className="font-semibold text-heading">{currentPage}</span>{" "}
              out of{" "}
              <span className="font-semibold text-heading">{totalPages}</span>
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="inline-flex items-center text-body bg-neutral-secondary-medium border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading shadow-xs font-medium leading-5 rounded-base text-sm px-3 py-2"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PlantList;
