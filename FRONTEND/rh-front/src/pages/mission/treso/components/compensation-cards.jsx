"use client";

import React from "react";
// Importations Lucide-React
import {
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    MapPin,
    User,
    FileText,
    Clock as ClockIcon,
    AlertTriangle,
    CheckCircle as ValidIcon,
    DollarSign,
} from "lucide-react";
// Importations Styled-Components
import styled, { css } from "styled-components";
import {
    Loading,
    NoDataMessage,
    StatusBadge,
} from "styles/generaliser/table-container";
// Importation du composant de pagination (ajustez le chemin si nécessaire)
import Pagination from "components/pagination"; 

// ========================================================================================
// NOUVELLES COULEURS ET CONSTANTES
// ========================================================================================

const COLORS = {
    primary: "#2684ff", // Bleu
    primaryHover: "#0057d9",
    urgent: "#dc3545", // Rouge (Urgence)
    urgentLight: "#f8d7da",
    dueSoon: "#ffc107", // Jaune (Échéance proche)
    dueSoonLight: "#fff3cd",
    normal: "#28a745", // Vert (Délai normal)
    normalLight: "#d4edda",
    textPrimary: "var(--text-primary)",
    textSecondary: "var(--text-secondary)",
    background: "white",
    border: "#e1e5e9",
    referenceBg: "#f1f3f5", // Arrière-plan pour la référence
};

// ========================================================================================
// STYLES REDESSINÉS
// ========================================================================================

const CardsPaginationContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
`;

const CardsContainer = styled.div`
    display: grid;
    /* FORCE 2 COLONNES : S'étend sur les grands écrans pour améliorer l'espacement entre les cartes. */
    grid-template-columns: repeat(2, 1fr); 
    gap: var(--spacing-md);
    padding: var(--spacing-md);

    /* Adaptation pour les petits écrans (mobile) */
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    background: ${COLORS.background};
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    /* Structure de la carte : Indicateur (80px) | Contenu */
    display: grid;
    grid-template-columns: 80px 1fr;
    grid-template-rows: auto auto;
    grid-template-areas:
        "indicator header"
        "indicator info"
        "reference reference";
    gap: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

    &:hover {
        background-color: #f8f9fa;
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }
`;

const IndicatorBlock = styled.div`
    grid-area: indicator;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 8px;
    font-weight: bold;
    text-align: center;
    min-height: 100%;
    border-right: 1px solid ${COLORS.border};
    
    ${({ $isUrgent, $daysUntilDue }) => {
        let bgColor, color;
        
        if ($daysUntilDue < 0) {
            bgColor = COLORS.urgentLight; // Retard
            color = COLORS.urgent;
        } else if ($isUrgent) {
            // URGENT (<= 3 jours)
            bgColor = COLORS.urgentLight;
            color = COLORS.urgent;
        } else if ($daysUntilDue >= 0 && $daysUntilDue <= 7) {
            // PROCHE (4 à 7 jours)
            bgColor = COLORS.dueSoonLight;
            color = COLORS.dueSoon;
        } else {
            // NORMAL (> 7 jours)
            bgColor = COLORS.normalLight;
            color = COLORS.normal;
        }

        return css`
            background-color: ${bgColor};
            color: ${color};
        `;
    }}
`;

const IndicatorValue = styled.div`
    font-size: 24px;
    margin-top: 4px;
    line-height: 1;
`;

const IndicatorText = styled.div`
    font-size: 10px;
    font-weight: normal;
    margin-top: 2px;
    text-transform: uppercase;
`;

const CardHeader = styled.div`
    grid-area: header;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-xs);
`;

const CardTitle = styled.h3`
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: ${COLORS.textPrimary};
    margin: 0;
    line-height: 1.2;
    flex: 1;
    margin-right: var(--spacing-sm);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

// ESPACEMENT AMÉLIORÉ
const CardInfo = styled.div`
    grid-area: info;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm); /* Espacement augmenté */
    padding-left: var(--spacing-sm);
    padding-top: var(--spacing-xs);
`;

const InfoLine = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-size-sm);
    padding-right: var(--spacing-sm);
`;

const InfoLabel = styled.span`
    color: ${COLORS.textSecondary};
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const InfoValue = styled.span`
    color: ${COLORS.textPrimary};
    text-align: right;
    font-weight: 600;
    max-width: 60%;
    word-wrap: break-word;
`;

const ReferenceText = styled.div`
    grid-area: reference;
    font-size: var(--font-size-xs);
    color: ${COLORS.textSecondary};
    background-color: ${COLORS.referenceBg};
    padding: 8px 12px;
    border-radius: 0 0 10px 10px;
    margin: 12px -16px -16px -16px;
    text-align: center;
    font-weight: 600;
    border-top: 1px solid ${COLORS.border};
`;

// ========================================================================================
// COMPOSANT PRINCIPAL COMPENSATIONCARDS
// ========================================================================================

