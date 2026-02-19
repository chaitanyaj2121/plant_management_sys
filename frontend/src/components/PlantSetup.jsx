import { useEffect, useRef, useState } from "react";
import api, { getErrorMessage } from "../api/client";

const defaultForm = { name: "", des: "", code: "" };
const limit = 4;

const PlantSetup = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const lastFetchedPage = useRef(null);

  const fetchPlants = async (targetPage) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/plants?page=${targetPage}`);
      setPlants(data.plants || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lastFetchedPage.current === page) {
      return;
    }
    lastFetchedPage.current = page;
    fetchPlants(page);
  }, [page]);

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
      fetchPlants(page);
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
      fetchPlants(page);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Plant Setup</h2>
          <p className="text-sm text-gray-500">
            Manage and configure plant details
          </p>
        </div>

        <button
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          onClick={onAdd}
          type="button"
        >
          + Add Plant
        </button>
      </div>

      {/* Modal */}
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
        <div className="flex justify-center py-10 text-gray-500">
          Loading plants...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Code</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plants.map((plant) => (
                <tr key={plant.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {plant.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{plant.des}</td>
                  <td className="px-6 py-4 text-gray-600">{plant.code}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      className="rounded-md bg-amber-500 px-3 py-1 text-xs font-medium text-white hover:bg-amber-600 transition"
                      onClick={() => onEdit(plant)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition"
                      onClick={() => onDelete(plant.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
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
