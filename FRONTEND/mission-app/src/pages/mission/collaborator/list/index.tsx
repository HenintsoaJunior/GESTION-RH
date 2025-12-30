"use client";
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MissionFilters from "./components/mission-filters";
import MissionTable from "./components/mission-table";
import MissionTabs from "./components/mission-tabs";
import { useMissionData } from "./hooks/use-mission-data";
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import MissionForm from "../form/index";
import ProtectedRoute from "@/components/protected-route";
import type { Mission } from "@/api/mission/services";
import type { Status } from "@/components/status";
import { useQueries } from "@tanstack/react-query";
import api from '@/utils/axios-config';
import { 
  MissionStatusEnum, 
  MissionStatusDisplay,
  useCancelMission, 
  useDeleteMissionWithUserId,
  useCloseMission,
} from "@/api/mission/services";
import { STATUSES, statusConfig } from '@/components/status';

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const MissionList: React.FC = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'mes' | 'toutes' | 'collaborateurs'>('mes');
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const {
    filters,
    appliedFilters,
    page,
    setPage,
    pageSize,
    missions,
    totalCount,
    isSearchLoading,
    refetchSearch,
    lieux,
    currentEmployees,
    canAddMission,
    canModifyMission,
    canCancelMission,
    canDeleteMission,
    canViewDetails,
    canClosedMission,
    tabTitles,
    handleFilterSubmit,
    handleResetFilters,
    handleEmployeeChange,
    handleLieuChange,
    handleMissionTypeChange,
    handleDateChange,
    handlePageSizeChange
  } = useMissionData(activeTab, setActiveTab);

  
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.userId || "";

  const { mutate: cancelMission, isPending: isCancelling } = useCancelMission();
  const { mutate: deleteMission, isPending: isDeleting } = useDeleteMissionWithUserId();
  const { mutate: closeMission, isPending: isClosing } = useCloseMission();

  const finalStatuses = useMemo(() => new Set<MissionStatusEnum>([
    MissionStatusEnum.InProgress,
    MissionStatusEnum.Completed,
    MissionStatusEnum.Planned,
    MissionStatusEnum.PaymentInProgress,
    MissionStatusEnum.Closed,
    MissionStatusEnum.Canceled,
    MissionStatusEnum.MissionRejected
  ]), []);

  const missionIds = useMemo(
    () => [...new Set(missions.map((mission: Mission) => mission.missionId))],
    [missions]
  );

  const validationQueries = useQueries({
    queries: missionIds.map((missionId) => ({
      queryKey: ['hasAnyValidatorValidated', missionId],
      queryFn: async () => {
        const response = await api.get(`/api/MissionValidation/has-any-validator-validated/${missionId}`);
        if (response.data.status !== 200) {
          throw new Error(response.data.message || 'Failed to check if any validator has validated');
        }
        return response.data.data;
      },
      enabled: !!missionId && !isSearchLoading,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const validatedMissions = useMemo<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    missionIds.forEach((missionId, index) => {
      const query = validationQueries[index];
      if (query?.isSuccess && missionId) {
        const id = String(missionId);
        map[id] = Boolean(query.data);
      }
    });
    return map;
  }, [missionIds, validationQueries]);

  const hasActions = useMemo(() => {
    return missions.some((mission: Mission) => {
      const status = mission.status as MissionStatusEnum;
      const isValidated = validatedMissions[mission.missionId] || false;
      
      const isFinal = finalStatuses.has(status);
      const isCanceledOrRejected = 
        status === MissionStatusEnum.Canceled || 
        status === MissionStatusEnum.MissionRejected;
      const isCompleted = status === MissionStatusEnum.Completed;
      const isClosed = status === MissionStatusEnum.Closed;
      
      const needsNonFinalAction = !isFinal && !isValidated && (canModifyMission || canCancelMission);
      const needsDeleteAction = isCanceledOrRejected && !isValidated && canDeleteMission;
      const needsCloseAction = isCompleted && !isClosed && !isValidated;
      
      return needsNonFinalAction || needsDeleteAction || needsCloseAction;
    });
  }, [missions, finalStatuses, validatedMissions, canModifyMission, canCancelMission, canDeleteMission]);

  // Fonction pour mapper les clés d'enum vers les clés de statusConfig
  const getStatusConfigKey = (statusEnum: MissionStatusEnum): string => {
    const enumToConfigKeyMap: Record<MissionStatusEnum, string> = {
      [MissionStatusEnum.Unknown]: "unknown",
      [MissionStatusEnum.PendingApproval]: "pending approval",
      [MissionStatusEnum.PaymentInProgress]: "payment in progress",
      [MissionStatusEnum.Planned]: "planned",
      [MissionStatusEnum.InProgress]: "in progress",
      [MissionStatusEnum.Completed]: "completed",
      [MissionStatusEnum.Closed]: "closed",
      [MissionStatusEnum.Canceled]: "canceled",
      [MissionStatusEnum.MissionRejected]: "mission rejected",
    };
    
    return enumToConfigKeyMap[statusEnum] || "unknown";
  };

  const getStatus = useCallback((statusEnum: MissionStatusEnum): Status => {
    // Obtenir la clé de configuration pour ce statut
    const configKey = getStatusConfigKey(statusEnum);
    
    // Chercher d'abord dans le config spécifique
    if (statusConfig[configKey]) {
      const config = statusConfig[configKey];
      const statusLabel = MissionStatusDisplay[statusEnum] || "Inconnu";
      
      // Chercher dans STATUSES pour trouver un statut correspondant
      const matchingStatus = STATUSES.find(status => 
        status.label.toLowerCase() === statusLabel.toLowerCase() ||
        status.id === configKey
      );
      
      return {
        id: configKey,
        label: statusLabel,
        color: config.color,
        category: config.category,
        ...(matchingStatus && { 
          id: matchingStatus.id,
          label: matchingStatus.label
        })
      };
    }
    
    // Chercher dans la liste des statuts STATIC pour une correspondance de label
    const statusLabel = MissionStatusDisplay[statusEnum] || "Inconnu";
    const foundStatus = STATUSES.find(status => 
      status.label.toLowerCase() === statusLabel.toLowerCase()
    );
    
    if (foundStatus) {
      return foundStatus;
    }
    
    // Fallback : créer un statut par défaut
    return { 
      id: statusEnum.toString(), 
      label: statusLabel, 
      color: '#6b7280', 
      category: 'error' as const 
    };
  }, []);

  const handleRowClick = useCallback((missionId: string) => {
    if (canViewDetails) {
      navigate(`/mission/${missionId}`);
    }
  }, [canViewDetails, navigate]);

  const handleEditClick = useCallback((missionId: string) => {
    if (canModifyMission) {
      setSelectedMissionId(missionId);
      setIsFormOpen(true);
    }
  }, [canModifyMission]);

  const handleCancelClick = useCallback((mission: Mission) => {
    if (canCancelMission) {
      setSelectedMission(mission);
      setShowCancelModal(true);
    }
  }, [canCancelMission]);

  const handleDeleteClick = useCallback((mission: Mission) => {
    if (canDeleteMission) {
      setSelectedMission(mission);
      setShowDeleteModal(true);
    }
  }, [canDeleteMission]);

  const handleCloseClick = useCallback((mission: Mission) => {
    setSelectedMission(mission);
    setShowCloseModal(true);
  }, []);

  const handleCancelConfirm = useCallback(() => {
    if (!selectedMission) return;
    if (!userId) {
      setAlert({ isOpen: true, type: "error", message: "Utilisateur non authentifié. Veuillez vous reconnecter." });
      return;
    }
    
    cancelMission(
      { missionId: selectedMission.missionId, userId },
      {
        onSuccess: (response) => {
          setAlert({ 
            isOpen: true, 
            type: "success", 
            message: response.message || "Mission annulée avec succès." 
          });
          refetchSearch();
          setShowCancelModal(false);
          setSelectedMission(null);
        },
        onError: (error) => {
          setAlert({ 
            isOpen: true, 
            type: "error", 
            message: error.message || "Erreur lors de l'annulation." 
          });
        }
      }
    );
  }, [selectedMission, refetchSearch, userId, cancelMission]);

  const handleDeleteConfirm = useCallback(() => {
    if (!selectedMission) return;
    if (!userId) {
      setAlert({ isOpen: true, type: "error", message: "Utilisateur non authentifié. Veuillez vous reconnecter." });
      return;
    }
    
    deleteMission(
      { missionId: selectedMission.missionId, userId },
      {
        onSuccess: (response) => {
          setAlert({ 
            isOpen: true, 
            type: "success", 
            message: response.message || "Mission supprimée avec succès." 
          });
          refetchSearch();
          setShowDeleteModal(false);
          setSelectedMission(null);
        },
        onError: (error) => {
          setAlert({ 
            isOpen: true, 
            type: "error", 
            message: error.message || "Erreur lors de la suppression." 
          });
        }
      }
    );
  }, [selectedMission, refetchSearch, userId, deleteMission]);

  const handleCloseConfirm = useCallback(() => {
    if (!selectedMission) return;
    if (!userId) {
      setAlert({ isOpen: true, type: "error", message: "Utilisateur non authentifié. Veuillez vous reconnecter." });
      return;
    }
    
    closeMission(
      { missionId: selectedMission.missionId, userId },
      {
        onSuccess: (response) => {
          setAlert({ 
            isOpen: true, 
            type: "success", 
            message: response.message || "Mission clôturée avec succès." 
          });
          refetchSearch();
          setShowCloseModal(false);
          setSelectedMission(null);
        },
        onError: (error) => {
          setAlert({ 
            isOpen: true, 
            type: "error", 
            message: error.message || "Erreur lors de la clôture." 
          });
        }
      }
    );
  }, [selectedMission, refetchSearch, userId, closeMission]);

  const handleFormSuccess = useCallback((type: string, message: string) => {
    refetchSearch();
    setIsFormOpen(false);
    setAlert({ isOpen: true, type: type as "info" | "success" | "error" | "warning", message });
  }, [refetchSearch]);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  const handleOpenForm = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as 'mes' | 'toutes' | 'collaborateurs');
  }, []);

  const compatibleFilters = useMemo(() => ({
    ...filters,
    employeeId: filters.employeeId || "",
    missionType: typeof filters.missionType === 'number' ? String(filters.missionType) : (filters.missionType || ""),
    lieuId: filters.lieuId || "",
    status: filters.status || [],
    employeeSearch: filters.employeeSearch || "",
    lieuSearch: filters.lieuSearch || "",
    minStartDate: filters.minStartDate || undefined,
    maxStartDate: filters.maxStartDate || undefined,
    minEndDate: filters.minEndDate || undefined,
    maxEndDate: filters.maxEndDate || undefined,
  }), [filters]);

  const compatibleAppliedFilters = useMemo(() => ({
    ...appliedFilters,
    employeeId: appliedFilters.employeeId || "",
    missionType: typeof appliedFilters.missionType === 'number' ? String(appliedFilters.missionType) : (appliedFilters.missionType || ""),
    lieuId: appliedFilters.lieuId || "",
    status: appliedFilters.status || [],
    employeeSearch: appliedFilters.employeeSearch || "",
    lieuSearch: appliedFilters.lieuSearch || "",
    minStartDate: appliedFilters.minStartDate || undefined,
    maxStartDate: appliedFilters.maxStartDate || undefined,
    minEndDate: appliedFilters.minEndDate || undefined,
    maxEndDate: appliedFilters.maxEndDate || undefined,
  }), [appliedFilters]);

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      {isFormOpen && (
        <MissionForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          missionId={selectedMissionId}
          initialStartDate={new Date().toISOString().split('T')[0]}
          onFormSuccess={handleFormSuccess}
        />
      )}

      {showCancelModal && selectedMission && (
        <Modal
          type="warning"
          message="Êtes-vous sûr de vouloir annuler cette mission ?"
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Confirmer l'annulation"
          confirmAction={handleCancelConfirm}
          confirmLabel={isCancelling ? "Annulation..." : "Confirmer l'annulation"}
          cancelLabel="Annuler"
          showActions={true}
        />
      )}

      {showDeleteModal && selectedMission && (
        <Modal
          type="warning"
          message="Êtes-vous sûr de vouloir supprimer cette mission ? Cette action est irréversible."
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirmer la suppression"
          confirmAction={handleDeleteConfirm}
          confirmLabel={isDeleting ? "Suppression..." : "Supprimer"}
          cancelLabel="Annuler"
          showActions={true}
        />
      )}

      {showCloseModal && selectedMission && (
        <Modal
          type="warning"
          message="Êtes-vous sûr de vouloir clôturer cette mission ? Cette action est définitive."
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          title="Confirmer la clôture"
          confirmAction={handleCloseConfirm}
          confirmLabel={isClosing ? "Clôture en cours..." : "Clôturer la mission"}
          cancelLabel="Annuler"
          showActions={true}
        />
      )}

      <MissionFilters
        filters={compatibleFilters}
        activeTab={activeTab}
        isSearchLoading={isSearchLoading}
        employees={currentEmployees}
        lieux={lieux}
        onFilterSubmit={handleFilterSubmit}
        onResetFilters={handleResetFilters}
        onEmployeeChange={handleEmployeeChange}
        onLieuChange={handleLieuChange}
        onMissionTypeChange={handleMissionTypeChange}
        onDateChange={handleDateChange}
      />

      <MissionTabs
        activeTab={activeTab}
        tabTitles={tabTitles}
        onTabChange={handleTabChange}
      />

      <MissionTable
        missions={missions}
        appliedFilters={compatibleAppliedFilters}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        isSearchLoading={isSearchLoading}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        canAddMission={!!canAddMission}
        canViewDetails={!!canViewDetails}
        canEditMission={!!canModifyMission}
        canCancelMission={!!canCancelMission}
        canDeleteMission={!!canDeleteMission}
        canCloseMission={!!canClosedMission}
        validatedMissions={validatedMissions}
        hasActions={hasActions}
        finalStatuses={finalStatuses}
        getStatus={getStatus}
        onRowClick={handleRowClick}
        onEditClick={handleEditClick}
        onCancelClick={handleCancelClick}
        onDeleteClick={handleDeleteClick}
        onCloseClick={handleCloseClick}
        onAddMission={handleOpenForm}
        userId={userId}
      />
    </>
  );
};

const ProtectedMissionList: React.FC = () => (
  <ProtectedRoute requiredHabilitation="Voir la page des missions">
    <MissionList />
  </ProtectedRoute>
);

export default ProtectedMissionList;