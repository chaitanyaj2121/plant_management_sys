import { useEffect, useRef, useState } from "react";
import api, { getErrorMessage } from "../api/client";

const defaultLimit = 5;
const rowsPerPageOptions = [5, 10, 20, 50];
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
  const [limit, setLimit] = useState(defaultLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const lastFetchKey = useRef("");
  const hasPlantSelectionsLoaded = useRef(false);

  const fetchPlants = async (force = false) => {
    if (!force && hasPlantSelectionsLoaded.current) {
      return;
    }

    try {
      const { data } = await api.get("/plants/selections");
      setPlants(data.plants || []);
      hasPlantSelectionsLoaded.current = true;
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const fetchDepartments = async (targetPage, targetSearch, targetLimit) => {
    try {
      setLoading(true);
      const search = targetSearch?.trim() || "";
      const { data } = await api.get(
        `/departments?page=${targetPage}&limit=${targetLimit}&search=${encodeURIComponent(search)}`,
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
    fetchDepartments(page, debouncedSearchTerm, limit);
  }, [page, limit, debouncedSearchTerm]);

  const submitForm = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, form);
        alert("Department updated successfully");
      } else {
        await api.post("/departments", form);
        alert("Department added successfully");
      }
      setForm(defaultForm);
      setEditingId(null);
      setIsFormOpen(false);
      fetchDepartments(page, debouncedSearchTerm, limit);
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

    if (department.plant) {
      setPlants([department.plant]);
      hasPlantSelectionsLoaded.current = false;
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
      await api.delete(`/departments/${id}`);
      alert("Department deleted successfully");
      fetchDepartments(page, debouncedSearchTerm, limit);
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
                onMouseDown={() => fetchPlants(true)}
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
        <div className="mb-6 flex justify-center py-10 text-gray-500">
          Loading departments...
        </div>
      ) : (
        <div className="mb-6 min-h-[320px] overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
              <tr>
                <th className="w-[20%] px-6 py-3 text-left font-semibold">
                  Plant
                </th>
                <th className="w-[24%] px-6 py-3 text-left font-semibold">
                  Department
                </th>
                <th className="w-[13%] px-6 py-3 text-left font-semibold">
                  Code
                </th>
                <th className="w-[23%] px-6 py-3 text-left font-semibold">
                  Description
                </th>
                <th className="w-[20%] px-6 py-3 text-left font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {departments.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-5 text-center text-sm text-gray-500"
                    colSpan={5}
                  >
                    No matching departments found.
                  </td>
                </tr>
              ) : (
                departments.map((row) => (
                  <tr key={row.id} className="h-16 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-700 font-medium align-middle truncate">
                      {row.plant?.name || row.plantId}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium align-middle truncate">
                      {row.depName}
                    </td>
                    <td className="px-6 py-4 text-gray-600 align-middle truncate">
                      {row.depCode || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 align-middle">
                      <p className="truncate" title={row.depDescription || "-"}>
                        {row.depDescription || "-"}
                      </p>
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
