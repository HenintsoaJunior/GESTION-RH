import { useState, useEffect, useCallback } from "react";
import { GetDistinctMissionAssignations, GetTotalReimbursedAmount } from "services/mission/expense";

const useExpenseReportData = () => {
  const [expenseReportsData, setExpenseReportsData] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: "",
  });
  const [isLoading, setIsLoading] = useState({
    expenseReports: true,
    stats: true,
  });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [selectedAssignationId, setSelectedAssignationId] = useState(null);
  const [showDetailsExpenseReport, setShowDetailsExpenseReport] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, reimbursed: 0, totalAmount: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);

  // Initialize hooks
  const getDistinctMissionAssignations = GetDistinctMissionAssignations();
  const getTotalReimbursedAmount = GetTotalReimbursedAmount();

  // Fetch total reimbursed amount
  useEffect(() => {
    const fetchTotalReimbursedAmount = async () => {
      try {
        const totalReimbursed = await getTotalReimbursedAmount();
        setStats((prev) => ({ ...prev, totalAmount: totalReimbursed }));
      } catch (error) {
        console.error("Erreur lors du chargement du montant total remboursé:", error);
        setAlert({
          isOpen: true,
          type: "error",
          message: `Erreur lors du chargement du montant total remboursé: ${error.message || "Une erreur inconnue s'est produite."}`,
        });
        setStats((prev) => ({ ...prev, totalAmount: 0 }));
      } finally {
        setIsLoading((prev) => ({ ...prev, stats: false }));
      }
    };

    fetchTotalReimbursedAmount();
  }, [getTotalReimbursedAmount]);

  // Memoize fetchExpenseReports
  const fetchExpenseReports = useCallback(async (status = null, page = 1, size = 10) => {
    try {
      setIsLoading((prev) => ({ ...prev, expenseReports: true }));
      const data = await getDistinctMissionAssignations({ status, pageNumber: page, pageSize: size });
      data.items.forEach(item => console.log("Status ZANDRY AN:", item));

      // Calculate counts from data
      const total = data.totalCount;
      const pending = data.items.filter(item => item.status === "pending").length;
      const reimbursed = data.items.filter(item => item.status === "reimbursed").length;
      
      setStats((prev) => ({ ...prev, total, pending, reimbursed }));
      setExpenseReportsData(data.items);
      setTotalEntries(data.totalCount);
    } catch (error) {
      console.error("Erreur lors du chargement des rapports de frais:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors du chargement des rapports de frais: ${error.message || "Une erreur inconnue s'est produite."}`,
      });
      setExpenseReportsData([]);
      setTotalEntries(0);
      setStats((prev) => ({ ...prev, total: 0, pending: 0, reimbursed: 0 }));
    } finally {
      setIsLoading((prev) => ({ ...prev, expenseReports: false }));
    }
  }, [getDistinctMissionAssignations]);

  // Fetch on mount
  useEffect(() => {
    fetchExpenseReports();
  }, [fetchExpenseReports]);

  // Refetch on applied filters or pagination change
  useEffect(() => {
    fetchExpenseReports(appliedFilters.status || null, currentPage, pageSize);
  }, [appliedFilters.status, currentPage, pageSize, fetchExpenseReports]);

  const handlePageChange = (newPage) => {
    const maxPage = Math.ceil(totalEntries / pageSize);
    if (newPage >= 1 && newPage <= maxPage) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = Number(event.target.value);
    if (newPageSize > 0 && Number.isInteger(newPageSize)) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
  };

  const handleRowClick = (assignationId) => {
    if (assignationId) {
      setSelectedAssignationId(assignationId);
      setShowDetailsExpenseReport(true);
      setAlert({ isOpen: false, type: "info", message: "" });
    } else {
      console.warn("Invalid assignationId clicked:", assignationId);
      setAlert({
        isOpen: true,
        type: "error",
        message: "ID d'assignation invalide.",
      });
    }
  };

  const handleFilterSubmit = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      status: "",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date non spécifiée";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return 0;
    const today = new Date("2025-10-03"); // Current date as provided
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return {
    expenseReportsData,
    filters,
    setFilters,
    appliedFilters,
    isLoading,
    alert,
    setAlert,
    stats,
    selectedAssignationId,
    showDetailsExpenseReport,
    setShowDetailsExpenseReport,
    isHidden,
    setIsHidden,
    handleRowClick,
    handleFilterSubmit,
    handleResetFilters,
    formatDate,
    getDaysUntilDue,
    currentPage,
    pageSize,
    totalEntries,
    handlePageChange,
    handlePageSizeChange,
    fetchExpenseReports,
  };
};

export default useExpenseReportData;