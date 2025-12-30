// ValidateursPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
    ShieldCheck, 
    Users, 
    User, 
    Mail, 
    Phone,
    Calendar,
    X
} from "lucide-react";

// Import des styles
import {
    ValidateursPageContainer,
    ValidateursHeader,
    ValidateursTitle,
    DirectionsNav,
    DirectionButton,
    ValidateursTable,
    TableHeader,
    ValidateurRow,
    Cell,
    ValidateurInfo,
    ValidateurName,
    ValidateurFullName,
    ValidateurMatricule,
    DirectionCell,
    PosteCell,
    RemplacantsCell,
    RemplacantsContainer,
    RemplacantItem,
    RemplacantInfo,
    RemplacantName,
    RemplacantOrdre,
    DetailsModal,
    ModalHeader,
    ModalTitle,
    ModalContent,
    LoadingState,
    EmptyState,
    EmptyIcon,
    EmptyText
} from "@/styles/validateur-styles";

// Import du hook de service
import { useGetValidators } from "@/api/mission/validation_flow/services";
import type { Validator } from "@/api/mission/validation_flow/services";

// Import de la fonction getInitials
import { getInitials } from "@/utils/initials";

// Types adaptés à l'API
interface Remplacant {
    id: string;
    validatorId: string;
    nom: string;
    prenom: string;
    matricule: string;
    ordre: number;
    email?: string;
    poste: string;
    validatorType: string;
}

interface Validateur {
    id: string;
    validatorId: string;
    nom: string;
    prenom: string;
    direction: string;
    poste: string;
    email: string;
    telephone?: string;
    matricule: string;
    dateDebut: string;
    dateFin?: string;
    validatorType: string;
    backupOrder: number;
    superiorName?: string;
    superiorPosition?: string;
    remplaçants: Remplacant[];
}

interface ValidateursListProps {
    validateurs?: Validateur[];
    directions?: string[];
}

// Composant Avatar réutilisable
const Avatar: React.FC<{
    name: string;
    size?: number;
    bgColor?: string;
    textColor?: string;
}> = ({ name, size = 40, bgColor = "var(--primary-color)", textColor = "white" }) => {
    return (
        <div style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            backgroundColor: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: `${size * 0.4}px`,
            fontWeight: "600",
            color: textColor,
            overflow: "hidden",
            flexShrink: 0
        }}>
            {getInitials(name)}
        </div>
    );
};

// Composant ModalSection personnalisé
const ModalSection: React.FC<{ 
    children: React.ReactNode;
    isLast?: boolean;
}> = ({ children, isLast = false }) => (
    <div style={{
        marginBottom: isLast ? 0 : 'var(--spacing-lg)',
        paddingBottom: isLast ? 0 : 'var(--spacing-lg)',
        borderBottom: isLast ? 'none' : '1px solid var(--border-color)'
    }}>
        {children}
    </div>
);

// Composant SectionTitle
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
        marginBottom: 'var(--spacing-md)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    }}>
        {children}
    </div>
);

// Props pour ValidateurDetailsModal
interface ValidateurDetailsModalProps {
    validateur: Validateur | null;
    isOpen: boolean;
    onClose: () => void;
}

