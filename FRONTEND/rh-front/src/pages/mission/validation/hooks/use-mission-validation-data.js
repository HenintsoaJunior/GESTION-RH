import { useState, useEffect } from "react";
import { MissionValidationRequests, ValidateMission } from "services/mission/validation";
import { CreateComment, GetCommentsByMission, UpdateComment, DeleteComment } from "services/mission/comments";
import { fetchAllEmployees } from "services/employee/employee";
import { fetchMissionValidationStats } from "services/mission/validation";

const useMissionValidationData = () => {
  const [missions, setMissions] = useState([]);
  const [filters, setFilters] = useState({
    employeeId: "",
    employeeName: "",
    status: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    employeeId: "",
    employeeName: "",
    status: "",
  });
  const [suggestions, setSuggestions] = useState({
    beneficiary: [],
  });
  const [isLoading, setIsLoading] = useState({
    missions: true,
    comments: false,
    employees: false,
    stats: false,
  });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [showDetailsMission, setShowDetailsMission] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [comments, setComments] = useState([]);

  const userId = JSON.parse(localStorage.getItem("user"))?.userId || null;
  const matricule = JSON.parse(localStorage.getItem("user"))?.matricule || null;
  // Initialize services
  const validateMissionRequest = MissionValidationRequests(userId);
  const validateMission = ValidateMission();
  const createComment = CreateComment();
  const getCommentsByMission = GetCommentsByMission();
  const updateComment = UpdateComment();
  const deleteComment = DeleteComment();

  // Fetch stats for mission validations
  const fetchStats = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, stats: true }));
      await fetchMissionValidationStats(
        (data) => {
          setStats(data);
        },
        setIsLoading,
        (error) => {
          setAlert({
            isOpen: true,
            type: "error",
            message: error.message,
          });
        },
        matricule
      );
    } catch (error) {
      console.error("Erreur dans fetchStats:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur inattendue lors du chargement des statistiques: ${error.message || "Une erreur inconnue s'est produite."}`,
      });
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    } finally {
      setIsLoading((prev) => ({ ...prev, stats: false }));
    }
  };

  // Fetch collaborators (employees) for autocomplete suggestions
  useEffect(() => {
    if (userId) {
      setIsLoading((prev) => ({ ...prev, employees: true }));
      fetchAllEmployees(
        (data) => {
          if (!Array.isArray(data)) {
            console.warn("Employee data is not an array:", data);
            setAlert({
              isOpen: true,
              type: "error",
              message: "Les données des collaborateurs ne sont pas valides.",
            });
            setIsLoading((prev) => ({ ...prev, employees: false }));
            return;
          }
          setSuggestions((prev) => ({
            ...prev,
            beneficiary: data.map((emp) => ({
              id: emp.employeeId || "N/A",
              name: `${emp.lastName || "Inconnu"} ${emp.firstName || ""}`.trim(),
              displayName: `${emp.lastName || "Inconnu"} ${emp.firstName || ""} (${emp.direction?.acronym || "N/A"})`.trim(),
              acronym: emp.direction?.acronym || "N/A",
            })),
          }));
          setIsLoading((prev) => ({ ...prev, employees: false }));
        },
        setIsLoading,
        (error) => {
          setAlert({
            isOpen: true,
            type: "error",
            message: `Erreur lors du chargement des collaborateurs: ${error.message || "Une erreur inconnue s'est produite."}`,
          });
          setIsLoading((prev) => ({ ...prev, employees: false }));
        }
      );
    } else {
      console.warn("No userId found, skipping employee fetch");
      setAlert({
        isOpen: true,
        type: "error",
        message: "Utilisateur non connecté. Veuillez vous connecter pour charger les collaborateurs.",
      });
      setIsLoading((prev) => ({ ...prev, employees: false }));
    }
  }, [userId]);

  // Fetch missions
  const fetchMissions = async (page = currentPage, size = pageSize, filters = appliedFilters) => {
    try {
      setIsLoading((prev) => ({ ...prev, missions: true }));

      if (!userId) {
        throw new Error("Utilisateur non connecté. Veuillez vous connecter.");
      }

      console.log("Fetching missions with filters:", filters); // Debug
      const response = await validateMissionRequest({
        page,
        pageSize: size,
        employeeId: filters.employeeId,
        status: filters.status,
      });

      if (!response.results || !Array.isArray(response.results)) {
        console.warn("La réponse ne contient pas un tableau de résultats:", response);
        setMissions([]);
        setTotalEntries(0);
        setAlert({
          isOpen: true,
          type: "error",
          message: "La réponse de l'API ne contient pas de résultats valides.",
        });
        return;
      }

      const formattedMissions = response.results.map((validation) => {
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
          status: validation.status || "pending",
          requestDate: mission.startDate || new Date().toISOString(),
          dueDate: mission.endDate || new Date().toISOString(),
          estimatedDuration: missionAssignation.duration
            ? `${missionAssignation.duration} jour${missionAssignation.duration > 1 ? "s" : ""}`
            : "Non spécifié",
          location: mission.lieu ? `${mission.lieu.nom || "Inconnu"}, ${mission.lieu.pays || "Inconnu"}` : "Lieu non spécifié",
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
          superiorName: creator.superiorName || "Non spécifié",
          email: creator.email || "",
          createdAt: validation.createdAt || new Date().toISOString(),
          updatedAt: validation.updatedAt || null,
          missionAssignationId: validation.missionAssignationId || "N/A",
          missionType: mission.missionType || "Non spécifié",
          missionStatus: mission.status || "Non spécifié",
          allocatedFund: missionAssignation.allocatedFund || 0,
          type: missionAssignation.type || "Non spécifié",
          assignationType: missionAssignation.type || "Non spécifié",
          employeeId: missionAssignation.employeeId || "Non spécifié",
          missionId: mission.missionId || "N/A",
        };
      });

      setTotalEntries(response.totalCount || formattedMissions.length);
      setMissions(formattedMissions);
    } catch (error) {
      console.error("Erreur lors du chargement des missions:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors du chargement des missions: ${error.message || "Une erreur inconnue s'est produite."}`,
      });
      setMissions([]);
      setTotalEntries(0);
    } finally {
      setIsLoading((prev) => ({ ...prev, missions: false }));
    }
  };

  // Fetch comments for the selected mission
  const fetchComments = async (missionId) => {
    try {
      setIsLoading((prev) => ({ ...prev, comments: true }));
      const commentsData = await getCommentsByMission(missionId);
      setComments(commentsData || []);
    } catch (error) {
      console.error("Erreur lors du chargement des commentaires:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors du chargement des commentaires: ${error.message || "Une erreur inconnue s'est produite."}`,
      });
      setComments([]);
    } finally {
      setIsLoading((prev) => ({ ...prev, comments: false }));
    }
  };

  // Fetch stats and missions on mount and when filters/page change
  useEffect(() => {
    if (userId) {
      fetchStats();
      fetchMissions(currentPage, pageSize, appliedFilters);
    } else {
      console.warn("No userId found, skipping mission and stats fetch");
      setAlert({
        isOpen: true,
        type: "error",
        message: "Utilisateur non connecté. Veuillez vous connecter pour voir les missions et les statistiques.",
      });
      setIsLoading((prev) => ({ ...prev, missions: false, stats: false }));
    }
  }, [appliedFilters, currentPage, pageSize, userId]);

  // Fetch comments when a mission is selected
  useEffect(() => {
    if (selectedMissionId) {
      const mission = missions.find((m) => m.id === selectedMissionId);
      if (mission && mission.missionId) {
        fetchComments(mission.missionId);
      } else {
        console.warn("Mission not found or invalid missionId:", selectedMissionId);
        setAlert({
          isOpen: true,
          type: "error",
          message: "Mission sélectionnée non trouvée ou ID de mission invalide.",
        });
      }
    }
  }, [selectedMissionId]);

  const handleCreateComment = async (missionId, commentText) => {
    try {
      const commentData = {
        missionId,
        userId,
        commentText,
        createdAt: new Date().toISOString(),
      };
      const response = await createComment(commentData);
      await fetchComments(missionId);
      
      return response;
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors de l'ajout du commentaire: ${error.message || "Une erreur inconnue s'est produite."}`,
      });
      throw error;
    }
  };

  const handleUpdateComment = async (commentId, missionId, commentText) => {
    try {
      const commentData = {
        missionId,
        userId,
        commentText,
        createdAt: new Date().toISOString(),
      };
      const response = await updateComment(commentId, commentData);
      await fetchComments(missionId);
      
      return response;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du commentaire:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors de la mise à jour du commentaire: ${error.message || "Une erreur inconnue s'est produite."}`,
      });
      throw error;
    }
  };

  const handleDeleteComment = async (commentId, missionId) => {
    try {
      const response = await deleteComment(commentId, missionId, userId);
      await fetchComments(missionId);
      
      return response;
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors de la suppression du commentaire: ${error.message || "Une erreur inconnue s'est produite."}`,
      });
      throw error;
    }
  };

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
      setAlert({ isOpen: false, type: "info", message: "" });
    } else {
      console.warn("Invalid missionId clicked:", missionId);
      setAlert({
        isOpen: true,
        type: "error",
        message: "ID de mission invalide.",
      });
    }
  };

  const handleFilterSubmit = () => {
    let updatedFilters = { ...filters };
    if (filters.employeeName && !filters.employeeId) {
      const selectedEmployee = suggestions.beneficiary.find(
        (emp) => emp.displayName === filters.employeeName
      );
      if (!selectedEmployee) {
        setAlert({
          isOpen: true,
          type: "error",
          message: "Veuillez sélectionner un collaborateur valide dans la liste des suggestions.",
        });
        return;
      }
      updatedFilters.employeeId = selectedEmployee.id;
      updatedFilters.employeeName = selectedEmployee.displayName;
    }
    console.log("Applied filters:", updatedFilters); // Debug
    setAppliedFilters(updatedFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      employeeId: "",
      employeeName: "",
      status: "",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
  };

  const handleValidate = async (missionId, action, comment = "", signature = "") => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || !mission.missionAssignationId) {
      console.warn("Mission or missionAssignationId not found:", missionId);
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
      userId: userId || "N/A",
    };

    try {
      const missionType = mission.type || mission.assignationType || "Non spécifié";
      await validateMission(missionId, mission.missionAssignationId, action, missionType, comment, signature, missionBudget);

      if (comment.trim()) {
        await handleCreateComment(mission.missionId, comment);
      }

      await fetchMissions(currentPage, pageSize, appliedFilters);
      await fetchStats();

      setAlert({
        isOpen: true,
        type: "success",
        message: `Mission ${action === "validate" ? "approuvée" : action === "reject" ? "rejetée" : "sauvegardée"} avec succès.`,
      });
    } catch (error) {
      console.error("Erreur lors de la validation de la mission:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors de la validation de la mission: ${error.message || "Une erreur inconnue s'est produite."}`,
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
    suggestions,
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
    comments,
    handleCreateComment,
    handleUpdateComment,
    handleDeleteComment,
    fetchComments,
  };
};

export default useMissionValidationData;