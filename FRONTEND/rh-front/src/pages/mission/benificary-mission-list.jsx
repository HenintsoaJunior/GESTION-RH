"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronDown, ChevronUp, X, List, FileText, Download } from "lucide-react";
import { formatDate } from "utils/dateConverter";
import Alert from "components/alert";
import Pagination from "components/pagination";
import AutoCompleteInput from "components/auto-complete-input";
import "styles/generic-table-styles.css";
import { 
  fetchAssignMission, 
  fetchAllMissions,
  exportMissionAssignationPDF,
  exportMissionAssignationExcel
} from "services/mission/mission";
import { fetchAllEmployees } from "services/employee/employee";
import { fetchAllRegions } from "services/lieu/lieu";

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

  // Chargement initial des données
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
      () => {}, // setTotalEntries pour les missions
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

  // Chargement des assignations de mission avec filtres
  useEffect(() => {
    console.log("Applied Filters:", appliedFilters);
    
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

  // Gestion des changements de filtres
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Validation et soumission des filtres
  const handleFilterSubmit = (event) => {
    event.preventDefault();
    
    let updatedFilters = { ...filters };

    // Validation de l'employé sélectionné
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

    // Validation de la mission sélectionnée
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

    // Validation du lieu sélectionné
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
    
    console.log("Filters applied:", updatedFilters);
  };

  // Réinitialisation des filtres
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

  // Gestion de la pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  // Navigation vers les détails
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

  // Export PDF
  const handleExportPDF = () => {
    const exportFilters = {
      missionId: appliedFilters.missionId || null,
      employeeId: appliedFilters.employeeId || null,
      transportId: appliedFilters.transportId || null,
      lieuId: appliedFilters.lieuId || null,
      departureDate: appliedFilters.startDate || null,
      departureArrive: appliedFilters.endDate || null,
      status: appliedFilters.status || null,
    };

    exportMissionAssignationPDF(
      exportFilters,
      setIsLoading,
      (success) => setAlert(success),
      (error) => setAlert(error)
    );
  };

  // Export Excel
  const handleExportExcel = () => {
    const exportFilters = {
      missionId: appliedFilters.missionId || null,
      employeeId: appliedFilters.employeeId || null,
      transportId: appliedFilters.transportId || null,
      lieuId: appliedFilters.lieuId || null,
      departureDate: appliedFilters.startDate || null,
      departureArrive: appliedFilters.endDate || null,
      status: appliedFilters.status || null,
    };

    exportMissionAssignationExcel(
      exportFilters,
      setIsLoading,
      (success) => setAlert(success),
      (error) => setAlert(error)
    );
  };

  // Contrôles d'affichage des filtres
  const toggleMinimize = () => setIsMinimized((prev) => !prev);
  const toggleHide = () => setIsHidden((prev) => !prev);

  // Badge de statut
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

      {/* Section des filtres */}
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
                              employeeId: value ? prev.employeeId : "", // Garde l'ID si la valeur existe
                            }));
                          }}
                          onSelect={(value) => {
                            const selectedEmployee = suggestions.beneficiary.find(
                              (emp) => emp.displayName === value
                            );
                            console.log("Selected Employee:", selectedEmployee);
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
                              missionId: value ? prev.missionId : "",
                            }));
                          }}
                          onSelect={(value) => {
                            const selectedMission = suggestions.missions.find(
                              (mission) => mission.displayName === value
                            );
                            console.log("Selected Mission:", selectedMission);
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
                            console.log("Selected Region:", selectedRegion);
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
                          <option value="Annulé">Annulé</option>
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
                  <button 
                    type="button" 
                    className="btn-reset" 
                    onClick={handleResetFilters}
                    disabled={isLoading.assignMissions}
                  >
                    Réinitialiser
                  </button>
                  <button 
                    type="submit" 
                    className="btn-search"
                    disabled={isLoading.assignMissions}
                  >
                    {isLoading.assignMissions ? "Recherche..." : "Rechercher"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Bouton pour afficher les filtres cachés */}
      {isHidden && (
        <div className="filters-toggle">
          <button type="button" className="btn-show-filters" onClick={toggleHide}>
            <List className="w-4 h-4 mr-2" />
            Afficher les filtres
          </button>
        </div>
      )}

      {/* En-tête du tableau avec actions */}
      <div className="table-header">
        <h2 className="table-title">Liste des Missions des Collaborateurs</h2>

      </div>

      {/* Tableau des données */}
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
                <td colSpan={2} className="text-center py-4">
                  <div className="loading">Chargement des données...</div>
                </td>
              </tr>
            ) : assignedPersons.length > 0 ? (
              assignedPersons.map((assignment, index) => (
                <tr
                  key={`${assignment.employeeId}-${assignment.missionId}-${assignment.transportId}-${index}`}
                  onClick={() => handleRowClick(assignment.missionId, assignment.employeeId)}
                  className="table-row-clickable"
                  style={{ cursor: "pointer" }}
                >
                  <td>{assignment.missionId || "Non spécifié"}</td>
                  <td>
                    {(assignment.beneficiary && assignment.directionAcronym)
                      ? `${assignment.beneficiary} (${assignment.directionAcronym})`
                      : assignment.beneficiary || "Non spécifié"}
                  </td>
                  <td>{assignment.matricule || "Non spécifié"}</td>
                  <td className="mission-title">{assignment.missionTitle || "Non spécifié"}</td>
                  <td>{assignment.function || "Non spécifié"}</td>
                  <td>{assignment.lieu || "Non spécifié"}</td>
                  <td>{formatDate(assignment.startDate) || "Non spécifié"}</td>
                  <td>{formatDate(assignment.endDate) || "Non spécifié"}</td>
                  <td>{getStatusBadge(assignment.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  <div className="no-data-message">
                    {appliedFilters.employeeId || appliedFilters.missionId || appliedFilters.status || appliedFilters.startDate || appliedFilters.endDate
                      ? "Aucune assignation de mission ne correspond aux critères de recherche."
                      : "Aucune assignation de mission trouvée."}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalEntries={totalEntries}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        disabled={isLoading.assignMissions}
      />
    </div>
  );
};

export default BeneficiaryMissionList;