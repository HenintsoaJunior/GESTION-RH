"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Clock, Calendar, ChevronDown, ChevronUp, X, CheckCircle, List, XCircle } from "lucide-react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { formatDate } from "utils/dateConverter";
import { hasHabilitation } from "utils/authUtils";
import { fetchMissions, fetchMissionStats, cancelMission } from "services/mission/mission";
import Modal from "components/modal";
import Pagination from "components/pagination";
import { fetchAllRegions } from "services/lieu/lieu";
import AssignedPersonsList from "./mission-assign-list";
import DetailsMission from "./mission-details";
import MissionForm from "../form/mission-form";
import {
  DashboardContainer,
  StatsContainer,
  StatsGrid,
  StatCard,
  StatIcon,
  StatContent,
  StatNumber,
  StatLabel,
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
  ButtonAdd,
  ButtonUpdate,
  ButtonCancel,
  ButtonConfirm,
  FiltersToggle,
  ButtonShowFilters,
  TableHeader,
  TableTitle,
  ViewToggle,
  ButtonView,
  TableContainer,
  DataTable,
  TableHeadCell,
  TableRow,
  TableCell,
  StatusBadge,
  CalendarLegend,
  LegendItem,
  LegendColor,
  LegendLabel,
  LegendNote,
  ActionButtons,
  ModalActions,
  Loading,
  NoDataMessage,
} from "styles/generaliser/table-container";

// Configuration de moment en français
moment.locale("fr");

// Configuration du localizer pour react-big-calendar avec les messages en français
const localizer = momentLocalizer(moment);

// Messages en français pour react-big-calendar
const messages = {
  allDay: "Toute la journée",
  previous: "Précédent",
  next: "Suivant",
  today: "Aujourd'hui",
  month: "Mois",
  week: "Semaine",
  day: "Jour",
  agenda: "Agenda",
  date: "Date",
  time: "Heure",
  event: "Événement",
  noEventsInRange: "Aucun événement dans cette période.",
  showMore: (total) => `+ ${total} événement(s) supplémentaire(s)`,
};

