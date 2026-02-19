import { useEffect, useRef, useState } from "react";
import api, { getErrorMessage } from "../api/client";

const limit = 5;
const defaultForm = {
  plantId: "",
  depName: "",
  depCode: "",
  depDescription: "",
};

const DepartmentSetup = () => {
  const [plants, setPlants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const lastFetchedPage = useRef(null);

  const fetchAssignmentData = async () => {
    try {
      const { data } = await api.get("/departments/assignment-data");
      setPlants(data.plants || []);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const fetchDepartments = async (targetPage) => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/departments?page=${targetPage}&limit=${limit}`,
      );
      setDepartments(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
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
    fetchDepartments(page);
  }, [page]);

  const submitForm = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, form);
      } else {
        await api.post("/departments", form);
      }
      setForm(defaultForm);
      setEditingId(null);
      setIsFormOpen(false);
      fetchDepartments(page);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const onEdit = async (department) => {
    await fetchAssignmentData();
    setEditingId(department.id);
    setForm({
      plantId: department.plantId || "",
      depName: department.depName || "",
      depCode: department.depCode || "",
      depDescription: department.depDescription || "",
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
      await api.delete(`/departments/${id}`);
      fetchDepartments(page);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Department Setup
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage department assignments and configuration
          </p>
        </div>

        <button
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={onAdd}
          type="button"
        >
          + Add Department
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <form onSubmit={submitForm} className="flex flex-col gap-5">
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                value={form.plantId}
                onFocus={fetchAssignmentData}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, plantId: e.target.value }))
                }
                required
              >
                <option value="">Select Plant</option>
                {plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
                  </option>
                ))}
              </select>

              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="Department Name"
                value={form.depName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, depName: e.target.value }))
                }
                required
              />

              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="Department Code"
                value={form.depCode}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, depCode: e.target.value }))
                }
                required
              />

              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="Description"
                value={form.depDescription}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    depDescription: e.target.value,
                  }))
                }
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                  type="button"
                  onClick={onCloseForm}
                >
                  Cancel
                </button>

                <button
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                  type="submit"
                >
                  {editingId ? "Update Department" : "Add Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10 text-gray-500">
          Loading departments...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Plant</th>
                <th className="px-6 py-3 text-left font-semibold">
                  Department
                </th>
                <th className="px-6 py-3 text-left font-semibold">Code</th>
                <th className="px-6 py-3 text-left font-semibold">
                  Description
                </th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {departments.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {row.plant?.name || row.plantId}
                  </td>
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {row.depName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {row.depCode || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {row.depDescription || "-"}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      className="rounded-md bg-amber-500 px-3 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-amber-600"
                      onClick={() => onEdit(row)}
                      type="button"
                    >
                      Edit
                    </button>

                    <button
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-red-700"
                      onClick={() => onDelete(row.id)}
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

      <div className="flex items-center justify-between pt-4">
        <button
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
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
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
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

export default DepartmentSetup;
