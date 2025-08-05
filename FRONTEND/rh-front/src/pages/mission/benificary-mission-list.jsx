"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronDown, ChevronUp, X, List } from "lucide-react";
import { formatDate } from "utils/dateConverter";
import Alert from "components/alert";
import Pagination from "components/pagination";
import AutoCompleteInput from "components/auto-complete-input";
import "styles/generic-table-styles.css";
import { fetchAssignMission, fetchAllMissions } from "services/mission/mission";
import { fetchAllEmployees } from "services/employee/employee";
import { fetchAllRegions } from "services/lieu/lieu"; // Import the service for fetching regions

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
    lieuId: "", // Added for location filter
    location: "", // Added for location filter
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });
  const [suggestions, setSuggestions] = useState({
    beneficiary: [],
    missions: [],
    regions: [], // Added for location suggestions
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({
    assignMissions: false,
    employees: false,
    missions: false,
    regions: false, // Added for loading state of regions
  });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Fetch employees
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

    // Fetch missions
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
      setTotalEntries,
      (error) => setAlert(error)
    );

    // Fetch regions
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
        employeeId: appliedFilters.employeeId || undefined,
        transportId: appliedFilters.transportId || undefined,
        startDate: appliedFilters.startDate || undefined,
        endDate: appliedFilters.endDate || undefined,
        status: appliedFilters.status || undefined,
        missionId: appliedFilters.missionId || undefined,
        lieuId: appliedFilters.lieuId || undefined, // Added for location filter
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
    setAppliedFilters({ ...filters });
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
      lieuId: "", // Added
      location: "", // Added
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
    return <span className={`status-badge ${statusClass}`}>{status || "Inconnu"}</span>;
  };

  return (
    <div className="dashboard-container">
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      {!isHidden && (
        <div className={`filters-container ${isMinimized ? "minimized" : ""}`}>
          <div className="filters-header">
            <h2 className="filters-title">Filtres de Recherche</h2>
            <div className="filters-controls">
              <button
                type="button"
                className="filter-control-btn filter-minimize-btn"
                onClick={toggleMinimize}
                title={isMinimized ? "Développer" : "Réduire"}
              >
                {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
              <button
                type="button"
                className="filter-control-btn filter-close-btn"
                onClick={toggleHide}
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="filters-section">
              <form onSubmit={handleFilterSubmit}>
                <table className="form-table-search w-full border-collapse">
                  <tbody>
                    <tr className="form-row">
                      <td className="form-field-cell p-2 align-top">
                        <label className="form-label-search block mb-2">Bénéficiaire</label>
                        <AutoCompleteInput
                          value={filters.employeeName || ""}
                          onChange={(value) => {
                            setFilters((prev) => ({
                              ...prev,
                              employeeName: value,
                              employeeId: "",
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
                          className="form-input-search w-full"
                        />
                      </td>

                      <td className="form-field-cell p-2 align-top">
                        <label className="form-label-search block mb-2">Mission</label>
                        <AutoCompleteInput
                          value={filters.missionName || ""}
                          onChange={(value) => {
                            setFilters((prev) => ({
                              ...prev,
                              missionName: value,
                              missionId: "",
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
                          className="form-input-search w-full"
                        />
                      </td>

                      <td className="form-field-cell p-2 align-top">
                        <label className="form-label-search block mb-2">Lieu</label>
                        <AutoCompleteInput
                          value={filters.location || ""}
                          onChange={(value) => {
                            const regionName = value.includes("/") ? value.split("/")[0] : value;
                            const selectedRegion = suggestions.regions.find((r) => r.name === regionName);
                            setFilters((prev) => ({
                              ...prev,
                              location: value,
                              lieuId: selectedRegion ? selectedRegion.id : "",
                            }));
                          }}
                          suggestions={suggestions.regions.map((region) => region.displayName)}
                          maxVisibleItems={5}
                          placeholder="Saisir ou sélectionner un lieu..."
                          disabled={isLoading.regions || isLoading.assignMissions}
                          fieldType="lieuId"
                          fieldLabel="lieu"
                          className="form-input-search w-full"
                        />
                      </td>

                      <td className="form-field-cell p-2 align-top">
                        <label className="form-label-search block mb-2">Statut</label>
                        <select
                          name="status"
                          value={filters.status}
                          onChange={(e) => handleFilterChange("status", e.target.value)}
                          className="form-input-search w-full"
                        >
                          <option value="">Tous les statuts</option>
                          <option value="En Cours">En Cours</option>
                          <option value="Planifié">Planifié</option>
                          <option value="Terminé">Terminé</option>
                        </select>
                      </td>

                      <td className="form-field-cell p-2 align-top">
                        <label className="form-label-search block mb-2">Date début</label>
                        <input
                          name="startDate"
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange("startDate", e.target.value)}
                          className="form-input-search w-full"
                        />
                      </td>

                      <td className="form-field-cell p-2 align-top">
                        <label className="form-label-search block mb-2">Date fin</label>
                        <input
                          name="endDate"
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => handleFilterChange("endDate", e.target.value)}
                          className="form-input-search w-full"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="filters-actions">
                  <button type="button" className="btn-reset" onClick={handleResetFilters}>
                    Réinitialiser
                  </button>
                  <button type="submit" className="btn-search">
                    Rechercher
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {isHidden && (
        <div className="filters-toggle">
          <button type="button" className="btn-show-filters" onClick={toggleHide}>
            Afficher les filtres
          </button>
        </div>
      )}

      <div className="table-header">
        <h2 className="table-title">Liste des Mission des Colaborateur</h2>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Mission</th>
              <th>Bénéficiaire</th>
              <th>Matricule</th>
              <th>Mission</th>
              <th>Fonction</th>
              <th>Lieu</th>
              <th>Date début</th>
              <th>Date fin</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {isLoading.assignMissions ? (
              <tr>
                <td colSpan={9}>Chargement...</td>
              </tr>
            ) : assignedPersons.length > 0 ? (
              assignedPersons.map((assignment, index) => (
                <tr
                  key={`${assignment.employeeId}-${assignment.missionId}-${assignment.transportId}-${index}`}
                  onClick={() => handleRowClick(assignment.missionId, assignment.employeeId)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{assignment.missionId || "Non spécifié"}</td>
                  <td>
                    {(assignment.beneficiary && assignment.directionAcronym)
                      ? `${assignment.beneficiary} (${assignment.directionAcronym})`
                      : assignment.beneficiary || "Non spécifié"}
                  </td>
                  <td>{assignment.matricule || "Non spécifié"}</td>
                  <td>{assignment.missionTitle || "Non spécifié"}</td>
                  <td>{assignment.function || "Non spécifié"}</td>
                  <td>{assignment.lieu || "Non spécifié"}</td>
                  <td>{formatDate(assignment.startDate) || "Non spécifié"}</td>
                  <td>{formatDate(assignment.endDate) || "Non spécifié"}</td>
                  <td>{getStatusBadge(assignment.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>Aucune donnée trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalEntries={totalEntries}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default BeneficiaryMissionList;