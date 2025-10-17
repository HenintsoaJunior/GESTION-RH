/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ArrowLeft, Download } from "lucide-react";
import {
    DetailSection,
    SectionTitle,
    InfoGrid,
    InfoItem,
    InfoLabel,
    InfoValue,
    IndemnityTable,
    TableHeader,
    TableCell,
    TotalRow,
    ActionButton,
} from "@/styles/detailsmission-styles";
import { NoDataMessage } from "@/styles/table-styles";
import { formatNumber } from "@/utils/format";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import type {
    ChartData,
    ChartOptions,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import styled from "styled-components";

// Enregistrement des éléments Chart.js nécessaires
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Define styled-components outside the component
const ChartGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
`;

const ChartCard = styled.div`
    padding: 20px;
    background: var(--bg-primary, #ffffff);
    border: 1px solid var(--border-light, #dee2e6);
    min-height: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;

    h4 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 1.1rem;
        color: var(--text-color-primary, #333);
        text-align: center;
    }

    .chart-content {
        width: 100%;
        max-width: 300px;
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }
`;

interface CompensationScale {
    amount: number;
    expenseType?: {
        type: string;
    };
    transportId?: string;
}

interface DailyPaiement {
    date: string;
    totalAmount: number;
    compensationScales: CompensationScale[];
}

interface AssignmentDetails {
    beneficiary: string;
    matricule: string;
    missionTitle: string;
    function: string;
    base: string;
    meansOfTransport: string;
    direction: string;
    departmentService: string;
    costCenter: number;
    departureDate: string;
    departureTime: string;
    missionDuration: number;
    returnDate: string;
    returnTime: string;
    startDate: string;
}

interface MissionPayment {
    dailyPaiements: DailyPaiement[];
    assignmentDetails: AssignmentDetails;
    totalAmount: number;
}

interface IndemnityDetail {
    date: string;
    breakfast: number;
    lunch: number;
    dinner: number;
    accommodation: number;
    transport: number;
    total: number;
}

interface IsLoading {
    exportExcel: boolean;
    // Add other loading states if needed
}

interface OMPaymentProps {
    missionPayment: MissionPayment;
    selectedAssignmentId: string;
    onBack: () => void;
    onExportPDF?: (employeeId: string) => void;
    onExportExcel: () => void;
    isLoading: IsLoading;
    formatDate: (date: string) => string;
}

const createTooltipCallback = (
    unit: string = ",00 "
) => {
    return {
        callbacks: {
            label: function (tooltipItem: any) {
                const label = tooltipItem.label || "";
                const value = tooltipItem.raw as number;
                return `${label}: ${formatNumber(value)}${unit} MGA`;
            },
        },
    };
};

const IndemnityDoughnutChart: React.FC<{ indemnityDetails: IndemnityDetail[] }> = ({ indemnityDetails }) => {
    const totalTransport = indemnityDetails.reduce((sum, item) => sum + (item.transport || 0), 0);
    const totalRepas = indemnityDetails.reduce(
        (sum, item) => sum + (item.breakfast || 0) + (item.lunch || 0) + (item.dinner || 0),
        0
    );
    const totalHebergement = indemnityDetails.reduce((sum, item) => sum + (item.accommodation || 0), 0);

    const data: number[] = [totalTransport, totalRepas, totalHebergement];
    const hasData = data.some(val => val > 0);

    if (!hasData) return <p>Données insuffisantes.</p>;

    const chartData: ChartData<'doughnut'> = {
        labels: ["Transport", "Repas", "Hébergement"],
        datasets: [
            {
                data: data,
                backgroundColor: ["#007bff", "#28a745", "#ffc107"],
                hoverBackgroundColor: ["#0056b3", "#1e7e34", "#d39e00"],
                borderColor: ["#ffffff"],
                borderWidth: 2,
            },
        ],
    };

    const options: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right" as const,
                labels: { boxWidth: 10, padding: 10 },
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem: any) {
                        const label = tooltipItem.label || "";
                        const value = tooltipItem.raw as number;
                        const total = tooltipItem.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1) + "%";
                        return `${label}: ${formatNumber(value)},00 MGA (${percentage})`;
                    },
                },
            },
        },
        cutout: "70%",
    };

    return (
        <ChartCard>
            <h4>Répartition Globale des Coûts</h4>
            <div className="chart-content">
                <Doughnut data={chartData} options={options} />
            </div>
        </ChartCard>
    );
};

const DailyIndemnityBarChart: React.FC<{ indemnityDetails: IndemnityDetail[]; formatDate: (date: string) => string }> = ({ indemnityDetails, formatDate }) => {
    const dailyTotals = indemnityDetails.map(item => ({
        date: formatDate(item.date),
        amount: item.total || 0,
    }));

    const hasData = dailyTotals.some(item => item.amount > 0);
    if (!hasData) return <p>Données journalières insuffisantes.</p>;

    const chartData: ChartData<'bar'> = {
        labels: dailyTotals.map(item => item.date),
        datasets: [
            {
                label: "Montant par jour",
                data: dailyTotals.map(item => item.amount),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: createTooltipCallback(" MGA"),
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Montant Total (MGA)' },
                ticks: {
                    callback: function (value: number | string) {
                        return formatNumber(Number(value));
                    },
                },
            },
            x: {
                title: { display: true, text: 'Date' },
            },
        },
    };

    return (
        <ChartCard>
            <h4>Indemnité Totale par Jour</h4>
            <div className="chart-content">
                <Bar data={chartData} options={options} />
            </div>
        </ChartCard>
    );
};

const OMPayment: React.FC<OMPaymentProps> = ({ missionPayment, selectedAssignmentId, onBack, onExportExcel, isLoading, formatDate }) => {
    const indemnityDetails: IndemnityDetail[] = missionPayment.dailyPaiements.map((item: DailyPaiement) => {
        const amounts = {
            breakfast: 0,
            lunch: 0,
            dinner: 0,
            accommodation: 0,
            transport: 0,
        };

        item.compensationScales.forEach((scale: CompensationScale) => {
            const amount = scale.amount || 0;
            if (scale.expenseType?.type === "Petit Déjeuner") amounts.breakfast += amount;
            else if (scale.expenseType?.type === "Déjeuner") amounts.lunch += amount;
            else if (scale.expenseType?.type === "Dîner") amounts.dinner += amount;
            else if (scale.expenseType?.type === "Hébergement") amounts.accommodation += amount;
            else if (scale.transportId) amounts.transport += amount;
        });

        const total = amounts.breakfast + amounts.lunch + amounts.dinner + amounts.accommodation + amounts.transport;

        return {
            date: item.date,
            breakfast: amounts.breakfast,
            lunch: amounts.lunch,
            dinner: amounts.dinner,
            accommodation: amounts.accommodation,
            transport: amounts.transport,
            total,
        };
    });

    const grandTotal = indemnityDetails.reduce((sum, item) => sum + item.total, 0);

    return (
        <>
            <div className="page-header">
                <div className="header-left">
                    <button onClick={onBack} className="btn-back" title="Retour aux assignations">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="header-title-section">
                        <h1 className="page-title">Détails du Paiement</h1>
                        <p className="page-subtitle">Mission #{selectedAssignmentId}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <ActionButton
                        onClick={onExportExcel}
                        disabled={isLoading.exportExcel}
                    >
                        <Download size={16} /> Excel
                    </ActionButton>
                </div>
            </div>

            {missionPayment.assignmentDetails ? (
                <>
                    <SectionTitle>Analyse Visuelle des Montants</SectionTitle>
                    <DetailSection>
                        <ChartGrid>
                            <IndemnityDoughnutChart indemnityDetails={indemnityDetails} />
                            <DailyIndemnityBarChart indemnityDetails={indemnityDetails} formatDate={formatDate} />
                        </ChartGrid>
                    </DetailSection>

                    <SectionTitle>Informations Générales</SectionTitle>
                    <DetailSection>
                        <InfoGrid>
                            {[
                                { label: "Collaborateur", value: missionPayment.assignmentDetails.beneficiary },
                                { label: "Matricule", value: missionPayment.assignmentDetails.matricule },
                                { label: "Mission", value: missionPayment.assignmentDetails.missionTitle },
                                { label: "Fonction", value: missionPayment.assignmentDetails.function },
                                { label: "Site", value: missionPayment.assignmentDetails.base },
                                { label: "Moyen de transport", value: missionPayment.assignmentDetails.meansOfTransport },
                                { label: "Direction", value: missionPayment.assignmentDetails.direction },
                                { label: "Département/Service", value: missionPayment.assignmentDetails.departmentService },
                                { label: "Centre de coût", value: missionPayment.assignmentDetails.costCenter },
                                { label: "Date de départ", value: formatDate(missionPayment.assignmentDetails.departureDate) },
                                { label: "Heure de départ", value: missionPayment.assignmentDetails.departureTime },
                                { label: "Durée de la mission", value: `${missionPayment.assignmentDetails.missionDuration} jours` },
                                { label: "Date de retour", value: formatDate(missionPayment.assignmentDetails.returnDate) },
                                { label: "Heure de retour", value: missionPayment.assignmentDetails.returnTime },
                                { label: "Date debut mission", value: formatDate(missionPayment.assignmentDetails.startDate) },
                            ].map((item, index) => (
                                <InfoItem key={index}>
                                    <InfoLabel>{item.label}</InfoLabel>
                                    <InfoValue>{item.value}</InfoValue>
                                </InfoItem>
                            ))}
                        </InfoGrid>
                    </DetailSection>

                    <SectionTitle>Régularisation des Indemnités de Mission</SectionTitle>
                    <IndemnityTable>
                        <thead>
                            <tr>
                                <TableHeader>Date</TableHeader>
                                <TableHeader>Transport</TableHeader>
                                <TableHeader>Petit Déjeuner</TableHeader>
                                <TableHeader>Déjeuner</TableHeader>
                                <TableHeader>Dîner</TableHeader>
                                <TableHeader>Hébergement</TableHeader>
                                <TableHeader>Montant Total</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {indemnityDetails.map((item, index) => (
                                <tr key={index}>
                                    <TableCell>
                                        {item.date
                                            ? new Date(item.date).toLocaleDateString("fr-FR", {
                                                  day: "numeric",
                                                  month: "short",
                                                  year: "2-digit",
                                              })
                                            : ""}
                                    </TableCell>
                                    <TableCell>{item.transport ? `${formatNumber(item.transport)},00` : ""}</TableCell>
                                    <TableCell>{item.breakfast ? `${formatNumber(item.breakfast)},00` : ""}</TableCell>
                                    <TableCell>{item.lunch ? `${formatNumber(item.lunch)},00` : ""}</TableCell>
                                    <TableCell>{item.dinner ? `${formatNumber(item.dinner)},00` : ""}</TableCell>
                                    <TableCell>{item.accommodation ? `${formatNumber(item.accommodation)},00` : ""}</TableCell>
                                    <TableCell>{item.total ? `${formatNumber(item.total)},00` : ""}</TableCell>
                                </tr>
                            ))}
                            <TotalRow>
                                <TableCell colSpan={6}>Total</TableCell>
                                <TableCell><strong>{formatNumber(grandTotal)},00</strong></TableCell>
                            </TotalRow>
                        </tbody>
                    </IndemnityTable>
                </>
            ) : (
                <NoDataMessage>Aucune donnée trouvée pour cette assignation.</NoDataMessage>
            )}
        </>
    );
};

export default OMPayment;