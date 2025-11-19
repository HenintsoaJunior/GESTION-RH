"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { 
  ChevronDown, 
  ChevronUp, 
  X, 
  List, 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  Calendar as CalendarIcon,
  User,
  Briefcase,
  Globe,
  MapPin,
  CalendarDays,
  Plane,
 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  FiltersContainer,
  FiltersHeader,
  FiltersTitle,
  FiltersControls,
  FilterControlButton,
  FiltersSection,
  FormLabelSearch,
  StyledAutoCompleteInput,
  StyledSelect,
  FormInputSearch,
  FiltersActions,
  ButtonReset,
  ButtonSearch,
  TableContainer,
  DataTable,
  TableTitle,
  TableHeader,
  TableHeadCell,
  TableRow,
  TableCell,
  FiltersToggle,
  ButtonShowFilters,
  Loading,
  NoDataMessage,
  Separator,
  EditorButton,
  CancelButton,
} from "@/styles/table-styles";
import {
  TabContainer,
  TabButton,
} from "@/styles/onglet-style";
import { CalendarContainer } from "@/styles/calendar-styles";
import StatusFilter from "@/components/status";
import { StatusBadge } from "@/components/status";
import type { Status } from "@/components/status";
import { useGetAllEmployeesSimple, useGetEmployeesByMatriculesSimple } from "@/api/collaborator/services";
import { useLieux } from "@/api/lieu/services";
import { useSearchMissionAssignations } from "@/api/mission/services";
import { useCancelMission, useDeleteMission } from "@/api/mission/services";
import { useUserCollaborators, useUserCollaboratorsMatricules } from "@/api/users/services";
import { useHasHabilitation } from "@/api/users/services";
import type { MissionAssignationSearchFilters, MissionAssignation, Lieu } from "@/api/mission/services";
import type { Employee as CollabEmployee } from "@/api/collaborator/services";
import type { UserInfo, UserInfosResponse } from "@/api/users/services";
import { useQueries } from "@tanstack/react-query";
import api from '@/utils/axios-config';
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import Pagination from "@/components/pagination";
import MissionForm from "../form/index";
import { englishToFrench } from "@/utils/status";
import ProtectedRoute from "@/components/protected-route";
import { Calendar, dateFnsLocalizer,type View } from 'react-big-calendar';
import { format, parse, getDay, startOfWeek as dateFnsStartOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const customStartOfWeek = (date: Date) => dateFnsStartOfWeek(date, { weekStartsOn: 1 });

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: customStartOfWeek,
  getDay,
  locales: { 'fr': fr },
  locale: 'fr',
});

type TabKey = 'mes' | 'toutes' | 'collaborateurs';

interface Tab {
  key: TabKey;
  label: string;
}