// Composant ValidateurDetailsModal
const ValidateurDetailsModal: React.FC<ValidateurDetailsModalProps> = ({ 
    validateur, 
    isOpen, 
    onClose 
}) => {
    if (!validateur) return null;

    const formatDate = (date: string) => {
        try {
            return new Date(date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return date;
        }
    };

    // Compter le nombre de sections pour savoir quelle est la dernière
    const hasRemplacants = validateur.remplaçants.length > 0;
    const hasSuperior = !!validateur.superiorName;
    // Déterminer le nombre de sections qui seront affichées
    const sectionCount = 3 + (hasRemplacants ? 1 : 0) + (hasSuperior ? 1 : 0);
    let currentSection = 0;

    return (
        <DetailsModal $isOpen={isOpen}>
            <ModalHeader>
                <ModalTitle>Détails du validateur</ModalTitle>
                <button 
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={20} />
                </button>
            </ModalHeader>
            
            <ModalContent>
                {/* Section informations générales */}
                <ModalSection isLast={++currentSection === sectionCount}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-md)',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        <Avatar 
                            name={`${validateur.prenom} ${validateur.nom}`}
                            size={60}
                            bgColor="var(--primary-color)"
                            textColor="white"
                        />
                        <div>
                            <div style={{
                                fontSize: 'var(--font-size-lg)',
                                fontWeight: '600',
                                color: 'var(--text-color)'
                            }}>
                                {validateur.prenom} {validateur.nom.toUpperCase()}
                            </div>
                            <div style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--text-secondary)',
                                marginTop: '2px'
                            }}>
                                {validateur.poste} • {validateur.validatorType}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 'var(--spacing-md)'
                    }}>
                        <div>
                            <div style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--text-secondary)',
                                marginBottom: '4px'
                            }}>
                                Direction
                            </div>
                            <div style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--text-color)',
                                fontWeight: '500'
                            }}>
                                {validateur.direction}
                            </div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--text-secondary)',
                                marginBottom: '4px'
                            }}>
                                Matricule
                            </div>
                            <div style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--text-color)',
                                fontWeight: '500'
                            }}>
                                {validateur.matricule}
                            </div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--text-secondary)',
                                marginBottom: '4px'
                            }}>
                                Type
                            </div>
                            <div style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--text-color)',
                                fontWeight: '500'
                            }}>
                                {validateur.validatorType}
                            </div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--text-secondary)',
                                marginBottom: '4px'
                            }}>
                                Ordre
                            </div>
                            <div style={{
                                fontSize: 'var(--font-size-sm)',
                                color: validateur.backupOrder === 0 ? 'var(--primary-color)' : 'var(--info-color)',
                                fontWeight: '500'
                            }}>
                                {validateur.backupOrder === 0 ? 'Principal' : `Backup ${validateur.backupOrder}`}
                            </div>
                        </div>
                    </div>
                </ModalSection>

                {/* Section informations de contact */}
                <ModalSection isLast={++currentSection === sectionCount}>
                    <SectionTitle>
                        <User size={14} />
                        Informations de contact
                    </SectionTitle>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-md)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}>
                            <Mail size={14} style={{ color: 'var(--text-secondary)' }} />
                            <div>
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--text-secondary)'
                                }}>
                                    Email
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--text-color)'
                                }}>
                                    {validateur.email}
                                </div>
                            </div>
                        </div>
                        {validateur.telephone && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)'
                            }}>
                                <Phone size={14} style={{ color: 'var(--text-secondary)' }} />
                                <div>
                                    <div style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        Téléphone
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--text-color)'
                                    }}>
                                        {validateur.telephone}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ModalSection>

                {/* Section chefs de département (remplaçants) */}
                {hasRemplacants && (
                    <ModalSection isLast={++currentSection === sectionCount}>
                        <SectionTitle>
                            <Users size={14} />
                            Remplaçants ({validateur.remplaçants.length})
                        </SectionTitle>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-sm)'
                        }}>
                            {validateur.remplaçants.map((remplaçant) => (
                                <div 
                                    key={remplaçant.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 'var(--spacing-sm)',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                        <Avatar 
                                            name={`${remplaçant.prenom} ${remplaçant.nom}`}
                                            size={40}
                                            bgColor="var(--primary-color)"
                                            textColor="white"
                                        />
                                        <div>
                                            <div style={{
                                                fontSize: 'var(--font-size-sm)',
                                                fontWeight: '500',
                                                color: 'var(--text-color)'
                                            }}>
                                                {remplaçant.prenom} {remplaçant.nom}
                                            </div>
                                            <div style={{
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {remplaçant.poste} • Mat. {remplaçant.matricule}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: 'var(--font-size-xs)',
                                            fontWeight: '600',
                                            color: 'var(--primary-color)',
                                            background: 'var(--primary-light)',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--primary-border)'
                                        }}>
                                            Ordre {remplaçant.ordre}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ModalSection>
                )}

                {/* Section supérieur hiérarchique */}
                {hasSuperior && (
                    <ModalSection isLast={++currentSection === sectionCount}>
                        <SectionTitle>
                            <Users size={14} />
                            Supérieur hiérarchique
                        </SectionTitle>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            padding: 'var(--spacing-sm)',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px'
                        }}>
                            <Avatar 
                                name={validateur.superiorName || ''}
                                size={40}
                                bgColor="var(--info-color)"
                                textColor="white"
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: '500',
                                    color: 'var(--text-color)'
                                }}>
                                    {validateur.superiorName}
                                </div>
                                {validateur.superiorPosition && (
                                    <div style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--text-secondary)',
                                        marginTop: '2px'
                                    }}>
                                        {validateur.superiorPosition}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ModalSection>
                )}

                {/* Section dates importantes (toujours la dernière section) */}
                <ModalSection isLast={true}>
                    <SectionTitle>
                        <Calendar size={14} />
                        Dates importantes
                    </SectionTitle>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 'var(--spacing-md)'
                    }}>
                        <div>
                            <div style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--text-secondary)',
                                marginBottom: '4px'
                            }}>
                                Date de début
                            </div>
                            <div style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--text-color)'
                            }}>
                                {formatDate(validateur.dateDebut)}
                            </div>
                        </div>
                        {validateur.dateFin && (
                            <div>
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '4px'
                                }}>
                                    Date de fin
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--error-color)'
                                }}>
                                    {formatDate(validateur.dateFin)}
                                </div>
                            </div>
                        )}
                    </div>
                </ModalSection>
            </ModalContent>
        </DetailsModal>
    );
};

