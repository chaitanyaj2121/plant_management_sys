import { useEffect, useRef, useState } from "react";
import api, { getErrorMessage } from "../api/client";
import PopupModal from "./PopupModal";

const defaultLimit = 5;
const rowsPerPageOptions = [5, 10, 20, 50];
const defaultForm = {
  plantId: "",
  depId: "",
  costCenterName: "",
  costCenterCode: "",
  description: "",
  workCenterId: "",
};

const CostCenterSetup = () => {
  const [plants, setPlants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
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
  const workCentersLoadedForKey = useRef("");

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

  const fetchWorkCenters = async (plantId, depId, force = false) => {
    if (!plantId || !depId) {
      setWorkCenters([]);
      workCentersLoadedForKey.current = "";
      return;
    }

    const requestKey = `${plantId}|${depId}`;
    if (!force && workCentersLoadedForKey.current === requestKey) {
      return;
    }

    try {
      const params = new URLSearchParams({ plantId, depId });
      const { data } = await api.get(
        `/work-centers/selections?${params.toString()}`,
      );
      setWorkCenters(data.workCenters || []);
      workCentersLoadedForKey.current = requestKey;
    } catch (error) {
      openPopup({
        title: "Error",
        message: getErrorMessage(error),
        tone: "error",
      });
    }
  };

  const fetchCostCenters = async (targetPage, targetSearch, targetLimit) => {
    try {
      setLoading(true);
      const search = targetSearch?.trim() || "";
      const { data } = await api.get(
        `/cost-centers?page=${targetPage}&limit=${targetLimit}&search=${encodeURIComponent(search)}`,
      );
      setCostCenters(data.data || []);
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
    fetchCostCenters(page, debouncedSearchTerm, limit);
  }, [page, limit, debouncedSearchTerm]);

  const onPlantChange = (plantId) => {
    setForm((prev) => ({ ...prev, plantId, depId: "", workCenterId: "" }));
    // Do NOT fetch departments here — only fetch when user clicks the dept dropdown
    setDepartments([]);
    setWorkCenters([]);
    departmentsLoadedForPlant.current = "";
    workCentersLoadedForKey.current = "";
  };

  const onDepartmentChange = (depId) => {
    setForm((prev) => ({ ...prev, depId, workCenterId: "" }));
    // Do NOT fetch work centers here — only fetch when user clicks the work center dropdown
    setWorkCenters([]);
    workCentersLoadedForKey.current = "";
  };

  const onPlantDropdownFocus = () => {
    fetchPlants(true);
  };

  const onDepartmentDropdownFocus = () => {
    if (!form.plantId) return;
    fetchDepartments(form.plantId, true);
  };

  const onWorkCenterDropdownFocus = () => {
    if (!form.plantId || !form.depId) return;
    fetchWorkCenters(form.plantId, form.depId, true);
  };
  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        workCenterIds: form.workCenterId ? [Number(form.workCenterId)] : [],
      };
      delete payload.workCenterId;

      if (editingId) {
        await api.put(`/cost-centers/${editingId}`, payload);
        openPopup({
          title: "Success",
          message: "Cost center updated successfully",
          tone: "success",
        });
      } else {
        await api.post("/cost-centers", payload);
        openPopup({
          title: "Success",
          message: "Cost center added successfully",
          tone: "success",
        });
      }
      setEditingId(null);
      setForm(defaultForm);
      setIsFormOpen(false);
      fetchCostCenters(page, debouncedSearchTerm, limit);
    } catch (error) {
      openPopup({
        title: "Error",
        message: getErrorMessage(error),
        tone: "error",
      });
    }
  };

  const onEdit = async (row) => {
    const selectedWorkCenterId = row.workCenters?.length
      ? row.workCenters[0].id?.toString()
      : "";

    setEditingId(row.id);
    setForm({
      plantId: row.plantId || "",
      depId: row.depId?.toString() || "",
      costCenterName: row.costCenterName || "",
      costCenterCode: row.costCenterCode || "",
      description: row.description || "",
      workCenterId: selectedWorkCenterId,
    });

    if (row.plant) {
      setPlants([row.plant]);
      hasPlantSelectionsLoaded.current = false;
    }
    if (row.department) {
      setDepartments([row.department]);
      departmentsLoadedForPlant.current = "";
    }
    if (row.workCenters?.length) {
      setWorkCenters(row.workCenters);
      workCentersLoadedForKey.current = "";
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
    openPopup({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this cost center?",
      tone: "warning",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await api.delete(`/cost-centers/${id}`);
          openPopup({
            title: "Success",
            message: "Cost center deleted successfully",
            tone: "success",
          });
          fetchCostCenters(page, debouncedSearchTerm, limit);
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
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => {
              setPage(1);
              setSearchTerm("");
              setDebouncedSearchTerm("");
            }}
            disabled={!searchTerm.trim()}
          >
            Clear
          </button>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 border border-blue-200 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          onClick={onAdd}
          type="button"
        >
          + Add Cost Centre
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
                  Cost Center Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Cost Center Name"
                  value={form.costCenterName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      costCenterName: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Cost Center Code <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Cost Center Code"
                  value={form.costCenterCode}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      costCenterCode: e.target.value,
                    }))
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
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Work Center <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={form.workCenterId}
                  onMouseDown={onWorkCenterDropdownFocus}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      workCenterId: e.target.value,
                    }))
                  }
                  disabled={!form.depId}
                  required
                >
                  <option value="">Select Work Center</option>
                  {workCenters.map((workCenter) => (
                    <option key={workCenter.id} value={workCenter.id}>
                      {workCenter.workName}
                    </option>
                  ))}
                </select>
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
                  {editingId ? "Update Cost Centre" : "Add Cost Centre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mb-6 flex justify-center py-10 text-gray-500">
          Loading cost centers...
        </div>
      ) : (
        <div className="mb-6 min-h-[320px] overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
              <tr>
                <th className="w-[14%] px-6 py-3 text-left font-semibold">
                  Plant
                </th>
                <th className="w-[14%] px-6 py-3 text-left font-semibold">
                  Department
                </th>
                <th className="w-[16%] px-6 py-3 text-left font-semibold">
                  Cost Center
                </th>
                <th className="w-[18%] px-6 py-3 text-left font-semibold">
                  Work Center
                </th>
                <th className="w-[10%] px-6 py-3 text-left font-semibold">
                  Code
                </th>
                <th className="w-[14%] px-6 py-3 text-left font-semibold">
                  Description
                </th>
                <th className="w-[14%] px-6 py-3 text-left font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {costCenters.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-5 text-center text-sm text-gray-500"
                    colSpan={7}
                  >
                    No matching cost centers found.
                  </td>
                </tr>
              ) : (
                costCenters.map((row) => (
                  <tr key={row.id} className="h-16 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-700 font-medium align-middle truncate">
                      {row.plant?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700 align-middle truncate">
                      {row.department?.depName || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium align-middle truncate">
                      {row.costCenterName}
                    </td>
                    <td className="px-6 py-4 text-gray-600 align-middle">
                      <p
                        className="truncate"
                        title={
                          row.workCenters?.length
                            ? row.workCenters
                                .map((item) => item.workName)
                                .join(", ")
                            : "-"
                        }
                      >
                        {row.workCenters?.length
                          ? row.workCenters
                              .map((item) => item.workName)
                              .join(", ")
                          : "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 align-middle truncate">
                      {row.costCenterCode || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 align-middle">
                      <p className="truncate" title={row.description || "-"}>
                        {row.description || "-"}
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

        <span className="text-sm text-gray-600">
          Showing entries <span className="font-semibold">{costCenters.length}</span>{" "}
          out of <span className="font-semibold">{totalCount}</span>
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

export default CostCenterSetup;

