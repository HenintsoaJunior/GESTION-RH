"use client";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import useMissionValidationData from "./use-mission-validation-data";
import MissionCards from "./mission-cards";
import MissionModals from "./mission-modals";
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
  } = useMissionValidationData();

  // Si une mission est sélectionnée pour affichage détaillé, on affiche uniquement MissionModals
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
      />
    );
  }

  // Affichage normal de la page de validation des missions
  return (
    <DashboardContainer>
      <TableHeader>
        <TableTitle>Validation des Missions</TableTitle>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}>
          Tableau de bord moderne pour la gestion des missions
        </p>
      </TableHeader>
      
      <StatsContainer>
        <StatsGrid>
          <StatCard className="stat-card-total">
            <StatIcon>
              <Clock size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{isLoading.missions ? "..." : stats.total}</StatNumber>
              <StatLabel>Total des missions</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard className="stat-card-pending">
            <StatIcon>
              <Clock size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{isLoading.missions ? "..." : stats.pending}</StatNumber>
              <StatLabel>En attente</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard className="stat-card-approved">
            <StatIcon>
              <CheckCircle size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{isLoading.missions ? "..." : stats.approved}</StatNumber>
              <StatLabel>Approuvées</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard className="stat-card-cancelled">
            <StatIcon>
              <XCircle size={24} />
            </StatIcon>
            <StatContent>
              <StatNumber>{isLoading.missions ? "..." : stats.rejected}</StatNumber>
              <StatLabel>Rejetées</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>
      </StatsContainer>
      
      <MissionCards
        missions={missions}
        isLoading={isLoading}
        handleRowClick={handleRowClick}
        formatDate={formatDate}
        getDaysUntilDue={getDaysUntilDue}
      />
    </DashboardContainer>
  );
};

export default MissionValidationPage;