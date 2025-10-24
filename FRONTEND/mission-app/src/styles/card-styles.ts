// card-styles.ts
import styled, { css } from "styled-components";

export const CardsPaginationContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
`;

export const CardsContainer = styled.div`
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

export const MissionCardsContainer = styled.div`
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

export const Card = styled.div`
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

interface IndicatorBlockProps {
    $daysUntilDue: number;
}

export const IndicatorBlock = styled.div<IndicatorBlockProps>`
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

export const IndicatorValue = styled.div`
    font-size: 24px;
    margin-top: 4px;
    line-height: 1;
`;

export const IndicatorText = styled.div`
    font-size: 10px;
    font-weight: normal;
    margin-top: 2px;
    text-transform: uppercase;
`;

export const CardHeader = styled.div`
    grid-area: header;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-xs);
`;

export const CardTitle = styled.h3`
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
export const CardInfo = styled.div`
    grid-area: info;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm); /* Espacement augmenté */
    padding-left: var(--spacing-sm);
    padding-top: var(--spacing-xs);
`;

export const InfoLine = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-size-sm);
    padding-right: var(--spacing-sm);
`;

export const InfoLabel = styled.span`
    color: var(--text-secondary);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const InfoValue = styled.span`
    color: var(--text-color);
    text-align: right;
    font-weight: 600;
    max-width: 60%;
    word-wrap: break-word;
`;

export const ReferenceText = styled.div`
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

// Conteneur principal pour les cardes
export const CardsContainerLegacy = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
`;

// Card principale
export const CardLegacy = styled.div`
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

// Header de la card
export const CardHeaderLegacy = styled.div`
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
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
`;

// Corps de la card
export const CardBodyLegacy = styled.div`
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

// Champ dans la card
export const CardFieldLegacy = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

// Label du champ
export const CardLabelLegacy = styled.label`
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
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
`;

// Footer de la card (pour les actions)
export const CardFooterLegacy = styled.div`
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
`;

// Bouton d'action dans la card
export const CardActionButtonLegacy = styled.button`
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
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
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
`;

// État de chargement pour les cardes
export const LoadingCardsState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
`;