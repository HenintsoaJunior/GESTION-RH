"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Clock, Calendar, ChevronDown, ChevronUp, X, CheckCircle } from "lucide-react";
import { formatDate } from "utils/generalisation";
import Alert from "components/alert";
import "styles/generic-table-styles.css";

// Données statiques pour simuler les missions
const mockMissions = [
  {
    missionId: 1,
    missionTitle: "Développement d'une application mobile",
    description: "Création d'une application pour la gestion des stocks.",
    location: "Paris",
    startDate: "2025-06-01",
    status: "En Cours",
    createdAt: "2025-05-20",
  },
  {
    missionId: 2,
    missionTitle: "Audit de sécurité informatique",
    description: "Vérification des systèmes internes pour conformité RGPD.",
    location: "Lyon",
    startDate: "2025-07-15",
    status: "Planifié",
    createdAt: "2025-05-25",
  },
  {
    missionId: 3,
    missionTitle: "Formation des employés",
    description: "Programme de formation sur les nouvelles technologies.",
    location: "Marseille",
    startDate: "2025-08-01",
    status: "Terminé",
    createdAt: "2025-04-10",
  },
  {
    missionId: 4,
    missionTitle: "Migration vers le cloud",
    description: "Transition des services vers AWS.",
    location: "Toulouse",
    startDate: "2025-09-01",
    status: "En Cours",
    createdAt: "2025-06-05",
  },
  {
    missionId: 5,
    missionTitle: "Optimisation des processus",
    description: "Analyse et amélioration des flux de production.",
    location: "Nice",
    startDate: "2025-06-20",
    status: "Planifié",
    createdAt: "2025-05-15",
  },
];

const MissionList = () => {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, enCours: 0, planifie: 0, termine: 0 });
  const [filters, setFilters] = useState({
    status: "",
    missionTitleKeyword: "",
    startDateMin: "",
    startDateMax: "",
    location: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Simuler le chargement des données
  useEffect(() => {
    setIsLoading(true);
    // Simuler un appel API
    setTimeout(() => {
      setMissions(mockMissions);
      setTotalEntries(mockMissions.length);
      // Calculer les statistiques
      const stats = {
        total: mockMissions.length,
        enCours: mockMissions.filter((m) => m.status === "En Cours").length,
        planifie: mockMissions.filter((m) => m.status === "Planifié").length,
        termine: mockMissions.filter((m) => m.status === "Terminé").length,
      };
      setStats(stats);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtrer les missions
  const filteredMissions = useMemo(() => {
    let filtered = mockMissions;
    
    if (filters.missionTitleKeyword) {
      filtered = filtered.filter((mission) =>
        mission.missionTitle.toLowerCase().includes(filters.missionTitleKeyword.toLowerCase())
      );
    }
    
    if (filters.location) {
      filtered = filtered.filter((mission) =>
        mission.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter((mission) => mission.status === filters.status);
    }
    
    if (filters.startDateMin) {
      filtered = filtered.filter((mission) => mission.startDate >= filters.startDateMin);
    }
    
    if (filters.startDateMax) {
      filtered = filtered.filter((mission) => mission.startDate <= filters.startDateMax);
    }
    
    return filtered;
  }, [filters]);

  // Pagination
  const paginatedMissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMissions.slice(start, start + pageSize);
  }, [filteredMissions, currentPage, pageSize]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      status: "",
      missionTitleKeyword: "",
      startDateMin: "",
      startDateMax: "",
      location: "",
    };
    setFilters(resetFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleRowClick = (missionId) => {
    if (missionId) {
      navigate(`/missions/details/${missionId}`);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const toggleHide = () => {
    setIsHidden((prev) => !prev);
  };

  const totalPages = Math.ceil(filteredMissions.length / pageSize);

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

      {/* Cartes statistiques */}
      <div className="stats-container">
        <div className="stats-grid">
          <div className="stat-card stat-card-total">
            <div className="stat-icon">
              <Clock className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total des missions</div>
            </div>
          </div>
          <div className="stat-card stat-card-progress">
            <div className="stat-icon">
              <Clock className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.enCours}</div>
              <div className="stat-label">En Cours</div>
            </div>
          </div>
          <div className="stat-card stat-card-pending">
            <div className="stat-icon">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.planifie}</div>
              <div className="stat-label">Planifié</div>
            </div>
          </div>
          <div className="stat-card stat-card-approved">
            <div className="stat-icon">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.termine}</div>
              <div className="stat-label">Terminé</div>
            </div>
          </div>
        </div>
      </div>

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
                <table className="form-table-search">
                  <tbody>
                    <tr>
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
                          placeholder="Recherche par titre"
                        />
                      </td>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Lieu</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="location"
                          type="text"
                          value={filters.location}
                          onChange={(e) => handleFilterChange("location", e.target.value)}
                          className="form-input-search"
                          placeholder="Recherche par lieu"
                        />
                      </td>
                    </tr>
                    <tr>
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
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Date de début min</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="startDateMin"
                          type="date"
                          value={filters.startDateMin}
                          onChange={(e) => handleFilterChange("startDateMin", e.target.value)}
                          className="form-input-search"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Date de début max</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="startDateMax"
                          type="date"
                          value={filters.startDateMax}
                          onChange={(e) => handleFilterChange("startDateMax", e.target.value)}
                          className="form-input-search"
                        />
                      </td>
                      <th className="form-label-cell-search"></th>
                      <td className="form-input-cell-search"></td>
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

      {/* Bouton pour réafficher les filtres si cachés */}
      {isHidden && (
        <div className="filters-toggle">
          <button type="button" className="btn-show-filters" onClick={toggleHide}>
            Afficher les filtres
          </button>
        </div>
      )}

      {/* Section titre et bouton Nouvelle Mission */}
      <div className="table-header">
        <h2 className="table-title">Liste des Missions</h2>
        <button
          onClick={() => navigate("/missions/create")}
          className="btn-new-request"
        >
          <Plus className="w-4 h-4" />
          Nouvelle mission
        </button>
      </div>

      {/* Tableau de données */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Intitulé</th>
              <th>Description</th>
              <th>Lieu</th>
              <th>Date de début</th>
              <th>Statut</th>
              <th>Date de création</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>Chargement...</td>
              </tr>
            ) : paginatedMissions.length > 0 ? (
              paginatedMissions.map((mission) => (
                <tr
                  key={mission.missionId}
                  onClick={() => handleRowClick(mission.missionId)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{mission.missionTitle || "Non spécifié"}</td>
                  <td>{mission.description || "Non spécifié"}</td>
                  <td>{mission.location || "Non spécifié"}</td>
                  <td>{formatDate(mission.startDate) || "Non spécifié"}</td>
                  <td>{getStatusBadge(mission.status)}</td>
                  <td>{formatDate(mission.createdAt) || "Non spécifié"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>Aucune donnée trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
          Affichage des données {Math.min((currentPage - 1) * pageSize + 1, filteredMissions.length)} à{" "}
          {Math.min(currentPage * pageSize, filteredMissions.length)} sur {filteredMissions.length} entrées
        </div>
        <div className="pagination-controls">{renderPagination()}</div>
      </div>
    </div>
  );
};

export default MissionList;