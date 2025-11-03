"use client";
import React from 'react';
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  ContentArea,
} from "@/styles/detailsmission-styles";
import { Line, Doughnut } from 'react-chartjs-2';
import { usePrevision } from '@/api/prevision/services'; 
import { useTotalNotPaid } from '@/api/compensation/national/services';
import { useTotalNotReimbursed } from '@/api/mission/expense/services';
import { formatDate } from '@/utils/date-converter'; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TresoPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: previsionData, isLoading: previsionLoading, error: previsionError } = usePrevision();
  const { data: notPaidData, isLoading: notPaidLoading, error: notPaidError } = useTotalNotPaid();
  const { data: notReimbursedData, isLoading: notReimbursedLoading, error: notReimbursedError } = useTotalNotReimbursed();

  const isLoading = previsionLoading || notPaidLoading || notReimbursedLoading;
  const error = previsionError || notPaidError || notReimbursedError;

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur : {error.message}</div>;
  }

  if (!previsionData?.data || previsionData.data.length === 0) {
    return <div>Aucune donnée de prévision disponible.</div>;
  }

  // Sort data by departureDate and prepare labels and values for prevision line chart
  const sortedData = previsionData.data
    .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());

  const labels = sortedData.map(item => formatDate(item.departureDate));
  const amounts = sortedData.map(item => item.amount);

  const previsionOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Prévisions des Prix Chaque Jour',
      },
    },
  };

  const previsionChartData = {
    labels,
    datasets: [
      {
        label: 'Montant',
        data: amounts,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  // Doughnut chart data
  const totalNotPaid = notPaidData?.data?.totalNotPaidAmount || 0;
  const totalNotReimbursed = notReimbursedData?.data?.totalNotReimbursedAmount || 0;

  const doughnutData = {
    labels: ['Non Payé', 'Non Remboursé'],
    datasets: [
      {
        data: [totalNotPaid, totalNotReimbursed],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Total Non Payé vs Non Remboursé',
      },
    },
  };

  const tabStyle = {
    padding: 'var(--spacing-lg) var(--spacing-2xl)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-color)',
    cursor: 'pointer',
    margin: `0 var(--spacing-sm)`,
    borderRadius: 'var(--border-radius-sm)',
    transition: 'var(--transition-speed) ease-in-out',
    fontSize: 'var(--font-size-md)',
    fontFamily: 'var(--font-family)',
    fontWeight: 'var(--font-weight-medium)',
  };

  const chartsContainerStyle = {
    display: 'flex',
    width: '100%',
    gap: 'var(--spacing-2xl)',
    padding: 'var(--spacing-2xl)',
  };

  const doughnutChartContainerStyle = {
    flex: 1,
    height: '320px',
  };

  const lineChartContainerStyle = {
    flex: 1,
    height: '400px',
  };

  const tabsContainerStyle = {
    padding: `0 var(--spacing-2xl) var(--spacing-2xl)`,
  };

  const tabsButtonsStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 'var(--spacing-2xl)',
    gap: 'var(--spacing-sm)',
  };

  const handleIndemniteClick = () => {
    navigate('/treasury/compensation');
  };

  const handleNotesClick = () => {
    navigate('/treso/notes-de-frais');
  };

  return (
    <ContentArea>
      <div style={chartsContainerStyle}>
        <div style={doughnutChartContainerStyle}>
          <Doughnut options={doughnutOptions} data={doughnutData} />
        </div>
        <div style={lineChartContainerStyle}>
          <Line options={previsionOptions} data={previsionChartData} />
        </div>
      </div>
      <div style={tabsContainerStyle}>
        <div style={tabsButtonsStyle}>
          <button
            style={tabStyle}
            onClick={handleIndemniteClick}
          >
            INDEMNITÉ
          </button>
          <button
            style={tabStyle}
            onClick={handleNotesClick}
          >
            NOTE DE FRAIS
          </button>
        </div>
      </div>
    </ContentArea>
  );
};

export default TresoPage;