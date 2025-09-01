"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, X, List } from "lucide-react";
import { formatDate } from "utils/dateConverter";
import Alert from "components/alert";
import Pagination from "components/pagination";
import {
  fetchAssignMission,
  fetchAllMissions,
} from "services/mission/mission";
import { fetchAllEmployees } from "services/employee/employee";
import { fetchAllRegions } from "services/lieu/lieu";
import {
  DashboardContainer,
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
  FormInputSearch,
  StyledAutoCompleteInput,
  FiltersActions,
  ButtonReset,
  ButtonSearch,
  FiltersToggle,
  ButtonShowFilters,
  TableContainer,
  DataTable,
  TableHeader,
  TableTitle,
  TableRow,
  TableCell,
  TableHeadCell,
  Loading,
  NoDataMessage,
  StatusBadge,
} from "styles/generaliser/table-container";

const BeneficiaryMissionList = () => {
  const navigate = useNavigate();
  const [assignedPersons, setAssignedPersons] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    employeeId: "",
    employeeName: "",
    startDate: "",
    endDate: "",
    transportId: "",
    missionId: "",
    missionName: "",
    lieuId: "",
    location: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });
  const [suggestions, setSuggestions] = useState({
    beneficiary: [],
    missions: [],
    regions: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({
    assignMissions: false,
    employees: false,
    missions: false,
    regions: false,
    exportPDF: false,
    exportExcel: false,
  });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    fetchAllEmployees(
      (data) => {
        setSuggestions((prev) => ({
          ...prev,
          beneficiary: data.map((emp) => ({
            id: emp.employeeId,
            name: `${emp.lastName} ${emp.firstName}`,
            displayName: `${emp.lastName} ${emp.firstName} (${emp.direction?.acronym || "N/A"})`,
            acronym: emp.direction?.acronym || "N/A",
          })),
        }));
      },
      setIsLoading,
      (error) => setAlert(error)
    );

    fetchAllMissions(
      (data) => {
        setSuggestions((prev) => ({
          ...prev,
          missions: data.map((mission) => ({
            id: mission.missionId,
            name: mission.name,
            displayName: `${mission.name || "Non spécifié"} (${
              formatDate(mission.startDate) || "Non spécifié"
            } - ${formatDate(mission.endDate) || "Non spécifié"}, ${
              mission.lieu?.nom || "Non spécifié"
            })`,
          })),
        }));
      },
      setIsLoading,
      () => {},
      (error) => setAlert(error)
    );

    fetchAllRegions(
      (data) => {
        setSuggestions((prev) => ({
          ...prev,
          regions: data.map((lieu) => ({
            id: lieu.lieuId,
            name: lieu.nom,
            displayName: `${lieu.nom}${lieu.pays ? `/${lieu.pays}` : ""}`,
          })),
        }));
      },
      setIsLoading,
      (error) => setAlert(error)
    );
  }, []);

  useEffect(() => {
    fetchAssignMission(
      setAssignedPersons,
      setIsLoading,
      setTotalEntries,
      {
        employeeId: appliedFilters.employeeId || "",
        transportId: appliedFilters.transportId || "",
        startDate: appliedFilters.startDate || "",
        endDate: appliedFilters.endDate || "",
        status: appliedFilters.status || "",
        missionId: appliedFilters.missionId || "",
        lieuId: appliedFilters.lieuId || "",
      },
      currentPage,
      pageSize,
      (error) => setAlert(error)
    );
  }, [appliedFilters, currentPage, pageSize]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    let updatedFilters = { ...filters };

    if (filters.employeeName && !filters.employeeId) {
      const selectedEmployee = suggestions.beneficiary.find(
        (emp) => emp.displayName === filters.employeeName
      );
      if (!selectedEmployee) {
        setAlert({
          isOpen: true,
          type: "error",
          message: "Veuillez sélectionner un bénéficiaire valide dans la liste des suggestions.",
        });
        return;
      }
      updatedFilters.employeeId = selectedEmployee.id;
      updatedFilters.employeeName = selectedEmployee.displayName;
    }

    if (filters.missionName && !filters.missionId) {
      const selectedMission = suggestions.missions.find(
        (mission) => mission.displayName === filters.missionName
      );
      if (!selectedMission) {
        setAlert({
          isOpen: true,
          type: "error",
          message: "Veuillez sélectionner une mission valide dans la liste des suggestions.",
        });
        return;
      }
      updatedFilters.missionId = selectedMission.id;
      updatedFilters.missionName = selectedMission.displayName;
    }

    if (filters.location && !filters.lieuId) {
      const selectedRegion = suggestions.regions.find(
        (region) => region.displayName === filters.location
      );
      if (!selectedRegion) {
        setAlert({
          isOpen: true,
          type: "error",
          message: "Veuillez sélectionner un lieu valide dans la liste des suggestions.",
        });
        return;
      }
      updatedFilters.lieuId = selectedRegion.id;
      updatedFilters.location = selectedRegion.displayName;
    }

    setFilters(updatedFilters);
    setAppliedFilters(updatedFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      status: "",
      employeeId: "",
      employeeName: "",
      startDate: "",
      endDate: "",
      transportId: "",
      missionId: "",
      missionName: "",
      lieuId: "",
      location: "",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
    setAlert({ isOpen: true, type: "info", message: "Filtres réinitialisés." });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleRowClick = (missionId, employeeId) => {
    if (missionId && employeeId) {
      navigate(`/assignments/details?missionId=${missionId}&employeeId=${employeeId}`);
    } else {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Informations manquantes pour accéder aux détails.",
      });
    }
  };
  const toggleMinimize = () => setIsMinimized((prev) => !prev);
  const toggleHide = () => setIsHidden((prev) => !prev);

  const getStatusBadge = (status) => {
    const statusClass =
      status === "En Cours"
        ? "status-progress"
        : status === "Planifié"
        ? "status-pending"
        : status === "Terminé"
        ? "status-approved"
        : status === "Annulé"
        ? "status-cancelled"
        : "status-pending";
    return <StatusBadge className={statusClass}>{status || "Inconnu"}</StatusBadge>;
  };

  return (
    <DashboardContainer>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      {!isHidden && (
        <FiltersContainer $isMinimized={isMinimized}>
          <FiltersHeader>
            <FiltersTitle>Filtres de Recherche</FiltersTitle>
            <FiltersControls>
              <FilterControlButton
                $isMinimized={isMinimized}
                onClick={toggleMinimize}
                title={isMinimized ? "Développer" : "Réduire"}
              >
                {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </FilterControlButton>
              <FilterControlButton $isClose onClick={toggleHide} title="Fermer">
                <X size={16} />
              </FilterControlButton>
            </FiltersControls>
          </FiltersHeader>

          {!isMinimized && (
            <FiltersSection>
              <form onSubmit={handleFilterSubmit}>
                <FormTableSearch>
                  <tbody>
                    <FormRow>
                      <FormFieldCell>
                        <FormLabelSearch>Bénéficiaire</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.employeeName || ""}
                          onChange={(value) => {
                            setFilters((prev) => ({
                              ...prev,
                              employeeName: value,
                              employeeId: value ? prev.employeeId : "",
                            }));
                          }}
                          onSelect={(value) => {
                            const selectedEmployee = suggestions.beneficiary.find(
                              (emp) => emp.displayName === value
                            );
                            setFilters((prev) => ({
                              ...prev,
                              employeeId: selectedEmployee ? selectedEmployee.id : "",
                              employeeName: selectedEmployee ? selectedEmployee.displayName : value,
                            }));
                          }}
                          suggestions={suggestions.beneficiary
                            .filter((emp) =>
                              emp.displayName.toLowerCase().includes(filters.employeeName?.toLowerCase() || "")
                            )
                            .map((emp) => emp.displayName)}
                          maxVisibleItems={5}
                          placeholder="Rechercher par bénéficiaire..."
                          disabled={isLoading.employees || isLoading.assignMissions}
                          fieldType="beneficiary"
                          fieldLabel="bénéficiaire"
                        />
                      </FormFieldCell>

                      <FormFieldCell>
                        <FormLabelSearch>Mission</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.missionName || ""}
                          onChange={(value) => {
                            setFilters((prev) => ({
                              ...prev,
                              missionName: value,
                              missionId: value ? prev.missionId : "",
                            }));
                          }}
                          onSelect={(value) => {
                            const selectedMission = suggestions.missions.find(
                              (mission) => mission.displayName === value
                            );
                            setFilters((prev) => ({
                              ...prev,
                              missionId: selectedMission ? selectedMission.id : "",
                              missionName: selectedMission ? selectedMission.displayName : value,
                            }));
                          }}
                          suggestions={suggestions.missions
                            .filter((mission) =>
                              mission.displayName.toLowerCase().includes(filters.missionName?.toLowerCase() || "")
                            )
                            .map((mission) => mission.displayName)}
                          maxVisibleItems={5}
                          placeholder="Rechercher par mission..."
                          disabled={isLoading.missions || isLoading.assignMissions}
                          fieldType="mission"
                          fieldLabel="mission"
                        />
                      </FormFieldCell>

                      <FormFieldCell>
                        <FormLabelSearch>Lieu</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.location || ""}
                          onChange={(value) => {
                            setFilters((prev) => ({
                              ...prev,
                              location: value,
                              lieuId: value ? prev.lieuId : "",
                            }));
                          }}
                          onSelect={(value) => {
                            const selectedRegion = suggestions.regions.find(
                              (region) => region.displayName === value
                            );
                            setFilters((prev) => ({
                              ...prev,
                              lieuId: selectedRegion ? selectedRegion.id : "",
                              location: selectedRegion ? selectedRegion.displayName : value,
                            }));
                          }}
                          suggestions={suggestions.regions
                            .filter((region) =>
                              region.displayName.toLowerCase().includes(filters.location?.toLowerCase() || "")
                            )
                            .map((region) => region.displayName)}
                          maxVisibleItems={5}
                          placeholder="Saisir ou sélectionner un lieu..."
                          disabled={isLoading.regions || isLoading.assignMissions}
                          fieldType="lieuId"
                          fieldLabel="lieu"
                        />
                      </FormFieldCell>

                      <FormFieldCell>
                        <FormLabelSearch>Statut</FormLabelSearch>
                        <FormInputSearch
                          as="select"
                          name="status"
                          value={filters.status}
                          onChange={(e) => handleFilterChange("status", e.target.value)}
                        >
                          <option value="">Tous les statuts</option>
                          <option value="En Cours">En Cours</option>
                          <option value="Planifié">Planifié</option>
                          <option value="Terminé">Terminé</option>
                          <option value="Annulé">Annulé</option>
                        </FormInputSearch>
                      </FormFieldCell>

                      <FormFieldCell>
                        <FormLabelSearch>Date début</FormLabelSearch>
                        <FormInputSearch
                          name="startDate"
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        />
                      </FormFieldCell>

                      <FormFieldCell>
                        <FormLabelSearch>Date fin</FormLabelSearch>
                        <FormInputSearch
                          name="endDate"
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        />
                      </FormFieldCell>
                    </FormRow>
                  </tbody>
                </FormTableSearch>

                <FiltersActions>
                  <ButtonReset type="button" onClick={handleResetFilters} disabled={isLoading.assignMissions}>
                    Réinitialiser
                  </ButtonReset>
                  <ButtonSearch type="submit" disabled={isLoading.assignMissions}>
                    {isLoading.assignMissions ? "Recherche..." : "Rechercher"}
                  </ButtonSearch>
                </FiltersActions>
              </form>
            </FiltersSection>
          )}
        </FiltersContainer>
      )}

      {isHidden && (
        <FiltersToggle>
          <ButtonShowFilters type="button" onClick={toggleHide}>
            <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Afficher les filtres
          </ButtonShowFilters>
        </FiltersToggle>
      )}

      <TableHeader>
        <TableTitle>Liste des Missions des Collaborateurs</TableTitle>
      </TableHeader>

      <TableContainer>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>ID Mission</TableHeadCell>
              <TableHeadCell>Bénéficiaire</TableHeadCell>
              <TableHeadCell>Matricule</TableHeadCell>
              <TableHeadCell>Mission</TableHeadCell>
              <TableHeadCell>Fonction</TableHeadCell>
              <TableHeadCell>Lieu</TableHeadCell>
              <TableHeadCell>Date début</TableHeadCell>
              <TableHeadCell>Date Fin</TableHeadCell>
              <TableHeadCell>Statut</TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {isLoading.assignMissions ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Loading>Chargement des données...</Loading>
                </TableCell>
              </TableRow>
            ) : assignedPersons.length > 0 ? (
              assignedPersons.map((assignment, index) => (
                <TableRow
                  key={`${assignment.employeeId}-${assignment.missionId}-${assignment.transportId}-${index}`}
                  $clickable
                  onClick={() => handleRowClick(assignment.missionId, assignment.employeeId)}
                >
                  <TableCell>{assignment.assignationId || "Non spécifié"}</TableCell>
                  <TableCell>
                    {assignment.beneficiary && assignment.directionAcronym
                      ? `${assignment.beneficiary} (${assignment.directionAcronym})`
                      : assignment.beneficiary || "Non spécifié"}
                  </TableCell>
                  <TableCell>{assignment.matricule || "Non spécifié"}</TableCell>
                  <TableCell>{assignment.missionTitle || "Non spécifié"}</TableCell>
                  <TableCell>{assignment.function || "Non spécifié"}</TableCell>
                  <TableCell>{assignment.lieu || "Non spécifié"}</TableCell>
                  <TableCell>{formatDate(assignment.startDate) || "Non spécifié"}</TableCell>
                  <TableCell>{formatDate(assignment.endDate) || "Non spécifié"}</TableCell>
                  <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9}>
                  <NoDataMessage>
                    {appliedFilters.employeeId ||
                    appliedFilters.missionId ||
                    appliedFilters.status ||
                    appliedFilters.startDate ||
                    appliedFilters.endDate
                      ? "Aucune assignation de mission ne correspond aux critères de recherche."
                      : "Aucune assignation de mission trouvée."}
                  </NoDataMessage>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </DataTable>
      </TableContainer>

      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalEntries={totalEntries}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        disabled={isLoading.assignMissions}
      />
    </DashboardContainer>
  );
};

export default BeneficiaryMissionList;