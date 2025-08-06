"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, Calendar, ChevronDown, ChevronUp, X, CheckCircle, List, XCircle } from "lucide-react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr"; // Import de la locale française
import { formatDate } from "utils/dateConverter";
import { fetchMissions, fetchMissionStats, cancelMission } from "services/mission/mission";
import Modal from "components/modal";
import Pagination from "components/pagination";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "styles/generic-table-styles.css";
import AutoCompleteInput from "components/auto-complete-input";
import { fetchAllRegions } from "services/lieu/lieu";

// Configuration de moment en français
moment.locale('fr');

// Configuration du localizer pour react-big-calendar avec les messages en français
const localizer = momentLocalizer(moment);

// Messages en français pour react-big-calendar
const messages = {
  allDay: 'Toute la journée',
  previous: 'Précédent',
  next: 'Suivant',
  today: "Aujourd'hui",
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Événement',
  noEventsInRange: 'Aucun événement dans cette période.',
  showMore: total => `+ ${total} événement(s) supplémentaire(s)`
};

const MissionList = () => {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, enCours: 0, planifiee: 0, terminee: 0, annulee: 0 });
  const [filters, setFilters] = useState({
    name: "",
    startDate: "",
    endDate: "",
    lieuId: "",
    location: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({ missions: false, stats: false, regions: false });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [regions, setRegions] = useState([]);
  const [regionNames, setRegionNames] = useState([]);
  const [regionDisplayNames, setRegionDisplayNames] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [missionToCancel, setMissionToCancel] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "En Cours":
        return "#3b82f6";
      case "Planifié":
        return "#f59e0b";
      case "Terminé":
        return "#10b981";
      case "Annulé":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

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

  const handleError = useCallback((error) => {
    setAlert(error);
  }, []);

  useEffect(() => {
    fetchAllRegions(
      (data) => {
        setRegions(data);
        setRegionNames(data.map((lieu) => lieu.nom));
        setRegionDisplayNames(data.map((lieu) => `${lieu.nom}${lieu.pays ? `/${lieu.pays}` : ''}`));
      },
      setIsLoading,
      (alert) => setAlert(alert),
      () => setTotalEntries(0)
    );
  }, []);

  useEffect(() => {
    const initialFilters = {
      name: "",
      startDate: "",
      endDate: "",
      lieuId: "",
      location: "",
      status: "",
    };
    fetchMissions(setMissions, setIsLoading, setTotalEntries, initialFilters, currentPage, pageSize, handleError);
    fetchMissionStats(setStats, setIsLoading, handleError);
  }, [currentPage, pageSize, handleError]);

  const calendarEvents = useMemo(() => {
    const events = [];
    
    missions.forEach((mission) => {
      const startDate = new Date(mission.startDate);
      const endDate = new Date(mission.endDate);
      
      events.push({
        id: `${mission.missionId}-start`,
        title: `🚀 ${mission.name} (Début)`,
        start: startDate,
        end: startDate,
        allDay: true,
        resource: { ...mission, eventType: 'start' },
      });
      
      if (startDate.getTime() !== endDate.getTime()) {
        events.push({
          id: `${mission.missionId}-end`,
          title: `🏁 ${mission.name} (Fin)`,
          start: endDate,
          end: endDate,
          allDay: true,
          resource: { ...mission, eventType: 'end' },
        });
      }
    });
    
    return events;
  }, [missions]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    fetchMissions(setMissions, setIsLoading, setTotalEntries, filters, 1, pageSize, handleError);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      name: "",
      startDate: "",
      endDate: "",
      lieuId: "",
      location: "",
      status: "",
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    fetchMissions(setMissions, setIsLoading, setTotalEntries, resetFilters, 1, pageSize, handleError);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchMissions(setMissions, setIsLoading, setTotalEntries, filters, page, pageSize, handleError);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1);
    fetchMissions(setMissions, setIsLoading, setTotalEntries, filters, 1, newPageSize, handleError);
  };

  const handleRowClick = (missionId) => {
    if (missionId) {
      navigate(`/mission/assign-mission/${missionId}`);
    }
  };

  const handleCancelMission = async (missionId) => {
    try {
      await cancelMission(
        missionId,
        setIsLoading,
        (successAlert) => {
          setAlert(successAlert);
          fetchMissions(setMissions, setIsLoading, setTotalEntries, filters, currentPage, pageSize, handleError);
          fetchMissionStats(setStats, setIsLoading, handleError);
        },
        handleError
      );
    } catch (error) {
      // Erreur déjà gérée dans le service
    }
  };

  const handleShowCancelModal = (missionId) => {
    setMissionToCancel(missionId);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (missionToCancel) {
      handleCancelMission(missionToCancel);
    }
    setShowCancelModal(false);
    setMissionToCancel(null);
  };

  const handleEventClick = (event) => {
    const missionId = event.id.replace(/-(start|end)$/, '');
    navigate(`/mission/assign-mission/${missionId}`);
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
      <Modal
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title="Notification"
      />

      <Modal
        type="warning"
        message="Êtes-vous sûr de vouloir annuler cette mission ? Cette action est irréversible."
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Confirmer l'annulation"
      >
        <div className="modal-actions">
          <button
            className="btn-cancel"
            onClick={() => setShowCancelModal(false)}
          >
            Annuler
          </button>
          <button
            className="btn-confirm"
            onClick={handleConfirmCancel}
          >
            Confirmer
          </button>
        </div>
      </Modal>

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
                <table className="form-table-search w-full border-collapse">
                  <tbody>
                    <tr className="form-row">
                      <td className="form-field-cell p-2 align-top">
                        <label className="form-label-search block mb-2">Intitulé de la Mission</label>
                        <input
                          name="name"
                          type="text"
                          value={filters.name}
                          onChange={(e) => handleFilterChange("name", e.target.value)}
                          className="form-input-search w-full"
                          placeholder="Recherche par titre"
                        />
                      </td>

                      <td className="form-field-cell p-2 align-top">
                        <label className="form-label-search block mb-2">Lieu</label>
                        <AutoCompleteInput
                          value={filters.location}
                          onChange={(value) => {
                            const regionName = value.includes('/') ? value.split('/')[0] : value;
                            const selectedRegion = regions.find((r) => r.nom === regionName);
                            setFilters((prev) => ({
                              ...prev,
                              location: value,
                              lieuId: selectedRegion ? selectedRegion.lieuId : "",
                            }));
                          }}
                          suggestions={regionDisplayNames}
                          maxVisibleItems={3}
                          placeholder="Saisir ou sélectionner un lieu..."
                          disabled={isLoading.regions}
                          showAddOption={false}
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
                        <label className="form-label-search block mb-2">Date de début</label>
                        <input
                          name="startDate"
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange("startDate", e.target.value)}
                          className="form-input-search w-full"
                        />
                      </td>
                      
                      <td className="form-field-cell p-2 align-top">
                        <label className="form-label-search block mb-2">Date de fin</label>
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
            onClick={() => navigate("/mission/form")}
            className="btn-new-request"
          >
            <Plus className="w-4 h-4" />
            Nouvelle mission
          </button>
        </div>
      </div>

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
          <div style={{ 
            marginLeft: '20px', 
            padding: '8px 12px', 
            backgroundColor: '#e9ecef', 
            borderRadius: '4px',
            fontSize: '12px',
            color: '#6c757d'
          }}>
            🚀 = Début de mission | 🏁 = Fin de mission
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
                  <th>Date de fin</th>
                  <th>Statut</th>
                  <th>Date de création</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody> 
                {isLoading.missions ? (
                  <tr>
                    <td colSpan={8}>Chargement...</td>
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
                      <td>{`${mission.lieu.nom}/${mission.lieu.pays}` || "Non spécifié"}</td>
                      <td>{formatDate(mission.startDate) || "Non spécifié"}</td>
                      <td>{formatDate(mission.endDate) || "Non spécifié"}</td>
                      <td>{getStatusBadge(mission.status)}</td>
                      <td>{formatDate(mission.createdAt) || "Non spécifié"}</td>
                      <td>
                        <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn-update"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/mission/form/${mission.missionId}`);
                            }}
                            disabled={mission.status === "Annulé" || mission.status === "Terminé"}
                          >
                            Modifier
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowCancelModal(mission.missionId);
                            }}
                            disabled={mission.status === "Annulé" || mission.status === "Terminé"}
                          >
                            Annuler
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>Aucune donnée trouvée.</td>
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
            views={["month", "week"]}
            defaultView="month"
            style={{ height: "100%" }}
            eventPropGetter={eventStyleGetter}
            messages={messages}
          />
        </div>
      )}
    </div>
  );
};

export default MissionList;