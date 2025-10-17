"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, ChevronUp, X, List, Search, Plus } from "lucide-react";
import {
  FiltersContainer,
  FiltersHeader,
  FiltersTitle,
  FiltersControls,
  FilterControlButton,
  FiltersSection,
  FormTableSearch,
  FormRow,
  FormFieldCell,
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
  ActionsSelect,
  SelectionInfo,
  StatusBadge,
} from "@/styles/table-styles";
import { useEmployees } from "@/api/collaborator/services";
import { useLieux } from "@/api/lieu/services";
import { useSearchMissionAssignations } from "@/api/mission/services";
import { useUserCollaborators } from "@/api/users/services";
import { useHasHabilitation } from "@/api/users/services";
import type { MissionAssignationSearchFilters, MissionAssignation, Lieu } from "@/api/mission/services";
import type { Employee as CollabEmployee } from "@/api/collaborator/services";
import type { UserInfo, UserInfosResponse } from "@/api/users/services";
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import Pagination from "@/components/pagination";
import DetailsMission from "../details/mission-details";
import MissionForm from "../form/index";
import { getStatusBadgeClass, englishToFrench } from "@/utils/status";
import ProtectedRoute from "@/components/protected-route";

interface FiltersState extends Omit<MissionAssignationSearchFilters, 'matricule' | 'missionId' | 'transportId'> {
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

const MissionList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mes' | 'toutes' | 'collaborateurs'>('mes');
  const [filters, setFilters] = useState<FiltersState>({
    employeeId: "",
    missionType: "",
    lieuId: "",
    status: "",
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
    status: "",
    minDepartureDate: null,
    maxDepartureDate: null,
    minArrivalDate: null,
    maxArrivalDate: null,
    selectedEmployee: null,
    selectedLieu: null,
    employeeSearch: "",
    lieuSearch: "",
  });
  const [selectedAssignations, setSelectedAssignations] = useState<string[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const matricule = userData?.matricule || "";
  const userId = userData?.userId || "";

  const canViewDetails = useHasHabilitation(userId, "voir details mission");
  const canModifyMission = useHasHabilitation(userId, "modifier mission");
  const canCancelMission = useHasHabilitation(userId, "annuler mission");
  const canAddMission = useHasHabilitation(userId, "ajouter mission");

  const hasAnyHabilitation = canViewDetails || canModifyMission || canCancelMission;

  const { data: employeesResponse, isLoading: isEmployeesLoading } = useEmployees();
  const { data: lieuxResponse, isLoading: isLieuxLoading } = useLieux();
  const { data: collaboratorsResponse }: { data?: UserInfosResponse } = useUserCollaborators(userId);

  const employees = useMemo(() => employeesResponse?.data || [], [employeesResponse?.data]) as CollabEmployee[];
  const lieux = useMemo(() => lieuxResponse?.data || [], [lieuxResponse?.data]);

  const employeeSuggestions = useMemo(() =>
    employees.map((emp) => `${emp.firstName} ${emp.lastName}`),
    [employees]
  );

  const filteredEmployeeSuggestions = useMemo(() =>
    employeeSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.employeeSearch || "").toLowerCase())
    ),
    [employeeSuggestions, filters.employeeSearch]
  );

  const lieuSuggestions = useMemo(() =>
    lieux.map((lieu: Lieu) => lieu.nom),
    [lieux]
  );

  const filteredLieuSuggestions = useMemo(() =>
    lieuSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.lieuSearch || "").toLowerCase())
    ),
    [lieuSuggestions, filters.lieuSearch]
  );

  const missionTypes = ["International", "National"];

  const statusOptions = [
    { label: "En cours", value: "in progress" },
    { label: "Terminé", value: "completed" },
    { label: "Planifié", value: "planned" },
  ];

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
  }).some((val) => (val || "").trim() !== "");

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
    if (appliedFilters.status) {
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

  const filteredAssignations = useMemo(() => assignations, [assignations]);

  const showNoCollaboratorsMessage = useMemo(() => {
    const collaboratorsData = collaboratorsResponse?.data as UserInfo[] || [];
    return activeTab === 'collaborateurs' && collaboratorsData.length === 0;
  }, [activeTab, collaboratorsResponse]);

  const handleRowSelection = useCallback((assignationId: string, missionId: string) => {
    if (selectedAssignations.includes(assignationId)) {
      setSelectedAssignations([]);
      setSelectedMissionId(null);
    } else {
      setSelectedAssignations([assignationId]);
      setSelectedMissionId(missionId);
    }
  }, [selectedAssignations]);

  const handleActionsChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const action = e.target.value;
    if (action === "details" && canViewDetails) {
      if (selectedAssignations.length === 0) {
        setAlert({ isOpen: true, type: "warning", message: "Veuillez sélectionner au moins une assignation." });
      } else {
        setIsDetailsOpen(true);
      }
    } else if (action === "modifier" && canModifyMission) {
      if (selectedAssignations.length === 0) {
        setAlert({ isOpen: true, type: "warning", message: "Veuillez sélectionner au moins une assignation." });
      } else if (selectedMissionId) {
        setIsFormOpen(true);
      }
    } else if (action === "annuler" && canCancelMission) {
      if (selectedAssignations.length === 0) {
        setAlert({ isOpen: true, type: "warning", message: "Veuillez sélectionner au moins une assignation." });
      } else {
        setShowCancelModal(true);
      }
    }
    e.target.value = "";
  }, [selectedAssignations, selectedMissionId, canViewDetails, canModifyMission, canCancelMission]);

  const handleCancelConfirm = useCallback(() => {
    setAlert({ isOpen: true, type: "success", message: "Assignation(s) annulée(s) avec succès." });
    setSelectedAssignations([]);
    setSelectedMissionId(null);
    refetchSearch();
    setShowCancelModal(false);
  }, [refetchSearch]);

  const selectedCountText = useMemo(
    () => `${selectedAssignations.length} élément${selectedAssignations.length !== 1 ? "s" : ""} sélectionné${selectedAssignations.length !== 1 ? "s" : ""}`,
    [selectedAssignations.length]
  );

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
      status: "",
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
    setAlert({ isOpen: true, type: "info", message: "Filtres réinitialisés." });
    setPage(1);
  }, []);

  const handleEmployeeChange = useCallback((value: string): void => {
    setFilters((prev) => ({ ...prev, employeeSearch: value }));
    const matchedEmployee = employees.find((emp) =>
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
  }, [employees]);

  const handleLieuChange = useCallback((value: string): void => {
    setFilters((prev) => ({ ...prev, lieuSearch: value }));
    const matchedLieu = lieux.find((lieu: Lieu) => lieu.nom === value);
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

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
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

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
    setSelectedAssignations([]);
    setSelectedMissionId(null);
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
    setSelectedAssignations([]);
    setSelectedMissionId(null);
    setIsDetailsOpen(false);
    setPage(1);
  }, [activeTab, appliedFiltersStr]);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  }, []);

  const tabTitles = [
    { key: 'toutes' as const, label: 'Toutes les missions' },
    { key: 'mes' as const, label: 'Mes missions' },
    { key: 'collaborateurs' as const, label: 'Missions de mes collaborateurs' },
  ];

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      {isDetailsOpen && selectedMissionId && (
        <DetailsMission
          missionId={selectedMissionId}
          userId={userId}
          onClose={handleCloseDetails}
          isOpen={isDetailsOpen}
        />
      )}

      {isFormOpen && (
        <MissionForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          missionId={selectedMissionId}
          initialStartDate={new Date().toISOString().split('T')[0]}
          onFormSuccess={handleFormSuccess}
        />
      )}

      {showCancelModal && (
        <Modal
          type="error"
          message={`Êtes-vous sûr de vouloir annuler ${selectedAssignations.length} assignation${selectedAssignations.length > 1 ? 's' : ''} sélectionnée${selectedAssignations.length > 1 ? 's' : ''} ?`}
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Confirmer l'annulation"
          confirmAction={handleCancelConfirm}
          confirmLabel="Confirmer l'annulation"
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
                <FormTableSearch>
                  <tbody>
                    <FormRow>
                      <FormFieldCell style={{ width: "25%" }}>
                        <FormLabelSearch>Collaborateur</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.employeeSearch || ""}
                          onChange={handleEmployeeChange}
                          suggestions={filteredEmployeeSuggestions}
                          maxVisibleItems={5}
                          placeholder="Sélectionner un employé..."
                          disabled={isEmployeesLoading || isSearchLoading}
                          fieldType="employee"
                          fieldLabel="employé"
                          showAddOption={false}
                        />
                      </FormFieldCell>
                      <FormFieldCell style={{ width: "25%" }}>
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
                      </FormFieldCell>
                      <FormFieldCell style={{ width: "25%" }}>
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
                      </FormFieldCell>
                      <FormFieldCell style={{ width: "25%" }}>
                        <FormLabelSearch>Statut</FormLabelSearch>
                        <StyledSelect
                          value={filters.status}
                          onChange={handleStatusChange}
                          disabled={isSearchLoading}
                        >
                          <option value="">Tous</option>
                          {statusOptions.map(({ label, value }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </StyledSelect>
                      </FormFieldCell>
                    </FormRow>
                    <FormRow>
                      <FormFieldCell style={{ width: "25%" }}>
                        <FormLabelSearch>Date Départ Du</FormLabelSearch>
                        <FormInputSearch
                          type="date"
                          value={filters.minDepartureDate || ""}
                          onChange={handleMinDepartureDateChange}
                          disabled={isSearchLoading}
                        />
                      </FormFieldCell>
                      <FormFieldCell style={{ width: "25%" }}>
                        <FormLabelSearch>Date Départ Au</FormLabelSearch>
                        <FormInputSearch
                          type="date"
                          value={filters.maxDepartureDate || ""}
                          onChange={handleMaxDepartureDateChange}
                          disabled={isSearchLoading}
                        />
                      </FormFieldCell>
                      <FormFieldCell style={{ width: "25%" }}>
                        <FormLabelSearch>Date Retour Du</FormLabelSearch>
                        <FormInputSearch
                          type="date"
                          value={filters.minArrivalDate || ""}
                          onChange={handleMinArrivalDateChange}
                          disabled={isSearchLoading}
                        />
                      </FormFieldCell>
                      <FormFieldCell style={{ width: "25%" }}>
                        <FormLabelSearch>Date Retour Au</FormLabelSearch>
                        <FormInputSearch
                          type="date"
                          value={filters.maxArrivalDate || ""}
                          onChange={handleMaxArrivalDateChange}
                          disabled={isSearchLoading}
                        />
                      </FormFieldCell>
                    </FormRow>
                  </tbody>
                </FormTableSearch>

                <Separator />

                <FiltersActions>
                  <ButtonReset
                    type="button"
                    onClick={handleResetFilters}
                    disabled={!hasFilters || isSearchLoading}
                    title="Effacer"
                  >
                    Effacer
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

      <div style={{ display: "flex", gap: "0", marginBottom: "var(--spacing-md)" }}>
        {tabTitles.map((tab, index) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "var(--spacing-sm) var(--spacing-md)",
              background: "transparent",
              color: activeTab === tab.key ? "var(--primary-color)" : "var(--text-color)",
              border: "none",
              borderBottom: activeTab === tab.key ? "3px solid var(--primary-color)" : "1px solid var(--border-color)",
              borderRight: index < tabTitles.length - 1 ? "1px solid var(--border-color)" : "none",
              borderRadius: "0",
              cursor: "pointer",
              fontWeight: activeTab === tab.key ? "var(--font-weight-semibold)" : "var(--font-weight-normal)",
              fontFamily: "var(--font-family)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <TableContainer>
        <TableHeader>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
            <TableTitle>Liste</TableTitle>
            {hasAnyHabilitation && selectedAssignations.length > 0 && <SelectionInfo>{selectedCountText}</SelectionInfo>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
            {hasAnyHabilitation && selectedAssignations.length > 0 && (
              <ActionsSelect value="" onChange={handleActionsChange}>
                <option value="">Actions</option>
                {canViewDetails && <option value="details">Details</option>}
                {canModifyMission && <option value="modifier">Modifier</option>}
                {canCancelMission && <option value="annuler">Annuler</option>}
              </ActionsSelect>
            )}
            {canAddMission && (
              <ButtonSearch title="Ajouter" onClick={handleOpenForm}>
                <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                Ajouter
              </ButtonSearch>
            )}
          </div>
        </TableHeader>

        <div className="table-wrapper" style={{ overflowX: "auto" }}>
          <DataTable>
            <thead>
              <tr>
                <TableHeadCell>Collaborateur</TableHeadCell>
                <TableHeadCell>Mission</TableHeadCell>
                <TableHeadCell>TYPE</TableHeadCell>
                <TableHeadCell>Lieu</TableHeadCell>
                <TableHeadCell>Statut</TableHeadCell>
                <TableHeadCell>Date Départ</TableHeadCell>
                <TableHeadCell>Date Retour</TableHeadCell>
              </tr>
            </thead>
            <tbody>
              {isSearchLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Loading>Chargement des données...</Loading>
                  </TableCell>
                </TableRow>
              ) : showNoCollaboratorsMessage ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <NoDataMessage>Aucun collaborateur trouvé.</NoDataMessage>
                  </TableCell>
                </TableRow>
              ) : filteredAssignations.length > 0 ? (
                filteredAssignations.map((assignation: MissionAssignation, index: number) => {
                  const isSelected = selectedAssignations.includes(assignation.assignationId);
                  const rawStatus = assignation.mission.status;
                  const trimmedLowerStatus = rawStatus.trim().toLowerCase();
                  const frenchStatus = englishToFrench[trimmedLowerStatus] || rawStatus.trim();
                 const statusClass = getStatusBadgeClass(rawStatus);

                  
                  return (
                    <TableRow
                      key={`${assignation.assignationId}-${index}`}
                      style={{
                        cursor: hasAnyHabilitation ? "pointer" : "default",
                        backgroundColor: isSelected ? "var(--primary-light)" : "transparent",
                      }}
                      onClick={hasAnyHabilitation ? () => handleRowSelection(assignation.assignationId, assignation.mission.missionId) : undefined}
                      title={hasAnyHabilitation ? "Clic pour sélectionner" : ""}
                    >
                      <TableCell>
                        {assignation.employee.firstName} {assignation.employee.lastName}
                      </TableCell>
                      <TableCell>{assignation.mission.name}</TableCell>
                      <TableCell>{assignation.mission.missionType.toUpperCase()}</TableCell>
                      <TableCell>{assignation.mission.lieu.nom}</TableCell>
                      <TableCell><StatusBadge className={statusClass}>{frenchStatus}</StatusBadge></TableCell>
                      <TableCell>{new Date(assignation.departureDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(assignation.returnDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <NoDataMessage>
                      {Object.values(appliedFilters).some(Boolean) ? "Aucune assignation ne correspond aux critères." : "Aucune assignation trouvée."}
                    </NoDataMessage>
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </DataTable>
        </div>
      </TableContainer>
      <Pagination
        currentPage={page}
        pageSize={pageSize}
        totalEntries={totalCount}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
};

const ProtectedMissionList: React.FC = () => (
  <ProtectedRoute requiredHabilitation="voir page mission">
    <MissionList />
  </ProtectedRoute>
);

export default ProtectedMissionList;