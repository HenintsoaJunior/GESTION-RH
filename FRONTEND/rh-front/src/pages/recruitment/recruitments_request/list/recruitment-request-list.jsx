"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Users, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, X, List, Calendar } from "lucide-react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { formatDate } from "utils/dateConverter";
import { hasHabilitation } from "utils/authUtils";
import { fetchSites } from "services/site/site";
import { fetchContractTypes } from "services/contract/contract-type";
import { fetchDirections } from "services/direction/direction";
import { fetchDepartments } from "services/direction/department";
import { fetchServices } from "services/direction/service";
import { fetchRecruitmentRequests, fetchRecruitmentRequestStats } from "services/recruitment/recruitment-request-service/recruitment-request-service";
import Modal from "components/modal";
import Pagination from "components/pagination";
import DetailsRecruitmentRequest from "./recruitment-request-details";
import RecruitmentRequestForm from "../form/recruitment-request-form"; // Import the RecruitmentRequestForm
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
    FiltersActions,
    ButtonReset,
    ButtonSearch,
    ButtonAdd,
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

const RecruitmentRequestList = () => {
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({ total: 0, enAttente: 0, enCours: 0, approuvees: 0, rejetees: 0 });
    const [filters, setFilters] = useState({
        status: "",
        jobTitleKeyword: "",
        requestDateMin: "",
        requestDateMax: "",
        siteId: "",
        contractTypeId: "",
        directionId: "",
        departmentId: "",
        serviceId: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalEntries, setTotalEntries] = useState(0);
    const [isLoading, setIsLoading] = useState({
        requests: true,
        sites: true,
        contractTypes: true,
        directions: true,
        departments: true,
        services: true,
        stats: true,
    });
    const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
    const [isMinimized, setIsMinimized] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [viewMode, setViewMode] = useState("list");
    const [sites, setSites] = useState([]);
    const [contractTypes, setContractTypes] = useState([]);
    const [directions, setDirections] = useState([]);
    const [allDepartments, setAllDepartments] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [showDetailsPopup, setShowDetailsPopup] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [isFormOpen, setIsFormOpen] = useState(false); // State to control form popup visibility

    const getStatusColor = (status) => {
        switch (status) {
            case "En Cours":
                return "#3b82f6";
            case "BROUILLON":
                return "#f59e0b";
            case "Approuvé":
                return "#10b981";
            case "Rejeté":
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
        fetchRecruitmentRequests(setRequests, setIsLoading, setTotalEntries, filters, currentPage, pageSize, handleError);
        fetchRecruitmentRequestStats(setStats, setIsLoading, handleError);
    }, [filters, currentPage, pageSize, handleError]);

    useEffect(() => {
        fetchSites(setSites, setIsLoading, null, handleError);
        fetchContractTypes(setContractTypes, setIsLoading, null, handleError);
        fetchDirections(setDirections, setIsLoading, null, handleError);
        fetchDepartments(setAllDepartments, setIsLoading, null, handleError);
        fetchServices(setAllServices, setIsLoading, null, handleError);
        refetchData();
    }, [refetchData]);

    useEffect(() => {
        const fetchPermissions = async () => {
            const newPermissions = {};
            for (const request of requests) {
                const canViewDetails = await hasHabilitation("recruitment_request_view");
                newPermissions[request.recruitmentRequestId] = { canViewDetails };
            }
            setPermissions(newPermissions);
        };

        if (requests.length > 0) {
            fetchPermissions();
        }
    }, [requests]);

    const calendarEvents = useMemo(() => {
        const events = [];
        requests.forEach((request) => {
            const requestDate = new Date(request.recruitmentRequest?.createdAt);
            events.push({
                id: `${request.recruitmentRequestId}`,
                title: `📋 ${request.recruitmentRequest?.positionTitle || "Demande sans titre"}`,
                start: requestDate,
                end: requestDate,
                allDay: true,
                resource: { ...request.recruitmentRequest, status: request.recruitmentRequest?.status },
            });
        });
        return events;
    }, [requests]);

    const filteredDepartments = useMemo(() => {
        if (filters.directionId) {
            return allDepartments.filter((dept) => dept.directionId === filters.directionId);
        }
        return allDepartments;
    }, [allDepartments, filters.directionId]);

    const filteredServices = useMemo(() => {
        if (filters.departmentId) {
            return allServices.filter((svc) => svc.departmentId === filters.departmentId);
        } else if (filters.directionId) {
            return allServices.filter((svc) => svc.directionId === filters.directionId);
        }
        return allServices;
    }, [allServices, filters.directionId, filters.departmentId]);

    const siteMap = useMemo(() => {
        const map = {};
        sites.forEach((site) => {
            map[site.siteId] = site.siteName;
        });
        return map;
    }, [sites]);

    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "directionId" && { departmentId: "", serviceId: "" }),
            ...(name === "departmentId" && { serviceId: "" }),
        }));
    };

    const handleFilterSubmit = (event) => {
        event.preventDefault();
        setCurrentPage(1);
        refetchData();
    };

    const handleResetFilters = () => {
        const resetFilters = {
            status: "",
            jobTitleKeyword: "",
            requestDateMin: "",
            requestDateMax: "",
            siteId: "",
            contractTypeId: "",
            directionId: "",
            departmentId: "",
            serviceId: "",
        };
        setFilters(resetFilters);
        setCurrentPage(1);
        fetchRecruitmentRequests(setRequests, setIsLoading, setTotalEntries, resetFilters, 1, pageSize, handleError);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setCurrentPage(1);
    };

    const handleRowClick = (requestId) => {
        if (requestId && permissions[requestId]?.canViewDetails) {
            setSelectedRequestId(requestId);
            setShowDetailsPopup(true);
        }
    };

    const handleEventClick = (event) => {
        const requestId = event.id;
        if (requestId && permissions[requestId]?.canViewDetails) {
            setSelectedRequestId(requestId);
            setShowDetailsPopup(true);
        }
    };

    const toggleMinimize = () => {
        setIsMinimized((prev) => !prev);
    };

    const toggleHide = () => {
        setIsHidden((prev) => !prev);
    };

    const getStatusBadge = (status) => {
        const statusClass =
            status === "BROUILLON"
                ? "status-pending"
                : status === "En Cours"
                    ? "status-progress"
                    : status === "Approuvé"
                        ? "status-approved"
                        : status === "Rejeté"
                            ? "status-rejected"
                            : "status-pending";
        return <StatusBadge className={statusClass}>{status || "Inconnu"}</StatusBadge>;
    };

    // Function to open the form popup
    const handleOpenForm = () => {
        setIsFormOpen(true);
    };

    // Function to close the form popup and refetch data
    const handleCloseForm = () => {
        setIsFormOpen(false);
        refetchData(); // Refetch data to update the list after form submission
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

            {showDetailsPopup && (
                <DetailsRecruitmentRequest
                    requestId={selectedRequestId}
                    isOpen={showDetailsPopup}
                    onClose={() => setShowDetailsPopup(false)}
                />
            )}

            {/* Render the RecruitmentRequestForm as a popup */}
            <RecruitmentRequestForm isOpen={isFormOpen} onClose={handleCloseForm} />

            <StatsContainer>
                <StatsGrid>
                    <StatCard className="stat-card-total">
                        <StatIcon>
                            <Users size={24} />
                        </StatIcon>
                        <StatContent>
                            <StatNumber>{stats.total}</StatNumber>
                            <StatLabel>Total des demandes</StatLabel>
                        </StatContent>
                    </StatCard>
                    <StatCard className="stat-card-pending">
                        <StatIcon>
                            <Clock size={24} />
                        </StatIcon>
                        <StatContent>
                            <StatNumber>{stats.enAttente}</StatNumber>
                            <StatLabel>Brouillon</StatLabel>
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
                    <StatCard className="stat-card-approved">
                        <StatIcon>
                            <CheckCircle size={24} />
                        </StatIcon>
                        <StatContent>
                            <StatNumber>{stats.approuvees}</StatNumber>
                            <StatLabel>Approuvées</StatLabel>
                        </StatContent>
                    </StatCard>
                    <StatCard className="stat-card-rejected">
                        <StatIcon>
                            <XCircle size={24} />
                        </StatIcon>
                        <StatContent>
                            <StatNumber>{stats.rejetees}</StatNumber>
                            <StatLabel>Rejetées</StatLabel>
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
                                            <FormLabelSearch>Intitulé du Poste</FormLabelSearch>
                                            <FormInputSearch
                                                name="jobTitleKeyword"
                                                type="text"
                                                value={filters.jobTitleKeyword}
                                                onChange={(e) => handleFilterChange("jobTitleKeyword", e.target.value)}
                                                placeholder="Recherche par poste"
                                            />
                                        </FormFieldCell>
                                        <FormFieldCell>
                                            <FormLabelSearch>Direction</FormLabelSearch>
                                            <FormInputSearch
                                                as="select"
                                                name="directionId"
                                                value={filters.directionId}
                                                onChange={(e) => handleFilterChange("directionId", e.target.value)}
                                            >
                                                <option value="">Toutes les directions</option>
                                                {directions.map((dir) => (
                                                    <option key={dir.directionId} value={dir.directionId}>
                                                        {dir.directionName}
                                                    </option>
                                                ))}
                                            </FormInputSearch>
                                        </FormFieldCell>
                                        <FormFieldCell>
                                            <FormLabelSearch>Type de Contrat</FormLabelSearch>
                                            <FormInputSearch
                                                as="select"
                                                name="contractTypeId"
                                                value={filters.contractTypeId}
                                                onChange={(e) => handleFilterChange("contractTypeId", e.target.value)}
                                            >
                                                <option value="">Tous les contrats</option>
                                                {contractTypes.map((ct) => (
                                                    <option key={ct.contractTypeId} value={ct.contractTypeId}>
                                                        {ct.label}
                                                    </option>
                                                ))}
                                            </FormInputSearch>
                                        </FormFieldCell>
                                    </FormRow>
                                    <FormRow>
                                        <FormFieldCell>
                                            <FormLabelSearch>Site</FormLabelSearch>
                                            <FormInputSearch
                                                as="select"
                                                name="siteId"
                                                value={filters.siteId}
                                                onChange={(e) => handleFilterChange("siteId", e.target.value)}
                                            >
                                                <option value="">Tous les sites</option>
                                                {sites.map((site) => (
                                                    <option key={site.siteId} value={site.siteId}>
                                                        {site.siteName}
                                                    </option>
                                                ))}
                                            </FormInputSearch>
                                        </FormFieldCell>
                                        <FormFieldCell>
                                            <FormLabelSearch>Département</FormLabelSearch>
                                            <FormInputSearch
                                                as="select"
                                                name="departmentId"
                                                value={filters.departmentId}
                                                onChange={(e) => handleFilterChange("departmentId", e.target.value)}
                                                disabled={filters.directionId === ""}
                                            >
                                                <option value="">Tous les départements</option>
                                                {filteredDepartments.map((dept) => (
                                                    <option key={dept.departmentId} value={dept.departmentId}>
                                                        {dept.departmentName}
                                                    </option>
                                                ))}
                                            </FormInputSearch>
                                        </FormFieldCell>
                                        <FormFieldCell>
                                            <FormLabelSearch>Service</FormLabelSearch>
                                            <FormInputSearch
                                                as="select"
                                                name="serviceId"
                                                value={filters.serviceId}
                                                onChange={(e) => handleFilterChange("serviceId", e.target.value)}
                                                disabled={filters.directionId === "" && filters.departmentId === ""}
                                            >
                                                <option value="">Tous les services</option>
                                                {filteredServices.map((svc) => (
                                                    <option key={svc.serviceId} value={svc.serviceId}>
                                                        {svc.serviceName}
                                                    </option>
                                                ))}
                                            </FormInputSearch>
                                        </FormFieldCell>
                                    </FormRow>
                                    <FormRow>
                                        <FormFieldCell>
                                            <FormLabelSearch>Statut</FormLabelSearch>
                                            <FormInputSearch
                                                as="select"
                                                name="status"
                                                value={filters.status}
                                                onChange={(e) => handleFilterChange("status", e.target.value)}
                                            >
                                                <option value="">Tous les statuts</option>
                                                <option value="BROUILLON">Brouillon</option>
                                                <option value="En Cours">En Cours</option>
                                                <option value="Approuvé">Approuvé</option>
                                                <option value="Rejeté">Rejeté</option>
                                            </FormInputSearch>
                                        </FormFieldCell>
                                        <FormFieldCell>
                                            <FormLabelSearch>Date de début</FormLabelSearch>
                                            <FormInputSearch
                                                name="requestDateMin"
                                                type="date"
                                                value={filters.requestDateMin}
                                                onChange={(e) => handleFilterChange("requestDateMin", e.target.value)}
                                            />
                                        </FormFieldCell>
                                        <FormFieldCell>
                                            <FormLabelSearch>Date de fin</FormLabelSearch>
                                            <FormInputSearch
                                                name="requestDateMax"
                                                type="date"
                                                value={filters.requestDateMax}
                                                onChange={(e) => handleFilterChange("requestDateMax", e.target.value)}
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
                <TableTitle>Liste des Demandes de Recrutement</TableTitle>
                <ViewToggle>
                    <ButtonView $active={viewMode === "list"} onClick={() => setViewMode("list")}>
                        <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Liste
                    </ButtonView>
                    <ButtonView $active={viewMode === "calendar"} onClick={() => setViewMode("calendar")}>
                        <Calendar size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Calendrier
                    </ButtonView>
                    <ButtonAdd onClick={handleOpenForm}>
                        <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Nouvelle demande
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
                        <LegendLabel>Brouillon</LegendLabel>
                    </LegendItem>
                    <LegendItem>
                        <LegendColor color="#10b981" />
                        <LegendLabel>Approuvé</LegendLabel>
                    </LegendItem>
                    <LegendItem>
                        <LegendColor color="#ef4444" />
                        <LegendLabel>Rejeté</LegendLabel>
                    </LegendItem>
                    <LegendNote>📋 = Demande de recrutement</LegendNote>
                </CalendarLegend>
            )}

            {viewMode === "list" ? (
                <>
                    <TableContainer>
                        <DataTable>
                            <thead>
                            <tr>
                                <TableHeadCell>Poste</TableHeadCell>
                                <TableHeadCell>Effectif</TableHeadCell>
                                <TableHeadCell>Type Contrat</TableHeadCell>
                                <TableHeadCell>Direction</TableHeadCell>
                                <TableHeadCell>Département</TableHeadCell>
                                <TableHeadCell>Service</TableHeadCell>
                                <TableHeadCell>Site</TableHeadCell>
                                <TableHeadCell>Statut</TableHeadCell>
                                <TableHeadCell>Date de création</TableHeadCell>
                            </tr>
                            </thead>
                            <tbody>
                            {isLoading.requests ? (
                                <TableRow>
                                    <TableCell colSpan={9}>
                                        <Loading>Chargement...</Loading>
                                    </TableCell>
                                </TableRow>
                            ) : requests.length > 0 ? (
                                requests.map((request) => (
                                    <TableRow
                                        key={request.recruitmentRequestId}
                                        $clickable
                                        onClick={() => handleRowClick(request.recruitmentRequestId)}
                                    >
                                        <TableCell>{request.recruitmentRequest?.positionTitle || "Non spécifié"}</TableCell>
                                        <TableCell>{request.recruitmentRequest?.positionCount || 0}</TableCell>
                                        <TableCell>
                                            {request.recruitmentRequest?.contractType?.label
                                                ? `${request.recruitmentRequest.contractType.label} (${request.recruitmentRequest.contractType.code || ''})`
                                                : "Non spécifié"}
                                        </TableCell>
                                        <TableCell>
                                            {request.direction?.directionName
                                                ? `${request.direction.directionName} (${request.direction.acronym || ''})`
                                                : "Non spécifié"}
                                        </TableCell>
                                        <TableCell>{request.department?.departmentName || "Non spécifié"}</TableCell>
                                        <TableCell>{request.service?.serviceName || "Non spécifié"}</TableCell>
                                        <TableCell>{siteMap[request.recruitmentRequest?.siteId] || "Non spécifié"}</TableCell>
                                        <TableCell>{getStatusBadge(request.recruitmentRequest?.status)}</TableCell>
                                        <TableCell>{formatDate(request.recruitmentRequest?.createdAt) || "Non spécifié"}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9}>
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
                        disabled={isLoading.requests}
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

export default RecruitmentRequestList;