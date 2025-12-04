import { useState, useEffect, useCallback, useMemo } from "react";
import { useGetAllEmployeesSimple, useGetEmployeesByMatriculesSimple } from "@/api/collaborator/services";
import { useLieux } from "@/api/lieu/services";
import { useUserCollaborators, useUserCollaboratorsMatricules, useHasHabilitation } from "@/api/users/services";
import type { UserInfo, UserInfosResponse } from "@/api/users/services";
import { 
  useSearchMissions, 
  type MissionSearchFilters,
  type MissionTypeEnum,
  type MissionStatusEnum,
} from "@/api/mission/services";

const statusDisplayToEnum: Record<string, MissionStatusEnum> = {
  "pending approval": 1,
  "payment in progress": 2, 
  "planned": 3, 
  "in progress": 4, 
  "completed": 5,
  "closed": 6,
  "canceled": 7, 
  "mission rejected": 8, 
};

const missionTypeDisplayToEnum: Record<string, MissionTypeEnum> = {
  "International": 2, 
  "National": 1, 
};

interface UISelectableEmployee {
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

interface UISelectableLieu {
  lieuId: string;
  nom: string;
  pays: string;
  displayName: string;
}

interface LocalFiltersState {
  employeeId: string;
  missionType: string; 
  lieuId: string;
  status: string[]; 
  minStartDate?: string;
  maxStartDate?: string;
  minEndDate?: string;
  maxEndDate?: string;
  type?: string;
  selectedEmployee?: UISelectableEmployee | null;
  selectedLieu?: UISelectableLieu | null;
  employeeSearch?: string;
  lieuSearch?: string;
  name?: string;
}

export const useMissionData = (activeTab: string, setActiveTab: (tab: any) => void) => {
  // États locaux (utilisant des strings pour l'UI)
  const [filters, setFilters] = useState<LocalFiltersState>({
    employeeId: "",
    missionType: "",
    lieuId: "",
    status: [],
    minStartDate: undefined,
    maxStartDate: undefined,
    minEndDate: undefined,
    maxEndDate: undefined,
    selectedEmployee: null,
    selectedLieu: null,
    employeeSearch: "",
    lieuSearch: "",
  });
  
  const [appliedFilters, setAppliedFilters] = useState<LocalFiltersState>({
    employeeId: "",
    missionType: "",
    lieuId: "",
    status: [],
    minStartDate: undefined,
    maxStartDate: undefined,
    minEndDate: undefined,
    maxEndDate: undefined,
    selectedEmployee: null,
    selectedLieu: null,
    employeeSearch: "",
    lieuSearch: "",
  });
  
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Données utilisateur
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const matricule = userData?.matricule || "";
  const userId = userData?.userId || "";

  // Habilitation
  const canViewAllMissions = useHasHabilitation(userId, "Voir les missions de tous les collaborateurs");
  const canAddMission = useHasHabilitation(userId, "Ajouter une mission");
  const canModifyMission = useHasHabilitation(userId, "Modifier une mission");
  const canCancelMission = useHasHabilitation(userId, "Annuler une mission");
  const canDeleteMission = useHasHabilitation(userId, "Supprimer une mission");
  const canViewDetails = useHasHabilitation(userId, "Voir les détails mission");
const canClosedMission = useHasHabilitation(userId, "Voir les détails mission");

  // APIs
  const { data: employeesResponse } = useGetAllEmployeesSimple();
  const { data: collaborateursMatriculesResponse } = useUserCollaboratorsMatricules(userId);
  const { data: collaborateursEmployeesResponse } = useGetEmployeesByMatriculesSimple(collaborateursMatriculesResponse?.data || []);
  const { data: lieuxResponse } = useLieux();
  const { data: collaboratorsResponse }: { data?: UserInfosResponse } = useUserCollaborators(userId);

  // Conversion des données en types simplifiés pour l'UI
  const employees = useMemo((): UISelectableEmployee[] => {
    const data = employeesResponse?.data || [];
    return data.map(emp => ({
      employeeId: emp.employeeId,
      employeeCode: emp.employeeCode || '',
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      displayName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim()
    }));
  }, [employeesResponse?.data]);

  const collaborateursEmployees = useMemo((): UISelectableEmployee[] => {
    const data = collaborateursEmployeesResponse?.data || [];
    return data.map(emp => ({
      employeeId: emp.employeeId,
      employeeCode: emp.employeeCode || '',
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      displayName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim()
    }));
  }, [collaborateursEmployeesResponse]);

  const currentEmployees = useMemo(() => 
    activeTab === 'collaborateurs' ? collaborateursEmployees : employees, 
    [activeTab, collaborateursEmployees, employees]
  );

  const lieux = useMemo((): UISelectableLieu[] => {
    const data = lieuxResponse?.data || [];
    return data.map(lieu => ({
      lieuId: lieu.lieuId,
      nom: lieu.nom || '',
      pays: lieu.pays || '',
      displayName: `${lieu.nom || ''}/${lieu.pays || ''}`
    }));
  }, [lieuxResponse?.data]);

  const hasCollaborators = useMemo(() => (collaboratorsResponse?.data as UserInfo[] || []).length > 0, [collaboratorsResponse]);

  // Tabs
  const tabTitles = useMemo(() => {
    const titles = [
      { key: 'mes', label: 'Mes missions' },
    ];
    if (canViewAllMissions) {
      titles.unshift({ key: 'toutes', label: 'Toutes les missions' });
    }
    if (hasCollaborators) {
      titles.push({ key: 'collaborateurs', label: 'Missions de mes collaborateurs' });
    }
    return titles;
  }, [hasCollaborators, canViewAllMissions]);

  // Filtres de requête - conversion des strings vers les enum
  const queryFilters: MissionSearchFilters = useMemo(() => {
    const filtersBase: Partial<MissionSearchFilters> = {};

    // Filtres de recherche avec conversion des types
    if (appliedFilters.name) filtersBase.name = appliedFilters.name;
    if (appliedFilters.employeeId) filtersBase.employeeId = appliedFilters.employeeId;
    
    // Conversion du type de mission
    if (appliedFilters.missionType) {
      filtersBase.missionType = missionTypeDisplayToEnum[appliedFilters.missionType];
    }
    
    if (appliedFilters.lieuId) filtersBase.lieuId = appliedFilters.lieuId;
    
    // Conversion des statuts
    if (appliedFilters.status && appliedFilters.status.length > 0) {
      filtersBase.status = appliedFilters.status
        .map(status => statusDisplayToEnum[status])
        .filter(Boolean) as MissionStatusEnum[];
    }
    
    if (appliedFilters.minStartDate) filtersBase.minStartDate = appliedFilters.minStartDate;
    if (appliedFilters.maxStartDate) filtersBase.maxStartDate = appliedFilters.maxStartDate;
    if (appliedFilters.minEndDate) filtersBase.minEndDate = appliedFilters.minEndDate;
    if (appliedFilters.maxEndDate) filtersBase.maxEndDate = appliedFilters.maxEndDate;

    // Filtres par onglet (matricule)
    switch (activeTab) {
      case 'mes':
        if (matricule) filtersBase.matricule = [matricule];
        break;
      case 'collaborateurs':
        const collaboratorsData = collaboratorsResponse?.data as UserInfo[] || [];
        const collaboratorsMatricules = collaboratorsData.map((c) => c.matricule).filter(Boolean);
        if (collaboratorsMatricules.length > 0) filtersBase.matricule = collaboratorsMatricules;
        break;
      case 'toutes':
        break;
      default:
        break;
    }

    return filtersBase as MissionSearchFilters;
  }, [appliedFilters, activeTab, matricule, collaboratorsResponse]);

  // Recherche des missions
  const { data: searchResponse, isLoading: isSearchLoading, refetch: refetchSearch } = useSearchMissions(
    queryFilters,
    page,
    pageSize
  );

  // Extraction des missions
  const missions = useMemo(() => {
    // @ts-ignore
    const results = searchResponse?.data?.results || [];
    return results;
  }, [searchResponse]);

  // @ts-ignore
  const totalCountFromApi = searchResponse?.data?.totalCount || 0;

  // Handlers
  const handleFilterSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setAppliedFilters(filters);
    setPage(1);
  }, [filters]);

  const handleResetFilters = useCallback((): void => {
    const resetFilters: LocalFiltersState = {
      employeeId: "",
      missionType: "",
      lieuId: "",
      status: [],
      minStartDate: undefined,
      maxStartDate: undefined,
      minEndDate: undefined,
      maxEndDate: undefined,
      selectedEmployee: null,
      selectedLieu: null,
      employeeSearch: "",
      lieuSearch: "",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPage(1);
  }, []);

  const handleEmployeeChange = useCallback((value: string): void => {
    setFilters((prev) => ({ ...prev, employeeSearch: value }));
    const matchedEmployee = currentEmployees.find((emp: UISelectableEmployee) =>
      emp.displayName === value
    );
    if (matchedEmployee) {
      setFilters((prev) => ({
        ...prev,
        selectedEmployee: matchedEmployee,
        employeeId: matchedEmployee.employeeId,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        selectedEmployee: null,
        employeeId: "",
      }));
    }
  }, [currentEmployees]);

  const handleLieuChange = useCallback((value: string): void => {
    setFilters((prev) => ({ ...prev, lieuSearch: value }));
    const matchedLieu = lieux.find((lieu: UISelectableLieu) => lieu.displayName === value);
    if (matchedLieu) {
      setFilters((prev) => ({
        ...prev,
        selectedLieu: matchedLieu,
        lieuId: matchedLieu.lieuId,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        selectedLieu: null,
        lieuId: "",
      }));
    }
  }, [lieux]);

  const handleMissionTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilters((prev) => ({ ...prev, missionType: e.target.value }));
  }, []);

  const handleDateChange = useCallback((field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  }, []);

  // Effets
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      employeeId: "",
      selectedEmployee: null,
      employeeSearch: "",
    }));
    setAppliedFilters((prev) => ({
      ...prev,
      employeeId: "",
      selectedEmployee: null,
      employeeSearch: "",
    }));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'collaborateurs' && !hasCollaborators) {
      setActiveTab('mes');
    }
  }, [activeTab, hasCollaborators, setActiveTab]);

  useEffect(() => {
    if (activeTab === 'toutes' && !canViewAllMissions) {
      setActiveTab('mes');
    }
  }, [activeTab, canViewAllMissions, setActiveTab]);

  return {
    // États
    filters,
    appliedFilters,
    setFilters,
    setAppliedFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    
    // Données
    missions,
    totalCount: totalCountFromApi,
    isSearchLoading,
    refetchSearch,
    employees: employees as UISelectableEmployee[],
    lieux: lieux as UISelectableLieu[],
    currentEmployees: currentEmployees as UISelectableEmployee[],
    
    // Habilitation
    hasCollaborators,
    canViewAllMissions,
    canAddMission,
    canModifyMission,
    canCancelMission,
    canDeleteMission,
    canViewDetails,
    canClosedMission,
    
    // UI
    tabTitles,
    queryFilters,
    
    // Handlers
    handleFilterSubmit,
    handleResetFilters,
    handleEmployeeChange,
    handleLieuChange,
    handleMissionTypeChange,
    handleDateChange,
    handlePageSizeChange
  };
};