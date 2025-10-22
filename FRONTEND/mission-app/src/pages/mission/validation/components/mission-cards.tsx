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
} from "lucide-react";
import styled, { css } from "styled-components";
import {
    Loading,
    NoDataMessage,
    StatusBadge,
} from "@/styles/table-styles";
import Pagination from "@/components/pagination"; 
// Types from previous context
interface FormattedMission {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  department: string;
  status: string;
  requestDate: string;
  dueDate: string;
  estimatedDuration: string;
  location: string;
  comments: string;
  signature: string;
  matricule: string;
  function: string;
  transport: string;
  departureTime: string;
  departureDate: string;
  returnDate: string;
  returnTime: string;
  reference: string;
  toWhom: string;
  validationDate: string | null;
  missionCreator: string;
  superiorName: string;
  email: string;
  createdAt: string;
  updatedAt: string | null;
  missionAssignationId: string;
  missionType: string;
  missionStatus: string;
  allocatedFund: number;
  type: string;
  assignationType: string;
  employeeId: string;
  missionId: string;
}

interface LoadingState {
  missions: boolean;
  comments: boolean;
  employees: boolean;
  stats: boolean;
}

interface AppliedFilters {
  search?: string;
  status?: string;
  department?: string;
  priority?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

interface MissionCardsProps {
  missions: FormattedMission[];
  isLoading: LoadingState;
  handleRowClick: (missionId: string) => void;
  formatDate: (dateString?: string | null) => string;
  getDaysUntilDue: (dueDate?: string | null) => number;
  currentPage: number;
  pageSize: number;
  totalEntries: number;
  handlePageChange: (newPage: number) => void;
  handlePageSizeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  appliedFilters: AppliedFilters;
}


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
    /* FORCE 3 COLONNES : S'étend sur les grands écrans pour afficher trois cartes par ligne. */
    grid-template-columns: repeat(3, 1fr); 
    gap: var(--spacing-md);
    padding: var(--spacing-md);

