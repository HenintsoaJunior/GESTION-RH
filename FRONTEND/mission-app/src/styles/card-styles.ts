// card-styles.ts
import styled, { css } from "styled-components";

export const CardsPaginationContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
`;

export const CardsContainer = styled.div`
    display: grid;
    /* FORCE 2 COLONNES : S'étend sur les grands écrans pour améliorer l'espacement entre les cartes. */
    grid-template-columns: repeat(2, 1fr); 
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;

    /* Adaptation pour les petits écrans (mobile) */
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
    }
`;

export const MissionCardsContainer = styled.div`
    display: grid;
    /* FORCE 2 COLONNES : Affichage de deux cartes par ligne sur les grands écrans. */
    grid-template-columns: repeat(2, 1fr); 
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;

    /* Adaptation pour les petits écrans (mobile) */
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
    }
`;

export const Card = styled.div`
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    /* Structure de la carte : Indicateur (80px) | Contenu */
    display: grid;
    grid-template-columns: 80px 1fr;
    grid-template-rows: auto auto auto;
    grid-template-areas:
        "indicator header"
        "indicator info"
        "indicator actions";
    gap: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    min-height: 200px; /* Hauteur minimale pour remplir le contenu */

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }

    /* Responsive : Sur mobile, empiler verticalement */
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        grid-template-areas:
            "indicator"
            "header"
            "info"
            "actions";
        gap: 8px;
        padding: 12px;
        min-height: 250px; /* Plus d'espace sur mobile pour le contenu */
    }
`;

interface IndicatorBlockProps {
    $daysUntilDue: number;
}

export const IndicatorBlock = styled.div<IndicatorBlockProps>`
    grid-area: indicator;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    text-align: center;
    border-right: 1px solid var(--border-color);
    
    /* Remplir toute la hauteur à gauche avec 1px d'espace */
    align-self: stretch;
    margin: 1px 0 1px 1px;
    padding: 16px 8px;
    border-radius: 3px 0 0 3px;
    
    ${({ $daysUntilDue }) => {
        let bgVar, colorVar;
        
        if ($daysUntilDue <= 3) {
            // URGENT (<= 3 jours ou passé)
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

    /* Responsive : Sur mobile, bordure en bas au lieu de droite */
    @media (max-width: 768px) {
        border-right: none;
        border-bottom: 1px solid var(--border-color);
        border-radius: 3px 3px 0 0;
        align-self: auto;
        margin: 0 0 1px 0;
        padding: 12px 8px;
    }
`;

export const IndicatorValue = styled.div`
    font-size: 24px;
    margin-top: 4px;
    line-height: 1;

    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

export const IndicatorText = styled.div`
    font-size: 10px;
    font-weight: normal;
    margin-top: 2px;
    text-transform: uppercase;

    @media (max-width: 768px) {
        font-size: 9px;
    }
`;

export const CardHeader = styled.div`
    grid-area: header;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-xs);

    @media (max-width: 768px) {
        margin-bottom: var(--spacing-xs);
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
    }
`;

export const CardTitle = styled.h3`
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: var(--text-color);
    margin: 0;
    line-height: 1.3;
    flex: 1;
    margin-right: var(--spacing-sm);
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* Permet 2 lignes pour remplir le titre */
    -webkit-box-orient: vertical;

    @media (max-width: 768px) {
        font-size: var(--font-size-md);
        margin-right: 0;
        -webkit-line-clamp: 3; /* Plus de lignes sur mobile */
    }
`;

// ESPACEMENT AMÉLIORÉ
export const CardInfo = styled.div`
    grid-area: info;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm); /* Espacement augmenté */
    padding-left: var(--spacing-sm);
    padding-top: var(--spacing-xs);

    @media (max-width: 768px) {
        padding-left: 0;
        gap: var(--spacing-xs);
        padding-top: 0;
    }
`;

export const InfoLine = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-size-sm);
    padding-right: var(--spacing-sm);

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        padding-right: 0;
    }
`;

export const InfoLabel = styled.span`
    color: var(--text-secondary);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;

    @media (max-width: 768px) {
        gap: 4px;
        font-size: var(--font-size-xs);
    }
`;

export const InfoValue = styled.span`
    color: var(--text-color);
    text-align: right;
    font-weight: 600;
    max-width: 60%;
    word-wrap: break-word;
    overflow-wrap: break-word; /* Ajout pour briser les mots longs */

    @media (max-width: 768px) {
        text-align: left;
        max-width: 100%;
        font-size: var(--font-size-xs);
    }
`;

// NOUVEAUX STYLES POUR LA BARRE D'ACTIONS AMÉLIORÉE
export const ActionsContainer = styled.div<{ $singleButton?: boolean }>`
    grid-area: actions;
    display: flex;
    flex-direction: row;
    gap: 8px;
    justify-content: ${props => props.$singleButton ? 'center' : 'flex-start'};
    align-items: center;
    margin: 12px 0;
    padding: 8px 16px;
    border-top: 1px solid var(--border-color);
    background: var(--bg-light);

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 6px;
        padding: 6px 12px;
        justify-content: stretch;

        button {
            flex: 1;
            min-width: unset;
        }
    }
