import { useState, useEffect } from "react";
import { MissionValidationRequests, ValidateMission } from "services/mission/validation";

const useMissionValidationData = () => {
  const [missions, setMissions] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    department: "",
    priority: "",
    dateRange: { start: "", end: "" },
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    status: "",
    department: "",
    priority: "",
    dateRange: { start: "", end: "" },
  });
  const [isLoading, setIsLoading] = useState({ missions: true });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [showDetailsMission, setShowDetailsMission] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);

  const validateMissionRequest = MissionValidationRequests();
  const validateMission = ValidateMission();

  // Fonction pour récupérer les missions avec pagination
  const fetchMissions = async (page = currentPage, size = pageSize, filters = appliedFilters) => {
    try {
      setIsLoading((prev) => ({ ...prev, missions: true }));
      
      const response = await validateMissionRequest();
      
      if (!response.results || !Array.isArray(response.results)) {
        console.warn("La réponse ne contient pas un tableau de résultats:", response);
        setMissions([]);
        setTotalEntries(0);
        return;
      }

      let formattedMissions = response.results.map((validation) => {
        const mission = validation.mission || {};
        const creator = validation.creator || {};
        const validator = validation.validator || {};
        const missionAssignation = validation.missionAssignation || {};
        
        return {
          id: validation.missionValidationId || "N/A",
          title: mission.name || "Mission sans titre",
          description: mission.description || "Aucune description",
          requestedBy: creator.name || "Demandeur inconnu",
          department: creator.department || "Département non spécifié",
          priority: "medium",
          status: validation.status || "En attente",
          requestDate: mission.startDate || new Date().toISOString(),
          dueDate: mission.endDate || new Date().toISOString(),
          estimatedDuration: missionAssignation.duration
            ? `${missionAssignation.duration} jour${missionAssignation.duration > 1 ? "s" : ""}`
            : "Non spécifié",
          location: mission.lieu ? `${mission.lieu.nom}, ${mission.lieu.pays}` : "Lieu non spécifié",
          comments: validation.comments || "",
          signature: validator.signature || "",
          matricule: creator.matricule || "N/A",
          function: creator.position || "Fonction non spécifiée",
          transport: missionAssignation.transport?.name || "Non spécifié",
          departureTime: missionAssignation.departureTime || "Non spécifié",
          departureDate: missionAssignation.departureDate || mission.startDate || "Non spécifié",
          returnDate: missionAssignation.returnDate || mission.endDate || "Non spécifié",
          returnTime: missionAssignation.returnTime || "Non spécifié",
          reference: validation.missionValidationId || "N/A",
          toWhom: validator.name || "Non spécifié",
          validationDate: validation.validationDate || null,
          missionCreator: validation.missionCreator || "N/A",
          superiorName: creator.superiorName || "Supérieur non spécifié",
          email: creator.email || "",
          createdAt: validation.createdAt || new Date().toISOString(),
          updatedAt: validation.updatedAt || null,
          missionAssignationId: validation.missionAssignationId || "N/A",
        };
      });

      // Appliquer les filtres côté client
      if (filters.search) {
        formattedMissions = formattedMissions.filter(
          (mission) =>
            mission.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            mission.requestedBy.toLowerCase().includes(filters.search.toLowerCase()) ||
            mission.matricule.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters.status) {
        formattedMissions = formattedMissions.filter((mission) => mission.status === filters.status);
      }
      
      if (filters.department) {
        formattedMissions = formattedMissions.filter((mission) => mission.department === filters.department);
      }
      
      if (filters.priority) {
        formattedMissions = formattedMissions.filter((mission) => mission.priority === filters.priority);
      }
      
      if (filters.dateRange?.start) {
        formattedMissions = formattedMissions.filter(
          (mission) => new Date(mission.requestDate) >= new Date(filters.dateRange.start)
        );
      }
      
      if (filters.dateRange?.end) {
        formattedMissions = formattedMissions.filter(
          (mission) => new Date(mission.requestDate) <= new Date(filters.dateRange.end)
        );
      }

      // Définir le total après filtrage
      setTotalEntries(formattedMissions.length);

      // Calculer les statistiques sur toutes les missions filtrées
      setStats({
        total: formattedMissions.length,
        pending: formattedMissions.filter((m) => m.status === "En attente").length,
        approved: formattedMissions.filter((m) => m.status === "Approuvée").length,
        rejected: formattedMissions.filter((m) => m.status === "Rejetée").length,
      });

      // Appliquer la pagination côté client
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedMissions = formattedMissions.slice(startIndex, endIndex);

      setMissions(paginatedMissions);
      
    } catch (error) {
      console.error("Erreur lors du chargement des missions:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors du chargement des missions: ${error.message}`,
      });
      setMissions([]);
      setTotalEntries(0);
    } finally {
      setIsLoading((prev) => ({ ...prev, missions: false }));
    }
  };

  // Charger les missions à l'initialisation et quand les paramètres changent
  useEffect(() => {
    fetchMissions(currentPage, pageSize, appliedFilters);
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

  const handleRowClick = (missionId) => {
    if (missionId) {
      setSelectedMissionId(missionId);
      setShowDetailsMission(true);
    } else {
      setAlert({
        isOpen: true,
        type: "error",
        message: "ID de mission invalide.",
      });
    }
  };

  const handleFilterSubmit = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1); // Retour à la première page lors du filtrage
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: "",
      status: "",
      department: "",
      priority: "",
      dateRange: { start: "", end: "" },
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
  };

  const handleValidate = async (missionId, action, comment = "", signature = "") => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || !mission.missionAssignationId) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Mission ou ID d'assignation introuvable.",
      });
      return;
    }

    const missionBudget = {
      directionName: "DRH",
      budget: 1000000000,
      userId: JSON.parse(localStorage.getItem("user"))?.userId || "N/A",
    };

    try {
      await validateMission(missionId, mission.missionAssignationId, action, comment, signature, missionBudget);
      
      // Recharger les données après validation
      await fetchMissions(currentPage, pageSize, appliedFilters);
      
      setAlert({
        isOpen: true,
        type: "success",
        message: `Mission ${action === "validate" ? "approuvée" : action === "reject" ? "rejetée" : "sauvegardée"} avec succès.`,
      });
    } catch (error) {
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors de la validation de la mission: ${error.message}`,
      });
    }
  };

  const handleUpdateComments = (missionId, comments) => {
    setMissions((prevMissions) =>
      prevMissions.map((mission) =>
        mission.id === missionId ? { ...mission, comments } : mission
      )
    );
  };

  const handleUpdateSignature = (missionId, signature) => {
    setMissions((prevMissions) =>
      prevMissions.map((mission) =>
        mission.id === missionId ? { ...mission, signature } : mission
      )
    );
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
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return {
    missions,
    filters,
    setFilters,
    appliedFilters,
    setAppliedFilters,
    isLoading,
    alert,
    setAlert,
    stats,
    selectedMissionId,
    setSelectedMissionId,
    showDetailsMission,
    setShowDetailsMission,
    isHidden,
    setIsHidden,
    handleRowClick,
    handleFilterSubmit,
    handleResetFilters,
    handleValidate,
    handleUpdateComments,
    handleUpdateSignature,
    formatDate,
    getDaysUntilDue,
    currentPage,
    pageSize,
    totalEntries,
    handlePageChange,
    handlePageSizeChange,
  };
};

export default useMissionValidationData;