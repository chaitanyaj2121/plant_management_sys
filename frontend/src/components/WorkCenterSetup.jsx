import { useEffect, useRef, useState } from "react";
import api, { getErrorMessage } from "../api/client";

const limit = 5;
const defaultForm = {
  plantId: "",
  depId: "",
  workName: "",
  workCode: "",
  workDescription: "",
};

const WorkCenterSetup = () => {
  const [plants, setPlants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const lastFetchKey = useRef("");

  const fetchPlants = async () => {
    try {
      const { data } = await api.get("/plants/selections");
      setPlants(data.plants || []);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const fetchDepartments = async (plantId) => {
    if (!plantId) {
      setDepartments([]);
      return;
    }

    try {
      const params = new URLSearchParams({ plantId });
      const { data } = await api.get(
        `/departments/selections?${params.toString()}`,
      );
      setDepartments(data.departments || []);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const fetchWorkCenters = async (targetPage, targetSearch) => {
    try {
      setLoading(true);
      const search = targetSearch?.trim() || "";
      const { data } = await api.get(
        `/work-centers?page=${targetPage}&limit=${limit}&search=${encodeURIComponent(search)}`,
      );
      setWorkCenters(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
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
    const fetchKey = `${page}|${debouncedSearchTerm.trim()}`;
    if (lastFetchKey.current === fetchKey) {
      return;
    }
    lastFetchKey.current = fetchKey;
    fetchWorkCenters(page, debouncedSearchTerm);
  }, [page, debouncedSearchTerm]);

  const onPlantChange = (plantId) => {
    setForm((prev) => ({ ...prev, plantId, depId: "" }));
    fetchDepartments(plantId);
  };

  const onDepartmentChange = (depId) => {
    setForm((prev) => ({ ...prev, depId }));
  };

  const onPlantDropdownFocus = () => {
    fetchPlants();
  };

  const onDepartmentDropdownFocus = () => {
    if (!form.plantId) return;
    fetchDepartments(form.plantId);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/work-centers/${editingId}`, form);
        alert("Work center updated successfully");
      } else {
        await api.post("/work-centers", form);
        alert("Work center added successfully");
      }

      setEditingId(null);
      setForm(defaultForm);
      setIsFormOpen(false);
      fetchWorkCenters(page, debouncedSearchTerm);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const onEdit = (row) => {
    setEditingId(row.id);
    setForm({
      plantId: row.plantId || "",
      depId: row.depId?.toString() || "",
      workName: row.workName || "",
      workCode: row.workCode || "",
      workDescription: row.workDescription || "",
    });

    if (row.plant) {
      setPlants([row.plant]);
    }
    if (row.department) {
      setDepartments([row.department]);
    }

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
      await api.delete(`/work-centers/${id}`);
      alert("Work center deleted successfully");
      fetchWorkCenters(page, debouncedSearchTerm);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-40px)] flex-col">
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
          + Add Workcentre
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                value={form.plantId}
                onFocus={onPlantDropdownFocus}
                onChange={(e) => onPlantChange(e.target.value)}
                required
              >
                <option value="">Select Plant</option>
                {plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
                  </option>
                ))}
              </select>

              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={form.depId}
                onFocus={onDepartmentDropdownFocus}
                onChange={(e) => onDepartmentChange(e.target.value)}
                required
                disabled={!form.plantId}
              >
                <option value="">Select Department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.depName}
                  </option>
                ))}
              </select>

              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="Work Center Name"
                value={form.workName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, workName: e.target.value }))
                }
                required
              />

              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="Work Center Code"
                value={form.workCode}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, workCode: e.target.value }))
                }
                required
              />

              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="Description"
                value={form.workDescription}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    workDescription: e.target.value,
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
                  {editingId ? "Update Workcentre" : "Add Workcentre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mb-6 flex justify-center py-10 text-gray-500">
          Loading work centers...
        </div>
      ) : (
        <div className="mb-6 min-h-[320px] overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
              <tr>
                <th className="w-[20%] px-6 py-3 text-left font-semibold">
                  Plant
                </th>
                <th className="w-[20%] px-6 py-3 text-left font-semibold">
                  Department
                </th>
                <th className="w-[24%] px-6 py-3 text-left font-semibold">
                  Work Center
                </th>
                <th className="w-[12%] px-6 py-3 text-left font-semibold">
                  Code
                </th>
                <th className="w-[24%] px-6 py-3 text-left font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {workCenters.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-5 text-center text-sm text-gray-500"
                    colSpan={5}
                  >
                    No matching work centers found.
                  </td>
                </tr>
              ) : (
                workCenters.map((row) => (
                  <tr key={row.id} className="h-16 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-700 font-medium align-middle truncate">
                      {row.plant?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700 align-middle truncate">
                      {row.department?.depName || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium align-middle truncate">
                      {row.workName}
                    </td>
                    <td className="px-6 py-4 text-gray-600 align-middle truncate">
                      {row.workCode || "-"}
                    </td>
                    <td className="px-6 py-4 align-middle space-x-2">
                      <button
                        className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 hover:border-gray-400"
                        onClick={() => onEdit(row)}
                        type="button"
                      >
                        Edit
                      </button>

                      <button
                        className="inline-flex items-center rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:border-red-300"
                        onClick={() => onDelete(row.id)}
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

      <div className="mt-auto flex items-center justify-between pt-4">
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

export default WorkCenterSetup;
