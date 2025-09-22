"use client";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import useRecruitmentValidationData from "./hooks/use-recruitment-validation-data";
import RecruitmentCards from "./components/recruitment-cards";
import RecruitmentModals from "./components/recruitment-modals";
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

const RecruitmentValidationPage = () => {
  const {
    recruitments,
    isLoading,
    alert,
    setAlert,
    stats,
    selectedRecruitmentId,
    showDetailsRecruitment,
    setShowDetailsRecruitment,
    handleRowClick,
    formatDate,
    getDaysUntilDue,
    currentPage,
    pageSize,
    totalEntries,
    handlePageChange,
    handlePageSizeChange,
    appliedFilters,
    fetchRecruitments,
    handleUpdateComments, // Add this
    handleUpdateSignature, // Add this
  } = useRecruitmentValidationData();

  if (showDetailsRecruitment) {
    return (
      <RecruitmentModals
        alert={alert}
        setAlert={setAlert}
        showDetailsRecruitment={showDetailsRecruitment}
        setShowDetailsRecruitment={setShowDetailsRecruitment}
        selectedRecruitmentId={selectedRecruitmentId}
        handleUpdateComments={handleUpdateComments}
        handleUpdateSignature={handleUpdateSignature}
        fetchRecruitments={fetchRecruitments}
      />
    );
  }

  return (
    <DashboardContainer>
      <TableHeader>
        <TableTitle>Validation des Recrutements</TableTitle>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}>
          Tableau de bord moderne pour la gestion des demandes de recrutement
        </p>
      </TableHeader>
      <StatsContainer>
        <StatsGrid>
          <StatCard className="stat-card-total">
            <StatIcon>
              <Clock size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{isLoading.recruitments ? "..." : stats.total}</StatNumber>
              <StatLabel>Total des demandes</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard className="stat-card-pending">
            <StatIcon>
              <Clock size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{isLoading.recruitments ? "..." : stats.pending}</StatNumber>
              <StatLabel>En attente</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard className="stat-card-approved">
            <StatIcon>
              <CheckCircle size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{isLoading.recruitments ? "..." : stats.approved}</StatNumber>
              <StatLabel>Approuvées</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard className="stat-card-cancelled">
            <StatIcon>
              <XCircle size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{isLoading.recruitments ? "..." : stats.rejected}</StatNumber>
              <StatLabel>Rejetées</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>
      </StatsContainer>
      <RecruitmentCards
        recruitments={recruitments}
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

export default RecruitmentValidationPage;