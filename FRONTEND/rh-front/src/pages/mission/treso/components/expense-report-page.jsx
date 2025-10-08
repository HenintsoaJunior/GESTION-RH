"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import styled from "styled-components";
import useExpenseReportData from "../hooks/use-expense-report-data";
import ExpenseReportCards from "./expense-report-cards";
import ExpenseReportFilters from "./expense-report-filters";
import ExpenseReportModals from "./expense-report-modals";
import {
  DashboardContainer,
  TableHeader,
  TableTitle,
  StatNumber,
  StatLabel,
} from "styles/generaliser/table-container";
import { GetTotalReimbursedCount, GetTotalNotReimbursedCount } from "services/mission/expense";
import { useState, useEffect, useCallback } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

const formatNumber = (num) => new Intl.NumberFormat('fr-FR').format(num);

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
  &.pending {
    background: #f8d7da;
  }
  &.reimbursed {
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

const ExpenseReportStatusChart = ({ reimbursedCount, notReimbursedCount, isLoading }) => {
  if (isLoading) return <p>Chargement du graphique...</p>;

  const totalCount = (reimbursedCount || 0) + (notReimbursedCount || 0);
  const hasData = totalCount > 0;

  const data = {
    labels: [`En attente: ${notReimbursedCount}`, `Remboursé: ${reimbursedCount}`],
    datasets: [
      {
        data: [notReimbursedCount, reimbursedCount],
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
            const value = tooltipItem.raw || 0;
            const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total ? ((value / total) * 100).toFixed(1) + "%" : "0%";
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

  return hasData ? <Doughnut data={data} options={options} /> : <p>Aucune donnée à afficher</p>;
};

const ExpenseReportPage = ({ setCurrentPage }) => {
  const {
    expenseReportsData,
    filters,
    setFilters,
    appliedFilters,
    isLoading,
    alert,
    setAlert,
    selectedAssignationId,
    showDetailsExpenseReport,
    setShowDetailsExpenseReport,
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
  } = useExpenseReportData();

  const [reimbursedCount, setReimbursedCount] = useState(0);
  const [notReimbursedCount, setNotReimbursedCount] = useState(0);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  const getTotalReimbursedCount = GetTotalReimbursedCount();
  const getTotalNotReimbursedCount = GetTotalNotReimbursedCount();

  const fetchCounts = useCallback(async () => {
    setIsLoadingCounts(true);
    try {
      const [reimbursed, notReimbursed] = await Promise.all([
        getTotalReimbursedCount(),
        getTotalNotReimbursedCount(),
      ]);
      setReimbursedCount(reimbursed || 0);
      setNotReimbursedCount(notReimbursed || 0);
    } catch (err) {
      console.error("Error fetching counts:", err);
      setAlert?.({
        isOpen: true,
        type: "error",
        message: err?.message || "Erreur lors de la récupération des compteurs de rapports.",
      });
      setReimbursedCount(0);
      setNotReimbursedCount(0);
    } finally {
      setIsLoadingCounts(false);
    }
  }, [getTotalReimbursedCount, getTotalNotReimbursedCount, setAlert]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return (
    <DashboardContainer>
      <TableHeader>
        <TableTitle>Tableau de Bord des Rapports de Frais</TableTitle>
        <BackButton onClick={() => setCurrentPage("dashboard")}>
          <span>←</span> Retour au Tableau de Bord
        </BackButton>
      </TableHeader>

      <ChartDashboard>
        <ChartWrapper>
          <ExpenseReportStatusChart
            reimbursedCount={reimbursedCount}
            notReimbursedCount={notReimbursedCount}
            isLoading={isLoadingCounts}
          />
        </ChartWrapper>
        
        <ChartSummary>
          <SummaryStatCard className="pending">
            <StatNumber>{isLoadingCounts ? "..." : formatNumber(notReimbursedCount)}</StatNumber>
            <StatLabel>Rapports En Attente</StatLabel>
          </SummaryStatCard>

          <SummaryStatCard className="reimbursed">
            <StatNumber>{isLoadingCounts ? "..." : formatNumber(reimbursedCount)}</StatNumber>
            <StatLabel>Rapports Remboursés</StatLabel>
          </SummaryStatCard>
        </ChartSummary>
      </ChartDashboard>

      <ExpenseReportFilters
        isHidden={isHidden}
        setIsHidden={setIsHidden}
        filters={filters}
        setFilters={setFilters}
        isLoading={isLoading}
        handleFilterSubmit={handleFilterSubmit}
        handleResetFilters={handleResetFilters}
      />

      <ExpenseReportCards
        expenseReports={expenseReportsData}
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

      <ExpenseReportModals
        alert={alert}
        setAlert={setAlert}
        showDetailsExpenseReport={showDetailsExpenseReport}
        setShowDetailsExpenseReport={setShowDetailsExpenseReport}
        selectedAssignationId={selectedAssignationId}
        formatDate={formatDate}
      />
    </DashboardContainer>
  );
};

export default ExpenseReportPage;