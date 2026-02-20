import { useEffect, useRef, useState } from "react";
import api, { getErrorMessage } from "../api/client";

const defaultForm = { name: "", des: "", code: "" };
const defaultLimit = 5;
const rowsPerPageOptions = [5, 10, 20, 50];

const PlantSetup = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const lastFetchKey = useRef("");

  const fetchPlants = async (targetPage, targetSearch, targetLimit) => {
    try {
      setLoading(true);
      const search = targetSearch?.trim() || "";
      const { data } = await api.get(
        `/plants?page=${targetPage}&limit=${targetLimit}&search=${encodeURIComponent(search)}`,
      );
      setPlants(data.plants || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    const fetchKey = `${page}|${limit}|${debouncedSearchTerm.trim()}`;
    if (lastFetchKey.current === fetchKey) {
      return;
    }
    lastFetchKey.current = fetchKey;
    fetchPlants(page, debouncedSearchTerm, limit);
  }, [page, limit, debouncedSearchTerm]);

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      if (editingId) {
        await api.put(`/plants/${editingId}`, {
          name: form.name,
          des: form.des,
          code: form.code,
        });
        alert("Plant updated successfully");
      } else {
        await api.post("/plants", form);
        alert("Plant added successfully");
      }
      setForm(defaultForm);
      setEditingId(null);
      setIsFormOpen(false);
      fetchPlants(page, debouncedSearchTerm, limit);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = (plant) => {
    setEditingId(plant.id);
    setForm({
      name: plant.name || "",
      des: plant.des || "",
      code: plant.code || "",
    });
    setIsFormOpen(true);
  };

  const onAdd = () => {
    setEditingId(null);
    setForm(defaultForm);
    setIsFormOpen(true);
  };

  const onCloseForm = () => {
    setEditingId(null);
    setForm(defaultForm);
    setIsFormOpen(false);
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/plants/${id}`);
      alert("Plant deleted successfully");
      fetchPlants(page, debouncedSearchTerm, limit);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-40px)] flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <input
          className="w-96 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Search by plant name or code"
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
        />
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 border border-blue-200 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          onClick={onAdd}
          type="button"
        >
          + Add Plant
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-200">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingId ? "Update Plant" : "Add New Plant"}
              </h3>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Plant Name
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Enter plant name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Description
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Enter description"
                  value={form.des}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, des: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Code
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Enter plant code"
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCloseForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  disabled={submitting}
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="mb-6 flex justify-center py-10 text-gray-500">
          Loading plants...
        </div>
      ) : (
        <div className="mb-6 min-h-[320px] overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="w-[22%] px-6 py-3 text-left">Name</th>
                <th className="w-[43%] px-6 py-3 text-left">Description</th>
                <th className="w-[12%] px-6 py-3 text-left">Code</th>
                <th className="w-[23%] px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plants.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-5 text-center text-sm text-gray-500"
                    colSpan={4}
                  >
                    No matching plants found.
                  </td>
                </tr>
              ) : (
                plants.map((plant) => (
                  <tr
                    key={plant.id}
                    className="h-16 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800 align-middle truncate">
                      {plant.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 align-middle">
                      <p className="truncate" title={plant.des || "-"}>
                        {plant.des || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 align-middle truncate">
                      {plant.code}
                    </td>
                    <td className="px-6 py-4 align-middle space-x-2">
                      <button
                        className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 hover:border-gray-400"
                        onClick={() => onEdit(plant)}
                        type="button"
                      >
                        Edit
                      </button>

                      <button
                        className="inline-flex items-center rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:border-red-300"
                        onClick={() => onDelete(plant.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Rows per page</span>
          <select
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
          >
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <button
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          type="button"
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-600">
          Page <span className="font-semibold">{page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </span>

        <button
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          type="button"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default PlantSetup;

