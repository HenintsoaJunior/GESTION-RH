"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronUp, X, List, FileText, Download, ArrowLeft, Plus } from "lucide-react";
import { formatDate } from "utils/dateConverter";
import Alert from "components/alert";
import Pagination from "components/pagination";
import AutoCompleteInput from "components/auto-complete-input";
import "styles/generic-table-styles.css";
import { fetchAllEmployees } from "services/employee/employee";
import { 
  fetchAssignMission, 
  fetchMissionById,
  exportMissionAssignationPDF,
  exportMissionAssignationExcel
} from "services/mission/mission";
import { fetchAllRegions } from "services/lieu/lieu";

const AssignedPersonsList = () => {
  const navigate = useNavigate();
  const { missionId } = useParams(); // Extraire missionId de l'URL (ex: MIS-000397)
  const [assignedPersons, setAssignedPersons] = useState([]);
  const [missionDetails, setMissionDetails] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    employeeId: "",
    employeeName: "",
    startDate: "",
    endDate: "",
    lieuId: "",
    location: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });
  const [suggestions, setSuggestions] = useState({
    beneficiary: [],
    regions: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({
    assignMissions: false,
    employees: false,
    regions: false,
    mission: false,
    exportPDF: false,
    exportExcel: false,
  });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Chargement initial des données
  useEffect(() => {
    if (!missionId) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Aucun ID de mission fourni dans l'URL.",
      });
      return;
    }

    // Fetch mission details
    fetchMissionById(
      missionId,
      setMissionDetails,
      setIsLoading,
      (error) => setAlert(error)
    );

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
  }, [missionId]);

  // Chargement des assignations avec filtres
  useEffect(() => {
    if (missionId) {
      console.log("Applied Filters for Mission:", appliedFilters);
      
      fetchAssignMission(
        setAssignedPersons,
        setIsLoading,
        setTotalEntries,
        {
          employeeId: appliedFilters.employeeId || "",
          startDate: appliedFilters.startDate || "",
          endDate: appliedFilters.endDate || "",
          status: appliedFilters.status || "",
          missionId: missionId, // Toujours inclure missionId
          lieuId: appliedFilters.lieuId || "",
          transportId: "", // Pas de filtre transport sur cette page
        },
        currentPage,
        pageSize,
        (error) => setAlert(error)
      );
    }
  }, [appliedFilters, currentPage, pageSize, missionId]);

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
    
    console.log("Mission Filters applied:", updatedFilters);
  };

  // Réinitialisation des filtres
  const handleResetFilters = () => {
    const resetFilters = {
      status: "",
      employeeId: "",
      employeeName: "",
      startDate: "",
      endDate: "",
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
  const handleRowClick = (employeeId) => {
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

  // Retour à la liste des missions
  const handleGoBack = () => {
    navigate(-1); // Retour à la page précédente
  };

  // Export PDF
  const handleExportPDF = () => {
    const exportFilters = {
      missionId: missionId,
      employeeId: appliedFilters.employeeId || null,
      transportId: null,
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
      missionId: missionId,
      employeeId: appliedFilters.employeeId || null,
      transportId: null,
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
                              employeeId: value ? prev.employeeId : "",
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
        <h2 className="table-title">
          Personnes Assignées à la Mission {missionId}
          {assignedPersons.length > 0 && (
            <span className="assignments-count">({assignedPersons.length} assignation{assignedPersons.length > 1 ? 's' : ''})</span>
          )}
        </h2>
        <div className="view-toggle">
          <button onClick={() => navigate("/mission/create")} className="btn-new-request">
            <Plus className="w-4 h-4" />
            Nouvelle mission
          </button>
        </div>
      </div>

      {/* Tableau des données */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Bénéficiaire</th>
              <th>Matricule</th>
              <th>Fonction</th>
              <th>Base</th>
              <th>Lieu</th>
              <th>Date début</th>
              <th>Date fin</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {isLoading.assignMissions ? (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  <div className="loading-spinner">Chargement des assignations...</div>
                </td>
              </tr>
            ) : assignedPersons.length > 0 ? (
              assignedPersons.map((assignment, index) => (
                <tr
                  key={`${assignment.employeeId}-${missionId}-${index}`}
                  onClick={() => handleRowClick(assignment.employeeId)}
                  className="table-row-clickable"
                  style={{ cursor: "pointer" }}
                >
                  <td>{assignment.assignationId || "Non spécifié"}</td>
                  <td>
                    {(assignment.beneficiary && assignment.directionAcronym)
                      ? `${assignment.beneficiary} (${assignment.directionAcronym})`
                      : assignment.beneficiary || "Non spécifié"}
                  </td>
                  <td>{assignment.matricule || "Non spécifié"}</td>
                  <td>{assignment.function || "Non spécifié"}</td>
                  <td>{assignment.base || "Non spécifié"}</td>
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
                    {appliedFilters.employeeId || appliedFilters.status || appliedFilters.startDate || appliedFilters.endDate
                      ? "Aucune assignation ne correspond aux critères de recherche pour cette mission."
                      : `Aucune personne assignée à la mission ${missionId}.`}
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

export default AssignedPersonsList;