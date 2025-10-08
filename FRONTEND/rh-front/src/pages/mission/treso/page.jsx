"use client";

import { useState, useEffect } from "react";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js"; 
import { Bar, Line } from "react-chartjs-2";
import {
  DashboardContainer,
  TableHeader,
  TableTitle,
  StatNumber,
  StatLabel,
} from "styles/generaliser/table-container";
import styled from "styled-components";
import { GetTotalPaidAmount, GetTotalNotPaidAmount } from "services/mission/compensation";
import { GetTotalReimbursedAmount, GetTotalNotReimbursedAmount } from "services/mission/expense";
import CompensationPage from "./components/compensation";
import ExpenseReportPage from "./components/expense-report-page";

// Formatage du nombre sans symbole ni devise
const formatNumber = (num) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(num);

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Styles
const PageWrapper = styled.div`
  background: var(--bg-secondary);
  min-height: 100vh;
  padding: 30px 20px;
`;

const ChartDashboard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 30px;
  background: var(--bg-primary);
  border: 1px solid #e0e0e0;
  margin-bottom: 20px;

  @media (max-width: 900px) {
    padding: 20px;
  }
`;

const ChartSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;

  @media (max-width: 900px) {
    gap: 25px;
  }
`;

const ChartRow = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const ChartWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  height: 300px;
  padding: 10px;
  overflow: hidden;
  flex: 1;
  
  @media (max-width: 900px) {
    height: 280px;
  }

  canvas {
    max-height: 100% !important;
  }
`;

const TrendChartWrapper = styled(ChartWrapper)`
  position: sticky;
  top: 20px;
  z-index: 10;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 20px;
  border: 1px solid #e0e0e0;
`;

const ChartSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryStatCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: var(--bg-tertiary);
  border: 1px solid #e0e0e0;
  border-left: 5px solid ${props => props.color || '#0052cc'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-light);
    transform: translateY(-2px);
  }

  ${StatNumber} {
    font-size: 2rem;
    font-weight: 700;
    color: ${props => props.color || '#003087'};
    margin-bottom: 4px;
    transition: color 0.2s ease;
  }

  ${StatLabel} {
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 0.9rem;
    text-align: center;
  }
`;

const NavigationButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  padding-top: 10px;
`;

const NavigationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  border: 2px solid transparent;
  background: var(--primary-color);
  color: var(--text-white);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--primary-hover);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus {
    outline: none;
    border-color: var(--primary-dark);
  }

  &.secondary {
    background: var(--bg-primary);
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
    
    &:hover {
      background: var(--primary-transparent);
      color: var(--primary-dark);
      border-color: var(--primary-dark);
    }
    
    &:active {
      transform: translateY(1px);
    }
  }

  span {
    font-size: 1.1rem;
  }
`;

