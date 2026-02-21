import { useEffect, useRef, useState } from "react";
import api, { getErrorMessage } from "../api/client";
import PopupModal from "./PopupModal";

const defaultLimit = 5;
const rowsPerPageOptions = [5, 10, 20, 50];
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
  const [limit, setLimit] = useState(defaultLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [popup, setPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    tone: "info",
    confirmText: "OK",
    cancelText: "",
    onConfirm: null,
  });
  const lastFetchKey = useRef("");
  const hasPlantSelectionsLoaded = useRef(false);
  const departmentsLoadedForPlant = useRef("");

  const openPopup = (config) => {
    setPopup({ isOpen: true, ...config });
  };

  const closePopup = () => {
    setPopup((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
  };

  const fetchPlants = async (force = false) => {
    if (!force && hasPlantSelectionsLoaded.current) {
      return;
    }

    try {
      const { data } = await api.get("/plants/selections");
      setPlants(data.plants || []);
      hasPlantSelectionsLoaded.current = true;
    } catch (error) {
      openPopup({
        title: "Error",
        message: getErrorMessage(error),
        tone: "error",
      });
    }
  };

  const fetchDepartments = async (plantId, force = false) => {
    if (!plantId) {
      setDepartments([]);
      departmentsLoadedForPlant.current = "";
      return;
    }

    if (!force && departmentsLoadedForPlant.current === plantId) {
      return;
    }

    try {
      const params = new URLSearchParams({ plantId });
      const { data } = await api.get(
        `/departments/selections?${params.toString()}`,
      );
      setDepartments(data.departments || []);
      departmentsLoadedForPlant.current = plantId;
    } catch (error) {
      openPopup({
        title: "Error",
        message: getErrorMessage(error),
        tone: "error",
      });
    }
  };

  const fetchWorkCenters = async (targetPage, targetSearch, targetLimit) => {
    try {
      setLoading(true);
      const search = targetSearch?.trim() || "";
      const { data } = await api.get(
        `/work-centers?page=${targetPage}&limit=${targetLimit}&search=${encodeURIComponent(search)}`,
      );
      setWorkCenters(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);
    } catch (error) {
      openPopup({
        title: "Error",
        message: getErrorMessage(error),
        tone: "error",
      });
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
    fetchWorkCenters(page, debouncedSearchTerm, limit);
  }, [page, limit, debouncedSearchTerm]);

  const onPlantChange = (plantId) => {
    setForm((prev) => ({ ...prev, plantId, depId: "" }));
    setDepartments([]);
    departmentsLoadedForPlant.current = "";
  };

  const onDepartmentChange = (depId) => {
    setForm((prev) => ({ ...prev, depId }));
  };

  const onPlantDropdownFocus = () => {
    fetchPlants(true);
  };

  const onDepartmentDropdownFocus = () => {
    if (!form.plantId) return;
    fetchDepartments(form.plantId, true);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/work-centers/${editingId}`, form);
      } else {
        await api.post("/work-centers", form);
      }

      setEditingId(null);
      setForm(defaultForm);
      setIsFormOpen(false);
      setPage(1);
      fetchWorkCenters(1, debouncedSearchTerm, limit);
    } catch (error) {
      openPopup({
        title: "Error",
        message: getErrorMessage(error),
        tone: "error",
      });
    }
  };

  const onEdit = async (row) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/work-centers/${row.id}`);
      const selectedWorkCenter = data?.workCenter || row;

      setEditingId(selectedWorkCenter.id || row.id);
      setForm({
        plantId: selectedWorkCenter.plantId || "",
        depId: selectedWorkCenter.depId?.toString() || "",
        workName: selectedWorkCenter.workName || "",
        workCode: selectedWorkCenter.workCode || "",
        workDescription: selectedWorkCenter.workDescription || "",
      });

      if (selectedWorkCenter.plant) {
        setPlants([selectedWorkCenter.plant]);
        hasPlantSelectionsLoaded.current = false;
      }
      if (selectedWorkCenter.department) {
        setDepartments([selectedWorkCenter.department]);
        departmentsLoadedForPlant.current = "";
      }

      setIsFormOpen(true);
    } catch (error) {
      openPopup({
        title: "Error",
        message: getErrorMessage(error),
        tone: "error",
      });
    } finally {
      setLoading(false);
    }
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
    openPopup({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this work center?",
      tone: "warning",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await api.delete(`/work-centers/${id}`);
          openPopup({
            title: "Success",
            message: "Work center deleted successfully",
            tone: "success",
          });
          fetchWorkCenters(page, debouncedSearchTerm, limit);
        } catch (error) {
          openPopup({
            title: "Error",
            message: getErrorMessage(error),
            tone: "error",
          });
        }
      },
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-40px)] flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
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
            className="rounded-lg border border-gray-400 px-3 py-2 text-sm font-semibold text-gray-800 bg-gray-50 transition hover:bg-gray-200 hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
            type="button"
            onClick={() => {
              setPage(1);
              setSearchTerm("");
              setDebouncedSearchTerm("");
            }}
            disabled={!searchTerm.trim()}
          >
            <span className="text-lg leading-none">&times;</span>
          </button>
        </div>
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
              <p className="text-xs text-gray-500">
                <span className="text-red-500">*</span> Required fields
              </p>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Plant <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  value={form.plantId}
                  onMouseDown={onPlantDropdownFocus}
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
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={form.depId}
                  onMouseDown={onDepartmentDropdownFocus}
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
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Work Center Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Work Center Name"
                  value={form.workName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, workName: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Work Center Code <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Work Center Code"
                  value={form.workCode}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, workCode: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Description
                </label>
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
              </div>

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

        <span className="text-sm text-gray-600">
          Showing entries{" "}
          <span className="font-semibold">{workCenters.length}</span> out of{" "}
          <span className="font-semibold">{totalCount}</span>
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

      <PopupModal
        isOpen={popup.isOpen}
        title={popup.title}
        message={popup.message}
        tone={popup.tone}
        confirmText={popup.confirmText}
        cancelText={popup.cancelText}
        onCancel={closePopup}
        onConfirm={async () => {
          const action = popup.onConfirm;
          closePopup();
          if (action) {
            await action();
          }
        }}
      />
    </div>
  );
};

export default WorkCenterSetup;
