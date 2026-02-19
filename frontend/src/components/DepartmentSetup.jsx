import { useEffect, useRef, useState } from "react";
import api, { getErrorMessage } from "../api/client";

const limit = 5;
const defaultForm = { plantId: "", depName: "", depCode: "", depDescription: "" };

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
      const { data } = await api.get(`/departments?page=${targetPage}&limit=${limit}`);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Department Setup</h2>
        <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={onAdd} type="button">
          Add Department
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-14">
          <div className="w-full max-w-4xl rounded border bg-white p-4 shadow-lg">
            <form onSubmit={submitForm} className="flex flex-col gap-3">
              <select
                className="rounded border px-3 py-2"
                value={form.plantId}
                onFocus={fetchAssignmentData}
                onChange={(e) => setForm((prev) => ({ ...prev, plantId: e.target.value }))}
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
                className="rounded border px-3 py-2"
                placeholder="Department Name"
                value={form.depName}
                onChange={(e) => setForm((prev) => ({ ...prev, depName: e.target.value }))}
                required
              />
              <input
                className="rounded border px-3 py-2"
                placeholder="Department Code"
                value={form.depCode}
                onChange={(e) => setForm((prev) => ({ ...prev, depCode: e.target.value }))}
                required
              />
              <input
                className="rounded border px-3 py-2"
                placeholder="Description"
                value={form.depDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, depDescription: e.target.value }))}
              />
              <div className="flex gap-2 pt-1">
                <button className="rounded bg-blue-600 px-3 py-2 text-white" type="submit">
                  {editingId ? "Update Department" : "Add Department"}
                </button>
                <button className="rounded border px-3 py-2" type="button" onClick={onCloseForm}>
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
                <th className="px-3 py-2 text-left">Plant</th>
                <th className="px-3 py-2 text-left">Department</th>
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2">{row.plant?.name || row.plantId}</td>
                  <td className="px-3 py-2">{row.depName}</td>
                  <td className="px-3 py-2">{row.depCode || "-"}</td>
                  <td className="px-3 py-2">{row.depDescription || "-"}</td>
                  <td className="px-3 py-2 space-x-2">
                    <button className="rounded bg-amber-500 px-2 py-1 text-white" onClick={() => onEdit(row)} type="button">
                      Edit
                    </button>
                    <button className="rounded bg-red-600 px-2 py-1 text-white" onClick={() => onDelete(row.id)} type="button">
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
        <button className="rounded border px-3 py-1 disabled:opacity-50" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1} type="button">
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button className="rounded border px-3 py-1 disabled:opacity-50" onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages} type="button">
          Next
        </button>
      </div>
    </div>
  );
};

export default DepartmentSetup;

