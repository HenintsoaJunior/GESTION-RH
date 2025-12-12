"use client";

import React, { useState } from "react";
import {
    Clock as ClockIcon,
    CheckCircle,
    XCircle,
    Calendar,
    MapPin,
    AlertTriangle,
    DollarSign,
    ArrowRight,
    Eye,
    User,
} from "lucide-react";
import {
    Loading,
    NoDataMessage,
} from "@/styles/table-styles";
import {
    StatusBadge,
    STATUSES,
    type Status,
} from "@/components/status";
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
    ActionButton,
    ActionsContainer,
} from "@/styles/card-styles";
import Modal from "@/components/modal";
import type { CompensationMissionCardsProps, FormattedCompensation } from "./types/compensation";

const CompensationMissionCards: React.FC<CompensationMissionCardsProps> = ({
    compensations,
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
    const [confirmingCompensationId, setConfirmingCompensationId] = useState<string | null>(null);
    const [confirmingEmployeeId, setConfirmingEmployeeId] = useState<string | null>(null);
    const [confirmActionType, setConfirmActionType] = useState<'pay' | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const formatEmployeeName = (fullName: string): string => {
        return fullName || "Non spécifié";
    };

    const getStatusObject = (status: string): Status => {
        const compensationStatuses: Status[] = [
            { 
                id: 'unpaid', 
                label: 'Non payé', 
                color: '#f97316', 
                category: 'warning' as const 
            },
            { 
                id: 'paid', 
                label: 'Payé', 
                color: '#10b981', 
                category: 'success' as const 
            },
        ];
        
        const foundStatus = compensationStatuses.find(s => s.id === status);
        if (foundStatus) return foundStatus;
        
        const generalStatus = STATUSES.find(s => s.id === status);
        if (generalStatus) return generalStatus;
        
        return { 
            id: status, 
            label: status, 
            color: '#6b7280', 
            category: 'progress' as const 
        };
    };

    const hasFilters =
        appliedFilters.employeeId ||
        appliedFilters.employeeName ||
        appliedFilters.employeeMatricule ||
        appliedFilters.status ||
        appliedFilters.missionType ||
        appliedFilters.paymentDateFrom ||
        appliedFilters.paymentDateTo ||
        appliedFilters.validationDateFrom ||
        appliedFilters.validationDateTo ||
        appliedFilters.requestDateFrom ||
        appliedFilters.requestDateTo;

    const openConfirmModal = (compensationId: string, employeeId: string, action: 'pay') => {
        setConfirmingCompensationId(compensationId);
        setConfirmingEmployeeId(employeeId);
        setConfirmActionType(action);
        setIsConfirmModalOpen(true);
    };

    const confirmAction = async () => {
        if (confirmingCompensationId && confirmingEmployeeId && confirmActionType && handleAction) {
            try {
                await handleAction(confirmingCompensationId, confirmingEmployeeId, confirmActionType);
            } catch (error) {
                console.error(`Erreur lors de l'action ${confirmActionType}:`, error);
            }
        }
        setIsConfirmModalOpen(false);
        setConfirmingCompensationId(null);
        setConfirmingEmployeeId(null);
        setConfirmActionType(null);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setConfirmingCompensationId(null);
        setConfirmingEmployeeId(null);
        setConfirmActionType(null);
    };

    const renderDueIndicator = (daysUntilDue: number, status: string) => {
        const neutralDays = 999;

        if (status === 'paid') {
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
                        PAYÉ
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
                    gridTemplateColumns: `repeat(${pageSize === 3 ? 3 : 3}, 1fr)`,
                    gap: 'var(--spacing-md, 1rem)',
                    alignItems: 'stretch',
                }}
            >
                {isLoading.compensations ? (
                    <Loading>Chargement des compensations...</Loading>
                ) : compensations && compensations.length > 0 ? (
                    <>
                        {compensations.map((compensation: FormattedCompensation) => {    
                            const daysUntilDue = getDaysUntilDue(compensation.departureDate);
                        
                            return (
                                <Card
                                    key={compensation.id}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                    }}
                                >
                                    {renderDueIndicator(daysUntilDue, compensation.status)}

                                    <CardHeader style={{ marginBottom: '0.5rem' }}>
                                        <CardTitle title={compensation.missionName} style={{ fontSize: '0.875rem' }}>
                                            {compensation.missionName}
                                        </CardTitle>
                                        <StatusBadge status={getStatusObject(compensation.status)} />
                                    </CardHeader>

                                    <CardInfo style={{ gap: '0.25rem', flex: 1 }}>
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
                                                    minWidth: 0,
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
                                                        {formatEmployeeName(compensation.employeeName || "Non spécifié")}
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
                                                        {compensation.employeeCode || "N/A"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

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
                                                    {compensation.lieuName || "Non spécifié"}
                                                </div>
                                            </div>
                                        </div>

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
                                                    {formatDate(compensation.departureDate)}
                                                </span>
                                                <ArrowRight size={12} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                    {formatDate(compensation.returnDate)}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{
                                            background: 'var(--info-bg)',
                                            padding: '6px 8px',
                                            borderRadius: '3px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            marginTop: '4px',
                                            flexWrap: 'wrap',
                                        }}>
                                            <DollarSign size={12} style={{ color: 'var(--info-color)' }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <span style={{
                                                    fontSize: '11px',
                                                    color: 'var(--info-color)',
                                                    fontWeight: '600',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {compensation.totalAmount.toLocaleString('fr-FR')} MGA
                                                </span>
                                            </div>
                                        </div>

                                        {compensation.status === 'paid' && compensation.paymentDate && (
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
                                                        Payé le {formatDate(compensation.paymentDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </CardInfo>

                                    <ActionsContainer style={{ marginTop: 'auto' }}>
                                        {compensation.status === 'unpaid' && (
                                            <ActionButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openConfirmModal(compensation.id, compensation.employeeId, 'pay');
                                                }}
                                                className="validate"
                                            >
                                                <CheckCircle size={14} />
                                                Payer
                                            </ActionButton>
                                        )}
                                        <ActionButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRowClick(compensation.id);
                                            }}
                                            className="details"
                                        >
                                            <Eye size={14} />
                                            Voir détails
                                        </ActionButton>
                                    </ActionsContainer>
                                </Card>
                            );
                        })}
                    </>
                ) : (
                    <NoDataMessage>
                        {hasFilters
                            ? "Aucune compensation ne correspond aux critères de recherche."
                            : "Aucune compensation trouvée."}
                    </NoDataMessage>
                )}
            </CardsContainer>

            {totalEntries > 0 && (
                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalEntries={totalEntries}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

            <Modal
                type="success"
                message="Êtes-vous sûr de vouloir payer cette compensation ? Cette action est irréversible et passera la compensation au statut 'Payée'."
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmModal}
                title="Confirmer le paiement"
                confirmAction={confirmAction}
                confirmLabel="Confirmer le Paiement"
                cancelLabel="Annuler"
                showActions={true}
            />
        </CardsPaginationContainer>
    );
};

export default CompensationMissionCards;