    /* Adaptation pour les petits écrans (mobile) */
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
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
        background-color: var(--bg-secondary);
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }
`;

const IndicatorBlock = styled.div<{ $daysUntilDue: number }>`
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
    border-right: 1px solid var(--border-color);
    
    ${({ $daysUntilDue }) => {
        let bgVar, colorVar;
        
        if ($daysUntilDue < 0) {
            bgVar = 'var(--error-bg)';
            colorVar = 'var(--error-color)';
        } else if ($daysUntilDue <= 3) {
            // URGENT (<= 3 jours)
            bgVar = 'var(--error-bg)';
            colorVar = 'var(--error-color)';
        } else if ($daysUntilDue <= 7) {
            // PROCHE (4 à 7 jours)
            bgVar = 'var(--warning-bg)';
            colorVar = 'var(--warning-color)';
        } else {
            // NORMAL (> 7 jours)
            bgVar = 'var(--success-bg)';
            colorVar = 'var(--success-color)';
        }

        return css`
            background-color: ${bgVar};
            color: ${colorVar};
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
    color: var(--text-color);
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
    color: var(--text-secondary);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const InfoValue = styled.span`
    color: var(--text-color);
    text-align: right;
    font-weight: 600;
    max-width: 60%;
    word-wrap: break-word;
`;

const ReferenceText = styled.div`
    grid-area: reference;
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    background-color: var(--bg-light);
    padding: 8px 12px;
    border-radius: 0 0 10px 10px;
    margin: 12px -16px -16px -16px;
    text-align: center;
    font-weight: 600;
    border-top: 1px solid var(--border-color);
`;

// ========================================================================================
// COMPOSANT PRINCIPAL MISSIONCARDS
// ========================================================================================

const MissionCards: React.FC<MissionCardsProps> = ({
    missions,
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
     * Formate le nom du demandeur : prend le prénom et le rôle entre parenthèses.
     * Ex: "Miantsafitia RAKOTOARIMANANA (DRH)" -> "Miantsafitia (DRH)"
     */
    const formatRequesterName = (fullName: string): string => {
        if (!fullName || fullName === "Non spécifié") return fullName;

        // Extraire le prénom (première partie avant espace)
        const firstName = fullName.split(' ')[0];

        // Extraire le rôle entre parenthèses
        const match = fullName.match(/\(([^)]+)\)/);
        const role = match ? `(${match[1]})` : '';

        return `${firstName} ${role}`;
    };

    /**
     * Retourne le badge de statut stylisé.
     */
    const getStatusBadge = (status: string) => {
        const statusInfo = {
            pending: { icon: Clock, text: "En attente", class: "status-pending" },
            approved: { icon: CheckCircle, text: "Validé", class: "status-approved" },
            rejected: { icon: XCircle, text: "Rejetée", class: "status-cancelled" },
        }[status] || { icon: Clock, text: "Inconnu", class: "status-pending" };

        const Icon = statusInfo.icon;
        return (
            <StatusBadge className={statusInfo.class}>
                <Icon size={12} /> {statusInfo.text}
            </StatusBadge>
        );
    };

    // Vérifie si des filtres sont appliqués pour afficher le message "NoData" approprié
    const hasFilters =
        appliedFilters.search ||
        appliedFilters.status ||
        appliedFilters.department ||
        appliedFilters.priority ||
        appliedFilters.dateRange?.start ||
        appliedFilters.dateRange?.end;

    /**
     * Rendu du bloc indicateur d'urgence basé sur le nombre de jours avant l'échéance.
     */
    const renderDueIndicator = (daysUntilDue: number) => {
        const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;
        const isDueSoon = daysUntilDue <= 7 && daysUntilDue > 3;

        let Icon: React.ComponentType<{ size?: number }>, text: string, displayValue: string | number;

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
            <IndicatorBlock $daysUntilDue={daysUntilDue}>
                <Icon size={20} />
                <IndicatorValue>
                    {displayValue}
                </IndicatorValue>
                <IndicatorText>{text}</IndicatorText>
            </IndicatorBlock>
        );
    };

    return (
        <CardsPaginationContainer>
            <CardsContainer>
                {/* Affichage conditionnel du chargement, des données ou de l'absence de données */}
                {isLoading.missions ? (
                    <Loading>Chargement des missions...</Loading>
                ) : missions && missions.length > 0 ? (
                    missions.map((mission) => {
                        // Calcul des jours restants avant l'échéance de validation (basé sur la date de début de mission)
                        const daysUntilDue = getDaysUntilDue(mission.departureDate);

                        return (
                            <Card key={mission.id} onClick={() => handleRowClick(mission.id)}>
                                
                                {/* 1. Bloc Indicateur (Statut/Urgence) */}
                                {renderDueIndicator(daysUntilDue)}

                                {/* 2. En-tête (Titre & Badge Statut) */}
                                <CardHeader>
                                    <CardTitle title={mission.title}>{mission.title}</CardTitle>
                                    {getStatusBadge(mission.status)}
                                </CardHeader>
                                
                                {/* 3. Informations de la mission */}
                                <CardInfo>
                                    <InfoLine>
                                        <InfoLabel>
                                            <User size={14} />
                                            Missionnaire
                                        </InfoLabel>
                                        <InfoValue>{formatRequesterName(mission.requestedBy || "Non spécifié")}</InfoValue>
                                    </InfoLine>
                                    <InfoLine>
                                        <InfoLabel>
                                            <FileText size={14} />
                                            Matricule
                                        </InfoLabel>
                                        <InfoValue>{mission.matricule || "Non spécifié"}</InfoValue>
                                    </InfoLine>
                                    <InfoLine>
                                        <InfoLabel>
                                            <MapPin size={14} />
                                            Destination
                                        </InfoLabel>
                                        <InfoValue>{mission.location || "Non spécifié"}</InfoValue>
                                    </InfoLine>
                                    <InfoLine>
                                        <InfoLabel>
                                            <Calendar size={14} />
                                            Départ/Retour
                                        </InfoLabel>
                                        <InfoValue>
                                            {formatDate(mission.departureDate)} - {formatDate(mission.returnDate)}
                                        </InfoValue>
                                    </InfoLine>
                                </CardInfo>

                                {/* 4. Référence */}
                                <ReferenceText>RÉFÉRENCE: {mission.reference || "N/A"}</ReferenceText>
                            </Card>
                        );
                    })
                ) : (
                    <NoDataMessage>
                        {hasFilters
                            ? "Aucune mission ne correspond aux critères de recherche."
                            : "Aucune mission trouvée."}
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
                />
            )}
        </CardsPaginationContainer>
    );
};

export default MissionCards;