// Composant principal
export const ValidateursPage: React.FC<ValidateursListProps> = ({ 
    validateurs: initialValidateurs = [], 
    directions: initialDirections = [] 
}) => {
    // Utilisation du hook de service
    const { data: apiValidators = [], isLoading, error } = useGetValidators();
    
    const [validateurs, setValidateurs] = useState<Validateur[]>(initialValidateurs);
    const [directions, setDirections] = useState<string[]>(initialDirections);
    const [selectedDirection, setSelectedDirection] = useState<string>('Tous');
    const [selectedValidateur, setSelectedValidateur] = useState<Validateur | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fonction pour transformer les données de l'API
    const transformValidatorData = useCallback((apiValidators: Validator[]): Validateur[] => {
        if (!apiValidators || apiValidators.length === 0) return [];
        
        // Filtrer d'abord les validateurs principaux (backupOrder = 0)
        const validateursPrincipaux = apiValidators.filter(v => v.backupOrder === 0);
        
        // Transformer chaque validateur principal
        return validateursPrincipaux.map(validateurPrincipal => {
            // Extraire nom et prénom
            const nameParts = validateurPrincipal.user.name.split(' ');
            const prenom = nameParts[0] || '';
            const nom = nameParts.slice(1).join(' ') || validateurPrincipal.user.name;
            
            // Trouver les remplaçants (backupOrder = 1) pour ce validateur principal
            // Les remplaçants sont ceux qui ont le même superiorId que le userId du validateur principal
            const remplaçants = apiValidators
                .filter(v => 
                    v.backupOrder === 1 && 
                    v.superiorId === validateurPrincipal.userId
                )
                .map(remplaçant => {
                    const remplaçantNameParts = remplaçant.user.name.split(' ');
                    const remplaçantPrenom = remplaçantNameParts[0] || '';
                    const remplaçantNom = remplaçantNameParts.slice(1).join(' ') || remplaçant.user.name;
                    
                    return {
                        id: remplaçant.validatorId,
                        validatorId: remplaçant.validatorId,
                        nom: remplaçantNom,
                        prenom: remplaçantPrenom,
                        matricule: remplaçant.user.matricule,
                        ordre: remplaçant.backupOrder,
                        email: remplaçant.user.email,
                        poste: remplaçant.user.position,
                        validatorType: remplaçant.validatorType
                    };
                })
                .sort((a, b) => a.ordre - b.ordre);

            // Trouver le supérieur hiérarchique (le validateur dont le userId correspond au superiorId du validateur principal)
            let superiorName = '';
            let superiorPosition = '';
            
            if (validateurPrincipal.superiorId) {
                const superieur = apiValidators.find(v => 
                    v.userId === validateurPrincipal.superiorId && v.backupOrder === 0
                );
                
                if (superieur) {
                    superiorName = superieur.user.name;
                    superiorPosition = superieur.user.position;
                } else {
                    // Si le supérieur n'est pas dans les validateurs, on utilise les données du champ superior si disponibles
                    superiorName = validateurPrincipal.superior?.name || '';
                    superiorPosition = validateurPrincipal.superior?.position || '';
                }
            } else {
                // Utiliser les données du champ superior si available
                superiorName = validateurPrincipal.superior?.name || '';
                superiorPosition = validateurPrincipal.superior?.position || '';
            }

            return {
                id: validateurPrincipal.validatorId,
                validatorId: validateurPrincipal.validatorId,
                nom,
                prenom,
                direction: validateurPrincipal.department,
                poste: validateurPrincipal.user.position,
                email: validateurPrincipal.user.email,
                matricule: validateurPrincipal.user.matricule,
                dateDebut: validateurPrincipal.createdAt,
                dateFin: validateurPrincipal.updatedAt !== validateurPrincipal.createdAt ? validateurPrincipal.updatedAt : undefined,
                validatorType: validateurPrincipal.validatorType,
                backupOrder: validateurPrincipal.backupOrder,
                superiorName: superiorName || undefined,
                superiorPosition: superiorPosition || undefined,
                remplaçants
            };
        });
    }, []);

    // Utiliser useMemo pour transformer les données uniquement quand apiValidators change
    const transformedValidators = useMemo(() => {
        if (apiValidators.length > 0) {
            return transformValidatorData(apiValidators);
        }
        return initialValidateurs;
    }, [apiValidators, initialValidateurs, transformValidatorData]);

    // Utiliser useMemo pour extraire les directions uniques
    const uniqueDirections = useMemo(() => {
        if (transformedValidators.length > 0) {
            return Array.from(
                new Set(['Tous', ...transformedValidators.map(v => v.direction)])
            ).filter(Boolean);
        }
        return ['Tous'];
    }, [transformedValidators]);

    // Mettre à jour les validateurs quand transformedValidators change
    useEffect(() => {
        if (transformedValidators.length > 0 && JSON.stringify(transformedValidators) !== JSON.stringify(validateurs)) {
            setValidateurs(transformedValidators);
        }
    }, [transformedValidators, validateurs]);

    // Mettre à jour les directions quand uniqueDirections change
    useEffect(() => {
        if (uniqueDirections.length > 0 && JSON.stringify(uniqueDirections) !== JSON.stringify(directions)) {
            setDirections(uniqueDirections);
        }
    }, [uniqueDirections, directions]);

    // Filtrer les validateurs par direction
    const filteredValidateurs = useMemo(() => {
        return selectedDirection === 'Tous'
            ? validateurs
            : validateurs.filter(v => v.direction === selectedDirection);
    }, [validateurs, selectedDirection]);

    const handleValidateurClick = useCallback((validateur: Validateur) => {
        setSelectedValidateur(validateur);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedValidateur(null);
    }, []);

    if (isLoading) {
        return <LoadingState>Chargement des validateurs...</LoadingState>;
    }

    if (error) {
        return (
            <EmptyState>
                <EmptyIcon>
                    <ShieldCheck size={48} />
                </EmptyIcon>
                <EmptyText style={{ color: 'var(--error-color)' }}>
                    Erreur lors du chargement des validateurs
                </EmptyText>
                <EmptyText style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>
                    {error.message}
                </EmptyText>
            </EmptyState>
        );
    }

    return (
        <ValidateursPageContainer>
            <ValidateursHeader>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <ValidateursTitle>
                        <ShieldCheck size={28} style={{ color: 'var(--primary-color)' }} />
                        Gestion des validateurs
                    </ValidateursTitle>
                    <div style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-secondary)',
                        marginTop: 'var(--spacing-xs)'
                    }}>
                        {validateurs.length} validateurs trouvés • {selectedDirection === 'Tous' ? 'Toutes directions' : selectedDirection}
                    </div>
                </div>
            </ValidateursHeader>

            {directions.length > 1 && (
                <DirectionsNav>
                    {directions.map((direction) => (
                        <DirectionButton
                            key={direction}
                            $isActive={selectedDirection === direction}
                            onClick={() => setSelectedDirection(direction)}
                            title={direction}
                        >
                            {direction}
                        </DirectionButton>
                    ))}
                </DirectionsNav>
            )}

            {filteredValidateurs.length === 0 ? (
                <EmptyState>
                    <EmptyIcon>
                        <Users size={48} />
                    </EmptyIcon>
                    <EmptyText>Aucun validateur trouvé pour la direction sélectionnée</EmptyText>
                </EmptyState>
            ) : (
                <ValidateursTable>
                    <TableHeader>
                        <Cell>Validateur</Cell>
                        <Cell>Direction</Cell>
                        <Cell>Poste</Cell>
                        <Cell>Remplaçants</Cell>
                    </TableHeader>
                    
                    {filteredValidateurs.map((validateur) => (
                        <ValidateurRow 
                            key={validateur.id}
                            $isActive={true} // Toujours actif
                            onClick={() => handleValidateurClick(validateur)}
                        >
                            <ValidateurInfo data-label="Validateur">
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--primary-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'white',
                                    flexShrink: 0
                                }}>
                                    {getInitials(`${validateur.prenom} ${validateur.nom}`)}
                                </div>
                                <ValidateurName>
                                    <ValidateurFullName $isActive={true}>
                                        {validateur.prenom} {validateur.nom.toUpperCase()}
                                    </ValidateurFullName>
                                    <ValidateurMatricule $isActive={true}>
                                        Mat. {validateur.matricule}
                                    </ValidateurMatricule>
                                </ValidateurName>
                            </ValidateurInfo>
                            
                            <DirectionCell data-label="Direction">
                                {validateur.direction}
                            </DirectionCell>
                            
                            <PosteCell data-label="Poste">
                                {validateur.poste}
                            </PosteCell>
                            
                            <RemplacantsCell data-label="Remplaçants">
                                {validateur.remplaçants.length === 0 ? (
                                    <div style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--text-tertiary)',
                                        fontStyle: 'italic'
                                    }}>
                                        Aucun remplaçant
                                    </div>
                                ) : (
                                    <RemplacantsContainer>
                                        {validateur.remplaçants
                                            .slice(0, 2) // Réduit à 2 pour mobile
                                            .map((remplaçant) => (
                                                <RemplacantItem 
                                                    key={remplaçant.id}
                                                    $estActif={true} // Toujours actif
                                                    title={`${remplaçant.prenom} ${remplaçant.nom} - ${remplaçant.poste} - Mat. ${remplaçant.matricule} (Ordre ${remplaçant.ordre})`}
                                                >
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'var(--primary-color)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        color: 'white',
                                                        flexShrink: 0
                                                    }}>
                                                        {getInitials(`${remplaçant.prenom} ${remplaçant.nom}`)}
                                                    </div>
                                                    <RemplacantInfo>
                                                        <RemplacantName>
                                                            {remplaçant.prenom} {remplaçant.nom.charAt(0)}.
                                                        </RemplacantName>
                                                        <RemplacantOrdre>
                                                            Ordre {remplaçant.ordre}
                                                        </RemplacantOrdre>
                                                    </RemplacantInfo>
                                                </RemplacantItem>
                                            ))}
                                        {validateur.remplaçants.length > 2 && (
                                            <RemplacantItem 
                                                $estActif={true} // Toujours actif
                                                title={`${validateur.remplaçants.length - 2} autres remplaçants`}
                                            >
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: 'var(--bg-secondary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--text-tertiary)',
                                                    fontWeight: '600'
                                                }}>
                                                    +{validateur.remplaçants.length - 2}
                                                </div>
                                            </RemplacantItem>
                                        )}
                                    </RemplacantsContainer>
                                )}
                            </RemplacantsCell>
                        </ValidateurRow>
                    ))}
                </ValidateursTable>
            )}

            <ValidateurDetailsModal
                validateur={selectedValidateur}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </ValidateursPageContainer>
    );
};

export default ValidateursPage;