interface FiltersState extends Omit<MissionAssignationSearchFilters, 'matricule' | 'missionId' | 'transportId' | 'status'> {
  status: string[];
  selectedEmployee?: CollabEmployee | null;
  selectedLieu?: Lieu | null;
  employeeSearch?: string;
  lieuSearch?: string;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const StyledTabContainer = styled.div`${TabContainer}`;

type TabButtonProps = {
  $isActive: boolean;
  $hasBorderRight: boolean;
};

const StyledTabButton = styled.button<TabButtonProps>`
  ${TabButton}
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
`;

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
`;

const Fieldset = styled.fieldset`
  background: var(--bg-primary, #ffffff);
  padding: var(--spacing-md);
  border: 1px solid var(--border-color, #ddd);
  border-radius: var(--border-radius, 4px);
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
`;

const Legend = styled.legend`
  font-weight: var(--font-weight-semibold);
  color: var(--text-color);
  padding: 0 var(--spacing-sm);
  font-size: 0.75rem;
  grid-column: 1 / -1;
`;

const DateField = styled.div`
  display: flex;
  flex-direction: column;
`;

const ViewToggleButton = styled(ButtonSearch)<{ $isActive?: boolean }>`
  background-color: ${props => props.$isActive ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.$isActive ? '#ffffff' : 'var(--text-color)'};
  border: ${props => props.$isActive ? '1px solid var(--primary-color)' : '1px solid var(--border-color, #ddd)'};
  &:hover {
    background-color: ${props => props.$isActive ? 'var(--primary-hover)' : 'var(--bg-secondary, #f8f9fa)'};
  }
`;

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  missionType?: string;
  status?: string;
}

const CustomEvent: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  const Icon = event.missionType === 'International' ? Plane : Briefcase;
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '4px',
      color: 'white',
      fontSize: '0.75rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      padding: '2px 4px',
    }}>
      <Icon size={12} color="white" />
      <span>{event.title}</span>
    </div>
  );
};

const MissionList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('mes');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [filters, setFilters] = useState<FiltersState>({
    employeeId: "",
    missionType: "",
    lieuId: "",
    status: [],
    minDepartureDate: null,
    maxDepartureDate: null,
    minArrivalDate: null,
    maxArrivalDate: null,
    selectedEmployee: null,
    selectedLieu: null,
    employeeSearch: "",
    lieuSearch: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({
    employeeId: "",
    missionType: "",
    lieuId: "",
    status: [],
    minDepartureDate: null,
    maxDepartureDate: null,
    minArrivalDate: null,
    maxArrivalDate: null,
    selectedEmployee: null,
    selectedLieu: null,
    employeeSearch: "",
    lieuSearch: "",
  });
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [selectedAssignation, setSelectedAssignation] = useState<MissionAssignation | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<View>('month');

  const statusOptions = [
    { label: "Mission en cours de validation", value: "pending approval" },
    { label: "Paiement en cours", value: "payment in progress" },
    { label: "Planifié", value: "planned" },
    { label: "En cours d'exécution", value: "in progress" },
    { label: "Terminé", value: "completed" },
    { label: "Clôturé", value: "closed" },
    { label: "Annulé", value: "canceled" },
    { label: "Mission Rejeté", value: "mission rejected" },
  ];

  const finalStatuses = useMemo(() => new Set([
    "in progress",
    "completed",
    "planned",
    "payment in progress",
    "closed",
    "canceled",
    "mission rejected"
  ]), []);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const matricule = userData?.matricule || "";
  const userId = userData?.userId || "";

  const canViewDetails = useHasHabilitation(userId, "Voir les détails d’une mission");
  const canModifyMission = useHasHabilitation(userId, "Modifier une mission");
  const canDeleteMission = useHasHabilitation(userId, "Supprimer une mission");
  const canCancelMission = useHasHabilitation(userId, "Annuler une mission");
  const canAddMission = useHasHabilitation(userId, "Ajouter une mission");
  const canViewAllMissions = useHasHabilitation(userId, "Voir les missions de tous les collaborateurs");

  const { data: employeesResponse, isLoading: isEmployeesLoading } = useGetAllEmployeesSimple();
  const { data: collaborateursMatriculesResponse } = useUserCollaboratorsMatricules(userId);
  const { data: collaborateursEmployeesResponse, isLoading: isCollaboratorsEmployeesLoading } = useGetEmployeesByMatriculesSimple(collaborateursMatriculesResponse?.data || []);
  const { data: lieuxResponse, isLoading: isLieuxLoading } = useLieux();
  const { data: collaboratorsResponse }: { data?: UserInfosResponse } = useUserCollaborators(userId);
  const { mutate: cancelMissionMutate } = useCancelMission();
  const { mutate: deleteMissionMutate } = useDeleteMission();

  const employees = useMemo(() => employeesResponse?.data || [], [employeesResponse?.data]) as CollabEmployee[];
  const collaborateursEmployees = useMemo(() => collaborateursEmployeesResponse?.data || [], [collaborateursEmployeesResponse]);
  const currentEmployees = useMemo(() => activeTab === 'collaborateurs' ? collaborateursEmployees : employees, [activeTab, collaborateursEmployees, employees]);
  const lieux = useMemo(() => lieuxResponse?.data || [], [lieuxResponse?.data]);

  const hasCollaborators = useMemo(() => (collaboratorsResponse?.data as UserInfo[] || []).length > 0, [collaboratorsResponse]);

  const tabTitles = useMemo(() => {
    const titles: Tab[] = [
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

  const employeeSuggestions = useMemo(() =>
    currentEmployees.map((emp: CollabEmployee) => `${emp.firstName} ${emp.lastName}`),
    [currentEmployees]
  );

  const filteredEmployeeSuggestions = useMemo(() =>
    employeeSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.employeeSearch || "").toLowerCase())
    ),
    [employeeSuggestions, filters.employeeSearch]
  );

  const lieuSuggestions = useMemo(() =>
    lieux.map((lieu: Lieu) => `${lieu.nom}/${lieu.pays}`),
    [lieux]
  );

  const filteredLieuSuggestions = useMemo(() =>
    lieuSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.lieuSearch || "").toLowerCase())
    ),
    [lieuSuggestions, filters.lieuSearch]
  );

  const missionTypes = ["International", "National"];

  const hasFilters: boolean = Object.values({ 
    ...filters, 
    selectedEmployee: null, 
    selectedLieu: null,
    employeeSearch: filters.employeeSearch || "",
    lieuSearch: filters.lieuSearch || "",
    minDepartureDate: filters.minDepartureDate || "",
    maxDepartureDate: filters.maxDepartureDate || "",
    minArrivalDate: filters.minArrivalDate || "",
    maxArrivalDate: filters.maxArrivalDate || "",
  }).some((val) => {
    if (Array.isArray(val)) {
      return val.length > 0;
    }
    return (val || "").trim() !== "";
  });

  const queryFilters: MissionAssignationSearchFilters = useMemo(() => {
    const filtersBase: Partial<MissionAssignationSearchFilters> = {};

    if (appliedFilters.employeeId) {
      filtersBase.employeeId = appliedFilters.employeeId;
    }
    if (appliedFilters.missionType) {
      filtersBase.missionType = appliedFilters.missionType;
    }
    if (appliedFilters.lieuId) {
      filtersBase.lieuId = appliedFilters.lieuId;
    }
    if (appliedFilters.status && appliedFilters.status.length > 0) {
      filtersBase.status = appliedFilters.status;
    }
    if (appliedFilters.minDepartureDate) {
      filtersBase.minDepartureDate = appliedFilters.minDepartureDate;
    }
    if (appliedFilters.maxDepartureDate) {
      filtersBase.maxDepartureDate = appliedFilters.maxDepartureDate;
    }
    if (appliedFilters.minArrivalDate) {
      filtersBase.minArrivalDate = appliedFilters.minArrivalDate;
    }
    if (appliedFilters.maxArrivalDate) {
      filtersBase.maxArrivalDate = appliedFilters.maxArrivalDate;
    }

    switch (activeTab) {
      case 'mes': {
        filtersBase.matricule = [matricule || ""];
        break;
      }
      case 'collaborateurs': {
        const collaboratorsData = collaboratorsResponse?.data as UserInfo[] || [];
        const collaboratorsMatricules = collaboratorsData.map((c) => c.matricule).filter(Boolean);
        if (collaboratorsMatricules.length > 0) {
          filtersBase.matricule = collaboratorsMatricules;
        }
        break;
      }
      case 'toutes': {
        // No matricule filter for all missions
        break;
      }
      default: {
        filtersBase.matricule = [""];
        break;
      }
    }

    return filtersBase as MissionAssignationSearchFilters;
  }, [appliedFilters, activeTab, matricule, collaboratorsResponse]);

  const { data: searchResponse, isLoading: isSearchLoading, refetch: refetchSearch } = useSearchMissionAssignations(
    queryFilters,
    page,
    pageSize
  );

  const assignations = useMemo(() => searchResponse?.data?.data || [], [searchResponse?.data?.data]);

  const events = useMemo(() => 
    assignations.map((assignation: MissionAssignation) => ({
      id: assignation.assignationId,
      title: `${assignation.employee.firstName} ${assignation.employee.lastName} - ${assignation.mission.name}`,
      start: new Date(assignation.departureDate),
      end: new Date(assignation.returnDate),
      missionType: assignation.mission.missionType,
      status: assignation.mission.status.trim().toLowerCase(),
    })), 
  [assignations]) as CalendarEvent[];

  const missionIds = useMemo(
    () => [...new Set(assignations.map((a: MissionAssignation) => a.mission.missionId))],
    [assignations]
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

  const validatedMissions = useMemo(() => {
    const map: Record<string, boolean> = {};
    missionIds.forEach((missionId, index) => {
      const query = validationQueries[index];
      if (query.isSuccess) {
        map[missionId] = query.data;
      }
    });
    return map;
  }, [missionIds, validationQueries]);

  const hasActions = useMemo(() => {
    return assignations.some((assignation: MissionAssignation) => {
      const rawStatus = assignation.mission.status;
      const trimmedLowerStatus = rawStatus.trim().toLowerCase();
      const isValidated = validatedMissions[assignation.mission.missionId] || false;
      const needsNonFinalAction = !finalStatuses.has(trimmedLowerStatus) && !isValidated && (canModifyMission || canCancelMission);
      const needsDeleteAction = (trimmedLowerStatus === 'canceled' || trimmedLowerStatus === 'mission rejected') && !isValidated && canDeleteMission;
      return needsNonFinalAction || needsDeleteAction;
    });
  }, [assignations, finalStatuses, validatedMissions, canModifyMission, canCancelMission, canDeleteMission]);

  const darkenColor = useCallback((color: string, amount: number = 20): string => {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    r = Math.max(0, Math.round(r * (100 - amount) / 100));
    g = Math.max(0, Math.round(g * (100 - amount) / 100));
    b = Math.max(0, Math.round(b * (100 - amount) / 100));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }, []);

  const getStatus = useCallback((statusKey: string): Status => {
    const map: Record<string, Status> = {
      'pending approval': { id: 'in-review', label: "Mission en cours de validation", color: '#60a5fa', category: 'progress' },
      'payment in progress': { id: 'in-progress', label: "Paiement en cours", color: '#3b82f6', category: 'progress' },
      'planned': { id: 'scheduled', label: "Planifié", color: '#8b5cf6', category: 'progress' },
      'in progress': { id: 'in-progress', label: "En cours d'exécution", color: '#3b82f6', category: 'progress' },
      'completed': { id: 'completed', label: "Terminé", color: '#10b981', category: 'success' },
      'closed': { id: 'closed', label: "Clôturé", color: '#10b981', category: 'success' },
      'canceled': { id: 'cancelled', label: "Annulé", color: '#6b7280', category: 'error' },
      'mission rejected': { id: 'mission rejected', label: "Rejeté", color: '#ef4444', category: 'error' },
    };
    return map[statusKey] || { id: 'unknown', label: englishToFrench[statusKey] || statusKey, color: '#6b7280', category: 'error' as const };
  }, []);

  const handleRowClick = useCallback((missionId: string) => {
    if (canViewDetails) {
      navigate(`/mission/collaborateur/${missionId}`);
    }
  }, [canViewDetails, navigate]);

  const handleEditClick = useCallback((missionId: string) => {
    if (canModifyMission) {
      setSelectedMissionId(missionId);
      setIsFormOpen(true);
    }
  }, [canModifyMission]);

  const handleCancelClick = useCallback((assignation: MissionAssignation) => {
    if (canCancelMission) {
      setSelectedAssignation(assignation);
      setShowCancelModal(true);
    }
  }, [canCancelMission]);

  const handleDeleteClick = useCallback((assignation: MissionAssignation) => {
    if (canDeleteMission) {
      setSelectedAssignation(assignation);
      setShowDeleteModal(true);
    }
  }, [canDeleteMission]);

  const handleCancelConfirm = useCallback(() => {
    if (!selectedAssignation) return;
    if (!userId) {
      setAlert({ isOpen: true, type: "error", message: "Utilisateur non authentifié. Veuillez vous reconnecter." });
      return;
    }
    cancelMissionMutate(
      { 
        missionId: selectedAssignation.mission.missionId, 
        userId: userId
      },
      {
        onSuccess: (data) => {
          setAlert({ isOpen: true, type: "success", message: data.message || "Assignation annulée avec succès." });
          refetchSearch();
          setShowCancelModal(false);
          setSelectedAssignation(null);
        },
        onError: (error) => {
          setAlert({ isOpen: true, type: "error", message: (error as Error).message || "Erreur lors de l'annulation." });
        }
      }
    );
  }, [selectedAssignation, cancelMissionMutate, refetchSearch, userId]);

  const handleDeleteConfirm = useCallback(() => {
    if (!selectedAssignation) return;
    if (!userId) {
      setAlert({ isOpen: true, type: "error", message: "Utilisateur non authentifié. Veuillez vous reconnecter." });
      return;
    }
    deleteMissionMutate(
      { 
        missionId: selectedAssignation.mission.missionId, 
        userId: userId
      },
      {
        onSuccess: (data) => {
          setAlert({ isOpen: true, type: "success", message: data.message || "Assignation supprimée avec succès." });
          refetchSearch();
          setShowDeleteModal(false);
          setSelectedAssignation(null);
        },
        onError: (error) => {
          setAlert({ isOpen: true, type: "error", message: (error as Error).message || "Erreur lors de la suppression." });
        }
      }
    );
  }, [selectedAssignation, deleteMissionMutate, refetchSearch, userId]);

  const handleFilterSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setAppliedFilters(filters);
    setPage(1);
  }, [filters]);

  const handleResetFilters = useCallback((): void => {
    const resetFilters: FiltersState = {
      employeeId: "",
      missionType: "",
      lieuId: "",
      status: [],
      minDepartureDate: null,
      maxDepartureDate: null,
      minArrivalDate: null,
      maxArrivalDate: null,
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
    const matchedEmployee = currentEmployees.find((emp: CollabEmployee) =>
      `${emp.firstName} ${emp.lastName}` === value
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
    const matchedLieu = lieux.find((lieu: Lieu) => `${lieu.nom}/${lieu.pays}` === value);
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

  const handleMinDepartureDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, minDepartureDate: e.target.value || null }));
  }, []);

  const handleMaxDepartureDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, maxDepartureDate: e.target.value || null }));
  }, []);

  const handleMinArrivalDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, minArrivalDate: e.target.value || null }));
  }, []);

  const handleMaxArrivalDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, maxArrivalDate: e.target.value || null }));
  }, []);

  const handleOpenForm = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  const handleFormSuccess = useCallback((type: string, message: string) => {
    refetchSearch();
    setIsFormOpen(false);
    setAlert({ isOpen: true, type: type as "info" | "success" | "error" | "warning", message });
  }, [refetchSearch]);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    const assignation = assignations.find(a => a.assignationId === event.id);
    if (assignation && canViewDetails) {
      navigate(`/mission/collaborateur/${assignation.mission.missionId}`);
    }
  }, [assignations, canViewDetails, navigate]);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const eventPropGetter = useCallback((event: CalendarEvent) => {
    const statusKey = event.status || '';
    const statusObj = getStatus(statusKey);
    const bgColor = statusObj.color;
    const darkerBg = darkenColor(bgColor, 20);
    return {
      style: {
        background: `linear-gradient(135deg, ${bgColor} 0%, ${darkerBg} 100%)`,
        border: 'none',
        color: 'white',
        borderRadius: 'var(--border-radius, 4px)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    };
  }, [getStatus, darkenColor]);

  useEffect(() => {
    if (searchResponse) {
      if (searchResponse.status === 200 && searchResponse.data) {
        setTotalCount(searchResponse.data.totalCount || 0);
      } else {
        setTotalCount(0);
        setAlert({
          isOpen: true,
          type: "error",
          message: searchResponse.message || "Erreur lors du chargement des assignations de mission",
        });
      }
    }
  }, [searchResponse]);

  const appliedFiltersStr = useMemo(() => JSON.stringify(appliedFilters), [appliedFilters]);

  useEffect(() => {
    setSelectedMissionId(null);
    setPage(1);
  }, [activeTab, appliedFiltersStr]);

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
  }, [activeTab, hasCollaborators]);

  useEffect(() => {
    if (activeTab === 'toutes' && !canViewAllMissions) {
      setActiveTab('mes');
    }
  }, [activeTab, canViewAllMissions]);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  }, []);

  const showEmployeeFilter = activeTab !== 'mes';

  const isCurrentEmployeesLoading = useMemo(() => activeTab === 'collaborateurs' ? isCollaboratorsEmployeesLoading : isEmployeesLoading, [activeTab, isCollaboratorsEmployeesLoading, isEmployeesLoading]);

  const truncateCellStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const statusCellStyle = {
    whiteSpace: 'normal' as const,
    overflowWrap: 'break-word' as const,
  };

  const columnWidths = useMemo(() => {
    const widths = ['15%', '25%', '8%', '15%', '12%', '10%', '10%'];
    if (hasActions) {
      widths.push('5%');
    }
    return widths;
  }, [hasActions]);

  const headers = useMemo(() => {
    const baseHeaders = [
      <div key="collaborateur" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <User size={16} />
        Collaborateur
      </div>,
      <div key="mission" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <Briefcase size={16} />
        Mission
      </div>,
      <div key="type" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <Globe size={16} />
        TYPE
      </div>,
      <div key="lieu" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <MapPin size={16} />
        Lieu
      </div>,
      <div key="statut" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <CalendarDays size={16} />
        Statut
      </div>,
      <div key="depart" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <CalendarDays size={16} />
        Date Départ
      </div>,
      <div key="retour" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <CalendarDays size={16} />
        Date Retour
      </div>,
    ];
    if (hasActions) {
      baseHeaders.push(
        <div key="actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <Edit size={16} />
          Actions
        </div>
      );
    }
    return baseHeaders;
  }, [hasActions]);

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

      {showCancelModal && selectedAssignation && (
        <Modal
          type="warning"
          message="Êtes-vous sûr de vouloir annuler l'assignation de mission ?"
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Confirmer l'annulation"
          confirmAction={handleCancelConfirm}
          confirmLabel="Confirmer l'annulation"
          cancelLabel="Annuler"
          showActions={true}
        />
      )}

      {showDeleteModal && selectedAssignation && (
        <Modal
          type="warning"
          message="Êtes-vous sûr de vouloir supprimer l'assignation de mission ?"
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirmer la suppression"
          confirmAction={handleDeleteConfirm}
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          showActions={true}
        />
      )}

      {!isHidden && (
        <FiltersContainer $isMinimized={isMinimized}>
          <FiltersHeader>
            <FiltersTitle>Filtre</FiltersTitle>
            <FiltersControls>
              <FilterControlButton
                $isMinimized={isMinimized}
                onClick={() => setIsMinimized((p) => !p)}
                title={isMinimized ? "Développer" : "Réduire"}
              >
                {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </FilterControlButton>
              <FilterControlButton $isClose onClick={() => setIsHidden(true)} title="Fermer">
                <X size={16} />
              </FilterControlButton>
            </FiltersControls>
          </FiltersHeader>

          {!isMinimized && (
            <FiltersSection>
              <Separator />
              <form onSubmit={handleFilterSubmit}>
                <FilterGrid>
                  {showEmployeeFilter && (
                    <FilterField>
                      <FormLabelSearch>Collaborateur</FormLabelSearch>
                      <StyledAutoCompleteInput
                        value={filters.employeeSearch || ""}
                        onChange={handleEmployeeChange}
                        suggestions={filteredEmployeeSuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner un employé..."
                        disabled={isCurrentEmployeesLoading || isSearchLoading}
                        fieldType="employee"
                        fieldLabel="employé"
                        showAddOption={false}
                      />
                    </FilterField>
                  )}
                  <FilterField>
                    <FormLabelSearch>Type de mission</FormLabelSearch>
                    <StyledSelect
                      value={filters.missionType}
                      onChange={handleMissionTypeChange}
                      disabled={isSearchLoading}
                    >
                      <option value="">Tous</option>
                      {missionTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </StyledSelect>
                  </FilterField>

                  <FilterField>
                    <FormLabelSearch>Statut</FormLabelSearch>
                    <StatusFilter
                      options={statusOptions}
                      selectedStatuses={filters.status}
                      onStatusChange={(statuses: string[]) => setFilters((prev) => ({ ...prev, status: statuses }))}
                    />
                  </FilterField>
                  
                  <FilterField>
                    <FormLabelSearch>Lieu</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.lieuSearch || ""}
                      onChange={handleLieuChange}
                      suggestions={filteredLieuSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner un lieu..."
                      disabled={isLieuxLoading || isSearchLoading}
                      fieldType="lieu"
                      fieldLabel="lieu"
                      showAddOption={false}
                    />
                  </FilterField>
                </FilterGrid>

                <DateGrid style={{ marginTop: 'var(--spacing-md)' }}>
                  <Fieldset>
                    <Legend>
                      Date Départ
                    </Legend>
                    <DateField>
                      <FormLabelSearch>Du</FormLabelSearch>
                      <FormInputSearch
                        type="date"
                        value={filters.minDepartureDate || ""}
                        onChange={handleMinDepartureDateChange}
                        disabled={isSearchLoading}
                      />
                    </DateField>
                    <DateField>
                      <FormLabelSearch>Au</FormLabelSearch>
                      <FormInputSearch
                        type="date"
                        value={filters.maxDepartureDate || ""}
                        onChange={handleMaxDepartureDateChange}
                        disabled={isSearchLoading}
                      />
                    </DateField>
                  </Fieldset>
                  <Fieldset>
                    <Legend>
                      Date Retour
                    </Legend>
                    <DateField>
                      <FormLabelSearch>Du</FormLabelSearch>
                      <FormInputSearch
                        type="date"
                        value={filters.minArrivalDate || ""}
                        onChange={handleMinArrivalDateChange}
                        disabled={isSearchLoading}
                      />
                    </DateField>
                    <DateField>
                      <FormLabelSearch>Au</FormLabelSearch>
                      <FormInputSearch
                        type="date"
                        value={filters.maxArrivalDate || ""}
                        onChange={handleMaxArrivalDateChange}
                        disabled={isSearchLoading}
                      />
                    </DateField>
                  </Fieldset>
                </DateGrid>

                <Separator />

                <FiltersActions>
                  <ButtonReset
                    type="button"
                    onClick={handleResetFilters}
                    disabled={!hasFilters || isSearchLoading}
                    title="Effacer filtre"
                  >
                    Effacer filtres
                  </ButtonReset>
                  <ButtonSearch type="submit" disabled={isSearchLoading} title="Rechercher">
                    <Search size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                    Rechercher
                  </ButtonSearch>
                </FiltersActions>
              </form>
            </FiltersSection>
          )}
        </FiltersContainer>
      )}

      {isHidden && (
        <FiltersToggle>
          <ButtonShowFilters type="button" onClick={() => setIsHidden(false)}>
            <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Afficher les filtres
          </ButtonShowFilters>
        </FiltersToggle>
      )}

      <StyledTabContainer>
        {tabTitles.map((tab, index) => (
          <StyledTabButton
            key={tab.key}
            $isActive={activeTab === tab.key}
            $hasBorderRight={index < tabTitles.length - 1}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </StyledTabButton>
        ))}
      </StyledTabContainer>

      <TableContainer>
        <TableHeader>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
            <TableTitle>{viewMode === 'table' ? 'Liste' : 'Calendrier'}</TableTitle>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
            <ViewToggleButton
              onClick={() => setViewMode('table')}
              $isActive={viewMode === 'table'}
              title="Afficher le tableau"
            >
              <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
              Tableau
            </ViewToggleButton>
            <ViewToggleButton
              onClick={() => setViewMode('calendar')}
              $isActive={viewMode === 'calendar'}
              title="Afficher le calendrier"
            >
              <CalendarIcon size={16} style={{ marginRight: "var(--spacing-sm)" }} />
              Calendrier
            </ViewToggleButton>
            {canAddMission && (
              <ButtonSearch title="Ajouter" onClick={handleOpenForm}>
                <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                Ajouter
              </ButtonSearch>
            )}
          </div>
        </TableHeader>

        {viewMode === 'table' ? (
          <>
            <div className="table-wrapper" style={{ overflowX: "auto", maxWidth: "100%" }}>
              <DataTable style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                  <tr>
                    {headers.map((header, index: number) => (
                      <TableHeadCell key={index} style={{ width: columnWidths[index] }}>
                        {header}
                      </TableHeadCell>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isSearchLoading ? (
                    <TableRow>
                      <TableCell colSpan={headers.length}>
                        <Loading>Chargement des données...</Loading>
                      </TableCell>
                    </TableRow>
                  ) : assignations.length > 0 ? (
                    assignations.map((assignation: MissionAssignation) => {
                      const rawStatus = assignation.mission.status;
                      const trimmedLowerStatus = rawStatus.trim().toLowerCase();
                      const status = getStatus(trimmedLowerStatus);
                      const isFinal = finalStatuses.has(trimmedLowerStatus);
                      const isValidated = validatedMissions[assignation.mission.missionId] || false;

                      return (
                        <TableRow
                          key={assignation.assignationId}
                          style={{
                            cursor: canViewDetails ? "pointer" : "default",
                          }}
                          onClick={() => handleRowClick(assignation.mission.missionId)}
                          title={canViewDetails ? "Clic pour voir les détails" : ""}
                        >
                          <TableCell style={truncateCellStyle} title={`${assignation.employee.firstName} ${assignation.employee.lastName}`}>
                            {assignation.employee.firstName} {assignation.employee.lastName}
                          </TableCell>
                          <TableCell style={truncateCellStyle} title={assignation.mission.name}>
                            {assignation.mission.name}
                          </TableCell>
                          <TableCell style={truncateCellStyle}>
                            {assignation.mission.missionType.toUpperCase()}
                          </TableCell>
                          <TableCell style={truncateCellStyle} title={assignation.mission.lieu.nom}>
                            {assignation.mission.lieu.nom}
                          </TableCell>
                          <TableCell style={statusCellStyle}>
                            <StatusBadge status={status} />
                          </TableCell>
                          <TableCell>
                            {format(new Date(assignation.departureDate), 'dd/MM/yyyy', { locale: fr })}
                          </TableCell>
                          <TableCell>
                            {format(new Date(assignation.returnDate), 'dd/MM/yyyy', { locale: fr })}
                          </TableCell>
                          {hasActions && (
                            <TableCell style={{ textAlign: "center" }}>
                              {(!isFinal && !isValidated && canModifyMission) && (
                                <EditorButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(assignation.mission.missionId);
                                  }}
                                  title="Modifier"
                                >
                                  <Edit size={16} />
                                </EditorButton>
                              )}
                              {(!isFinal && !isValidated && canCancelMission) && (
                                <CancelButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelClick(assignation);
                                  }}
                                  title="Annuler"
                                >
                                  <X size={16} />
                                </CancelButton>
                              )}
                              {(isFinal && (trimmedLowerStatus === 'canceled' || trimmedLowerStatus === 'mission rejected') && !isValidated && canDeleteMission) && (
                                <CancelButton
                                  className="delete-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(assignation);
                                  }}
                                  title="Supprimer"
                                  style={{ color: "var(--danger-color, #dc3545)" }}
                                >
                                  <Trash size={16} />
                                </CancelButton>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={headers.length}>
                        <NoDataMessage>
                          {Object.values(appliedFilters).some((val) => {
                            if (Array.isArray(val)) {
                              return val.length > 0;
                            }
                            return (val || "").trim() !== "";
                          }) ? "Aucune assignation ne correspond aux critères." : "Aucune assignation trouvée."}
                        </NoDataMessage>
                      </TableCell>
                    </TableRow>
                  )}
                </tbody>
              </DataTable>
            </div>
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalEntries={totalCount}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        ) : (
          <>
            {isSearchLoading ? (
              <Loading>Chargement des données...</Loading>
            ) : events.length > 0 ? (
              <CalendarContainer>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  date={date}
                  onNavigate={setDate}
                  view={view}
                  onView={handleViewChange}
                  onSelectEvent={handleSelectEvent}
                  eventPropGetter={eventPropGetter}
                  views={['month', 'week', 'day']}
                  messages={{
                    next: "Suivant",
                    previous: "Précédent",
                    today: "Aujourd'hui",
                    month: "Mois",
                    week: "Semaine",
                    day: "Jour",
                    agenda: "Agenda",
                  }}
                  components={{
                    event: CustomEvent,
                  }}
                />
              </CalendarContainer>
            ) : (
              <NoDataMessage>
                {Object.values(appliedFilters).some((val) => {
                  if (Array.isArray(val)) {
                    return val.length > 0;
                  }
                  return (val || "").trim() !== "";
                }) ? "Aucune assignation ne correspond aux critères." : "Aucune assignation trouvée."}
              </NoDataMessage>
            )}
          </>
        )}
      </TableContainer>
    </>
  );
};

const ProtectedMissionList: React.FC = () => (
  <ProtectedRoute requiredHabilitation="Voir la page des missions">
    <MissionList />
  </ProtectedRoute>
);

export default ProtectedMissionList;