import { useNavigate } from 'react-router-dom';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTotalNotPaid } from '@/api/mission/compensation(indemnité)/services';
import { useTotalNotReimbursed } from '@/api/mission/expense_report/services';
import { usePrevisionForMonth } from '@/api/prevision/services';
import { useCurrencies } from '@/api/currency/services';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TresoPage = () => {
  const navigate = useNavigate();

  const { data: totalNotPaidData, isLoading: isTotalNotPaidLoading, error: totalNotPaidError } = useTotalNotPaid();
  const { data: totalNotReimbursedData, isLoading: isTotalNotReimbursedLoading, error: totalNotReimbursedError } = useTotalNotReimbursed();
  const { isLoading: isCurrenciesLoading, error: currenciesError } = useCurrencies();
  const { data: previsionMonthData, isLoading: isPrevisionLoading, error: previsionError } = usePrevisionForMonth();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Traitement des données de prévision pour le chart
  let chartLabels: string[] = [];
  let previsionChartDataPoints: number[] = [];
  
  if (previsionMonthData?.data && previsionMonthData.data.length > 0) {
    const groupedByDate = previsionMonthData.data.reduce((acc: Record<string, number>, item) => {
      const dateKey = item.departureDate.split('T')[0];
      acc[dateKey] = (acc[dateKey] || 0) + item.amount;
      return acc;
    }, {});
    const sortedDates = Object.keys(groupedByDate).sort();
    chartLabels = sortedDates.map(date => formatDate(date));
    previsionChartDataPoints = sortedDates.map(date => groupedByDate[date]);
  }

  // Chart data pour prévisions
  const previsionChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Prévisions',
        data: previsionChartDataPoints,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.1,
        fill: false,
        borderWidth: 2,
      },
    ],
  };

  const previsionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#ffffff',
        padding: 8,
        titleColor: '#333',
        bodyColor: '#333',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        callbacks: {
          label: (context: { parsed: { y: number | null } }) => {
            const value = context.parsed.y ?? 0;
            return formatCurrency(value);
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: (value: string | number) => formatCurrency(Number(value)),
          color: '#63666a',
          font: {
            size: 12,
            family: 'century-gothic, sans-serif',
            weight: 500 as const,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#63666a',
          font: {
            size: 12,
            family: 'century-gothic, sans-serif',
            weight: 500 as const,
          },
        },
      },
    },
  };

  // Gestion de l'état de chargement
  if (isTotalNotPaidLoading || isTotalNotReimbursedLoading || isPrevisionLoading || isCurrenciesLoading) {
    return (
      <div style={{ 
        fontFamily: 'century-gothic, sans-serif',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div>Chargement des données de trésorerie...</div>
      </div>
    );
  }

  // Gestion d'erreur
  const anyError = totalNotPaidError || totalNotReimbursedError || previsionError || currenciesError;
  if (anyError) {
    return (
      <div style={{ 
        fontFamily: 'century-gothic, sans-serif',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div>Erreur lors du chargement des données : {anyError.message}</div>
      </div>
    );
  }

  // Extraction des données après vérification du chargement
  const totalNotPaid = totalNotPaidData?.data?.totalNotPaidAmount ?? 0;
  const totalNotReimbursed = totalNotReimbursedData?.data?.totalNotReimbursedAmount ?? 0;
  const totalPrevision = previsionMonthData?.data?.reduce((sum, item) => sum + item.amount, 0) ?? 0;

  return (
    <div style={{ 
      fontFamily: 'century-gothic, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
    }}>
      {/* Content Area */}
      <div style={{
        background: '#ffffff',
        borderRadius: 0,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px',
        width: '100%',
        maxWidth: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        border: 'none',
        borderTop: '5px solid #e0e0e0',
        overflow: 'hidden',
        boxSizing: 'border-box',
        paddingLeft: '32px',
        paddingRight: '32px',
        paddingBottom: '16px',
        paddingTop: '12px',
      }}>
        {/* Description Header */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f0f9ff',
          borderLeft: '4px solid #0ea5e9',
          borderRadius: '4px',
        }}>
          <p style={{
            fontSize: '16px',
            color: '#0369a1',
            margin: 0,
            fontFamily: 'century-gothic, sans-serif',
            lineHeight: '1.5',
          }}>
            Cette page offre une vue d'ensemble sur la trésorerie de la plateforme. Elle permet de suivre les prévisions de dépenses, les montants en attente de paiement et les indicateurs financiers, facilitant ainsi le pilotage budgétaire et la prise de décision.
          </p>
        </div>

        {/* KPI Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px',
          marginBottom: '32px',
        }}>
          {/* Card 1 - Total Non Payé */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '3px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e0e0e0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#63666a', 
                  marginBottom: '4px',
                  fontFamily: 'century-gothic, sans-serif',
                }}>
                  Total Non Payé
                </p>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#333',
                  margin: 0,
                  fontFamily: 'century-gothic, sans-serif',
                }}>
                  {formatCurrency(totalNotPaid)}
                </h2>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '3px',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <TrendingUp size={24} color="#e4002b" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
              <span style={{ 
                fontSize: '12px', 
                color: '#e4002b',
                backgroundColor: '#fef2f2',
                padding: '4px 8px',
                borderRadius: '3px',
                fontWeight: '600',
                fontFamily: 'century-gothic, sans-serif',
              }}>
                En attente
              </span>
            </div>
            <button
              style={{
                width: '100%',
                padding: '8px 16px',
                backgroundColor: '#e4002b',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontFamily: 'century-gothic, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
              }}
              onClick={() => navigate('/treasury/compensation')}
            >
              Paiement
            </button>
          </div>

          {/* Card 2 - Total Non Remboursé */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '3px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e0e0e0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#63666a', 
                  marginBottom: '4px',
                  fontFamily: 'century-gothic, sans-serif',
                }}>
                  Total Non Remboursé
                </p>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#333',
                  margin: 0,
                  fontFamily: 'century-gothic, sans-serif',
                }}>
                  {formatCurrency(totalNotReimbursed)}
                </h2>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '3px',
                backgroundColor: '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <DollarSign size={24} color="#f59e0b" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
              <span style={{ 
                fontSize: '12px', 
                color: '#f59e0b',
                backgroundColor: '#fffbeb',
                padding: '4px 8px',
                borderRadius: '3px',
                fontWeight: '600',
                fontFamily: 'century-gothic, sans-serif',
              }}>
                À traiter
              </span>
            </div>
            <button
              style={{
                width: '100%',
                padding: '8px 16px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontFamily: 'century-gothic, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
              }}
              onClick={() => navigate('/treasury/remboursement')}
            >
              Remboursement
            </button>
          </div>

          {/* Card 3 - Total Prévisions */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '3px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e0e0e0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#63666a', 
                  marginBottom: '4px',
                  fontFamily: 'century-gothic, sans-serif',
                }}>
                  Total Prévisions
                </p>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#333',
                  margin: 0,
                  fontFamily: 'century-gothic, sans-serif',
                }}>
                  {formatCurrency(totalPrevision)}
                </h2>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '3px',
                backgroundColor: 'rgba(105, 180, 46, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Calendar size={24} color="#69b42e" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ 
                fontSize: '12px', 
                color: '#69b42e',
                backgroundColor: 'rgba(105, 180, 46, 0.1)',
                padding: '4px 8px',
                borderRadius: '3px',
                fontWeight: '600',
                fontFamily: 'century-gothic, sans-serif',
              }}>
                Ce mois
              </span>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div style={{
          height: '2px',
          background: 'linear-gradient(to right, #69b42e, transparent)',
          margin: '24px 0',
          width: 'calc(100% + 2 * 32px)',
          marginLeft: 'calc(-1 * 32px)',
          borderRadius: '1px',
          opacity: '0.6',
        }} />

        {/* Charts Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '24px',
          marginBottom: '24px',
        }}>
          {/* Line Chart - Prévisions */}
          {previsionMonthData?.data && previsionMonthData.data.length > 0 && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '3px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e0e0e0',
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#333',
                fontFamily: 'century-gothic, sans-serif',
              }}>
                Prévisions des Dépenses
              </h3>
              <div style={{ height: '300px' }}>
                <Line options={previsionChartOptions} data={previsionChartData} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TresoPage;