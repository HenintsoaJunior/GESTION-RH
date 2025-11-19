"use client";
import { useMemo } from 'react';
import { TrendingUp, Users, Calendar, PieChart } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

import {
  useGetOngoingMissionsCount as useGetOngoingMissionsCountMissions,
  useGetPlannedMissionsThisMonthCountWithDate,
  useGetProgressRate,
  useGetMissionTypesRate,
} from '@/api/mission/services'; 

import {
  useGetOngoingMissionsCount as useGetPendingValidationCount,
  useGetValidationRate,
} from '@/api/mission/validation/services'; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardData {
  missionsEnCours: number;
  missionsAValider: number;
  totalPrevision: number;
  previsionData: number[];
  avancementData: number[];
  validationData: number[];
  missionTypes: { label: string; value: number }[];
  plannedDate?: string;
  validationDate?: string;
  progressDate?: string;
}

const TableauBord = () => {
  // Appels aux hooks
  const ongoingMissionsQuery = useGetOngoingMissionsCountMissions();
  const pendingValidationQuery = useGetPendingValidationCount();
  const plannedMissionsChartQuery = useGetPlannedMissionsThisMonthCountWithDate();
  const progressRateQuery = useGetProgressRate();
  const missionTypesQuery = useGetMissionTypesRate();
  const validationRateQuery = useGetValidationRate();

  // État de chargement global
  const isLoading =
    ongoingMissionsQuery.isLoading ||
    pendingValidationQuery.isLoading ||
    plannedMissionsChartQuery.isLoading ||
    progressRateQuery.isLoading ||
    missionTypesQuery.isLoading ||
    validationRateQuery.isLoading;

  // Génération dynamique des dates pour le mois courant (7 dates espacées entre 10 et 16 environ)
  const dates = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const datesArray: string[] = [];
    const startDay = 10;
    for (let i = 0; i < 7; i++) {
      const day = startDay + i;
      const nextDate = new Date(year, month, day);
      // S'assurer de ne pas dépasser la fin du mois
      if (nextDate.getMonth() === month) {
        datesArray.push(nextDate.toISOString().split('T')[0]);
      } else {
        // Si on dépasse, utiliser le dernier jour
        const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];
        datesArray.push(lastDay);
      }
    }
    return datesArray;
  }, []);

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Calcul des données du dashboard à partir des résultats des queries
  const data: DashboardData = useMemo(() => {
    const missionsEnCours = ongoingMissionsQuery.data?.data ?? 0;
    const missionsAValider = pendingValidationQuery.data?.data ?? 0;
    const chartData = plannedMissionsChartQuery.data?.data;
    const totalPrevision = chartData?.count ?? 0;
    const plannedDateStr = chartData?.date ? new Date(chartData.date).toISOString().split('T')[0] : null;
    const progressInnerData = progressRateQuery.data?.data;
    let progressRate = 0;
    let progressDate: string | undefined;
    if (typeof progressInnerData === 'object' && progressInnerData !== null) {
      progressRate = (progressInnerData as { progressRate?: number; date?: string }).progressRate ?? 0;
      progressDate = (progressInnerData as { progressRate?: number; date?: string }).date;
    }
    const nationalRate = missionTypesQuery.data?.data?.nationalRate ?? 0;
    const internationalRate = missionTypesQuery.data?.data?.internationalRate ?? 0;
    const innerData = validationRateQuery.data?.data;
    let validationRate = 0;
    let validationDate: string | undefined;
    if (typeof innerData === 'object' && innerData !== null) {
      validationRate = (innerData as { rate?: number; date?: string }).rate ?? 0;
      validationDate = (innerData as { rate?: number; date?: string }).date;
    }

    // Remplissage des tableaux pour les graphiques avec les valeurs uniques (répétées pour matcher les dates)
    // Pour previsionData : placer le total sur la date la plus proche
    const previsionData = Array.from({ length: dates.length }, () => 0);
    let plannedDate: string | undefined;
    if (totalPrevision > 0 && plannedDateStr) {
      plannedDate = plannedDateStr;
      const plannedDay = new Date(plannedDateStr).getDate();
      let closestIndex = 0;
      let minDiff = Math.abs(new Date(dates[0]).getDate() - plannedDay);
      for (let j = 1; j < dates.length; j++) {
        const dateDay = new Date(dates[j]).getDate();
        const diff = Math.abs(dateDay - plannedDay);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = j;
        }
      }
      previsionData[closestIndex] = totalPrevision;
    }

    // Pour avancementData : placer la valeur sur la date la plus proche
    const avancementData = Array.from({ length: dates.length }, () => 0);
    if (progressRate > 0 && progressDate) {
      const progressDay = new Date(progressDate).getDate();
      let closestIndex = 0;
      let minDiff = Math.abs(new Date(dates[0]).getDate() - progressDay);
      for (let j = 1; j < dates.length; j++) {
        const dateDay = new Date(dates[j]).getDate();
        const diff = Math.abs(dateDay - progressDay);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = j;
        }
      }
      avancementData[closestIndex] = progressRate;
    }

    // Pour validationData : placer la valeur sur la date la plus proche
    const validationData = Array.from({ length: dates.length }, () => 0);
    if (validationRate > 0 && validationDate) {
      const validationDay = new Date(validationDate).getDate();
      let closestIndex = 0;
      let minDiff = Math.abs(new Date(dates[0]).getDate() - validationDay);
      for (let j = 1; j < dates.length; j++) {
        const dateDay = new Date(dates[j]).getDate();
        const diff = Math.abs(dateDay - validationDay);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = j;
        }
      }
      validationData[closestIndex] = validationRate;
    }

    return {
      missionsEnCours,
      missionsAValider,
      totalPrevision,
      previsionData,
      avancementData,
      validationData,
      plannedDate,
      validationDate,
      progressDate,
      missionTypes: [
        { label: 'Nationales', value: nationalRate },
        { label: 'Internationales', value: internationalRate },
      ],
    };
  }, [
    ongoingMissionsQuery.data,
    pendingValidationQuery.data,
    plannedMissionsChartQuery.data,
    progressRateQuery.data,
    missionTypesQuery.data,
    validationRateQuery.data,
    dates,
  ]);

  const performanceChartData = useMemo(() => ({
    labels: dates.map(date => formatDate(date)),
    datasets: [
      {
        label: 'Missions Prévues',
        data: data.previsionData,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.1,
        fill: false,
        borderWidth: 2,
      },
      {
        label: 'Taux d\'Avancement (%)',
        data: data.avancementData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.1,
        fill: false,
        borderWidth: 2,
        yAxisID: 'y1',
      },
      {
        label: 'Taux de Validation (%)',
        data: data.validationData,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.1,
        fill: false,
        borderWidth: 2,
        yAxisID: 'y1',
      },
    ],
  }), [data, dates]);

  const performanceChartOptions = useMemo(() => ({
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
          title: (context: TooltipItem<'line'>[]) => {
            const ctx = context[0];
            if (ctx.datasetIndex === 0 && (ctx.parsed.y ?? 0) > 0 && data.plannedDate) {
              return formatDate(data.plannedDate);
            }
            if (ctx.datasetIndex === 1 && (ctx.parsed.y ?? 0) > 0 && data.progressDate) {
              return formatDate(data.progressDate);
            }
            if (ctx.datasetIndex === 2 && (ctx.parsed.y ?? 0) > 0 && data.validationDate) {
              return formatDate(data.validationDate);
            }
            return ctx.label;
          },
          label: (context: TooltipItem<'line'>) => {
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
  }), [data]);

  const missionTypesChartData = useMemo(() => ({
    labels: data.missionTypes.map(item => item.label),
    datasets: [
      {
        label: 'Répartition des Missions',
        data: data.missionTypes.map(item => item.value),
        backgroundColor: [
          'rgba(124, 58, 237, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgba(124, 58, 237, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }), [data.missionTypes]);

  const missionTypesChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
      },
      tooltip: {
        backgroundColor: '#ffffff',
        padding: 8,
        titleColor: '#333',
        bodyColor: '#333',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        callbacks: {
          label: (tooltipItem: TooltipItem<'pie'>) => {
            const total = data.missionTypes.reduce((sum, item) => sum + item.value, 0);
            const percentage = total > 0 ? ((tooltipItem.parsed / total) * 100).toFixed(1) : '0';
            return `${tooltipItem.label}: ${formatNumber(Number(percentage))}%`;
          },
        },
      },
    },
  }), [data.missionTypes]);

  if (isLoading) {
    return <div>Chargement du tableau de bord...</div>;
  }

  return (
    <div style={{ 
      fontFamily: 'century-gothic, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
    }}>
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

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px',
          marginBottom: '32px',
        }}>
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
                  {formatNumber(data.missionsEnCours)}
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
                  {formatNumber(data.missionsAValider)}
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
                  {formatNumber(data.totalPrevision)}
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

        <div style={{
          height: '2px',
          background: 'linear-gradient(to right, #69b42e, transparent)',
          margin: '24px 0',
          width: 'calc(100% + 2 * 32px)',
          marginLeft: 'calc(-1 * 32px)',
          borderRadius: '1px',
          opacity: '0.6',
        }} />

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '24px',
          marginBottom: '24px',
          overflow: 'hidden',
        }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '3px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
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

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '3px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <PieChart size={20} color="#10b981" />
              </div>
              <h3 style={{ 
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#333',
                fontFamily: 'century-gothic, sans-serif',
              }}>
                Répartition des Types de Missions
              </h3>
            </div>
            <div style={{ height: '250px' }}>
              <Pie data={missionTypesChartData} options={missionTypesChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableauBord;