"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, MapPin, Clock, Calendar, ChevronDown, ChevronUp, X, CheckCircle } from "lucide-react";
import { formatDate } from "utils/generalisation";
import Alert from "components/alert";
import "styles/generic-table-styles.css";
import { fetchAssignMission } from "services/mission/mission";

const AssignedPersonsList = () => {
  const navigate = useNavigate();
  const { missionId } = useParams();
  const [assignedPersons, setAssignedPersons] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    beneficiaryKeyword: "",
    missionTitleKeyword: "",
    departureDateMin: "",
    departureDateMax: "",
    base: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: "",
    beneficiaryKeyword: "",
    missionTitleKeyword: "",
    departureDateMin: "",
    departureDateMax: "",
    base: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({ assignMissions: false });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await fetchAssignMission(
        setAssignedPersons,
        setIsLoading,
        setTotalEntries,
        {
          missionId: missionId || "",
          status: appliedFilters.status,
          departureDateMin: appliedFilters.departureDateMin,
          departureDateMax: appliedFilters.departureDateMax,
        },
        currentPage,
        pageSize,
        (error) => setAlert(error)
      );
    };

    fetchData();
  }, [missionId, appliedFilters, currentPage, pageSize]);

  const filteredAssignedPersons = useMemo(() => {
    let filtered = assignedPersons;

    if (appliedFilters.beneficiaryKeyword) {
      filtered = filtered.filter((assignment) =>
        assignment.beneficiary.toLowerCase().includes(appliedFilters.beneficiaryKeyword.toLowerCase())
      );
    }

    if (appliedFilters.missionTitleKeyword) {
      filtered = filtered.filter((assignment) =>
        assignment.missionTitle.toLowerCase().includes(appliedFilters.missionTitleKeyword.toLowerCase())
      );
    }

    if (appliedFilters.base) {
      filtered = filtered.filter((assignment) =>
        assignment.base.toLowerCase().includes(appliedFilters.base.toLowerCase())
      );
    }

    return filtered;
  }, [assignedPersons, appliedFilters]);

  const paginatedAssignedPersons = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssignedPersons.slice(start, start + pageSize);
  }, [filteredAssignedPersons, currentPage, pageSize]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      status: "",
      beneficiaryKeyword: "",
      missionTitleKeyword: "",
      departureDateMin: "",
      departureDateMax: "",
      base: "",
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

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const toggleHide = () => {
    setIsHidden((prev) => !prev);
  };

  const totalPages = Math.ceil(filteredAssignedPersons.length / pageSize);

  const getStatusBadge = (status) => {
    const statusClass =
      status === "En Cours"
        ? "status-progress"
        : status === "Planifié"
        ? "status-pending"
        : status === "Terminé"
        ? "status-approved"
        : "status-pending";
    return <span className={`status-badge ${statusClass}`}>{status || "Inconnu"}</span>;
  };

  const renderPagination = () => {
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
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
                <table className="form-table-search">
                  <tbody>
                    <tr>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Bénéficiaire</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="beneficiaryKeyword"
                          type="text"
                          value={filters.beneficiaryKeyword}
                          onChange={(e) => handleFilterChange("beneficiaryKeyword", e.target.value)}
                          className="form-input-search"
                          placeholder="Recherche par bénéficiaire"
                        />
                      </td>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Intitulé de la Mission</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="missionTitleKeyword"
                          type="text"
                          value={filters.missionTitleKeyword}
                          onChange={(e) => handleFilterChange("missionTitleKeyword", e.target.value)}
                          className="form-input-search"
                          placeholder="Recherche par titre de mission"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Base</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="base"
                          type="text"
                          value={filters.base}
                          onChange={(e) => handleFilterChange("base", e.target.value)}
                          className="form-input-search"
                          placeholder="Recherche par base"
                        />
                      </td>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Statut</label>
                      </th>
                      <td className="form-input-cell-search">
                        <select
                          name="status"
                          value={filters.status}
                          onChange={(e) => handleFilterChange("status", e.target.value)}
                          className="form-input-search"
                        >
                          <option value="">Tous les statuts</option>
                          <option value="En Cours">En Cours</option>
                          <option value="Planifié">Planifié</option>
                          <option value="Terminé">Terminé</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Date de départ min</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="departureDateMin"
                          type="date"
                          value={filters.departureDateMin}
                          onChange={(e) => handleFilterChange("departureDateMin", e.target.value)}
                          className="form-input-search"
                        />
                      </td>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Date de départ max</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="departureDateMax"
                          type="date"
                          value={filters.departureDateMax}
                          onChange={(e) => handleFilterChange("departureDateMax", e.target.value)}
                          className="form-input-search"
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
        <h2 className="table-title">Liste des Assignations de Mission</h2>
        <button
          onClick={() => navigate(`/mission/assign${missionId ? `?missionId=${missionId}` : ""}`)}
          className="btn-new-request"
        >
          <Plus className="w-4 h-4" />
          Nouvelle assignation
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bénéficiaire</th>
              <th>Matricule</th>
              <th>Mission</th>
              <th>Fonction</th>
              <th>Base</th>
              <th>Date de départ</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {isLoading.assignMissions ? (
              <tr>
                <td colSpan={7}>Chargement...</td>
              </tr>
            ) : paginatedAssignedPersons.length > 0 ? (
              paginatedAssignedPersons.map((assignment, index) => (
                <tr
                  key={`${assignment.employeeId}-${assignment.missionId}-${assignment.transportId}-${index}`}
                  onClick={() => handleRowClick(assignment.missionId, assignment.employeeId)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{assignment.beneficiary || "Non spécifié"}</td>
                  <td>{assignment.matricule || "Non spécifié"}</td>
                  <td>{assignment.missionTitle || "Non spécifié"}</td>
                  <td>{assignment.function || "Non spécifié"}</td>
                  <td>{assignment.base || "Non spécifié"}</td>
                  <td>{formatDate(assignment.departureDate) || "Non spécifié"}</td>
                  <td>{getStatusBadge(assignment.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>Aucune donnée trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="pagination-options">
          <label htmlFor="pageSize" className="pagination-label">Afficher par page :</label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="pagination-select"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div className="pagination-info">
          Affichage des données {Math.min((currentPage - 1) * pageSize + 1, filteredAssignedPersons.length)} à{" "}
          {Math.min(currentPage * pageSize, filteredAssignedPersons.length)} sur {filteredAssignedPersons.length} entrées
        </div>
        <div className="pagination-controls">{renderPagination()}</div>
      </div>
    </div>
  );
};

export default AssignedPersonsList;