const CompensationStatusChart = ({ totalPaidAmount, totalNotPaidAmount, totalReimbursedAmount, totalNotReimbursedAmount, isLoading }) => {
  if (isLoading) return <p style={{ textAlign: 'center', color: '#666666' }}>Chargement du graphique...</p>;

  // Hard-coded colors
  const PAID_COLOR = "#00e676";
  const NOT_PAID_COLOR = "#ef5350";
  const REIMBURSED_COLOR = "#00bfa5";
  const NOT_REIMBURSED_COLOR = "#ffb300";

  const PAID_HOVER = "#00e676";
  const NOT_PAID_HOVER = "#d32f2f";
  const REIMBURSED_HOVER = "#00bfa5";
  const NOT_REIMBURSED_HOVER = "#ffb300";

  const data = {
    labels: ['Montants'],
    datasets: [
      {
        label: 'Indemnités Payées',
        data: [totalPaidAmount || 0],
        backgroundColor: PAID_COLOR,
        hoverBackgroundColor: PAID_HOVER,
        borderColor: 'transparent',
        borderWidth: 0,
      },
      {
        label: 'Indemnités Non Payées',
        data: [totalNotPaidAmount || 0],
        backgroundColor: NOT_PAID_COLOR,
        hoverBackgroundColor: NOT_PAID_HOVER,
        borderColor: 'transparent',
        borderWidth: 0,
      },
      {
        label: 'Remboursements Effectués',
        data: [totalReimbursedAmount || 0],
        backgroundColor: REIMBURSED_COLOR,
        hoverBackgroundColor: REIMBURSED_HOVER,
        borderColor: 'transparent',
        borderWidth: 0,
      },
      {
        label: 'Remboursements Non Effectués',
        data: [totalNotReimbursedAmount || 0],
        backgroundColor: NOT_REIMBURSED_COLOR,
        hoverBackgroundColor: NOT_REIMBURSED_HOVER,
        borderColor: 'transparent',
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 18,
          font: { size: 13, weight: '500' },
          color: '#666666',
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = tooltipItem.dataset.label || '';
            const value = tooltipItem.raw;
            return `${label}: ${formatNumber(value)}`;
          },
        },
        backgroundColor: '#ffffff',
        titleColor: '#1a1a1a',
        bodyColor: '#1a1a1a',
        padding: 12,
        cornerRadius: 0,
        borderColor: '#cccccc',
        borderWidth: 1,
      },
      title: {
        display: true,
        text: 'Répartition des Montants',
        font: { size: 18, weight: '700' },
        color: '#1a1a1a',
        padding: { bottom: 20 },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false,
        },
        ticks: {
          color: '#666666',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#e0e0e0',
        },
        ticks: {
          color: '#666666',
          callback: function (value) {
            return formatNumber(value);
          },
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

const TrendChart = ({ isLoading }) => {
  const mockMonths = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
  const mockIndemnities = [2000, 2500, 3000, 2800, 3200, 3500];
  const mockExpenses = [1500, 1800, 2200, 2000, 2400, 2600];

  if (isLoading) return <p style={{ textAlign: 'center', color: '#666666' }}>Chargement du graphique...</p>;

  const data = {
    labels: mockMonths,
    datasets: [
      {
        label: 'Indemnités',
        data: mockIndemnities,
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#00ff88',
        pointBorderColor: '#00ff88',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
      {
        label: 'Notes de Frais',
        data: mockExpenses,
        borderColor: '#ff4757',
        backgroundColor: 'rgba(255, 71, 87, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ff4757',
        pointBorderColor: '#ff4757',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    backgroundColor: 'transparent',
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 18,
          font: { size: 13, weight: '500' },
          color: '#1a1a1a',
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = tooltipItem.dataset.label || '';
            const value = tooltipItem.raw;
            return `${label}: ${formatNumber(value)} €`;
          },
        },
        backgroundColor: '#ffffff',
        titleColor: '#1a1a1a',
        bodyColor: '#1a1a1a',
        padding: 12,
        cornerRadius: 0,
        borderColor: '#e0e0e0',
        borderWidth: 1,
      },
      title: {
        display: true,
        text: 'Tendance Mensuelle (Exemple)',
        font: { size: 18, weight: '700' },
        color: '#1a1a1a',
        padding: { bottom: 20 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#e0e0e0',
          lineWidth: 1,
        },
        ticks: {
          color: '#666666',
          callback: function (value) {
            return formatNumber(value);
          },
        },
        border: {
          color: '#1a1a1a',
          width: 1,
        },
      },
      x: {
        grid: {
          color: '#e0e0e0',
          lineWidth: 1,
        },
        ticks: {
          color: '#666666',
        },
        border: {
          color: '#1a1a1a',
          width: 1,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

const TresoPage = () => {
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [totalNotPaidAmount, setTotalNotPaidAmount] = useState(0);
  const [totalReimbursedAmount, setTotalReimbursedAmount] = useState(0);
  const [totalNotReimbursedAmount, setTotalNotReimbursedAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const fetchTotalPaidAmount = GetTotalPaidAmount();
  const fetchTotalNotPaidAmount = GetTotalNotPaidAmount();
  
  const fetchTotalReimbursedAmount = GetTotalReimbursedAmount();
  const fetchTotalNotReimbursedAmount = GetTotalNotReimbursedAmount();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [paidAmount, notPaidAmount, reimbursedAmount, notReimbursedAmount] = await Promise.all([
          fetchTotalPaidAmount(),
          fetchTotalNotPaidAmount(),
          fetchTotalReimbursedAmount(),
          fetchTotalNotReimbursedAmount(),
        ]);

        
        setTotalPaidAmount(paidAmount || 0);
        setTotalNotPaidAmount(notPaidAmount || 0);
        setTotalReimbursedAmount(reimbursedAmount || 0);
        setTotalNotReimbursedAmount(notReimbursedAmount || 0);
      } catch (error) {
        console.error("Failed to fetch amounts:", error);
        setTotalPaidAmount(0);
        setTotalNotPaidAmount(0);
        setTotalReimbursedAmount(0);
        setTotalNotReimbursedAmount(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [fetchTotalPaidAmount, fetchTotalNotPaidAmount, fetchTotalReimbursedAmount, fetchTotalNotReimbursedAmount]);

  if (currentPage === "compensation") {
    return <CompensationPage setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === "expense") {
    return <ExpenseReportPage setCurrentPage={setCurrentPage} />;
  }

  return (
    <PageWrapper>
      <DashboardContainer>
        <TableHeader>
          <TableTitle>Tableau de Bord Trésorerie 💰</TableTitle>
        </TableHeader>

        <ChartDashboard>
          <ChartSection>
            <ChartSummary>
              <SummaryStatCard 
                color="#00c853"
                onClick={() => setCurrentPage("compensation")}
                title="Cliquez pour voir les détails des indemnités payées"
              >
                <StatNumber>{isLoading ? "..." : formatNumber(totalPaidAmount)}</StatNumber>
                <StatLabel>Indemnités Payées</StatLabel>
              </SummaryStatCard>

              <SummaryStatCard 
                color="#ef5350"
                onClick={() => setCurrentPage("compensation")}
                title="Cliquez pour voir les détails des indemnités non payées"
              >
                <StatNumber>{isLoading ? "..." : formatNumber(totalNotPaidAmount)}</StatNumber>
                <StatLabel>Indemnités Non Payées</StatLabel>
              </SummaryStatCard>

              <SummaryStatCard 
                color="#0288d1"
                onClick={() => setCurrentPage("expense")}
                title="Cliquez pour voir les détails des remboursements effectués"
              >
                <StatNumber>{isLoading ? "..." : formatNumber(totalReimbursedAmount)}</StatNumber>
                <StatLabel>Remboursements Effectués</StatLabel>
              </SummaryStatCard>

              <SummaryStatCard 
                color="#ffca28"
                onClick={() => setCurrentPage("expense")}
                title="Cliquez pour voir les détails des remboursements non effectués"
              >
                <StatNumber>{isLoading ? "..." : formatNumber(totalNotReimbursedAmount)}</StatNumber>
                <StatLabel>Remboursements Non Effectués</StatLabel>
              </SummaryStatCard>
            </ChartSummary>

            <ChartRow>
              <ChartWrapper>
                <CompensationStatusChart
                  totalPaidAmount={totalPaidAmount}
                  totalNotPaidAmount={totalNotPaidAmount}
                  totalReimbursedAmount={totalReimbursedAmount}
                  totalNotReimbursedAmount={totalNotReimbursedAmount}
                  isLoading={isLoading}
                />
              </ChartWrapper>

              <TrendChartWrapper>
                <TrendChart isLoading={isLoading} />
              </TrendChartWrapper>
            </ChartRow>
          </ChartSection>

          <NavigationButtonGroup>
            <NavigationButton onClick={() => setCurrentPage("compensation")}>
              <span>📋</span> Gérer les Indemnités
            </NavigationButton>
            <NavigationButton className="secondary" onClick={() => setCurrentPage("expense")}>
              <span>🧾</span> Gérer les Notes de Frais
            </NavigationButton>
          </NavigationButtonGroup>
        </ChartDashboard>
      </DashboardContainer>
    </PageWrapper>
  );
};

export default TresoPage;