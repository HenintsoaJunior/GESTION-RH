"use client";

import { Clock, CheckCircle, XCircle } from "lucide-react";
import useMissionValidationData from "./hooks/use-mission-validation-data";
import MissionCards from "./components/mission-cards";
import MissionFilters from "./components/mission-filters";
import MissionModals from "./components/mission-modals";
import {
  DashboardContainer,
  TableHeader,
  TableTitle,
  StatsContainer,
  StatsGrid,
  StatCard,
  StatIcon,
  StatContent,
  StatNumber,
  StatLabel,
} from "styles/generaliser/table-container";

const MissionValidationPage = () => {
  const {
    missions,
    filters,
    setFilters,
    appliedFilters,
    isLoading,
    alert,
    setAlert,
    stats,
    selectedMissionId,
    showDetailsMission,
    setShowDetailsMission,
    handleValidate,
    handleUpdateComments,
    handleUpdateSignature,
    handleRowClick,
    formatDate,
    getDaysUntilDue,
    currentPage,
    pageSize,
    totalEntries,
    handlePageChange,
    handlePageSizeChange,
    comments,
    handleCreateComment,
    handleUpdateComment,
    handleDeleteComment,
    isHidden,
    setIsHidden,
    suggestions,
    handleFilterSubmit,
    handleResetFilters,
  } = useMissionValidationData();

  if (showDetailsMission) {
    return (
      <MissionModals
        alert={alert}
        setAlert={setAlert}
        showDetailsMission={showDetailsMission}
        setShowDetailsMission={setShowDetailsMission}
        selectedMissionId={selectedMissionId}
        missions={missions}
        formatDate={formatDate}
        handleValidate={handleValidate}
        handleUpdateComments={handleUpdateComments}
        handleUpdateSignature={handleUpdateSignature}
        comments={comments}
        handleCreateComment={handleCreateComment}
        handleUpdateComment={handleUpdateComment}
        handleDeleteComment={handleDeleteComment}
      />
    );
  }

  return (
    <DashboardContainer>
      <TableHeader>
        <TableTitle>Validation des Missions</TableTitle>
      </TableHeader>

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

          <StatCard className="stat-card-pending">
            <StatIcon>
              <Clock size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{isLoading.stats ? "..." : stats.pending}</StatNumber>
              <StatLabel>En attente</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard className="stat-card-approved">
            <StatIcon>
              <CheckCircle size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{isLoading.stats ? "..." : stats.approved}</StatNumber>
              <StatLabel>Approuvées</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard className="stat-card-rejected">
            <StatIcon>
              <XCircle size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{isLoading.stats ? "..." : stats.rejected}</StatNumber>
              <StatLabel>Rejetées</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>
      </StatsContainer>

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

      <MissionCards
        missions={missions}
        isLoading={isLoading}
        handleRowClick={handleRowClick}
        formatDate={formatDate}
        getDaysUntilDue={getDaysUntilDue}
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

export default MissionValidationPage;