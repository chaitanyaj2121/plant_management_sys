import { useEffect, useState } from "react";
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
    fetchAssignmentData();
  }, []);

  useEffect(() => {
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
      fetchDepartments(page);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const onEdit = (department) => {
    setEditingId(department.id);
    setForm({
      plantId: department.plantId || "",
      depName: department.depName || "",
      depCode: department.depCode || "",
      depDescription: department.depDescription || "",
    });
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
      <h2 className="text-xl font-semibold">Department Setup</h2>
      <form onSubmit={submitForm} className="grid grid-cols-1 gap-3 rounded border p-4 md:grid-cols-2">
        <select
          className="rounded border px-3 py-2"
          value={form.plantId}
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
        />
        <input
          className="rounded border px-3 py-2"
          placeholder="Description"
          value={form.depDescription}
          onChange={(e) => setForm((prev) => ({ ...prev, depDescription: e.target.value }))}
        />
        <div className="flex gap-2">
          <button className="rounded bg-blue-600 px-3 py-2 text-white" type="submit">
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              className="rounded border px-3 py-2"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(defaultForm);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

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

