import { useState, useEffect, useCallback } from "react";
import { GetCompensationsByStatus, GetTotalPaidAmount } from "services/mission/compensation"; 

const useCompensationStatusData = () => {
  const [compensationsData, setCompensationsData] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: "",
  });
  const [isLoading, setIsLoading] = useState({
    compensations: true,
    stats: true,
  });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [selectedAssignationId, setSelectedAssignationId] = useState(null);
  const [showDetailsCompensation, setShowDetailsCompensation] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [stats, setStats] = useState({ total: 0, notPaid: 0, paid: 0, totalAmount: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);

  // Initialize hooks
  const getCompensationsByStatus = GetCompensationsByStatus();
  const getTotalPaidAmount = GetTotalPaidAmount();

  // Fetch total paid amount
  useEffect(() => {
    const fetchTotalPaidAmount = async () => {
      try {
        const totalPaid = await getTotalPaidAmount();
        setStats((prev) => ({ ...prev, totalAmount: totalPaid }));
      } catch (error) {
        console.error("Erreur lors du chargement du montant total payé:", error);
        setAlert({
          isOpen: true,
          type: "error",
          message: `Erreur lors du chargement du montant total payé: ${error.message || "Une erreur inconnue s'est produite."}`,
        });
        setStats((prev) => ({ ...prev, totalAmount: 0 }));
      } finally {
        setIsLoading((prev) => ({ ...prev, stats: false }));
      }
    };

    fetchTotalPaidAmount();
  }, [getTotalPaidAmount]);

  // Memoize fetchCompensations
  const fetchCompensations = useCallback(async (status = null) => {
    try {
      setIsLoading((prev) => ({ ...prev, compensations: true }));
      const data = await getCompensationsByStatus(status);
      
      // Calculate counts from data
      const total = data.length;
      const notPaid = data.filter(item => item.compensations.some(comp => comp.status === "not paid")).length;
      const paid = data.filter(item => item.compensations.some(comp => comp.status === "paid")).length;
      
      setStats((prev) => ({ ...prev, total, notPaid, paid }));
      setCompensationsData(data);
      setTotalEntries(data.length);
    } catch (error) {
      console.error("Erreur lors du chargement des compensations:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors du chargement des compensations: ${error.message || "Une erreur inconnue s'est produite."}`,
      });
      setCompensationsData([]);
      setTotalEntries(0);
      setStats((prev) => ({ ...prev, total: 0, notPaid: 0, paid: 0 }));
    } finally {
      setIsLoading((prev) => ({ ...prev, compensations: false }));
    }
  }, [getCompensationsByStatus, setAlert]);

  // Fetch on mount
  useEffect(() => {
    fetchCompensations();
  }, [fetchCompensations]);

  // Refetch on applied filters change
  useEffect(() => {
    fetchCompensations(appliedFilters.status || null);
  }, [appliedFilters.status, fetchCompensations]);

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
      setShowDetailsCompensation(true);
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
    const today = new Date("2025-10-02"); // Current date as provided
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return {
    compensationsData,
    filters,
    setFilters,
    appliedFilters,
    isLoading,
    alert,
    setAlert,
    stats,
    selectedAssignationId,
    showDetailsCompensation,
    setShowDetailsCompensation,
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
    fetchCompensations,
  };
};

export default useCompensationStatusData;