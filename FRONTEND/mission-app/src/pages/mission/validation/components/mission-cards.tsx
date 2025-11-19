"use client";

import React, { useState } from "react";
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
    Eye, // Ajout pour l'icône "Voir détails"
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
    // Nouveaux styles pour les boutons d'actions
    ActionButton,
    ActionsContainer,
} from "@/styles/card-styles";
import type { FormattedMission } from "@/api/mission/validation/services";
import Modal from "@/components/modal";

// Other types
interface LoadingState {
  missions: boolean;
  comments: boolean;
  employees: boolean;
  stats: boolean;
}

interface AppliedFilters {
  employeeId: string;
  employeeName: string;
  status: string;
  validationDateFrom?: string;
  validationDateTo?: string;
  requestDateFrom?: string;
  requestDateTo?: string;
}

interface MissionCardsProps {
  missions: FormattedMission[];
  isLoading: LoadingState;
  handleRowClick: (missionId: string) => void;
  handleAction?: (missionId: string, action: 'validate' | 'reject') => Promise<void>;
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
    handleAction,
    formatDate,
    getDaysUntilDue,
    currentPage,
    pageSize,
    totalEntries,
    handlePageChange,
    handlePageSizeChange,
    appliedFilters,
}) => {
    // États pour la confirmation des actions
    const [confirmingMissionId, setConfirmingMissionId] = useState<string | null>(null);
    const [confirmActionType, setConfirmActionType] = useState<'validate' | 'reject' | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

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
        let statusInfo;
        switch (status) {
            case 'pending':
                statusInfo = { icon: ClockIcon, text: "En attente", class: "status-pending" };
                break;
            case 'approved':
                statusInfo = { icon: CheckCircle, text: "Validé", class: "status-approved" };
                break;
            case 'rejected':
            case 'Annulé':
                statusInfo = { icon: XCircle, text: status === 'rejected' ? "Rejetée" : "Annulé", class: "status-cancelled" };
                break;
            default:
                statusInfo = { icon: ClockIcon, text: "Inconnu", class: "status-pending" };
        }

        const Icon = statusInfo.icon;
        return (
            <StatusBadge className={statusInfo.class}>
                <Icon size={10} /> {statusInfo.text}
            </StatusBadge>
        );
    };

    // Vérifie si des filtres sont appliqués pour afficher le message "NoData" approprié
    const hasFilters =
        appliedFilters.employeeId ||
        appliedFilters.employeeName ||
        appliedFilters.status ||
        appliedFilters.validationDateFrom ||
        appliedFilters.validationDateTo ||
        appliedFilters.requestDateFrom ||
        appliedFilters.requestDateTo;

    /**
     * Ouvre le modal de confirmation pour une action
     */
    const openConfirmModal = (missionId: string, action: 'validate' | 'reject') => {
        setConfirmingMissionId(missionId);
        setConfirmActionType(action);
        setIsConfirmModalOpen(true);
    };

    /**
     * Confirme l'action et ferme le modal
     */
    const confirmAction = async () => {
        if (confirmingMissionId && confirmActionType && handleAction) {
            try {
                await handleAction(confirmingMissionId, confirmActionType);
            } catch (error) {
                console.error(`Erreur lors de l'action ${confirmActionType}:`, error);
            }
        }
        setIsConfirmModalOpen(false);
        setConfirmingMissionId(null);
        setConfirmActionType(null);
    };

    /**
     * Ferme le modal de confirmation
     */
    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setConfirmingMissionId(null);
        setConfirmActionType(null);
    };

    /**
     * Rendu du bloc indicateur d'urgence basé sur le nombre de jours avant l'échéance.
     */
    const renderDueIndicator = (daysUntilDue: number, status: string) => {
        const neutralDays = 999; // Valeur neutre pour éviter les styles d'urgence

        if (status === 'approved') {
            return (
                <IndicatorBlock $daysUntilDue={neutralDays} style={{ 
                    backgroundColor: 'var(--success-bg)', 
                    color: 'var(--success-color)',
                    border: '2px solid var(--success-border)',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)',
                }}>
                    <CheckCircle size={24} style={{ color: 'var(--success-color)' }} />
                    <IndicatorValue style={{ 
                        color: 'var(--success-color)', 
                        fontSize: '20px',
                        fontWeight: 'bold',
                    }}>
                    </IndicatorValue>
                    <IndicatorText style={{ 
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}>
                        VALIDÉ
                    </IndicatorText>
                </IndicatorBlock>
            );
        }

        if (status === 'rejected' || status === 'Annulé') {
            return (
                <IndicatorBlock $daysUntilDue={neutralDays} style={{ 
                    backgroundColor: 'var(--danger-bg)', 
                    color: 'var(--danger-color)',
                    border: '2px solid var(--danger-border)',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
                }}>
                    <XCircle size={24} style={{ color: 'var(--danger-color)' }} />
                    <IndicatorValue style={{ 
                        color: 'var(--danger-color)', 
                        fontSize: '20px',
                        fontWeight: 'bold',
                    }}>
                    </IndicatorValue>
                    <IndicatorText style={{ 
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}>
                        {status === 'rejected' ? 'REJETÉ' : 'ANNULÉ'}
                    </IndicatorText>
                </IndicatorBlock>
            );
        }

        const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;
        const isDueSoon = daysUntilDue <= 7 && daysUntilDue > 3;

        let Icon: React.ComponentType<{ size?: number }>, text: string, displayValue: string | number;
        let borderColor: string, shadow: string;

        if (daysUntilDue < 0) {
            Icon = XCircle;
            text = `RETARD`;
            displayValue = `+${Math.abs(daysUntilDue)}j`;
            borderColor = 'var(--danger-border)';
            shadow = '0 2px 8px rgba(239, 68, 68, 0.2)';
        } else if (isUrgent) {
            Icon = AlertTriangle;
            text = daysUntilDue === 0 ? "AUJOURD'HUI" : `URGENT`;
            displayValue = `${daysUntilDue}j`;
            borderColor = 'var(--error-border)';
            shadow = '0 2px 8px rgba(239, 68, 68, 0.2)';
        } else if (isDueSoon) {
            Icon = ClockIcon;
            text = `BIENTÔT`;
            displayValue = `${daysUntilDue}j`;
            borderColor = 'var(--warning-border)';
            shadow = '0 2px 8px rgba(245, 158, 11, 0.2)';
        } else if (daysUntilDue >= 0) {
            Icon = CheckCircle;
            text = "OK";
            displayValue = `${daysUntilDue}j`;
            borderColor = 'var(--success-border)';
            shadow = '0 2px 8px rgba(34, 197, 94, 0.2)';
        } else {
            Icon = ClockIcon;
            text = "N/A";
            displayValue = '--';
            borderColor = 'var(--border-color)';
            shadow = 'none';
        }

        return (
            <IndicatorBlock $daysUntilDue={daysUntilDue} style={{
                border: `2px solid ${borderColor}`,
                boxShadow: shadow,
            }}>
                <Icon size={24} />
                <IndicatorValue style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold' 
                }}>
                    {displayValue}
                </IndicatorValue>
                <IndicatorText style={{ 
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    {text}
                </IndicatorText>
            </IndicatorBlock>
        );
    };

    return (
        <CardsPaginationContainer style={{ maxWidth: '100%', overflowX: 'hidden' }}>
            <CardsContainer
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--spacing-md, 1rem)',
                  alignItems: 'stretch',
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
                            <Card 
                                key={mission.id} 
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                }}
                            >
                                
                                {/* 1. Bloc Indicateur (Statut/Urgence) */}
                                {renderDueIndicator(daysUntilDue, mission.status)}

                                {/* 2. En-tête (Titre & Badge Statut) */}
                                <CardHeader style={{ marginBottom: '0.5rem' }}>
                                    <CardTitle title={mission.title} style={{ fontSize: '0.875rem' }}>
                                        {mission.title}
                                    </CardTitle>
                                    {getStatusBadge(mission.status)}
                                </CardHeader>
                                
                                {/* 3. Informations de la mission - DESIGN AMÉLIORÉ ET RÉDUIT */}
                                <CardInfo style={{ gap: '0.25rem', flex: 1 }}>
                                    {/* Bloc principal - Missionnaire en vedette */}
                                    <div style={{
                                        background: 'var(--bg-light)',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border-color)',
                                    }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            gap: '8px',
                                            flexWrap: 'wrap',
                                        }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '6px',
                                                flex: 1,
                                                minWidth: 0, // Permet le shrink
                                            }}>
                                                <User size={16} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                                                <div style={{ 
                                                    fontSize: '13px', 
                                                    fontWeight: '600',
                                                    color: 'var(--text-color)',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {formatRequesterName(mission.employeeName || "Non spécifié")}
                                                </div>
                                            </div>
                                            <div style={{ 
                                                background: 'var(--bg-primary)',
                                                padding: '6px 8px',
                                                borderRadius: '3px',
                                                border: '1px solid var(--border-color)',
                                                flexShrink: 0,
                                            }}>
                                                <div style={{ 
                                                    fontSize: '8px', 
                                                    color: 'var(--text-secondary)',
                                                    marginBottom: '1px',
                                                    textAlign: 'center'
                                                }}>
                                                    MAT.
                                                </div>
                                                <div style={{ 
                                                    fontSize: '11px', 
                                                    fontWeight: '600',
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
                                        gap: '6px',
                                        padding: '6px 0',
                                        borderBottom: '1px solid var(--border-color)',
                                        flexWrap: 'wrap',
                                    }}>
                                        <MapPin size={14} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ 
                                                fontSize: '11px', 
                                                fontWeight: '500',
                                                color: 'var(--text-color)',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {mission.location || "Non spécifié"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Période */}
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '6px',
                                        padding: '6px 0',
                                        flexWrap: 'wrap',
                                    }}>
                                        <Calendar size={14} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                                        <div style={{ 
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '10px',
                                            fontWeight: '500',
                                            minWidth: 0,
                                        }}>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                {formatDate(mission.departureDate)}
                                            </span>
                                            <ArrowRight size={12} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                {formatDate(mission.returnDate)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Date de validation (si validée) */}
                                    {mission.status === 'approved' && mission.validationDate && (
                                        <div style={{
                                            background: 'var(--success-bg)',
                                            padding: '6px 8px',
                                            borderRadius: '3px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            marginTop: '2px',
                                            flexWrap: 'wrap',
                                        }}>
                                            <CheckCircle size={12} style={{ color: 'var(--success-color)' }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <span style={{ 
                                                    fontSize: '9px', 
                                                    color: 'var(--success-color)',
                                                    fontWeight: '500',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    Validée le {formatDate(mission.validationDate)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardInfo>

                                {/* 4. Barre d'actions améliorée - Conditionnelle selon le statut */}
                                <ActionsContainer style={{ marginTop: 'auto' }}>
                                    {mission.status === 'pending' && (
                                        <>
                                            <ActionButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openConfirmModal(mission.id, 'validate');
                                                }}
                                                className="validate"
                                            >
                                                <CheckCircle size={14} />
                                                Valider
                                            </ActionButton>
                                            <ActionButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openConfirmModal(mission.id, 'reject');
                                                }}
                                                className="reject"
                                            >
                                                <XCircle size={14} />
                                                Rejeter
                                            </ActionButton>
                                        </>
                                    )}
                                    <ActionButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRowClick(mission.id);
                                        }}
                                        className="details"
                                    >
                                        <Eye size={14} />
                                        Voir détails
                                    </ActionButton>
                                </ActionsContainer>
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

            {/* Modal de confirmation partagé pour toutes les cartes */}
            <Modal
                type={confirmActionType === 'validate' ? "success" : "error"}
                message={
                    confirmActionType === 'validate'
                        ? "Êtes-vous sûr de vouloir valider cette mission ? Cette action est irréversible et passera la mission au statut 'Validée'."
                        : "Êtes-vous sûr de vouloir rejeter cette mission ? Cette action est irréversible et passera la mission au statut 'Rejetée'."
                }
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmModal}
                title={confirmActionType === 'validate' ? "Confirmer la validation" : "Confirmer le rejet"}
                confirmAction={confirmAction}
                confirmLabel={confirmActionType === 'validate' ? "Confirmer la Validation" : "Confirmer le Rejet"}
                cancelLabel="Annuler"
                showActions={true}
            />
        </CardsPaginationContainer>
    );
};

export default MissionCards;