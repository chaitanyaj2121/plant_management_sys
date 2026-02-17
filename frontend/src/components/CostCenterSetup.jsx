import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/client";

const limit = 5;
const defaultForm = {
  plantId: "",
  depId: "",
  costCenterName: "",
  costCenterCode: "",
  description: "",
  workCenterIds: [],
};

const CostCenterSetup = () => {
  const [plants, setPlants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);

  const fetchAssignmentData = async (plantId, depId) => {
    try {
      const params = new URLSearchParams();
      if (plantId) params.set("plantId", plantId);
      if (depId) params.set("depId", depId);
      const { data } = await api.get(`/cost-centers/assignment-data?${params.toString()}`);
      setPlants(data.plants || []);
      setDepartments(data.departments || []);
      setWorkCenters(data.workCenters || []);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const fetchCostCenters = async (targetPage) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/cost-centers?page=${targetPage}&limit=${limit}`);
      setCostCenters(data.data || []);
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
    fetchCostCenters(page);
  }, [page]);

  const onPlantChange = (plantId) => {
    setForm((prev) => ({ ...prev, plantId, depId: "", workCenterIds: [] }));
    fetchAssignmentData(plantId, "");
  };

  const onDepartmentChange = (depId) => {
    setForm((prev) => ({ ...prev, depId, workCenterIds: [] }));
    fetchAssignmentData(form.plantId, depId);
  };

  const onWorkCenterSelection = (event) => {
    const values = Array.from(event.target.selectedOptions).map((option) =>
      Number(option.value)
    );
    setForm((prev) => ({ ...prev, workCenterIds: values }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/cost-centers/${editingId}`, form);
      } else {
        await api.post("/cost-centers", form);
      }
      setEditingId(null);
      setForm(defaultForm);
      fetchAssignmentData();
      fetchCostCenters(page);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const onEdit = async (row) => {
    setEditingId(row.id);
    setForm({
      plantId: row.plantId || "",
      depId: row.depId?.toString() || "",
      costCenterName: row.costCenterName || "",
      costCenterCode: row.costCenterCode || "",
      description: row.description || "",
      workCenterIds: [],
    });
    await fetchAssignmentData(row.plantId, row.depId?.toString() || "");
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/cost-centers/${id}`);
      fetchCostCenters(page);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Cost Center Setup</h2>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 rounded border p-4 md:grid-cols-3">
        <select className="rounded border px-3 py-2" value={form.plantId} onChange={(e) => onPlantChange(e.target.value)} required>
          <option value="">Select Plant</option>
          {plants.map((plant) => (
            <option key={plant.id} value={plant.id}>
              {plant.name}
            </option>
          ))}
        </select>

        <select className="rounded border px-3 py-2" value={form.depId} onChange={(e) => onDepartmentChange(e.target.value)} required disabled={!form.plantId}>
          <option value="">Select Department</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.depName}
            </option>
          ))}
        </select>

        <input className="rounded border px-3 py-2" placeholder="Cost Center Name" value={form.costCenterName} onChange={(e) => setForm((prev) => ({ ...prev, costCenterName: e.target.value }))} required />
        <input className="rounded border px-3 py-2" placeholder="Cost Center Code" value={form.costCenterCode} onChange={(e) => setForm((prev) => ({ ...prev, costCenterCode: e.target.value }))} />
        <input className="rounded border px-3 py-2" placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />

        <select
          multiple
          className="min-h-28 rounded border px-3 py-2"
          value={form.workCenterIds.map(String)}
          onChange={onWorkCenterSelection}
          disabled={!form.depId}
        >
          {workCenters.map((workCenter) => (
            <option key={workCenter.id} value={workCenter.id}>
              {workCenter.workName}
            </option>
          ))}
        </select>

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
                fetchAssignmentData();
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <p className="text-sm text-gray-600">Hold Ctrl/Cmd to select multiple Work Centers.</p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Plant</th>
                <th className="px-3 py-2 text-left">Department</th>
                <th className="px-3 py-2 text-left">Cost Center</th>
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {costCenters.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2">{row.plant?.name || "-"}</td>
                  <td className="px-3 py-2">{row.department?.depName || "-"}</td>
                  <td className="px-3 py-2">{row.costCenterName}</td>
                  <td className="px-3 py-2">{row.costCenterCode || "-"}</td>
                  <td className="px-3 py-2">{row.description || "-"}</td>
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

export default CostCenterSetup;

