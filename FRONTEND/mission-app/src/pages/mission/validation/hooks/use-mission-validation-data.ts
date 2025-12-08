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
import { useGetAllEmployeesSimple, type Employee } from "@/api/collaborator/services";
import { useQueryClient } from "@tanstack/react-query";

interface Filter {
  employeeId: string;
  employeeName: string;
  employeeMatricule: string;
  status: string;
  validationDateFrom?: string;
  validationDateTo?: string;
  requestDateFrom?: string;
  requestDateTo?: string;
}

interface BeneficiarySuggestion {
  id: string;
  name: string;
  displayName: string;
  acronym: string;
  matricule?: string;
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
    employeeMatricule: "",
    status: "",
    validationDateFrom: "",
    validationDateTo: "",
    requestDateFrom: "",
    requestDateTo: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<Filter>({
    employeeId: "",
    employeeName: "",
    employeeMatricule: "",
    status: "",
    validationDateFrom: "",
    validationDateTo: "",
    requestDateFrom: "",
    requestDateTo: "",
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

  const missionFilter: RequestFilter = useMemo(
    () => ({
      employeeId: appliedFilters.employeeId,
      employeeMatricule: appliedFilters.employeeMatricule,
      status: appliedFilters.status,
      validationDateFrom: appliedFilters.validationDateFrom,
      validationDateTo: appliedFilters.validationDateTo,
      requestDateFrom: appliedFilters.requestDateFrom,
      requestDateTo: appliedFilters.requestDateTo,
    }),
    [
      appliedFilters.employeeId,
      appliedFilters.employeeMatricule,
      appliedFilters.status,
      appliedFilters.validationDateFrom,
      appliedFilters.validationDateTo,
      appliedFilters.requestDateFrom,
      appliedFilters.requestDateTo
    ]
  );
  
  const { 
    data: missionsResponse, 
    isLoading: missionsLoading,
    error: missionsError,
    refetch: refetchMissions
  } = useGetMissionValidationRequests(
    userId,
    currentPage,
    pageSize,
    missionFilter
  );
  
  const validateMissionMutation = useValidateMission(userId || "");
  
  const selectedMissionIdMission = useMemo(() => {
    if (!selectedMissionId) return undefined;
    const mission = missions.find((m) => m.id === selectedMissionId);
    return mission?.missionId;
  }, [selectedMissionId, missions]);
  
  const { data: commentsResponse, isLoading: commentsLoading } = useCommentsByMission(selectedMissionIdMission);
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  
  const { 
    data: employeesData, 
    isLoading: employeesLoading, 
    error: employeesError 
  } = useGetAllEmployeesSimple();

  useEffect(() => {
    setIsLoading((prev) => ({ ...prev, missions: missionsLoading }));
    
    if (missionsError) {
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors du chargement des missions: ${missionsError.message}`,
      });
      setMissions([]);
      setTotalEntries(0);
      return;
    }

    if (missionsResponse) {
      if (!missionsResponse.results || !Array.isArray(missionsResponse.results)) {
        setMissions([]);
        setTotalEntries(0);
        return;
      }

      setTotalEntries(missionsResponse.totalCount || missionsResponse.results.length);
      setMissions(missionsResponse.results);
    } else {
      console.log('No missions response yet');
    }
  }, [missionsResponse, missionsLoading, missionsError]);

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

  useEffect(() => {
    setIsLoading((prev) => ({ ...prev, employees: employeesLoading }));
    
    if (employeesError) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Erreur lors du chargement des collaborateurs. Veuillez réessayer.",
      });
      return;
    }

    if (!userId) {
      setAlert({
        isOpen: true,
        type: "warning",
        message: "Utilisateur non connecté. Les collaborateurs ne seront pas chargés.",
      });
      return;
    }

    if (employeesData) {
      
      let employeesArray: Employee[] = [];
      
      if (employeesData.data && Array.isArray(employeesData.data)) {
        employeesArray = employeesData.data as Employee[];
      } else if (Array.isArray(employeesData)) {
        employeesArray = employeesData as Employee[];
      } else if (employeesData && typeof employeesData === 'object') {
        const possibleArrayProps = Object.keys(employeesData).filter(
          key => Array.isArray((employeesData as any)[key])
        );
        
        if (possibleArrayProps.length > 0) {
          const firstArrayProp = possibleArrayProps[0];
          employeesArray = (employeesData as any)[firstArrayProp] as Employee[];
        } else if ('results' in employeesData && Array.isArray((employeesData as any).results)) {
          employeesArray = (employeesData as any).results as Employee[];
        } else if ('content' in employeesData && Array.isArray((employeesData as any).content)) {
          employeesArray = (employeesData as any).content as Employee[];
        }
      }
      
      
      if (employeesArray.length > 0) {
        const newSuggestions = employeesArray.map((emp) => {
          let matricule = "";
          const matriculeProps = ['matricule', 'employeeCode', 'code', 'registrationNumber', 'badgeNumber', 'employeeId'];
          
          for (const prop of matriculeProps) {
            if (emp[prop as keyof Employee]) {
              matricule = String(emp[prop as keyof Employee]);
              break;
            }
          }
          
          const fullName = `${emp.firstName || ""} ${emp.lastName || "Inconnu"}`.trim();
          const suggestion = {
            id: emp.employeeId || matricule || "N/A",
            name: fullName,
            displayName: matricule ? `${fullName} (${matricule})` : fullName,
            acronym: emp.direction?.acronym || emp.department?.departmentName || "N/A",
            matricule: matricule,
          };
          
          return suggestion;
        });
        setSuggestions((prev) => ({
          ...prev,
          beneficiary: newSuggestions,
        }));
        
      } else {
        console.warn("DEBUG: Aucune donnée d'employé trouvée dans la réponse");
      }
    } else {
      console.log("DEBUG: Données employés undefined ou null");
    }
  }, [employeesData, employeesLoading, employeesError, userId]);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading((prev) => ({ ...prev, stats: true }));
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

  useEffect(() => {
    if (userId) {
      fetchStats();
    } else {
      console.warn("No userId found, skipping mission and stats fetch");
      setAlert({
        isOpen: true,
        type: "warning",
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
    
    // Vérification pour le matricule
    if (filters.employeeMatricule) {
      const selectedEmployee = suggestions.beneficiary.find(
        (emp) => emp.matricule === filters.employeeMatricule
      );
      
      if (selectedEmployee) {
        updatedFilters.employeeId = selectedEmployee.id;
        updatedFilters.employeeName = selectedEmployee.displayName;
      } else {
        updatedFilters.employeeId = "";
        updatedFilters.employeeName = "";
      }
    }
    
    if (filters.employeeName && !filters.employeeId) {
      const selectedEmployee = suggestions.beneficiary.find(
        (emp) => emp.displayName === filters.employeeName
      );
      
      if (selectedEmployee) {
        updatedFilters.employeeId = selectedEmployee.id;
        updatedFilters.employeeMatricule = selectedEmployee.matricule || "";
      } else {
        updatedFilters.employeeId = "";
        updatedFilters.employeeMatricule = "";
      }
    }
    
    setAppliedFilters(updatedFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const resetFilters: Filter = {
      employeeId: "",
      employeeName: "",
      employeeMatricule: "",
      status: "",
      validationDateFrom: "",
      validationDateTo: "",
      requestDateFrom: "",
      requestDateTo: "",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
  };

  const handleValidate = async (missionId: string, action: string, comment = "") => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Mission introuvable.",
      });
      return;
    }

    const missionBudget = {
      directionName: "DRH",
      budget: 1000000000,
      userId: userId || "N/A",
    };

    try {
      const missionType = mission.assignationType || "Non spécifié";
      await validateMissionMutation(mission.id, mission.missionId, action, missionType, comment, missionBudget);

      if (comment.trim()) {
        await handleCreateComment(mission.missionId, comment);
      }

      // Invalidate missions query
      queryClient.invalidateQueries({
        queryKey: ["missionValidationRequests", userId, currentPage, pageSize, missionFilter],
      });
      
      refetchMissions();

      setAlert({
        isOpen: true,
        type: "success",
        message: `Mission ${action === "validate" ? "approuvée" : action === "reject" ? "rejetée" : "sauvegardée"} avec succès.`,
      });
      
      const updatedMissions = missions.filter(m => m.id !== missionId);
      setMissions(updatedMissions);
      setTotalEntries(updatedMissions.length);
      
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

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "Date non spécifiée";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Erreur de formatage de date:", error, dateString);
      return "Date invalide";
    }
  };

  const getDaysUntilDue = (dueDate?: string | null): number => {
    if (!dueDate) return 0;
    try {
      const today = new Date();
      const due = new Date(dueDate);
      const diffTime = due.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error("Erreur de calcul des jours restants:", error, dueDate);
      return 0;
    }
  };

  // Fonction pour exporter les suggestions pour le débogage
  const getSuggestionsDebugInfo = () => {
    return {
      total: suggestions.beneficiary.length,
      withMatricule: suggestions.beneficiary.filter(s => s.matricule).length,
      sample: suggestions.beneficiary.slice(0, 5),
      matricules: suggestions.beneficiary
        .filter(s => s.matricule)
        .map(s => s.matricule)
        .slice(0, 10)
    };
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
    handleAction: handleValidate,
    handleUpdateComments,
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
    refetchMissions,
    getSuggestionsDebugInfo, // Exporté pour le débogage
  };
};

export default useMissionValidationData;