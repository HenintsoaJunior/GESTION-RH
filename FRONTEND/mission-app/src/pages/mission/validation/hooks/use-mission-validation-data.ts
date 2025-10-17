/* eslint-disable prefer-const */
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useGetMissionValidationRequests,
  useValidateMission,
  type RequestFilter,
  type FormattedMission,
} from "@/api/mission/validation/services";
import {
  useCommentsByMission,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  type CommentForm,
  type UpdateCommentParams,
  type DeleteCommentParams,
} from "@/api/comment/services";
import { useEmployees, type Employee } from "@/api/collaborator/services";
import { useQueryClient } from "@tanstack/react-query";

interface Filter {
  employeeId: string;
  employeeName: string;
  status: string;
}

interface BeneficiarySuggestion {
  id: string;
  name: string;
  displayName: string;
  acronym: string;
}

interface Suggestions {
  beneficiary: BeneficiarySuggestion[];
}

interface LoadingState {
  missions: boolean;
  comments: boolean;
  employees: boolean;
  stats: boolean;
}

interface Alert {
  isOpen: boolean;
  type: string;
  message: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface Comment {
  commentId: string;
  content: string;
  createdAt: string;
  creator: {
    name: string;
    userId: string;
  };
}

const useMissionValidationData = () => {
  const [missions, setMissions] = useState<FormattedMission[]>([]);
  const [filters, setFilters] = useState<Filter>({
    employeeId: "",
    employeeName: "",
    status: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<Filter>({
    employeeId: "",
    employeeName: "",
    status: "",
  });
  const [suggestions, setSuggestions] = useState<Suggestions>({
    beneficiary: [],
  });
  const [isLoading, setIsLoading] = useState<LoadingState>({
    missions: true,
    comments: false,
    employees: false,
    stats: false,
  });
  const [alert, setAlert] = useState<Alert>({ isOpen: false, type: "info", message: "" });
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [showDetailsMission, setShowDetailsMission] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [comments, setComments] = useState<Comment[]>([]);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.userId || "";

  const queryClient = useQueryClient();

  // Initialize services
  const missionFilter: RequestFilter = {
    employeeId: appliedFilters.employeeId,
    status: appliedFilters.status,
  };
  const { data: missionsResponse, isLoading: missionsLoading } = useGetMissionValidationRequests(
    userId,
    currentPage,
    pageSize,
    missionFilter
  );
  const validateMission = useValidateMission(userId || "");
  const selectedMissionIdMission = useMemo(() => {
    if (!selectedMissionId) return undefined;
    const mission = missions.find((m) => m.id === selectedMissionId);
    return mission?.missionId;
  }, [selectedMissionId, missions]);
  const { data: commentsResponse, isLoading: commentsLoading } = useCommentsByMission(selectedMissionIdMission);
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const { data: employeesData, isLoading: employeesLoading } = useEmployees();

  // Handle missions data
  useEffect(() => {
    setIsLoading((prev) => ({ ...prev, missions: missionsLoading }));
    if (missionsResponse) {
      if (!missionsResponse.results || !Array.isArray(missionsResponse.results)) {
        console.warn("La réponse ne contient pas un tableau de résultats:", missionsResponse);
        setMissions([]);
        setTotalEntries(0);
        setAlert({
          isOpen: true,
          type: "error",
          message: "La réponse de l'API ne contient pas de résultats valides.",
        });
        return;
      }

      const formattedMissions: FormattedMission[] = missionsResponse.results.map((validation) => {
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
          location: mission.lieu
            ? `${mission.lieu.nom || "Inconnu"}, ${mission.lieu.pays || "Inconnu"}`
            : "Lieu non spécifié",
          comments: "",
          signature: validator.signature || "",
          matricule: creator.matricule || "N/A",
          function: creator.position || "Fonction non spécifiée",
          transport: missionAssignation.transport?.name || "Non spécifié",
          departureTime: missionAssignation.departureTime || "Non spécifié",
          departureDate: missionAssignation.departureDate || (mission.startDate as string) || "Non spécifié",
          returnDate: missionAssignation.returnDate || (mission.endDate as string) || "Non spécifié",
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
          allocatedFund: missionAssignation.allocatedFund || 20000,
          type: missionAssignation.type || "Non spécifié",
          assignationType: missionAssignation.type || "Non spécifié",
          employeeId: missionAssignation.employeeId || "Non spécifié",
          missionId: mission.missionId || "N/A",
        };
      });

      setTotalEntries(missionsResponse.totalCount || formattedMissions.length);
      setMissions(formattedMissions);
    }
  }, [missionsResponse, missionsLoading]);

  // Handle comments data
  useEffect(() => {
    setIsLoading((prev) => ({ ...prev, comments: commentsLoading }));
    if (commentsResponse?.data) {
      setComments(
        commentsResponse.data.map(({ comment }) => ({
          commentId: comment.commentId,
          content: comment.commentText,
          createdAt: comment.createdAt,
          creator: {
            name: comment.user.name,
            userId: comment.user.userId,
          },
        }))
      );
    }
  }, [commentsResponse, commentsLoading]);

  // Handle employees data
  useEffect(() => {
    setIsLoading((prev) => ({ ...prev, employees: employeesLoading }));
    if (userId) {
      if (employeesData?.data && Array.isArray(employeesData.data)) {
        setSuggestions((prev) => ({
          ...prev,
          beneficiary: (employeesData.data as Employee[]).map((emp) => ({
            id: emp.employeeId || "N/A",
            name: `${emp.lastName || "Inconnu"} ${emp.firstName || ""}`.trim(),
            displayName: `${emp.lastName || "Inconnu"} ${emp.firstName || ""} (${emp.direction?.acronym || "N/A"})`.trim(),
            acronym: emp.direction?.acronym || "N/A",
          })),
        }));
      } else {
        console.warn("Employee data is not an array:", employeesData);
        setAlert({
          isOpen: true,
          type: "error",
          message: "Les données des collaborateurs ne sont pas valides.",
        });
      }
    } else {
      console.warn("No userId found, skipping employee fetch");
      setAlert({
        isOpen: true,
        type: "error",
        message: "Utilisateur non connecté. Veuillez vous connecter pour charger les collaborateurs.",
      });
    }
  }, [employeesData, employeesLoading, userId]);

  // Memoize fetchStats
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading((prev) => ({ ...prev, stats: true }));
      // TODO: Implement stats query or remove if not needed
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (error) {
      console.error("Erreur dans fetchStats:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur inattendue lors du chargement des statistiques: ${(error as Error).message || "Une erreur inconnue s'est produite."}`,
      });
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    } finally {
      setIsLoading((prev) => ({ ...prev, stats: false }));
    }
  }, []);

  // Fetch stats on mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchStats();
    } else {
      console.warn("No userId found, skipping mission and stats fetch");
      setAlert({
        isOpen: true,
        type: "error",
        message: "Utilisateur non connecté. Veuillez vous connecter pour voir les missions et les statistiques.",
      });
      setIsLoading((prev) => ({ ...prev, missions: false, stats: false }));
    }
  }, [userId, fetchStats]);

  const handleCreateComment = async (missionId: string, commentText: string) => {
    try {
      const commentData: CommentForm = {
        missionId,
        userId: userId || "",
        commentText,
        createdAt: new Date().toISOString(),
      };
      const response = await createCommentMutation.mutateAsync(commentData);
      return response;
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors de l'ajout du commentaire: ${(error as Error).message || "Une erreur inconnue s'est produite."}`,
      });
      throw error;
    }
  };

  const handleUpdateComment = async (commentId: string, missionId: string, commentText: string) => {
    try {
      const commentData: CommentForm = {
        missionId,
        userId: userId || "",
        commentText,
        createdAt: new Date().toISOString(),
      };
      const response = await updateCommentMutation.mutateAsync({ commentId, comment: commentData } as UpdateCommentParams);
      return response;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du commentaire:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors de la mise à jour du commentaire: ${(error as Error).message || "Une erreur inconnue s'est produite."}`,
      });
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string, missionId: string) => {
    try {
      const response = await deleteCommentMutation.mutateAsync({
        commentId,
        missionId,
        userId: userId || "",
      } as DeleteCommentParams);
      return response;
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire:", error);
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors de la suppression du commentaire: ${(error as Error).message || "Une erreur inconnue s'est produite."}`,
      });
      throw error;
    }
  };

  const handlePageChange = (newPage: number) => {
    const maxPage = Math.ceil(totalEntries / pageSize);
    if (newPage >= 1 && newPage <= maxPage) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value);
    if (newPageSize > 0 && Number.isInteger(newPageSize)) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
  };

  const handleRowClick = (missionId: string | null) => {
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
    let updatedFilters: Filter = { ...filters };
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
    const resetFilters: Filter = {
      employeeId: "",
      employeeName: "",
      status: "",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
  };

  const handleValidate = async (missionId: string, action: string, comment = "") => {
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
      await validateMission(missionId, mission.missionAssignationId, action, missionType, comment, missionBudget);

      if (comment.trim()) {
        await handleCreateComment(mission.missionId, comment);
      }

      // Invalidate missions query
      queryClient.invalidateQueries({
        queryKey: ["missionValidationRequests", userId, currentPage, pageSize, missionFilter],
      });

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
        message: `Erreur lors de la validation de la mission: ${(error as Error).message || "Une erreur inconnue s'est produite."}`,
      });
    }
  };

  const handleUpdateComments = (missionId: string, comments: string) => {
    setMissions((prevMissions) =>
      prevMissions.map((mission) =>
        mission.id === missionId ? { ...mission, comments } : mission
      )
    );
  };

  const handleUpdateSignature = (missionId: string, signature: string) => {
    setMissions((prevMissions) =>
      prevMissions.map((mission) =>
        mission.id === missionId ? { ...mission, signature } : mission
      )
    );
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "Date non spécifiée";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate?: string | null): number => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
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
  };
};

export default useMissionValidationData;