"use client";
import { useState } from "react";
import { Plus, List, Calendar } from "lucide-react";
import Modal from "components/modal";
import RecruitmentRequestForm from "../form/page";
import StatsDashboard from "./components/stats-dashboard";
import FiltersPanel from "./components/filters-panel";
import RequestsList from "./components/requests-list";
import CalendarView from "./components/calendar-view";
import ProcessRecruitment from "../validation/components/process";
import { useRecruitmentRequests } from "./hooks/use-recruitment-requests";
import {
    DashboardContainer,
    TableHeader,
    TableTitle,
    ViewToggle,
    ButtonView,
    ButtonAdd,
} from "styles/generaliser/table-container";

const RecruitmentRequest = () => {
    const {
        requests,
        stats,
        sites,
        contractTypes,
        directions,
        allDepartments,
        allServices,
        filters,
        handleFilterChange,
        handleFilterSubmit,
        handleResetFilters,
        currentPage,
        pageSize,
        totalEntries,
        handlePageChange,
        handlePageSizeChange,
        isLoading,
        alert,
        closeAlert,
        refetchData,
    } = useRecruitmentRequests();

    const [viewMode, setViewMode] = useState("list");
    const [showDetailsPopup, setShowDetailsPopup] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleRowClick = (requestId) => {
        if (requestId) {
            console.log("RecruitmentRequest - Setting selectedRequestId:", requestId);
            setSelectedRequestId(requestId);
            setShowDetailsPopup(true);
        } else {
            console.warn("RecruitmentRequest - No valid requestId provided");
        }
    };

    const handleEventClick = (event) => {
        const requestId = event.id;
        if (requestId) {
            console.log("RecruitmentRequest - Setting selectedRequestId from event:", requestId);
            setSelectedRequestId(requestId);
            setShowDetailsPopup(true);
        } else {
            console.warn("RecruitmentRequest - No valid event id provided");
        }
    };

    const handleOpenForm = () => {
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        refetchData();
    };

    const handleCloseDetailsPopup = () => {
        console.log("RecruitmentRequest - Closing details popup");
        setShowDetailsPopup(false);
        setSelectedRequestId(null);
    };

    return (
        <DashboardContainer>
            {/* Alert Modal */}
            <Modal
                type={alert.type}
                message={alert.message}
                isOpen={alert.isOpen}
                onClose={closeAlert}
                title="Notification"
            />
            {/* Form Modal */}
            <RecruitmentRequestForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
            />
            {/* Process Recruitment Popup */}
            {showDetailsPopup && selectedRequestId && (
                <ProcessRecruitment
                    recruitmentRequestId={selectedRequestId}
                    isOpen={showDetailsPopup}
                    onClose={handleCloseDetailsPopup}
                />
            )}
            {/* Stats Dashboard */}
            <StatsDashboard
                stats={stats}
                isLoading={isLoading.stats}
            />
            {/* Filters Panel */}
            <FiltersPanel
                filters={filters}
                sites={sites}
                contractTypes={contractTypes}
                directions={directions}
                allDepartments={allDepartments}
                allServices={allServices}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onResetFilters={handleResetFilters}
                isLoading={isLoading.requests}
            />
            {/* Table Header with View Controls */}
            <TableHeader>
                <TableTitle>Liste des Demandes de Recrutement</TableTitle>
                <ViewToggle>
                    <ButtonView
                        $active={viewMode === "list"}
                        onClick={() => setViewMode("list")}
                    >
                        <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Liste
                    </ButtonView>
                    <ButtonView
                        $active={viewMode === "calendar"}
                        onClick={() => setViewMode("calendar")}
                    >
                        <Calendar size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Calendrier
                    </ButtonView>
                    <ButtonAdd onClick={handleOpenForm}>
                        <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Nouvelle demande
                    </ButtonAdd>
                </ViewToggle>
            </TableHeader>
            {/* Main Content Area */}
            {viewMode === "list" ? (
                <RequestsList
                    requests={requests}
                    sites={sites}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalEntries={totalEntries}
                    isLoading={isLoading.requests}
                    onRowClick={handleRowClick}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            ) : (
                <CalendarView
                    requests={requests}
                    onEventClick={handleEventClick}
                />
            )}
        </DashboardContainer>
    );
};

export default RecruitmentRequest;