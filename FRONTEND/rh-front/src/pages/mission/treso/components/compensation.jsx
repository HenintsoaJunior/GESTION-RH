"use client";

import useCompensationStatusData from "../hooks/use-compensation-data";
import CompensationCards from "./compensation-cards";
import CompensationFilters from "./compensation-filters";
import CompensationModals from "./compensation-modals";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  DashboardContainer,
  TableHeader,
  TableTitle,
  StatNumber,
  StatLabel,
} from "styles/generaliser/table-container";
import styled from "styled-components";

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartDashboard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  padding: 20px;
  background: white;
  border: 1px solid #dee2e6;
  margin-bottom: 20px;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ChartWrapper = styled.div`
  width: 100%;
  max-width: 300px;
  min-height: 250px;

  @media (max-width: 900px) {
    max-width: 100%;
    margin: 0 auto;
  }
`;

const ChartSummary = styled.div`
  flex-grow: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-left: 1px solid #dee2e6;
  min-width: 450px;

  @media (max-width: 900px) {
    min-width: unset;
    grid-template-columns: 1fr 1fr;
    border-left: none;
    border-top: 1px solid #dee2e6;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const SummaryStatCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border: 1px solid #dee2e6;
  
  &.total {
    background: #e6f2ff;
  }
  &.not-paid {
    background: #f8d7da;
  }
  &.paid {
    background: #d4edda;
  }
  
  ${StatNumber} {
    font-size: 1.8rem;
    font-weight: 700;
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 0.95rem;
  font-weight: 500;
  background: none;
  color: var(--primary-color);
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
  border-radius: 6px;

  &:hover {
    background: #eff6ff;
    text-decoration: none;
    color: var(--primary-color);
    transform: translateX(-2px);
  }

  &:active {
    background: #dbeafe;
    color: var(--primary-color);
    transform: translateX(-1px);
  }

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  span {
    font-size: 1.2rem;
    font-weight: bold;
    transition: transform 0.2s ease;
  }

  &:hover span {
    transform: translateX(-2px);
  }
`;

const CompensationStatusChart = ({ stats, isLoading }) => {
  if (isLoading) return <p>Chargement du graphique...</p>;

  const data = {
    labels: [`Non Payées: ${stats.notPaid}`, `Payées: ${stats.paid}`],
    datasets: [
      {
        data: [stats.notPaid, stats.paid],
        backgroundColor: ["#dc3545", "#28a745"],
        hoverBackgroundColor: ["#c82333", "#1e7e34"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 10, padding: 15 },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = tooltipItem.label || "";
            const value = tooltipItem.raw;
            const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1) + "%";
            return `${label} (${percentage})`;
          },
        },
      },
      title: {
        display: true,
        text: 'Répartition par Statut',
        font: { size: 16, weight: 'bold' }
      }
    },
    cutout: "70%",
  };

  return <Doughnut data={data} options={options} />;
};

const CompensationPage = ({ setCurrentPage }) => {
  const {
    compensationsData,
    filters,
    setFilters,
    appliedFilters,
    isLoading,
    alert,
    setAlert,
    stats,
    selectedAssignationId,
    showDetailsCompensation,
    setShowDetailsCompensation,
    handleRowClick,
    formatDate,
    getDaysUntilDue,
    currentPage,
    pageSize,
    totalEntries,
    handlePageChange,
    handlePageSizeChange,
    isHidden,
    setIsHidden,
    handleFilterSubmit,
    handleResetFilters,
    fetchCompensations,
  } = useCompensationStatusData();

  if (showDetailsCompensation) {
    return (
      <CompensationModals
        alert={alert}
        setAlert={setAlert}
        showDetailsCompensation={showDetailsCompensation}
        setShowDetailsCompensation={setShowDetailsCompensation}
        selectedAssignationId={selectedAssignationId}
        compensationsData={compensationsData}
        formatDate={formatDate}
        onPaymentSuccess={fetchCompensations}
      />
    );
  }

  return (
    <DashboardContainer>
      <TableHeader>
        <TableTitle>Tableau de Bord des Compensations</TableTitle>
        <BackButton onClick={() => setCurrentPage("dashboard")}>
          <span>←</span> Retour au Tableau de Bord
        </BackButton>
      </TableHeader>

      <ChartDashboard>
        <ChartWrapper>
          <CompensationStatusChart stats={stats} isLoading={isLoading.compensations} />
        </ChartWrapper>
        
        <ChartSummary>
          <SummaryStatCard className="not-paid">
            <StatNumber>{isLoading.compensations ? "..." : stats.notPaid}</StatNumber>
            <StatLabel>Dossiers Non Payés</StatLabel>
          </SummaryStatCard>

          <SummaryStatCard className="paid">
            <StatNumber>{isLoading.compensations ? "..." : stats.paid}</StatNumber>
            <StatLabel>Dossiers Payés</StatLabel>
          </SummaryStatCard>
        </ChartSummary>
      </ChartDashboard>

      <CompensationFilters
        isHidden={isHidden}
        setIsHidden={setIsHidden}
        filters={filters}
        setFilters={setFilters}
        isLoading={isLoading}
        handleFilterSubmit={handleFilterSubmit}
        handleResetFilters={handleResetFilters}
      />

      <CompensationCards
        compensations={compensationsData}
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

export default CompensationPage;