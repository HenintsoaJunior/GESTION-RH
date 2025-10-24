"use client";

import React from "react";
// Importations Lucide-React
import {
    Clock as ClockIcon,
    CheckCircle,
    XCircle,
    Calendar,
    MapPin,
    User,
    FileText,
    AlertTriangle,
} from "lucide-react";
import {
    Loading,
    NoDataMessage,
    StatusBadge,
} from "@/styles/table-styles";
import Pagination from "@/components/pagination"; 
import {
    CardsPaginationContainer,
    MissionCardsContainer as CardsContainer,
    Card,
    IndicatorBlock,
    IndicatorValue,
    IndicatorText,
    CardHeader,
    CardTitle,
    CardInfo,
    InfoLine,
    InfoLabel,
    InfoValue,
    ReferenceText,
} from "@/styles/card-styles";
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
            pending: { icon: ClockIcon, text: "En attente", class: "status-pending" },
            approved: { icon: CheckCircle, text: "Validé", class: "status-approved" },
            rejected: { icon: XCircle, text: "Rejetée", class: "status-cancelled" },
        }[status] || { icon: ClockIcon, text: "Inconnu", class: "status-pending" };

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
            Icon = CheckCircle;
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