import { apiPost } from "utils/apiUtils";

export const fetchLogs = async (
  setLogs,
  setIsLoading,
  setTotalEntries,
  filters = {},
  page = 1,
  pageSize = 10,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, logs: true }));

    const requestBody = {
      action: filters.action?.trim() || "",
      tableName: filters.tableName?.trim() || "",
      userId: filters.userId?.trim() || "",
      minCreatedAt: filters.minCreatedAt && !isNaN(new Date(filters.minCreatedAt).getTime())
        ? new Date(filters.minCreatedAt).toISOString()
        : null,
      maxCreatedAt: filters.maxCreatedAt && !isNaN(new Date(filters.maxCreatedAt).getTime())
        ? new Date(filters.maxCreatedAt).toISOString()
        : null,
    };


    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    }).toString();

    const data = await apiPost(`/api/Log/search?${queryParams}`, requestBody);
    // Ensure logs is an array and handle response
    const logsData = Array.isArray(data.logs) ? data.logs : [];
    setLogs(logsData);
    setTotalEntries(data.totalCount || logsData.length || 0);
  } catch (error) {
    onError({
      isOpen: true,
      type: "error",
      message: error.response?.data?.message || error.message || "Erreur lors du chargement des logs",
      fieldErrors: error.response?.data?.errors || {},
    });
    setLogs([]);
    setTotalEntries(0);
  } finally {
    setIsLoading((prev) => ({ ...prev, logs: false }));
  }
};