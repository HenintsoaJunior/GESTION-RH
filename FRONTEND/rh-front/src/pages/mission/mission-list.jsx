"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Clock, Calendar, ChevronDown, ChevronUp, X, CheckCircle, List, XCircle } from "lucide-react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { formatDate } from "utils/generalisation";
import { fetchMissions, fetchMissionStats } from "services/mission/mission"; // Importer le service
import Alert from "components/alert";
import { BASE_URL } from "config/apiConfig";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "styles/generic-table-styles.css";

// Configuration du localizer pour react-big-calendar
const localizer = momentLocalizer(moment);

const MissionList = () => {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, enCours: 0, planifie: 0, termine: 0, annule: 0 });
  const [filters, setFilters] = useState({
    name: "",
    startDateMin: "",
    startDateMax: "",
    site: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({ missions: false, stats: false });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  // Fonction pour obtenir la couleur selon le statut
  const getStatusColor = (status) => {
    switch (status) {
      case "En Cours":
        return "#3b82f6"; // Bleu
      case "Planifié":
        return "#f59e0b"; // Orange/Amber
      case "Terminé":
        return "#10b981"; // Vert
      case "Annulé":
        return "#ef4444"; // Rouge
      default:
        return "#6b7280"; // Gris par défaut
    }
  };

  // Style personnalisé pour les événements du calendrier
  const eventStyleGetter = (event) => {
    const backgroundColor = getStatusColor(event.resource.status);
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Gestion des erreurs
  const handleError = useCallback((error) => {
    setAlert(error);
  }, []);

  // Charger les missions et les stats au montage (sans filtres)
  useEffect(() => {
    // Charger toutes les missions au début (sans filtres appliqués)
    const initialFilters = {
      name: "",
      startDateMin: "",
      startDateMax: "",
      site: "",
      status: "",
    };
    fetchMissions(setMissions, setIsLoading, setTotalEntries, initialFilters, currentPage, pageSize, handleError);
    fetchMissionStats(setStats, setIsLoading, handleError);
  }, [currentPage, pageSize]);

  const calendarEvents = useMemo(() => {
    return missions.map((mission) => ({
      id: mission.missionId,
      title: mission.name, // Utiliser 'name' au lieu de 'missionTitle'
      start: new Date(mission.startDate),
      end: new Date(mission.startDate),
      allDay: true,
      resource: mission,
    }));
  }, [missions]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Ne pas déclencher la recherche automatiquement
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    // Déclencher la recherche avec les filtres actuels
    fetchMissions(setMissions, setIsLoading, setTotalEntries, filters, 1, pageSize, handleError);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      name: "",
      startDateMin: "",
      startDateMax: "",
      site: "",
      status: "",
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    // Rechercher avec les filtres réinitialisés
    fetchMissions(setMissions, setIsLoading, setTotalEntries, resetFilters, 1, pageSize, handleError);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Utiliser les filtres actuels pour la pagination
    fetchMissions(setMissions, setIsLoading, setTotalEntries, filters, page, pageSize, handleError);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1);
    // Utiliser les filtres actuels avec la nouvelle taille de page
    fetchMissions(setMissions, setIsLoading, setTotalEntries, filters, 1, newPageSize, handleError);
  };

  const handleRowClick = (missionId) => {
    if (missionId) {
      navigate(`/mission/assign-mission/${missionId}`);
    }
  };

  const handleCancelMission = async (missionId) => {
    setIsLoading((prev) => ({ ...prev, missions: true }));
    try {
      const response = await fetch(`${BASE_URL}/api/Mission/${missionId}/cancel`, {
        method: "PUT",
        headers: {
          accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: Impossible d'annuler la mission.`);
      }

      setAlert({
        isOpen: true,
        type: "success",
        message: `Mission ${missionId} annulée avec succès.`,
      });

      // Rafraîchir la liste des missions et les statistiques
      await fetchMissions(setMissions, setIsLoading, setTotalEntries, filters, currentPage, pageSize, handleError);
      await fetchMissionStats(setStats, setIsLoading, handleError);
    } catch (error) {
      handleError({
        isOpen: true,
        type: "error",
        message: error.message || "Une erreur est survenue lors de l'annulation de la mission.",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, missions: false }));
    }
  };

  const handleEventClick = (event) => {
    navigate(`/mission/assign-mission/${event.id}`);
  };

  const handleSelectSlot = ({ start }) => {
    const formattedDate = moment(start).format("YYYY-MM-DD");
    navigate(`/mission/create?startDate=${formattedDate}`);
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const toggleHide = () => {
    setIsHidden((prev) => !prev);
  };

  const totalPages = Math.ceil(totalEntries / pageSize);

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
              <div className="stat-number">{stats.planifiee}</div>
              <div className="stat-label">Planifié</div>
            </div>
          </div>
          <div className="stat-card stat-card-approved">
            <div className="stat-icon">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.terminee}</div>
              <div className="stat-label">Terminé</div>
            </div>
          </div>
          <div className="stat-card stat-card-cancelled">
            <div className="stat-icon">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.annulee}</div>
              <div className="stat-label">Annulé</div>
            </div>
          </div>
        </div>
      </div>

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
                          name="name"
                          type="text"
                          value={filters.name}
                          onChange={(e) => handleFilterChange("name", e.target.value)}
                          className="form-input-search"
                          placeholder="Recherche par titre"
                        />
                      </td>
                      <th className="form-label-cell-search">
                        <label className="form-label-search">Lieu</label>
                      </th>
                      <td className="form-input-cell-search">
                        <input
                          name="site"
                          type="text"
                          value={filters.site}
                          onChange={(e) => handleFilterChange("site", e.target.value)}
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
                          <option value="Annulé">Annulé</option>
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

      {isHidden && (
        <div className="filters-toggle">
          <button type="button" className="btn-show-filters" onClick={toggleHide}>
            Afficher les filtres
          </button>
        </div>
      )}

      <div className="table-header">
        <h2 className="table-title">Liste des Missions</h2>
        <div className="view-toggle">
          <button
            className={`btn-view ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" /> Liste
          </button>
          <button
            className={`btn-view ${viewMode === "calendar" ? "active" : ""}`}
            onClick={() => setViewMode("calendar")}
          >
            <Calendar className="w-4 h-4" /> Calendrier
          </button>
          <button
            onClick={() => navigate("/mission/create")}
            className="btn-new-request"
          >
            <Plus className="w-4 h-4" />
            Nouvelle mission
          </button>
        </div>
      </div>

      {/* Légende des couleurs pour le calendrier */}
      {viewMode === "calendar" && (
        <div className="calendar-legend" style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#3b82f6', 
              borderRadius: '4px' 
            }}></div>
            <span>En Cours</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#f59e0b', 
              borderRadius: '4px' 
            }}></div>
            <span>Planifié</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#10b981', 
              borderRadius: '4px' 
            }}></div>
            <span>Terminé</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#ef4444', 
              borderRadius: '4px' 
            }}></div>
            <span>Annulé</span>
          </div>
        </div>
      )}

      {viewMode === "list" ? (
        <>
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading.missions ? (
                  <tr>
                    <td colSpan={7}>Chargement...</td>
                  </tr>
                ) : missions.length > 0 ? (
                  missions.map((mission) => (
                    <tr
                      key={mission.missionId}
                      onClick={() => handleRowClick(mission.missionId)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{mission.name || "Non spécifié"}</td>
                      <td>{mission.description || "Non spécifié"}</td>
                      <td>{mission.site || "Non spécifié"}</td>
                      <td>{formatDate(mission.startDate) || "Non spécifié"}</td>
                      <td>{getStatusBadge(mission.status)}</td>
                      <td>{formatDate(mission.createdAt) || "Non spécifié"}</td>
                      <td>
                        <button
                          className="btn-cancel"
                          onClick={(e) => {
                            e.stopPropagation(); // Empêche le clic sur la ligne
                            handleCancelMission(mission.missionId);
                          }}
                          disabled={mission.status === "Annulé" || mission.status === "Terminé"}
                        >
                          Annuler
                        </button>
                      </td>
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
              Affichage des données {Math.min((currentPage - 1) * pageSize + 1, totalEntries)} à{" "}
              {Math.min(currentPage * pageSize, totalEntries)} sur {totalEntries} entrées
            </div>
            <div className="pagination-controls">{renderPagination()}</div>
          </div>
        </>
      ) : (
        <div className="calendar-container" style={{ height: "600px" }}>
          <BigCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleEventClick}
            onSelectSlot={handleSelectSlot}
            selectable
            views={["month", "week", "day"]}
            defaultView="month"
            style={{ height: "100%" }}
            eventPropGetter={eventStyleGetter}
          />
        </div>
      )}
    </div>
  );
};

export default MissionList;