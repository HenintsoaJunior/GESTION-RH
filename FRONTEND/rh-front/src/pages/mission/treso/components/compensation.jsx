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

const formatNumber = (num) => new Intl.NumberFormat('fr-FR').format(num);

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
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-left: 1px solid #dee2e6;
  min-width: 450px;

  @media (max-width: 900px) {
    min-width: unset;
    grid-template-columns: 1fr 1fr 1fr;
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
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 600;
  border: 2px solid #e2e8f0;
  background: #f8f9fa;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: #ffffff;
    color: #0f172a;
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }

  span {
    font-size: 1.3rem;
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
          <SummaryStatCard className="total">
            <StatNumber>{isLoading.stats ? "..." : formatNumber(stats.totalAmount)},00</StatNumber>
            <StatLabel>Montant Total</StatLabel>
          </SummaryStatCard>

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