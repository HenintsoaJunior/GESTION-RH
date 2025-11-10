"use client";
import { TrendingUp, Users, Calendar } from 'lucide-react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TableauBord = () => {
  // Données de démonstration pour les dates communes (mises à jour pour novembre 2025)
  const dates = [
    '2025-11-01', '2025-11-05', '2025-11-08', '2025-11-15',
    '2025-11-20', '2025-11-25', '2025-11-30'
  ];

  // Données pour les prévisions (missions prévues) - total 5 missions prévues sur le mois
  const previsionData = [1, 1, 0, 1, 1, 1, 0];

  // Données pour l'avancement (%) - basé sur les missions en cours
  const avancementData = [60, 68, 75, 80, 78, 85, 82];

  // Données pour les indicateurs de performance (score composite 0-100%) - basé sur statuts (en cours, validé, etc.)
  const performanceData = [65, 70, 78, 82, 80, 88, 85];

  // KPIs ajustés pour 20 missions totales
  // Distribution exemple basée sur statuts : 10 en cours, 3 à valider (pending approval), 7 prévues/planifiées
  const missionsEnCours = 10; // "en cours" ou "en cours d'exécution"
  const missionsAValider = 3; // "Mission en cours de validation" ou "pending approval"
  const totalPrevision = previsionData.reduce((sum, item) => sum + item, 0); // 5 prévues

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Chart data unique pour indicateurs de performance (multi-lignes)
  const performanceChartData = {
    labels: dates.map(date => formatDate(date)),
    datasets: [
      {
        label: 'Missions Prévues',
        data: previsionData,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.1,
        fill: false,
        borderWidth: 2,
      },
      {
        label: 'Taux d\'Avancement (%)',
        data: avancementData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.1,
        fill: false,
        borderWidth: 2,
        yAxisID: 'y1',
      },
      {
        label: 'Score de Performance',
        data: performanceData,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.1,
        fill: false,
        borderWidth: 2,
        yAxisID: 'y1',
      },
    ],
  };

  const performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: '#ffffff',
        padding: 8,
        titleColor: '#333',
        bodyColor: '#333',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        callbacks: {
          label: (context: { datasetIndex: number; parsed: { y: number | null } }) => {
            const value = context.parsed.y ?? 0;
            if (context.datasetIndex === 0) {
              return `${formatNumber(value)} missions`;
            } else {
              return `${value.toFixed(1)}%`;
            }
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
          color: '#63666a',
          font: {
            size: 12,
            family: 'century-gothic, sans-serif',
            weight: 500 as const,
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: (value: string | number) => `${Number(value)}%`,
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
            Cette fonctionnalité offre une vue d’ensemble sur les activités de la plateforme. Elle permet de suivre les statistiques clés, l’état d’avancement des missions et les indicateurs de performance, facilitant ainsi le pilotage global et la prise de décision.
          </p>
        </div>

        {/* KPI Cards - Ajustés pour 20 missions totales */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px',
          marginBottom: '32px',
        }}>
          {/* Card 1 */}
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
                  Missions en Cours
                </p>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#333',
                  margin: 0,
                  fontFamily: 'century-gothic, sans-serif',
                }}>
                  {formatNumber(missionsEnCours)}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ 
                fontSize: '12px', 
                color: '#e4002b',
                backgroundColor: '#fef2f2',
                padding: '4px 8px',
                borderRadius: '3px',
                fontWeight: '600',
                fontFamily: 'century-gothic, sans-serif',
              }}>
                Actives
              </span>
            </div>
          </div>

          {/* Card 2 - Changée en Missions À Valider */}
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
                  Missions À Valider
                </p>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#333',
                  margin: 0,
                  fontFamily: 'century-gothic, sans-serif',
                }}>
                  {formatNumber(missionsAValider)}
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
                <Users size={24} color="#f59e0b" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ 
                fontSize: '12px', 
                color: '#f59e0b',
                backgroundColor: '#fffbeb',
                padding: '4px 8px',
                borderRadius: '3px',
                fontWeight: '600',
                fontFamily: 'century-gothic, sans-serif',
              }}>
                En attente
              </span>
            </div>
          </div>

          {/* Card 3 */}
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
                  Total Missions Prévues
                </p>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#333',
                  margin: 0,
                  fontFamily: 'century-gothic, sans-serif',
                }}>
                  {formatNumber(totalPrevision)}
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

        {/* Charts Section - Une seule line chart pour indicateurs de performance */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '24px',
          marginBottom: '24px',
        }}>
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
              Indicateurs de Performance
            </h3>
            <div style={{ height: '400px' }}>
              <Line options={performanceChartOptions} data={performanceChartData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableauBord;