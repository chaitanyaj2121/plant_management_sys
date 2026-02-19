import { useEffect, useRef, useState } from "react";
import api, { getErrorMessage } from "../api/client";

const defaultForm = { name: "", des: "", code: "" };
const limit = 5;

const PlantSetup = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const hasLoadedInitialPage = useRef(false);

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
    if (page === 1 && hasLoadedInitialPage.current) {
      return;
    }
    if (page === 1) {
      hasLoadedInitialPage.current = true;
    }
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
      } else {
        await api.post("/plants", form);
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
      fetchPlants(page);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Plant Setup</h2>
        <button
          className="rounded bg-blue-600 px-3 py-2 text-white"
          onClick={onAdd}
          type="button"
        >
          Add Plant
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-14">
          <div className="w-full max-w-4xl rounded border bg-white p-4 shadow-lg">
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              <input
                className="rounded border px-3 py-2"
                placeholder="Plant Name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
              <input
                className="rounded border px-3 py-2"
                placeholder="Description"
                value={form.des}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, des: e.target.value }))
                }
              />
              <input
                className="rounded border px-3 py-2"
                placeholder="Code"
                type="number"
                value={form.code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, code: e.target.value }))
                }
                required
              />
              <div className="flex gap-2 pt-1">
                <button
                  className="rounded bg-blue-600 px-3 py-2 text-white"
                  disabled={submitting}
                  type="submit"
                >
                  {editingId ? "Update Plant" : "Add Plant"}
                </button>
                <button
                  className="rounded border px-3 py-2"
                  type="button"
                  onClick={onCloseForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plants.map((plant) => (
                <tr key={plant.id} className="border-t">
                  <td className="px-3 py-2">{plant.name}</td>
                  <td className="px-3 py-2">{plant.des}</td>
                  <td className="px-3 py-2">{plant.code}</td>
                  <td className="px-3 py-2 space-x-2">
                    <button
                      className="rounded bg-amber-500 px-2 py-1 text-white"
                      onClick={() => onEdit(plant)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="rounded bg-red-600 px-2 py-1 text-white"
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

      <div className="flex items-center justify-between">
        <button
          className="rounded border px-3 py-1 disabled:opacity-50"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          type="button"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="rounded border px-3 py-1 disabled:opacity-50"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PlantSetup;
