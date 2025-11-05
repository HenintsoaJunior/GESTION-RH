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
    AlertTriangle,
    ArrowRight,
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
    ReferenceText,
} from "@/styles/card-styles";
import type { FormattedMission } from "@/api/mission/validation/services";

// Other types
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
     * Retourne le nom complet du missionnaire tel quel
     */
    const formatRequesterName = (fullName: string): string => {
        return fullName || "Non spécifié";
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
    const renderDueIndicator = (daysUntilDue: number, status: string) => {
        const neutralDays = 999; // Valeur neutre pour éviter les styles d'urgence

        if (status === 'approved') {
            return (
                <IndicatorBlock $daysUntilDue={neutralDays} style={{ 
                    backgroundColor: 'var(--success-bg)', 
                    color: 'var(--success-color)' 
                }}>
                    <CheckCircle size={24} style={{ color: 'var(--success-color)' }} />
                    <IndicatorValue style={{ color: 'var(--success-color)' }}>
                        --
                    </IndicatorValue>
                    {/* Pas de texte pour les missions validées */}
                </IndicatorBlock>
            );
        }

        if (status === 'rejected') {
            return (
                <IndicatorBlock $daysUntilDue={neutralDays} style={{ 
                    backgroundColor: 'var(--danger-bg)', 
                    color: 'var(--danger-color)' 
                }}>
                    <XCircle size={24} style={{ color: 'var(--danger-color)' }} />
                    <IndicatorValue style={{ color: 'var(--danger-color)' }}>
                        --
                    </IndicatorValue>
                    {/* Pas de texte pour les missions rejetées */}
                </IndicatorBlock>
            );
        }

        const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;
        const isDueSoon = daysUntilDue <= 7 && daysUntilDue > 3;

        let Icon: React.ComponentType<{ size?: number }>, text: string, displayValue: string | number;

        if (daysUntilDue < 0) {
            Icon = XCircle;
            text = `RETARD`;
            displayValue = `+${Math.abs(daysUntilDue)}j`;
        } else if (isUrgent) {
            Icon = AlertTriangle;
            text = daysUntilDue === 0 ? "AUJOURD'HUI" : `URGENT`;
            displayValue = `${daysUntilDue}j`;
        } else if (isDueSoon) {
            Icon = ClockIcon;
            text = `BIENTÔT`;
            displayValue = `${daysUntilDue}j`;
        } else if (daysUntilDue >= 0) {
            Icon = CheckCircle;
            text = "OK";
            displayValue = `${daysUntilDue}j`;
        } else {
            Icon = ClockIcon;
            text = "N/A";
            displayValue = '--';
        }

        return (
            <IndicatorBlock $daysUntilDue={daysUntilDue}>
                <Icon size={24} />
                <IndicatorValue>
                    {displayValue}
                </IndicatorValue>
                <IndicatorText>{text}</IndicatorText>
            </IndicatorBlock>
        );
    };

    return (
        <CardsPaginationContainer>
            <CardsContainer
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1.5rem',
                }}
            >
                {/* Affichage conditionnel du chargement, des données ou de l'absence de données */}
                {isLoading.missions ? (
                    <Loading>Chargement des missions...</Loading>
                ) : missions && missions.length > 0 ? (
                    missions.map((mission) => {
                        // Calcul des jours restants avant l'échéance de validation
                        const daysUntilDue = getDaysUntilDue(mission.departureDate);

                        return (
                            <Card key={mission.id} onClick={() => handleRowClick(mission.id)}>
                                
                                {/* 1. Bloc Indicateur (Statut/Urgence) */}
                                {renderDueIndicator(daysUntilDue, mission.status)}

                                {/* 2. En-tête (Titre & Badge Statut) */}
                                <CardHeader>
                                    <CardTitle title={mission.title}>{mission.title}</CardTitle>
                                    {getStatusBadge(mission.status)}
                                </CardHeader>
                                
                                {/* 3. Informations de la mission - DESIGN AMÉLIORÉ */}
                                <CardInfo>
                                    {/* Bloc principal - Missionnaire en vedette */}
                                    <div style={{
                                        background: 'var(--bg-light)',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-color)',
                                    }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            gap: '12px'
                                        }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '10px',
                                                flex: 1 
                                            }}>
                                                <User size={20} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                                                <div style={{ 
                                                    fontSize: '15px', 
                                                    fontWeight: '700',
                                                    color: 'var(--text-color)',
                                                }}>
                                                    {formatRequesterName(mission.employeeName || "Non spécifié")}
                                                </div>
                                            </div>
                                            <div style={{ 
                                                background: 'var(--bg-primary)',
                                                padding: '8px 12px',
                                                borderRadius: '4px',
                                                border: '1px solid var(--border-color)',
                                            }}>
                                                <div style={{ 
                                                    fontSize: '10px', 
                                                    color: 'var(--text-secondary)',
                                                    marginBottom: '2px',
                                                    textAlign: 'center'
                                                }}>
                                                    MAT.
                                                </div>
                                                <div style={{ 
                                                    fontSize: '13px', 
                                                    fontWeight: '700',
                                                    color: 'var(--primary-color)',
                                                    textAlign: 'center'
                                                }}>
                                                    {mission.matricule || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Destination */}
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '10px',
                                        padding: '8px 0',
                                        borderBottom: '1px solid var(--border-color)'
                                    }}>
                                        <MapPin size={16} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ 
                                                fontSize: '13px', 
                                                fontWeight: '600',
                                                color: 'var(--text-color)',
                                            }}>
                                                {mission.location || "Non spécifié"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Période */}
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '10px',
                                        padding: '8px 0'
                                    }}>
                                        <Calendar size={16} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                                        <div style={{ 
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            <span>{formatDate(mission.departureDate)}</span>
                                            <ArrowRight size={14} style={{ color: 'var(--text-secondary)' }} />
                                            <span>{formatDate(mission.returnDate)}</span>
                                        </div>
                                    </div>

                                    {/* Date de validation (si validée) */}
                                    {mission.status === 'approved' && mission.validationDate && (
                                        <div style={{
                                            background: 'var(--success-bg)',
                                            padding: '8px 12px',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginTop: '4px'
                                        }}>
                                            <CheckCircle size={14} style={{ color: 'var(--success-color)' }} />
                                            <div style={{ flex: 1 }}>
                                                <span style={{ 
                                                    fontSize: '11px', 
                                                    color: 'var(--success-color)',
                                                    fontWeight: '600'
                                                }}>
                                                    Validée le {formatDate(mission.validationDate)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardInfo>

                                {/* 4. Référence */}
                                <ReferenceText>
                                    {mission.missionAssignationId || "REF-N/A"}
                                </ReferenceText>
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