"use client";

import { useNavigate } from "react-router-dom";
import { List, Users, User, Plus, Clock, Calendar, CheckCircle, XCircle } from "lucide-react";
import MissionFilters from "./mission-filters";
import MissionTable from "./mission-table";
import MissionModals from "./mission-modals";
import useMissionData from "./use-mission-data";
import {
    DashboardContainer,
    TableHeader,
    TableTitle,
    ViewToggle,
    ButtonView,
    ButtonAdd,
    StatsContainer,
    StatsGrid,
    StatCard,
    StatIcon,
    StatContent,
    StatNumber,
    StatLabel,
} from "styles/generaliser/table-container";

const CollaboratorMissionList = () => {
    const navigate = useNavigate();
    const {
        isHidden,
        setIsHidden,
        viewMode,
        setViewMode,
        filters,
        setFilters,
        appliedFilters,
        setAppliedFilters,
        suggestions,
        isLoading,
        alert,
        setAlert,
        assignedPersons,
        totalEntries,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        permissions,
        collaborators,
        userMatricule,
        stats,
        handleFilterSubmit,
        handleResetFilters,
        handleAllMissions,
        handleCollaboratorsMissions,
        handleMyMissions,
        handlePageChange,
        handlePageSizeChange,
        handleRowClick,
        handleEditMission,
        handleShowCancelModal,
        handleConfirmCancel,
        handleFormSuccess,
        showCancelModal,
        setShowCancelModal,
        missionToCancel,
        setMissionToCancel,
        showDetailsMission,
        setShowDetailsMission,
        selectedMissionId,
        setSelectedMissionId,
        showMissionForm,
        setShowMissionForm,
        selectedMissionIdForEdit,
        setSelectedMissionIdForEdit,
    } = useMissionData();

    return (
        <DashboardContainer>
            <StatsContainer>
                <StatsGrid>
                    <StatCard className="stat-card-total">
                        <StatIcon>
                            <Clock size={24} />
                        </StatIcon>
                        <StatContent>
                            <StatNumber>{isLoading.stats ? "..." : stats.total}</StatNumber>
                            <StatLabel>Total des missions</StatLabel>
                        </StatContent>
                    </StatCard>
                    <StatCard className="stat-card-progress">
                        <StatIcon>
                            <Clock size={24} />
                        </StatIcon>
                        <StatContent>
                            <StatNumber>{isLoading.stats ? "..." : stats.enCours}</StatNumber>
                            <StatLabel>En Cours</StatLabel>
                        </StatContent>
                    </StatCard>
                    <StatCard className="stat-card-pending">
                        <StatIcon>
                            <Calendar size={24} />
                        </StatIcon>
                        <StatContent>
                            <StatNumber>{isLoading.stats ? "..." : stats.planifiee}</StatNumber>
                            <StatLabel>Planifié</StatLabel>
                        </StatContent>
                    </StatCard>
                    <StatCard className="stat-card-approved">
                        <StatIcon>
                            <CheckCircle size={24} />
                        </StatIcon>
                        <StatContent>
                            <StatNumber>{isLoading.stats ? "..." : stats.terminee}</StatNumber>
                            <StatLabel>Terminé</StatLabel>
                        </StatContent>
                    </StatCard>
                    <StatCard className="stat-card-cancelled">
                        <StatIcon>
                            <XCircle size={24} />
                        </StatIcon>
                        <StatContent>
                            <StatNumber>{isLoading.stats ? "..." : stats.annulee}</StatNumber>
                            <StatLabel>Annulé</StatLabel>
                        </StatContent>
                    </StatCard>
                </StatsGrid>
            </StatsContainer>
            <MissionModals
                alert={alert}
                setAlert={setAlert}
                handleConfirmCancel={handleConfirmCancel}
                handleEditMission={handleEditMission}
                handleFormSuccess={handleFormSuccess}
                showCancelModal={showCancelModal}
                setShowCancelModal={setShowCancelModal}
                missionToCancel={missionToCancel}
                setMissionToCancel={setMissionToCancel}
                showDetailsMission={showDetailsMission}
                setShowDetailsMission={setShowDetailsMission}
                selectedMissionId={selectedMissionId}
                setSelectedMissionId={setSelectedMissionId}
                showMissionForm={showMissionForm}
                setShowMissionForm={setShowMissionForm}
                selectedMissionIdForEdit={selectedMissionIdForEdit}
                setSelectedMissionIdForEdit={setSelectedMissionIdForEdit}
            />
            <MissionFilters
                isHidden={isHidden}
                setIsHidden={setIsHidden}
                filters={filters}
                setFilters={setFilters}
                suggestions={suggestions}
                isLoading={isLoading}
                handleFilterSubmit={handleFilterSubmit}
                handleResetFilters={handleResetFilters}
            />
            <TableHeader>
                <TableTitle>Collaborateurs</TableTitle>
                <ViewToggle>
                    <ButtonView
                        $active={viewMode === "all"}
                        onClick={handleAllMissions}
                        disabled={isLoading.assignMissions}
                    >
                        <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Toutes les Missions
                    </ButtonView>
                    {collaborators.length > 0 && (
                        <ButtonView
                            $active={viewMode === "collaborators"}
                            onClick={handleCollaboratorsMissions}
                            disabled={isLoading.assignMissions || isLoading.collaborators}
                        >
                            <Users size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                            Missions des Collaborateurs
                        </ButtonView>
                    )}
                    <ButtonView
                        $active={viewMode === "my"}
                        onClick={handleMyMissions}
                        disabled={isLoading.assignMissions || !userMatricule}
                    >
                        <User size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Mes Missions
                    </ButtonView>
                    <ButtonAdd onClick={() => handleEditMission(null)}>
                        <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Nouvelle mission
                    </ButtonAdd>
                </ViewToggle>
            </TableHeader>
            <MissionTable
                assignedPersons={assignedPersons}
                isLoading={isLoading}
                permissions={permissions}
                handleRowClick={handleRowClick}
                handleEditMission={handleEditMission}
                handleShowCancelModal={handleShowCancelModal}
                currentPage={currentPage}
                pageSize={pageSize}
                totalEntries={totalEntries}
                handlePageChange={handlePageChange}
                handlePageSizeChange={handlePageSizeChange}
                appliedFilters={appliedFilters}
            />
        </DashboardContainer>
    );
};

export default CollaboratorMissionList;