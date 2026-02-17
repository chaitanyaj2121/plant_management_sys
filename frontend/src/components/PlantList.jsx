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
      alert("Plant Deleted Successfully!!");
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
          <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
            <table className="w-full text-sm text-left rtl:text-right text-body">
              <thead className="text-sm text-body bg-neutral-secondary-soft border-b rounded-base border-default">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {plants.map((plant) => (
                  <tr
                    key={plant.id}
                    className="bg-neutral-primary border-b border-default"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-heading whitespace-nowrap"
                    >
                      {plant.name}
                    </th>
                    <td className="px-6 py-4">{plant.des}</td>
                    <td className="px-6 py-4">{plant.code}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(plant.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-300 transform hover:scale-105 active:scale-95"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