`;

export const ActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    max-width: 120px;
    padding: 8px 12px;
    border: 1px solid transparent;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    justify-content: center;

    /* Style par défaut pour "Voir détails" */
    background-color: var(--primary-bg);
    color: var(--primary-color);
    border-color: var(--primary-border);

    &:hover {
        color: var(--white);
        background-color: var(--primary-hover);
        transform: translateY(-1px);
    }

    /* Style spécifique pour Valider */
    &.validate {
        background-color: var(--success-bg);
        color: var(--success-color);
        border-color: var(--success-border);

        &:hover {
            color: var(--white);
            background-color: var(--success-hover);
        }
    }

    /* Style spécifique pour Rejeter */
    &.reject {
        background-color: var(--danger-bg);
        color: var(--danger-color);
        border-color: var(--danger-border);

        &:hover {
            color: var(--white);
            background-color: var(--danger-hover);
        }
    }

    /* Style spécifique pour Détails (plus proéminent) */
    &.details {
        background-color: var(--primary-bg);
        color: var(--primary-color);
        border-color: var(--primary-border);
        font-weight: 600;

        &:hover {
            color: var(--white);
            background-color: var(--primary-hover);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
    }

    @media (max-width: 768px) {
        padding: 10px 12px;
        font-size: 13px;
        max-width: unset;
    }
`;

// Conteneur principal pour les cardes
export const CardsContainerLegacy = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
`;

// Card principale
export const CardLegacy = styled.div`
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  overflow: hidden;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  @media (max-width: 768px) {
    margin-bottom: var(--spacing-sm);
  }
`;

// Header de la card
export const CardHeaderLegacy = styled.div`
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);

  @media (max-width: 768px) {
    padding: var(--spacing-sm);
  }
`;

// Titre de la card
export const CardTitleLegacy = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 768px) {
    font-size: var(--font-size-md);
    -webkit-line-clamp: 2;
  }
`;

// Corps de la card
export const CardBodyLegacy = styled.div`
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);

  @media (max-width: 768px) {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }
`;

// Champ dans la card
export const CardFieldLegacy = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);

  @media (max-width: 768px) {
    gap: var(--spacing-xs);
  }
`;

// Label du champ
export const CardLabelLegacy = styled.label`
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);

  @media (max-width: 768px) {
    font-size: var(--font-size-xs);
  }
`;

// Valeur du champ
export const CardValueLegacy = styled.div`
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 60px;

  @media (max-width: 768px) {
    font-size: var(--font-size-xs);
    min-height: 48px;
    -webkit-line-clamp: 4;
  }
`;

// Footer de la card (pour les actions)
export const CardFooterLegacy = styled.div`
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);

  @media (max-width: 768px) {
    padding: var(--spacing-sm);
    flex-direction: column;
    gap: var(--spacing-xs);
  }
`;

// Bouton d'action dans la card
export const CardActionButtonLegacy = styled.button`
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-xs);
  height: 32px;
  line-height: 1;
  transition: all 0.2s ease;
  min-width: 70px;

  &.edit {
    background-color: var(--primary-color);
    color: #ffffff;

    &:hover {
      background-color: var(--primary-hover);
    }
  }

  &.delete {
    background-color: var(--error-color);
    color: #ffffff;

    &:hover {
      background-color: var(--error-hover);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
  }
`;

// État vide pour les cardes
export const EmptyCardsState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  width: 100%;
`;

// État de chargement pour les cardes
export const LoadingCardsState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  width: 100%;
`;