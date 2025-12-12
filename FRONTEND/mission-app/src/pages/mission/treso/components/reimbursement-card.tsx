import React from "react";
import { useNavigate } from "react-router-dom";
import { 
    MapPin, 
    Calendar, 
    DollarSign, 
    User, 
    CheckCircle, 
    ClockIcon, 
    XCircle, 
    AlertTriangle,
    Eye 
} from "lucide-react";
import { 
    IndicatorBlock, 
    IndicatorValue, 
    IndicatorText,
    Card,
    CardHeader,
    CardTitle,
    CardInfo,
    ActionButton,
    ActionsContainer
} from "@/styles/card-styles";
import type { FormattedRemboursement } from "./types/reimbursement";
import { formatCurrency, formatDate } from "@/utils/currency";
import { StatusBadge, STATUSES, type Status } from "@/components/status";

interface ReimbursementCardProps {
    remboursement: FormattedRemboursement;
    onReimburse: (missionId: string, employeeId: string) => void;
    isReimbursing: boolean;
}

// Fonction pour formater le nom de l'employé
const formatEmployeeName = (name: string): string => {
    if (!name) return "Non spécifié";
    
    // Supposons que le nom est au format "Nom Prénom"
    const parts = name.split(' ');
    if (parts.length >= 2) {
        // Retourner "Prénom NOM" si c'est en format "NOM Prénom"
        const lastName = parts[0];
        const firstName = parts.slice(1).join(' ');
        return `${firstName} ${lastName.toUpperCase()}`;
    }
    return name;
};

// Fonction pour obtenir l'objet status
const getStatusObject = (status: string): Status => {
    const reimbursementStatuses: Status[] = [
        { 
            id: 'notreimbursed', 
            label: 'Non remboursé', 
            color: '#f97316', 
            category: 'warning' as const 
        },
        { 
            id: 'reimbursed', 
            label: 'Remboursé', 
            color: '#10b981', 
            category: 'success' as const 
        },
    ];
    
    const foundStatus = reimbursementStatuses.find(s => s.id === status);
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

// Fonction pour calculer le nombre de jours depuis la création
const getDaysSinceCreation = (createdAt: string): number => {
    try {
        const createdDate = new Date(createdAt);
        const today = new Date();
        
        // Réinitialiser les heures pour comparer seulement les dates
        const createdDateOnly = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        // Calculer la différence en millisecondes
        const diffTime = todayOnly.getTime() - createdDateOnly.getTime();
        
        // Convertir en jours (arrondi à l'entier inférieur)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    } catch (error) {
        console.error("Erreur lors du calcul des jours depuis la création:", error);
        return 0;
    }
};

// Fonction pour calculer le nombre de jours jusqu'à l'échéance (5 jours après création)
const getDaysUntilDue = (createdAt: string): number => {
    try {
        const createdDate = new Date(createdAt);
        const dueDate = new Date(createdDate);
        dueDate.setDate(createdDate.getDate() + 5); // Échéance 5 jours après création
        
        const today = new Date();
        
        // Réinitialiser les heures pour comparer seulement les dates
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        // Calculer la différence en millisecondes
        const diffTime = dueDateOnly.getTime() - todayOnly.getTime();
        
        // Convertir en jours (arrondi à l'entier inférieur)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    } catch (error) {
        console.error("Erreur lors du calcul des jours jusqu'à l'échéance:", error);
        return 0;
    }
};

const renderDueIndicator = (daysSinceCreation: number, status: string) => {
    const neutralDays = 999;
    
    // Si déjà remboursé
    if (status === 'reimbursed') {
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
                    REMBOURSÉ
                </IndicatorText>
            </IndicatorBlock>
        );
    }
    
    const daysUntilDue = 5 - daysSinceCreation;
    
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
        // Cas par défaut
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

export const ReimbursementCard: React.FC<ReimbursementCardProps> = ({ 
    remboursement, 
    onReimburse, 
    isReimbursing 
}) => {
    const navigate = useNavigate();
    
    // Calculer le nombre de jours depuis la création
    const daysSinceCreation = getDaysSinceCreation(remboursement.createdAt);
    // Calculer les jours jusqu'à l'échéance
    const daysUntilDue = getDaysUntilDue(remboursement.createdAt);

    return (
        <Card style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            {renderDueIndicator(daysSinceCreation, remboursement.status)}
            <CardHeader style={{ marginBottom: '0.5rem' }}>
                <CardTitle title={remboursement.missionName} style={{ fontSize: '0.875rem' }}>
                    {remboursement.missionName}
                </CardTitle>
                <StatusBadge status={getStatusObject(remboursement.status)} />
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
                                {formatEmployeeName(remboursement.employeeName || "Non spécifié")}
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
                                {remboursement.employeeCode || "N/A"}
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
                            {remboursement.lieuName || "Non spécifié"}
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '500',
                            color: 'var(--text-color)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            Créé le {formatDate(remboursement.createdAt)}
                        </div>
                        <div style={{
                            fontSize: '9px',
                            color: daysUntilDue < 0 ? 'var(--error-color)' : 
                                   daysUntilDue <= 3 ? 'var(--warning-color)' : 'var(--text-secondary)',
                            fontStyle: 'italic',
                        }}>
                        </div>
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
                            {formatCurrency(remboursement.totalAmount)}
                        </span>
                    </div>
                </div>
                
                {remboursement.status === 'reimbursed' && remboursement.updatedAt && (
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
                                Remboursé le {formatDate(remboursement.updatedAt)}
                            </span>
                        </div>
                    </div>
                )}
            </CardInfo>
            <ActionsContainer
                $singleButton={remboursement.status !== 'notreimbursed'}
                style={{ marginTop: 'auto' }}
            >
                {remboursement.status === 'notreimbursed' && (
                    <ActionButton
                        onClick={(e) => {
                            e.stopPropagation();
                            onReimburse(remboursement.missionId, remboursement.employeeId);
                        }}
                        className="validate"
                        disabled={isReimbursing}
                    >
                        <CheckCircle size={14} />
                        Rembourser
                    </ActionButton>
                )}
                <ActionButton
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/mission/collaborateur/${remboursement.missionId}`);
                    }}
                    className="details"
                    disabled={isReimbursing}
                >
                    <Eye size={14} />
                    Voir détails
                </ActionButton>
            </ActionsContainer>
        </Card>
    );
};