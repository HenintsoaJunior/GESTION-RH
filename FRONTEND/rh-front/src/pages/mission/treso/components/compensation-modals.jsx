"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, FileText, X } from "lucide-react";
import Alert from "components/alert";
import Modal from "components/modal";
// --- Import Chart.js Dependencies ---
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
// -------------------------------------
import {
    PopupOverlay,
    PagePopup,
    PopupHeader,
    PopupTitle,
    CloseButton,
    PopupContent,
    DetailSection,
    SectionTitle,
    InfoGrid,
    InfoItem,
    InfoLabel,
    InfoValue,
    StatusBadge,
    IndemnityTable,
    TableHeader,
    TableCell,
    TotalRow,
    PopupActions,
    ButtonPrimary,
    ButtonSecondary,
} from "styles/generaliser/details-mission-container";
import { NoDataMessage } from "styles/generaliser/table-container";
import { formatNumber } from "utils/format";
import styled from "styled-components";
import { UpdateCompensationStatus } from "services/mission/compensation";

// Enregistrement des éléments Chart.js nécessaires
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ResponsiveTableWrapper = styled.div`
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;

    @media (max-width: 768px) {
        font-size: 0.875rem;
    }
`;

const ChartGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
`;

// ====================================================================
// STYLES CHART CARD AVEC MODIFICATIONS (NO BORDER-RADIUS, NO BOX-SHADOW)
// ====================================================================
const ChartCard = styled.div`
    padding: 20px;
    background: var(--bg-primary, #ffffff);
    /* border-radius: 0; <-- Supprimé */
    border: 1px solid var(--border-light, #dee2e6); /* Ajouté une bordure pour la délimitation */
    /* box-shadow: none; <-- Supprimé */
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
// ====================================================================


// --- Fonctions utilitaires Chart ---

const createTooltipCallback = (unit = ",00 ") => {
    return {
        label: function (tooltipItem) {
            const label = tooltipItem.label || "";
            const value = tooltipItem.raw;
            // Assurez-vous d'avoir 'MGA' comme unité, si nécessaire
            return `${label}: ${formatNumber(value)}${unit} MGA`; 
        },
    };
};

/**
 * Graphique 1 : Répartition des Montants par Catégorie (Doughnut)
 */
const CompensationDoughnutChart = ({ compensations }) => {
    // Calcul des totaux par catégorie
    const totalTransport = compensations.reduce((sum, c) => sum + (c.transportAmount || 0), 0);
    const totalRepas = compensations.reduce(
        (sum, c) => sum + (c.breakfastAmount || 0) + (c.lunchAmount || 0) + (c.dinnerAmount || 0),
        0
    );
    const totalHebergement = compensations.reduce((sum, c) => sum + (c.accommodationAmount || 0), 0);

    const data = [totalTransport, totalRepas, totalHebergement];
    const hasData = data.some(val => val > 0);

    if (!hasData) return <p>Données insuffisantes.</p>;

    const chartData = {
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

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right",
                labels: { boxWidth: 10, padding: 10 },
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        const label = tooltipItem.label || "";
                        const value = tooltipItem.raw;
                        const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
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

/**
 * Graphique 2 : Total de Compensation par Jour (Barres)
 */
const DailyCompensationBarChart = ({ compensations, formatDate }) => {
    const dailyTotals = compensations.map(c => ({
        date: formatDate(c.paymentDate),
        amount: c.totalAmount || 0,
    }));

    const hasData = dailyTotals.some(item => item.amount > 0);
    if (!hasData) return <p>Données journalières insuffisantes.</p>;

    const chartData = {
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

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: { callbacks: createTooltipCallback(" MGA") }, // Utilisation du callback créé
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Montant Total (MGA)' },
                ticks: { callback: (value) => formatNumber(value) },
            },
            x: {
                title: { display: true, text: 'Date' },
            },
        },
    };

    return (
        <ChartCard>
            <h4>Compensation Totale par Jour</h4>
            <div className="chart-content">
                <Bar data={chartData} options={options} />
            </div>
        </ChartCard>
    );
};

// --- Composant Principal Modifié ---

const CompensationModals = ({
    alert,
    setAlert,
    showDetailsCompensation,
    setShowDetailsCompensation,
    selectedAssignationId,
    compensationsData,
    formatDate,
    onPaymentSuccess,
}) => {
    // ... (Logique inchangée)

    const [actionCompleted, setActionCompleted] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const updateCompensationStatus = UpdateCompensationStatus();

    const selectedItem = compensationsData.find((item) => item.assignation.assignationId === selectedAssignationId);
    const { assignation, compensations, totalAmount } = selectedItem || {};

    const translateStatus = (status) => {
        switch (status?.toLowerCase()) {
            case "not paid":
                return "Non payé";
            case "paid":
                return "Payé";
            default:
                return status || "Inconnu";
        }
    };

    useEffect(() => {
        if (selectedItem) {
            setActionCompleted(false);
        }
    }, [selectedItem]);

    const handleCloseModal = () => {
        setShowDetailsCompensation(false);
    };

    const confirmPay = async () => {
        try {
            const employeeId = assignation.employee.employeeId;
            const assignationId = assignation.assignationId;
            const message = await updateCompensationStatus(employeeId, assignationId, "paid");
            setAlert({ type: 'success', message, isOpen: true });
            setShowConfirmModal(false);
            setActionCompleted(true);
            if (onPaymentSuccess) {
                onPaymentSuccess();
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut:", error);
            setAlert({ type: 'error', message: error.message || 'Erreur lors de la mise à jour du statut de compensation', isOpen: true });
        }
    };

    const handlePayClick = () => {
        setShowConfirmModal(true);
    };

    if (!showDetailsCompensation || !selectedItem) return null;

    return (
        <PopupOverlay role="dialog" aria-labelledby="compensation-details-title" aria-modal="true">
            <PagePopup onClick={(e) => e.stopPropagation()} style={{ maxWidth: "1100px", padding: "0" }}> {/* Augmentation de la largeur pour les 2/3 graphiques */}
                <PopupHeader style={{ padding: "20px 30px", borderBottom: "1px solid var(--border-light)" }}>
                    <PopupTitle id="compensation-details-title" style={{ fontSize: "1.6rem" }}>
                        <FileText size={24} style={{ marginRight: "10px", verticalAlign: "middle" }} />
                        {actionCompleted
                            ? "Paiement effectué"
                            : `Détails de Compensation N° ${assignation.assignationId}`}
                    </PopupTitle>
                    <CloseButton onClick={handleCloseModal} aria-label="Fermer la fenêtre" title="Fermer la fenêtre">
                        <X size={24} />
                    </CloseButton>
                </PopupHeader>

                <PopupContent style={{ padding: "30px", background: "var(--bg-secondary)" }}>
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        isOpen={alert.isOpen}
                        onClose={() => setAlert({ ...alert, isOpen: false })}
                    />

                    {actionCompleted ? (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            <CheckCircle size={48} color="var(--success-color, #28a745)" style={{ marginBottom: "var(--spacing-md)" }} />
                            <h3>Paiement effectué avec succès !</h3>
                            <p>La compensation a été marquée comme payée. Veuillez fermer cette fenêtre.</p>
                        </div>
                    ) : (
                        <>
                            {/* SECTION DE GRAPHIQUES */}
                            <DetailSection>
                                <SectionTitle>Analyse Visuelle des Montants ({assignation.duration} jours)</SectionTitle>
                                <ChartGrid>
                                    <CompensationDoughnutChart compensations={compensations} />
                                    <DailyCompensationBarChart compensations={compensations} formatDate={formatDate} />
                                </ChartGrid>
                            </DetailSection>

                            <DetailSection>
                                <SectionTitle>Informations Générales</SectionTitle>
                                <InfoGrid>
                                    <InfoItem><InfoLabel>ID Assignation</InfoLabel><InfoValue>{assignation.assignationId}</InfoValue></InfoItem>
                                    <InfoItem>
                                        <InfoLabel>Statut</InfoLabel>
                                        <StatusBadge className={compensations?.[0]?.status || "pending"}>
                                            {translateStatus(compensations?.[0]?.status).toUpperCase()}
                                        </StatusBadge>
                                    </InfoItem>
                                    <InfoItem><InfoLabel>Employé</InfoLabel><InfoValue>{`${assignation.employee.lastName} ${assignation.employee.firstName}`}</InfoValue></InfoItem>
                                    <InfoItem><InfoLabel>Matricule</InfoLabel><InfoValue>{assignation.employee.employeeCode}</InfoValue></InfoItem>
                                    <InfoItem><InfoLabel>Mission</InfoLabel><InfoValue>{assignation.mission.name}</InfoValue></InfoItem>
                                    <InfoItem><InfoLabel>Lieu</InfoLabel><InfoValue>{assignation.mission.lieu.nom}</InfoValue></InfoItem>
                                    <InfoItem><InfoLabel>Date Départ</InfoLabel><InfoValue>{formatDate(assignation.departureDate)}</InfoValue></InfoItem>
                                    <InfoItem><InfoLabel>Date Retour</InfoLabel><InfoValue>{formatDate(assignation.returnDate)}</InfoValue></InfoItem>
                                    <InfoItem><InfoLabel>Durée</InfoLabel><InfoValue>{assignation.duration} jours</InfoValue></InfoItem>
                                    <InfoItem><InfoLabel>Total Montant</InfoLabel><InfoValue><strong>{totalAmount.toLocaleString()}</strong></InfoValue></InfoItem>
                                    <InfoItem><InfoLabel>Créée le</InfoLabel><InfoValue>{formatDate(assignation.createdAt)}</InfoValue></InfoItem>
                                </InfoGrid>

                                <SectionTitle>Détails des Compensations (Par Jour)</SectionTitle>
                                <ResponsiveTableWrapper>
                                    <IndemnityTable>
                                        <thead>
                                            <tr>
                                                <TableHeader>Date</TableHeader>
                                                <TableHeader>Transport</TableHeader>
                                                <TableHeader>Petit Déj.</TableHeader>
                                                <TableHeader>Déjeuner</TableHeader>
                                                <TableHeader>Dîner</TableHeader>
                                                <TableHeader>Hébergement</TableHeader>
                                                <TableHeader>Montant Total</TableHeader>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {compensations && compensations.length > 0 ? (
                                                compensations.map((comp, index) => (
                                                    <tr key={index}>
                                                        <TableCell>{formatDate(comp.paymentDate)}</TableCell>
                                                        <TableCell>{comp.transportAmount ? `${formatNumber(comp.transportAmount)},00 ` : ""}</TableCell>
                                                        <TableCell>{comp.breakfastAmount ? `${formatNumber(comp.breakfastAmount)},00 ` : ""}</TableCell>
                                                        <TableCell>{comp.lunchAmount ? `${formatNumber(comp.lunchAmount)},00 ` : ""}</TableCell>
                                                        <TableCell>{comp.dinnerAmount ? `${formatNumber(comp.dinnerAmount)},00 ` : ""}</TableCell>
                                                        <TableCell>{comp.accommodationAmount ? `${formatNumber(comp.accommodationAmount)},00 ` : ""}</TableCell>
                                                        <TableCell><strong>{comp.totalAmount ? `${formatNumber(comp.totalAmount)},00 ` : ""}</strong></TableCell>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7}>
                                                        <NoDataMessage>Aucune compensation disponible.</NoDataMessage>
                                                    </td>
                                                </tr>
                                            )}
                                            <TotalRow>
                                                <TableCell colSpan={6}>Total</TableCell>
                                                <TableCell><strong>{totalAmount ? `${formatNumber(totalAmount)},00 ` : "0,00 "}</strong></TableCell>
                                            </TotalRow>
                                        </tbody>
                                    </IndemnityTable>
                                </ResponsiveTableWrapper>
                            </DetailSection>
                        </>
                    )}
                </PopupContent>

                {!actionCompleted && (
                    <div style={{ padding: "20px 30px" }}>
                        <button 
                            onClick={handlePayClick} 
                            disabled={compensations?.[0]?.status === "paid"}
                            className="btn-primary" 
                            style={{ 
                                padding: "10px 20px", 
                                background: "#28a745", 
                                color: "white", 
                                border: "none", 
                                /* borderRadius: "5px", <-- Supprimé */
                                opacity: compensations?.[0]?.status === "paid" ? 0.5 : 1,
                                cursor: compensations?.[0]?.status === "paid" ? "not-allowed" : "pointer"
                            }} 
                        >
                            Payer
                        </button>
                        <button onClick={handleCloseModal} style={{ padding: "10px 20px", marginLeft: "10px", background: "#6c757d", color: "white", border: "none", /* borderRadius: "5px", <-- Supprimé */ }}>
                            Fermer
                        </button>
                    </div>
                )}

                <Modal
                    type="success"
                    message="Êtes-vous sûr de vouloir payer cette compensation ? Cette action est irréversible et passera le statut à 'Payé'."
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    title="Confirmer le paiement"
                >
                    <PopupActions>
                        <ButtonSecondary onClick={() => setShowConfirmModal(false)}>Annuler</ButtonSecondary>
                        <ButtonPrimary onClick={confirmPay}>Confirmer le Paiement</ButtonPrimary>
                    </PopupActions>
                </Modal>

                <Modal
                    type="success"
                    message="Le paiement a été confirmé avec succès."
                    isOpen={actionCompleted}
                    onClose={handleCloseModal}
                    title="Paiement"
                >
                    <div style={{ textAlign: "center" }}>
                        <button onClick={handleCloseModal} className="btn-primary">
                            Fermer
                        </button>
                    </div>
                </Modal>
            </PagePopup>
        </PopupOverlay>
    );
};

export default CompensationModals;