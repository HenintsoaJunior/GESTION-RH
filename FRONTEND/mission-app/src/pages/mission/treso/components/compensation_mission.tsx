"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
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
    ArrowLeft,
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
import { useCompensationsByStatus, useUpdateStatus } from "@/api/mission/compensation(indemnité)/services";
import type { Compensation } from "@/api/mission/compensation(indemnité)/services";
import Modal from "@/components/modal";
import AlertComponent from "@/components/alert";

// Types pour les filtres appliqués
interface AppliedFilters {
    employeeId: string;
    employeeName: string;
    status: string;
    missionType: string;
    paymentDateFrom?: string;
    paymentDateTo?: string;
}

// Types pour l'état de chargement
interface LoadingState {
    compensations: boolean;
    employees: boolean;
    stats: boolean;
}

// Type pour la compensation formatée
interface FormattedCompensation {
    id: string;
    missionId: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    missionName: string;
    missionType: string;
    transportType: string;
    lieuName: string;
    departureDate: string;
    returnDate: string;
    duration: number;
    totalAmount: number;
    status: string;
    paymentDate: string | null;
    createdAt: string;
    updatedAt: string | null;
    isValidated: boolean | null;
    allocatedFund: number;
}

// Props pour le composant CompensationMissionCards
interface CompensationMissionCardsProps {
    compensations: FormattedCompensation[];
    isLoading: LoadingState;
    handleRowClick: (compensationId: string) => void;
    handleAction?: (compensationId: string, employeeId: string, action: 'pay') => Promise<void>;
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
// COMPOSANT CARTES DE COMPENSATION
// ========================================================================================

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
    // États pour la confirmation des actions
    const [confirmingCompensationId, setConfirmingCompensationId] = useState<string | null>(null);
    const [confirmingEmployeeId, setConfirmingEmployeeId] = useState<string | null>(null);
    const [confirmActionType, setConfirmActionType] = useState<'pay' | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    /**
     * Retourne le nom complet du collaborateur tel quel
     */
    const formatEmployeeName = (fullName: string): string => {
        return fullName || "Non spécifié";
    };

    /**
     * Récupère la configuration du statut depuis STATUSES
     */
    const getStatusObject = (status: string): Status => {
        // Définition des statuts spécifiques aux compensations
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
        
        // Chercher d'abord dans les statuts spécifiques
        const foundStatus = compensationStatuses.find(s => s.id === status);
        if (foundStatus) return foundStatus;
        
        // Sinon chercher dans les statuts généraux
        const generalStatus = STATUSES.find(s => s.id === status);
        if (generalStatus) return generalStatus;
        
        // Statut par défaut
        return { 
            id: status, 
            label: status, 
            color: '#6b7280', 
            category: 'progress' as const 
        };
    };

    // Vérifie si des filtres sont appliqués pour afficher le message "NoData" approprié
    const hasFilters =
        appliedFilters.employeeId ||
        appliedFilters.employeeName ||
        appliedFilters.status ||
        appliedFilters.missionType ||
        appliedFilters.paymentDateFrom ||
        appliedFilters.paymentDateTo;

    /**
     * Ouvre le modal de confirmation pour une action
     */
    const openConfirmModal = (compensationId: string, employeeId: string, action: 'pay') => {
        setConfirmingCompensationId(compensationId);
        setConfirmingEmployeeId(employeeId);
        setConfirmActionType(action);
        setIsConfirmModalOpen(true);
    };

    /**
     * Confirme l'action et ferme le modal
     */
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

