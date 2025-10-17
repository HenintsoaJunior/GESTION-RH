/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
} from "@/styles/table-styles";
import { useEmployees } from "@/api/collaborator/services";
import { useLieux } from "@/api/lieu/services";
import { useSearchMissionAssignations } from "@/api/mission/services";
import { useUserCollaborators } from "@/api/users/services";
import type { MissionAssignationSearchFilters, MissionAssignation } from "@/api/mission/services";
import type { UserInfo } from "@/api/users/services";
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import Pagination from "@/components/pagination";
import DetailsMission from "../details/mission-details";
import MissionForm from "../form/index";

interface FiltersState extends Omit<MissionAssignationSearchFilters, 'matricule' | 'missionId' | 'transportId' | 'minDepartureDate' | 'maxDepartureDate' | 'minArrivalDate' | 'maxArrivalDate'> {
  selectedEmployee?: any;
  selectedLieu?: any;
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
    selectedEmployee: null,
    selectedLieu: null,
  });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({
    employeeId: "",
    missionType: "",
    lieuId: "",
    status: "",
    selectedEmployee: null,
    selectedLieu: null,
  });
  const [selectedAssignations, setSelectedAssignations] = useState<string[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null); // Store selected mission ID
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false); // State for DetailsMission
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false); // State for MissionForm

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const matricule = userData?.matricule || "";
  const userId = userData?.userId || "";

  const { data: employeesResponse, isLoading: isEmployeesLoading } = useEmployees();
  const { data: lieuxResponse, isLoading: isLieuxLoading } = useLieux();
  const { data: collaboratorsResponse } = useUserCollaborators(userId);

  const employees = useMemo(() => employeesResponse?.data || [], [employeesResponse?.data]);
  const lieux = useMemo(() => lieuxResponse?.data || [], [lieuxResponse?.data]);

  const employeeSuggestions = useMemo(() =>
    employees.map((emp: any) => `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`),
    [employees]
  );

  const lieuSuggestions = useMemo(() =>
    lieux.map((lieu: any) => lieu.nom),
    [lieux]
  );

  const missionTypes = ["International", "National"];
  const statuses = ["En cours", "Terminé", "Planifié"];

  const hasFilters: boolean = Object.values({ ...filters, selectedEmployee: null, selectedLieu: null }).some((val) => (val || "").trim() !== "");

  // Prepare filters for query based on active tab
  const queryFilters: MissionAssignationSearchFilters = useMemo(() => {
    const filters: Partial<MissionAssignationSearchFilters> = {};

    if (appliedFilters.employeeId) {
      filters.employeeId = appliedFilters.employeeId;
    }
    if (appliedFilters.missionType) {
      filters.missionType = appliedFilters.missionType;
    }
    if (appliedFilters.lieuId) {
      filters.lieuId = appliedFilters.lieuId;
    }
    if (appliedFilters.status) {
      filters.status = appliedFilters.status;
    }

    switch (activeTab) {
      case 'mes':
        filters.matricule = [matricule || ""];
        break;
      case 'collaborateurs':
        const collaboratorsData = collaboratorsResponse?.data as UserInfo[] || [];
        const collaboratorsMatricules = collaboratorsData.map((c) => c.matricule).filter(Boolean);
        if (collaboratorsMatricules.length > 0) {
          filters.matricule = collaboratorsMatricules;
        }
        break;
      default: // 'toutes'
        filters.matricule = [""];
        break;
    }

    return filters as MissionAssignationSearchFilters;
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

  // Handle row selection to highlight row and set mission ID
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
    if (action === "details") {
      if (selectedAssignations.length === 0) {
        setAlert({ isOpen: true, type: "warning", message: "Veuillez sélectionner au moins une assignation." });
      } else {
        setIsDetailsOpen(true);
      }
    } else if (action === "modifier") {
      if (selectedAssignations.length === 0) {
        setAlert({ isOpen: true, type: "warning", message: "Veuillez sélectionner au moins une assignation." });
      } else if (selectedMissionId) {
        setIsFormOpen(true);
      }
    } else if (action === "annuler") {
      if (selectedAssignations.length === 0) {
        setAlert({ isOpen: true, type: "warning", message: "Veuillez sélectionner au moins une assignation." });
      } else {
        setShowCancelModal(true);
      }
    }
    e.target.value = "";
  }, [selectedAssignations, selectedMissionId]);

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
      selectedEmployee: null,
      selectedLieu: null,
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setAlert({ isOpen: true, type: "info", message: "Filtres réinitialisés." });
    setPage(1);
  }, []);

  const handleEmployeeChange = useCallback((value: string): void => {
    const matchedEmployee = employees.find((emp: any) =>
      `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`.toLowerCase().includes(value.toLowerCase())
    );
    setFilters((prev) => ({
      ...prev,
      selectedEmployee: matchedEmployee || null,
      employeeId: matchedEmployee ? matchedEmployee.employeeId : "",
    }));
  }, [employees]);

  const handleLieuChange = useCallback((value: string): void => {
    const matchedLieu = lieux.find((lieu: any) => lieu.nom.toLowerCase().includes(value.toLowerCase()));
    setFilters((prev) => ({
      ...prev,
      selectedLieu: matchedLieu || null,
      lieuId: matchedLieu ? matchedLieu.lieuId : "",
    }));
  }, [lieux]);

  const handleMissionTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilters((prev) => ({ ...prev, missionType: e.target.value }));
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
    setSelectedAssignations([]);
    setSelectedMissionId(null);
  }, []);

  const handleOpenForm = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  const handleFormSuccess = useCallback((_data: any) => {
    refetchSearch();
    setIsFormOpen(false);
    setAlert({ isOpen: true, type: "success", message: "Mission créée avec succès." });
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

  useEffect(() => {
    setSelectedAssignations([]);
    setSelectedMissionId(null);
    setIsDetailsOpen(false);
    setPage(1);
  }, [activeTab, JSON.stringify(appliedFilters)]);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  }, []);

  const hasAnyHabilitation = true;

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
          initialStartDate={new Date().toISOString().split('T')[0]} // Today's date as initial
          onFormSuccess={handleFormSuccess}
        />
      )}

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
                      <FormFieldCell style={{ width: "50%" }}>
                        <FormLabelSearch>Employé</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.selectedEmployee ? `${filters.selectedEmployee.firstName} ${filters.selectedEmployee.lastName} (${filters.selectedEmployee.employeeCode})` : ""}
                          onChange={handleEmployeeChange}
                          suggestions={employeeSuggestions}
                          maxVisibleItems={5}
                          placeholder="Sélectionner un employé..."
                          disabled={isEmployeesLoading || isSearchLoading}
                          fieldType="employee"
                          fieldLabel="employé"
                          showAddOption={false}
                        />
                      </FormFieldCell>
                      <FormFieldCell style={{ width: "50%" }}>
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
                    </FormRow>
                    <FormRow>
                      <FormFieldCell style={{ width: "50%" }}>
                        <FormLabelSearch>Lieu</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.selectedLieu ? filters.selectedLieu.nom : ""}
                          onChange={handleLieuChange}
                          suggestions={lieuSuggestions}
                          maxVisibleItems={5}
                          placeholder="Sélectionner un lieu..."
                          disabled={isLieuxLoading || isSearchLoading}
                          fieldType="lieu"
                          fieldLabel="lieu"
                          showAddOption={false}
                        />
                      </FormFieldCell>
                      <FormFieldCell style={{ width: "50%" }}>
                        <FormLabelSearch>Statut</FormLabelSearch>
                        <StyledSelect
                          value={filters.status}
                          onChange={handleStatusChange}
                          disabled={isSearchLoading}
                        >
                          <option value="">Tous</option>
                          {statuses.map((stat) => (
                            <option key={stat} value={stat}>{stat}</option>
                          ))}
                        </StyledSelect>
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
                <option value="details">Details</option>
                <option value="modifier">Modifier</option>
                <option value="annuler">Annuler</option>
              </ActionsSelect>
            )}
            <ButtonSearch title="Ajouter" onClick={handleOpenForm}>
              <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
              Ajouter
            </ButtonSearch>
          </div>
        </TableHeader>

        <div className="table-wrapper" style={{ overflowX: "auto" }}>
          <DataTable>
            <thead>
              <tr>
                <TableHeadCell>Employé</TableHeadCell>
                <TableHeadCell>Mission</TableHeadCell>
                <TableHeadCell>Type</TableHeadCell>
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
                        {assignation.employee.firstName} {assignation.employee.lastName} ({assignation.employee.employeeCode})
                      </TableCell>
                      <TableCell>{assignation.mission.name}</TableCell>
                      <TableCell>{assignation.mission.missionType}</TableCell>
                      <TableCell>{assignation.mission.lieu.nom}</TableCell>
                      <TableCell>{assignation.mission.status}</TableCell>
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

export default MissionList;