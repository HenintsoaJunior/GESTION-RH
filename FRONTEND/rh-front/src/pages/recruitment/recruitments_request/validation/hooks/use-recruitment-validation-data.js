import { useState, useEffect } from "react";
import { useGetRecruitmentValidationsByValidator } from "services/recruitment/recruitment-request/validation";

const useRecruitmentValidationData = () => {
  const [recruitments, setRecruitments] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    department: "",
    dateRange: { start: "", end: "" },
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    status: "",
    department: "",
    dateRange: { start: "", end: "" },
  });
  const [isLoading, setIsLoading] = useState({ recruitments: true });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [selectedRecruitmentId, setSelectedRecruitmentId] = useState(null);
  const [showDetailsRecruitment, setShowDetailsRecruitment] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const getRecruitmentValidations = useGetRecruitmentValidationsByValidator();

  const fetchRecruitments = async (page = currentPage, size = pageSize, filters = appliedFilters) => {
    try {
      setIsLoading((prev) => ({ ...prev, recruitments: true }));
      const validatorId = JSON.parse(localStorage.getItem("user"))?.userId || "N/A";
      const response = await getRecruitmentValidations(validatorId, page, size);
      if (!response.results || !Array.isArray(response.results)) {
        console.warn("Response does not contain an array of results:", response);
        setRecruitments([]);
        setTotalEntries(0);
        return;
      }
      let formattedRecruitments = response.results.map((validation) => ({
        id: validation.recruitmentValidationId || "N/A",
        title: validation.recruitmentRequest?.positionTitle || "Non spécifié",
        status: validation.status || "Non défini",
        toWhom: validation.toWhom || "Non spécifié",
        createdAt: validation.createdAt || new Date().toISOString(),
        department: validation.validator?.department || "Non spécifié",
        positionCount: validation.recruitmentRequest?.positionCount || 0,
        contractDuration: validation.recruitmentRequest?.contractDuration || "Non spécifié",
        desiredStartDate: validation.recruitmentRequest?.desiredStartDate || "Non spécifié",
        newPositionExplanation: validation.recruitmentRequest?.newPositionExplanation || "",
        formerEmployeeName: validation.recruitmentRequest?.formerEmployeeName || "",
        validatorName: validation.validator?.name || "Non spécifié",
        validatorEmail: validation.validator?.email || "Non spécifié",
        creatorName: validation.creator?.name || "Non spécifié",
        creatorEmail: validation.creator?.email || "Non spécifié",
        comments: validation.comments || "",
        signature: validation.signature || "",
      }));

      if (filters.search) {
        formattedRecruitments = formattedRecruitments.filter(
          (recruitment) =>
            recruitment.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            recruitment.creatorName.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      if (filters.status) {
        formattedRecruitments = formattedRecruitments.filter(
          (recruitment) => recruitment.status === filters.status
        );
      }
      if (filters.department) {
        formattedRecruitments = formattedRecruitments.filter(
          (recruitment) => recruitment.department === filters.department
        );
      }
      if (filters.dateRange?.start) {
        formattedRecruitments = formattedRecruitments.filter(
          (recruitment) => new Date(recruitment.createdAt) >= new Date(filters.dateRange.start)
        );
      }
      if (filters.dateRange?.end) {
        formattedRecruitments = formattedRecruitments.filter(
          (recruitment) => new Date(recruitment.createdAt) <= new Date(filters.dateRange.end)
        );
      }

      setTotalEntries(formattedRecruitments.length);
      setStats({
        total: formattedRecruitments.length,
        pending: formattedRecruitments.filter((r) => r.status === "Non défini").length,
        approved: formattedRecruitments.filter((r) => r.status === "Approuvé").length,
        rejected: formattedRecruitments.filter((r) => r.status === "Rejeté").length,
      });

      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedRecruitments = formattedRecruitments.slice(startIndex, endIndex);
      setRecruitments(paginatedRecruitments);
    } catch (error) {
      console.error("Error fetching recruitment validations:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Error fetching recruitment validations: ${error.message}`,
      });
      setRecruitments([]);
      setTotalEntries(0);
    } finally {
      setIsLoading((prev) => ({ ...prev, recruitments: false }));
    }
  };

  useEffect(() => {
    fetchRecruitments(currentPage, pageSize, appliedFilters);
  }, [appliedFilters, currentPage, pageSize]);

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

  const handleRowClick = (recruitmentId) => {
    if (recruitmentId) {
      setSelectedRecruitmentId(recruitmentId);
      setShowDetailsRecruitment(true);
    } else {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Invalid recruitment ID.",
      });
    }
  };

  const handleFilterSubmit = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: "",
      status: "",
      department: "",
      dateRange: { start: "", end: "" },
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
  };

  const handleUpdateComments = (recruitmentId, comments) => {
    setRecruitments((prevRecruitments) =>
      prevRecruitments.map((recruitment) =>
        recruitment.id === recruitmentId ? { ...recruitment, comments } : recruitment
      )
    );
  };

  const handleUpdateSignature = (recruitmentId, signature) => {
    setRecruitments((prevRecruitments) =>
      prevRecruitments.map((recruitment) =>
        recruitment.id === recruitmentId ? { ...recruitment, signature } : recruitment
      )
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not specified";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return {
    recruitments,
    filters,
    setFilters,
    appliedFilters,
    setAppliedFilters,
    isLoading,
    alert,
    setAlert,
    stats,
    selectedRecruitmentId,
    setSelectedRecruitmentId,
    showDetailsRecruitment,
    setShowDetailsRecruitment,
    isHidden,
    setIsHidden,
    handleRowClick,
    handleFilterSubmit,
    handleResetFilters,
    handleUpdateComments,
    handleUpdateSignature,
    formatDate,
    getDaysUntilDue,
    currentPage,
    pageSize,
    totalEntries,
    handlePageChange,
    handlePageSizeChange,
    fetchRecruitments, // Export fetchRecruitments
  };
};

export default useRecruitmentValidationData;