const MissionList = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [showAssignedPersonsPopup, setShowAssignedPersonsPopup] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [selectedMissionIdForEdit, setSelectedMissionIdForEdit] = useState(null);
  const [initialStartDate, setInitialStartDate] = useState(null);

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
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  const handleError = useCallback((error) => {
    setAlert(error);
  }, []);

  const refetchData = useCallback(() => {
    fetchMissions(setMissions, setIsLoading, setTotalEntries, filters, currentPage, pageSize, handleError);
    fetchMissionStats(setStats, setIsLoading, handleError);
  }, [filters, currentPage, pageSize, handleError]);

  useEffect(() => {
    fetchAllRegions(
      (data) => {
        setRegions(data);
        setRegionNames(data.map((lieu) => lieu.nom));
        setRegionDisplayNames(data.map((lieu) => `${lieu.nom}${lieu.pays ? `/${lieu.pays}` : ""}`));
      },
      setIsLoading,
      (alert) => setAlert(alert),
      () => setTotalEntries(0)
    );
  }, []);

  useEffect(() => {
    refetchData();
  }, [refetchData]);

  useEffect(() => {
    const fetchPermissions = async () => {
      const newPermissions = {};
      for (const mission of missions) {
        const canModify = await hasHabilitation("mission_modification") && mission.status !== "Annulé" && mission.status !== "Terminé";
        const canCancel = await hasHabilitation("mission_suppression") && mission.status !== "Annulé" && mission.status !== "Terminé";
        newPermissions[mission.missionId] = { canModify, canCancel };
      }
      setPermissions(newPermissions);
    };

    if (missions.length > 0) {
      fetchPermissions();
    }
  }, [missions]);

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
        resource: { ...mission, eventType: "start" },
      });

      if (startDate.getTime() !== endDate.getTime()) {
        events.push({
          id: `${mission.missionId}-end`,
          title: `🏁 ${mission.name} (Fin)`,
          start: endDate,
          end: endDate,
          allDay: true,
          resource: { ...mission, eventType: "end" },
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
      setSelectedMissionId(missionId);
      setShowAssignedPersonsPopup(true);
    }
  };

  const handleCancelMission = async (missionId) => {
    try {
      await cancelMission(
        missionId,
        setIsLoading,
        (successAlert) => {
          setAlert(successAlert);
          refetchData();
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
    const missionId = event.id.replace(/-(start|end)$/, "");
    setSelectedMissionId(missionId);
    setShowAssignedPersonsPopup(true);
  };

  const handleSelectSlot = ({ start }) => {
    const formattedDate = moment(start).format("YYYY-MM-DD");
    setInitialStartDate(formattedDate);
    setShowMissionForm(true);
  };

  const handleEditMission = (missionId) => {
    setSelectedMissionIdForEdit(missionId);
    setShowMissionForm(true);
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
    return <StatusBadge className={statusClass}>{status || "Inconnu"}</StatusBadge>;
  };

  const renderActionButtons = (mission) => {
    const missionPermissions = permissions[mission.missionId] || { canModify: false, canCancel: false };

    if (!missionPermissions.canModify && !missionPermissions.canCancel) {
      return <TableCell>—</TableCell>;
    }

    return (
      <TableCell>
        <ActionButtons>
          {missionPermissions.canModify && (
            <ButtonUpdate
              onClick={(e) => {
                e.stopPropagation();
                handleEditMission(mission.missionId);
              }}
            >
              Modifier
            </ButtonUpdate>
          )}
          {missionPermissions.canCancel && (
            <ButtonCancel
              onClick={(e) => {
                e.stopPropagation();
                handleShowCancelModal(mission.missionId);
              }}
            >
              Annuler
            </ButtonCancel>
          )}
        </ActionButtons>
      </TableCell>
    );
  };

  const handleFormSuccess = (type, message) => {
    setAlert({ isOpen: true, type, message });
    refetchData();
  };

  return (
    <DashboardContainer>
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
        <ModalActions>
          <ButtonCancel onClick={() => setShowCancelModal(false)}>Annuler</ButtonCancel>
          <ButtonConfirm onClick={handleConfirmCancel}>Confirmer</ButtonConfirm>
        </ModalActions>
      </Modal>

      {showAssignedPersonsPopup && (
        <DetailsMission
          missionId={selectedMissionId}
          isOpen={showAssignedPersonsPopup}
          onClose={() => setShowAssignedPersonsPopup(false)}
        />
      )}

      {showMissionForm && (
        <MissionForm
          isOpen={showMissionForm}
          onClose={() => {
            setShowMissionForm(false);
            setSelectedMissionIdForEdit(null);
            setInitialStartDate(null);
          }}
          missionId={selectedMissionIdForEdit}
          initialStartDate={initialStartDate}
          onFormSuccess={handleFormSuccess}
        />
      )}

      <StatsContainer>
        <StatsGrid>
          <StatCard className="stat-card-total">
            <StatIcon>
              <Clock size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{stats.total}</StatNumber>
              <StatLabel>Total des missions</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard className="stat-card-progress">
            <StatIcon>
              <Clock size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{stats.enCours}</StatNumber>
              <StatLabel>En Cours</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard className="stat-card-pending">
            <StatIcon>
              <Calendar size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{stats.planifiee}</StatNumber>
              <StatLabel>Planifié</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard className="stat-card-approved">
            <StatIcon>
              <CheckCircle size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{stats.terminee}</StatNumber>
              <StatLabel>Terminé</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard className="stat-card-cancelled">
            <StatIcon>
              <XCircle size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{stats.annulee}</StatNumber>
              <StatLabel>Annulé</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>
      </StatsContainer>

      {!isHidden && (
        <FiltersContainer $isMinimized={isMinimized}>
          <FiltersHeader>
            <FiltersTitle>Filtres de Recherche</FiltersTitle>
            <FiltersControls>
              <FilterControlButton
                $isMinimized
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
                        <FormLabelSearch>Intitulé de la Mission</FormLabelSearch>
                        <FormInputSearch
                          name="name"
                          type="text"
                          value={filters.name}
                          onChange={(e) => handleFilterChange("name", e.target.value)}
                          placeholder="Recherche par titre"
                        />
                      </FormFieldCell>

                      <FormFieldCell>
                        <FormLabelSearch>Lieu</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.location}
                          onChange={(value) => {
                            const regionName = value.includes("/") ? value.split("/")[0] : value;
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
                        <FormLabelSearch>Date de début</FormLabelSearch>
                        <FormInputSearch
                          name="startDate"
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        />
                      </FormFieldCell>

                      <FormFieldCell>
                        <FormLabelSearch>Date de fin</FormLabelSearch>
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
                  <ButtonReset type="button" onClick={handleResetFilters}>
                    Réinitialiser
                  </ButtonReset>
                  <ButtonSearch type="submit">Rechercher</ButtonSearch>
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
        <TableTitle>Liste des Missions</TableTitle>
        <ViewToggle>
          <ButtonView $active={viewMode === "list"} onClick={() => setViewMode("list")}>
            <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Liste
          </ButtonView>
          <ButtonView $active={viewMode === "calendar"} onClick={() => setViewMode("calendar")}>
            <Calendar size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Calendrier
          </ButtonView>
          <ButtonAdd onClick={() => setShowMissionForm(true)}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Nouvelle mission
          </ButtonAdd>
        </ViewToggle>
      </TableHeader>

      {viewMode === "calendar" && (
        <CalendarLegend>
          <LegendItem>
            <LegendColor color="#3b82f6" />
            <LegendLabel>En Cours</LegendLabel>
          </LegendItem>
          <LegendItem>
            <LegendColor color="#f59e0b" />
            <LegendLabel>Planifié</LegendLabel>
          </LegendItem>
          <LegendItem>
            <LegendColor color="#10b981" />
            <LegendLabel>Terminé</LegendLabel>
          </LegendItem>
          <LegendItem>
            <LegendColor color="#ef4444" />
            <LegendLabel>Annulé</LegendLabel>
          </LegendItem>
          <LegendNote>🚀 = Début de mission | 🏁 = Fin de mission</LegendNote>
        </CalendarLegend>
      )}

      {viewMode === "list" ? (
        <>
          <TableContainer>
            <DataTable>
              <thead>
                <tr>
                  <TableHeadCell>Intitulé</TableHeadCell>
                  <TableHeadCell>Description</TableHeadCell>
                  <TableHeadCell>Lieu</TableHeadCell>
                  <TableHeadCell>Date de début</TableHeadCell>
                  <TableHeadCell>Date de fin</TableHeadCell>
                  <TableHeadCell>Statut</TableHeadCell>
                  <TableHeadCell>Date de création</TableHeadCell>
                  <TableHeadCell>Action</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {isLoading.missions ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Loading>Chargement...</Loading>
                    </TableCell>
                  </TableRow>
                ) : missions.length > 0 ? (
                  missions.map((mission) => (
                    <TableRow
                      key={mission.missionId}
                      $clickable
                      onClick={() => handleRowClick(mission.missionId)}
                    >
                      <TableCell>{mission.name || "Non spécifié"}</TableCell>
                      <TableCell>{mission.description || "Non spécifié"}</TableCell>
                      <TableCell>{`${mission.lieu.nom}/${mission.lieu.pays}` || "Non spécifié"}</TableCell>
                      <TableCell>{formatDate(mission.startDate) || "Non spécifié"}</TableCell>
                      <TableCell>{formatDate(mission.endDate) || "Non spécifié"}</TableCell>
                      <TableCell>{getStatusBadge(mission.status)}</TableCell>
                      <TableCell>{formatDate(mission.createdAt) || "Non spécifié"}</TableCell>
                      {renderActionButtons(mission)}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <NoDataMessage>Aucune donnée trouvée.</NoDataMessage>
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
            disabled={isLoading.missions}
          />
        </>
      ) : (
        <div style={{ height: "600px" }}>
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
    </DashboardContainer>
  );
};

export default MissionList;