const CompensationCards = ({
    compensations,
    isLoading,
    handleRowClick,
    formatDate,
    getDaysUntilDue,
    currentPage,
    pageSize,
    totalEntries,
    handlePageChange,
    handlePageSizeChange,
    appliedFilters,
}) => {
    /**
     * Retourne le badge de statut stylisé.
     */
    const getStatusBadge = (status) => {
        const statusInfo = {
            "not paid": { icon: Clock, text: "Non payé", class: "status-pending" },
            "paid": { icon: CheckCircle, text: "Payé", class: "status-approved" },
        }[status] || { icon: Clock, text: "Inconnu", class: "status-pending" };

        const Icon = statusInfo.icon;
        return (
            <StatusBadge className={statusInfo.class}>
                <Icon size={12} /> {statusInfo.text}
            </StatusBadge>
        );
    };

    // Vérifie si des filtres sont appliqués pour afficher le message "NoData" approprié
    const hasFilters = appliedFilters.status;
    /**
     * Rendu du bloc indicateur d'urgence basé sur le nombre de jours avant l'échéance.
     */
    const renderDueIndicator = (daysUntilDue) => {
        const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;
        const isDueSoon = daysUntilDue <= 7 && daysUntilDue > 3;

        let Icon, text, displayValue;

        if (daysUntilDue < 0) {
            Icon = XCircle;
            text = `En retard (${Math.abs(daysUntilDue)}J)`;
            displayValue = `+${Math.abs(daysUntilDue)}`;
        } else if (isUrgent) {
            Icon = AlertTriangle;
            text = daysUntilDue === 0 ? "Aujourd'hui" : `URGENT (${daysUntilDue}J)`;
            displayValue = daysUntilDue;
        } else if (isDueSoon) {
            Icon = ClockIcon;
            text = `Proche (${daysUntilDue}J)`;
            displayValue = daysUntilDue;
        } else if (daysUntilDue >= 0) {
            Icon = ValidIcon;
            text = "Délai normal";
            displayValue = daysUntilDue;
        } else {
            Icon = ClockIcon;
            text = "Non défini";
            displayValue = 'N/A';
        }

        return (
            <IndicatorBlock $isUrgent={isUrgent} $daysUntilDue={daysUntilDue}>
                <Icon size={20} />
                <IndicatorValue>
                    {displayValue}
                </IndicatorValue>
                <IndicatorText>{text}</IndicatorText>
            </IndicatorBlock>
        );
    };

    // Pagination client-side
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedCompensations = compensations.slice(startIndex, startIndex + pageSize);

    return (
        <CardsPaginationContainer>
            <CardsContainer>
                {/* Affichage conditionnel du chargement, des données ou de l'absence de données */}
                {isLoading.compensations ? (
                    <Loading>Chargement des compensations...</Loading>
                ) : paginatedCompensations.length > 0 ? (
                    paginatedCompensations.map((item) => {
                        const { assignation, compensations: comps, totalAmount } = item;
                        // Calcul des jours restants avant la première date de paiement
                        const minPaymentDate = comps.reduce((min, comp) => 
                            new Date(comp.paymentDate) < new Date(min) ? comp.paymentDate : min, 
                            comps[0]?.paymentDate
                        );
                        const daysUntilDue = minPaymentDate ? getDaysUntilDue(minPaymentDate) : 0;

                        return (
                            <Card key={assignation.assignationId} onClick={() => handleRowClick(assignation.assignationId)}>
                                
                                {/* 1. Bloc Indicateur (Statut/Urgence) */}
                                {renderDueIndicator(daysUntilDue)}

                                {/* 2. En-tête (Titre & Badge Statut) */}
                                <CardHeader>
                                    <CardTitle title={`${assignation.employee.lastName} ${assignation.employee.firstName}`}>
                                        {`${assignation.employee.lastName} ${assignation.employee.firstName}`}
                                    </CardTitle>
                                    
                                    {getStatusBadge(comps?.[0]?.status || "not paid")}
                                </CardHeader>
                                
                                {/* 3. Informations de la compensation */}
                                <CardInfo>
                                    <InfoLine>
                                        <InfoLabel>
                                            <User size={14} />
                                            Mission
                                        </InfoLabel>
                                        <InfoValue>{assignation.mission.name || "Non spécifié"}</InfoValue>
                                    </InfoLine>
                                    <InfoLine>
                                        <InfoLabel>
                                            <FileText size={14} />
                                            Matricule
                                        </InfoLabel>
                                        <InfoValue>{assignation.employee.employeeCode || "Non spécifié"}</InfoValue>
                                    </InfoLine>
                                    <InfoLine>
                                        <InfoLabel>
                                            <MapPin size={14} />
                                            Lieu
                                        </InfoLabel>
                                        <InfoValue>{assignation.mission.lieu.nom || "Non spécifié"}</InfoValue>
                                    </InfoLine>
                                    <InfoLine>
                                        <InfoLabel>
                                            <Calendar size={14} />
                                            Départ/Retour
                                        </InfoLabel>
                                        <InfoValue>
                                            {formatDate(assignation.departureDate)} - {formatDate(assignation.returnDate)}
                                        </InfoValue>
                                    </InfoLine>
                                    <InfoLine>
                                        <InfoLabel>
                                            <DollarSign size={14} />
                                            Total
                                        </InfoLabel>
                                        <InfoValue>{totalAmount.toLocaleString()} MGA</InfoValue>
                                    </InfoLine>
                                </CardInfo>

                                {/* 4. Référence */}
                                <ReferenceText>RÉFÉRENCE: {assignation.assignationId}</ReferenceText>
                            </Card>
                        );
                    })
                ) : (
                    <NoDataMessage>
                        {hasFilters
                            ? "Aucune compensation ne correspond aux critères de recherche."
                            : "Aucune compensation trouvée."}
                    </NoDataMessage>
                )}
            </CardsContainer>

            {/* Pagination */}
            {totalEntries > 0 && (
                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalEntries={totalEntries}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    disabled={isLoading.compensations}
                />
            )}
        </CardsPaginationContainer>
    );
};

export default CompensationCards;