    /**
     * Ferme le modal de confirmation
     */
    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setConfirmingCompensationId(null);
        setConfirmingEmployeeId(null);
        setConfirmActionType(null);
    };

    /**
     * Rendu du bloc indicateur d'urgence basé sur le nombre de jours avant l'échéance.
     */
    const renderDueIndicator = (daysUntilDue: number, status: string) => {
        const neutralDays = 999; // Valeur neutre pour éviter les styles d'urgence

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
                {/* Affichage conditionnel du chargement, des données ou de l'absence de données */}
                {isLoading.compensations ? (
                    <Loading>Chargement des compensations...</Loading>
                ) : compensations && compensations.length > 0 ? (
                    compensations.map((compensation) => {
                        // Calcul des jours restants avant l'échéance
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

                                {/* 1. Bloc Indicateur (Statut/Urgence) */}
                                {renderDueIndicator(daysUntilDue, compensation.status)}

                                {/* 2. En-tête (Titre & Badge Statut) */}
                                <CardHeader style={{ marginBottom: '0.5rem' }}>
                                    <CardTitle title={compensation.missionName} style={{ fontSize: '0.875rem' }}>
                                        {compensation.missionName}
                                    </CardTitle>
                                    <StatusBadge status={getStatusObject(compensation.status)} />
                                </CardHeader>

                                {/* 3. Informations de la compensation - DESIGN AMÉLIORÉ ET RÉDUIT */}
                                <CardInfo style={{ gap: '0.25rem', flex: 1 }}>
                                    {/* Bloc principal - Collaborateur en vedette */}
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
                                                {compensation.lieuName || "Non spécifié"}
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
                                                {formatDate(compensation.departureDate)}
                                            </span>
                                            <ArrowRight size={12} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                {formatDate(compensation.returnDate)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Montant */}
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

                                    {/* Date de paiement (si payée) */}
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

                                {/* 4. Barre d'actions améliorée - Conditionnelle selon le statut */}
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
                />
            )}

            {/* Modal de confirmation partagé pour toutes les cartes */}
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

const CompensationMission: React.FC = () => {
    const navigate = useNavigate();

    const [] = useState({
        status: "",
        missionType: "",
        employeeSearch: "",
        paymentDateMin: "",
        paymentDateMax: "",
    });
    const [appliedFilters] = useState<AppliedFilters>({
        employeeId: "",
        employeeName: "",
        status: "",
        missionType: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [compensations, setCompensations] = useState<FormattedCompensation[]>([]);
    const [totalEntries, setTotalEntries] = useState(0);
    const [isLoading, setIsLoading] = useState<LoadingState>({
        compensations: true,
        employees: false, // Modifié car on n'utilise plus employees
        stats: false,
    });

    // État pour l'alerte
    const [alert, setAlert] = useState<{
        message: string;
        type: "success" | "error" | "warning" | "info";
        isOpen: boolean;
    }>({ message: "", type: "info", isOpen: false });

    // Hooks d'API
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData?.userId || "";
    const statusParam = appliedFilters.status || "";
    const { data: compensationsResponse, isLoading: compensationsLoading } = useCompensationsByStatus(statusParam, currentPage, pageSize);
    const { mutate: updateStatus } = useUpdateStatus();

    // Formatter les compensations
    useEffect(() => {
        if (compensationsResponse && userId) {
            if (!compensationsResponse.data?.items || !Array.isArray(compensationsResponse.data.items)) {
                setCompensations([]);
                setTotalEntries(0);
                return;
            }

            const formattedCompensations: FormattedCompensation[] = compensationsResponse.data.items.map((item) => {
                const { mission, compensations: comps } = item;
                const employee = mission.employee || {};
                const lieu = mission.lieu || {};
                const compStatus = comps[0]?.status || statusParam;

                // Calcul du montant total
                let totalAmount = 0;
                let minPaymentDate: string | null = null;

                comps.forEach((compensation: Compensation) => {
                    const compTotal = (
                        (compensation.transportAmount || 0) +
                        (compensation.breakfastAmount || 0) +
                        (compensation.lunchAmount || 0) +
                        (compensation.dinnerAmount || 0) +
                        (compensation.accommodationAmount || 0) +
                        (compensation.communicationAmount || 0) +
                        (compensation.visaAmount || 0) +
                        (compensation.medicalExpensesAmount || 0) +
                        (compensation.taxesAmount || 0)
                    );
                    totalAmount += compTotal;

                    if (compensation.paymentDate) {
                        const compDate = new Date(compensation.paymentDate).getTime();
                        const currentMin = minPaymentDate ? new Date(minPaymentDate).getTime() : Infinity;
                        if (compDate < currentMin) {
                            minPaymentDate = compensation.paymentDate;
                        }
                    }
                });

                const missionTypeValue = mission.missionType || 1;
                const missionTypeString = missionTypeValue === 1 ? "National" : "International";

                return {
                    id: mission.missionId || "N/A",
                    missionId: mission.missionId || "N/A",
                    employeeId: mission.employeeId || "N/A",
                    employeeName: `${employee.lastName || "Inconnu"} ${employee.firstName || ""}`.trim(),
                    employeeCode: employee.employeeCode || "N/A",
                    missionName: mission.name || "Mission sans nom",
                    missionType: missionTypeString,
                    transportType: mission.transport?.type || "N/A",
                    lieuName: lieu.nom || "Non spécifié",
                    departureDate: mission.departureDate || "Non spécifié",
                    returnDate: mission.returnDate || "Non spécifié",
                    duration: mission.duration || 0,
                    totalAmount: totalAmount,
                    status: compStatus,
                    paymentDate: minPaymentDate,
                    createdAt: mission.createdAt || new Date().toISOString(),
                    updatedAt: mission.updatedAt || null,
                    isValidated: !!mission.isValidated,
                    allocatedFund: mission.allocatedFund || 0,
                };
            });

            setCompensations(formattedCompensations);
            setTotalEntries(compensationsResponse.data.totalCount || 0);
        }
    }, [compensationsResponse, statusParam, userId]);

    // Mise à jour de l'état de chargement
    useEffect(() => {
        setIsLoading((prev) => ({
            ...prev,
            compensations: compensationsLoading,
        }));
    }, [compensationsLoading]);

    // Handlers


    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
    }, []);

    const handlePageSizeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPageSize = Number(event.target.value);
        if (newPageSize > 0 && Number.isInteger(newPageSize)) {
            setPageSize(newPageSize);
            setCurrentPage(1);
        }
    }, []);

    const handleRowClick = useCallback((compensationId: string) => {
        navigate(`/mission/collaborateur/${compensationId}`);
    }, [navigate]);

    const handleAction = useCallback(async (compensationId: string, employeeId: string, action: 'pay') => {
        if (action === 'pay') {
            updateStatus(
                {
                    employeeId: employeeId,
                    missionId: compensationId,
                    status: "paid",
                },
                {
                    onSuccess: () => {
                        setAlert({
                            message: "Paiement confirmé avec succès !",
                            type: "success",
                            isOpen: true,
                        });
                    },
                    onError: (error) => {
                        console.error("Erreur lors de la mise à jour du statut:", error);
                        setAlert({
                            message: "Erreur lors de la confirmation du paiement.",
                            type: "error",
                            isOpen: true,
                        });
                    },
                }
            );
        }
    }, [updateStatus]);

    const handleAlertClose = useCallback(() => {
        setAlert({ message: "", type: "info", isOpen: false });
    }, []);

    const formatDate = useCallback((dateString?: string | null): string => {
        if (!dateString) return "Date non spécifiée";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }, []);

    const getDaysUntilDue = useCallback((dueDate?: string | null): number => {
        if (!dueDate) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, []);

    // Compensations filtrées
    const filteredCompensations = useMemo(() => {
        return compensations.filter((c) => {
            if (appliedFilters.missionType && c.missionType !== appliedFilters.missionType) return false;
            if (appliedFilters.employeeName && !c.employeeName.toLowerCase().includes(appliedFilters.employeeName.toLowerCase())) return false;
            if (appliedFilters.paymentDateFrom || appliedFilters.paymentDateTo) {
                if (c.status === "unpaid") return true;
                if (!c.paymentDate) return false;
                const paymentDate = new Date(c.paymentDate);
                if (appliedFilters.paymentDateFrom) {
                    const minDate = new Date(appliedFilters.paymentDateFrom);
                    if (paymentDate < minDate) return false;
                }
                if (appliedFilters.paymentDateTo) {
                    const maxDate = new Date(appliedFilters.paymentDateTo);
                    if (paymentDate > maxDate) return false;
                }
            }
            return true;
        });
    }, [compensations, appliedFilters]);

    // Pagination
    const paginatedCompensations = useMemo(
        () => filteredCompensations.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [filteredCompensations, currentPage, pageSize]
    );

    const handleBack = useCallback(() => {
        navigate("/treasury");
    }, [navigate]);

    return (
        <>
            {/* En-tête de page */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--spacing-lg)',
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <button
                        onClick={handleBack}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-light)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-light)'}
                        title="Retour aux missions"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            margin: 0,
                            color: 'var(--text-color)',
                        }}>
                            Indemnités
                        </h1>
                        <p style={{
                            fontSize: '0.875rem',
                            margin: 0,
                            color: 'var(--text-secondary)',
                        }}>
                            Gestion des indemnités
                        </p>
                    </div>
                </div>
            </div>

            <CompensationMissionCards
                compensations={paginatedCompensations}
                isLoading={isLoading}
                handleRowClick={handleRowClick}
                handleAction={handleAction}
                formatDate={formatDate}
                getDaysUntilDue={getDaysUntilDue}
                currentPage={currentPage}
                pageSize={pageSize}
                totalEntries={totalEntries}
                handlePageChange={handlePageChange}
                handlePageSizeChange={handlePageSizeChange}
                appliedFilters={appliedFilters}
            />

            {/* Toast Alert Component */}
            <AlertComponent
                type={alert.type}
                message={alert.message}
                isOpen={alert.isOpen}
                onClose={handleAlertClose}
            />
        </>
    );
};

export default CompensationMission;