import styled from "styled-components";

// Conteneur principal pour les cardes
export const CardsContainer = styled.div`
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
export const Card = styled.div`
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
export const CardHeader = styled.div`
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
`;

// Titre de la card
export const CardTitle = styled.h3`
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
export const CardBody = styled.div`
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

// Champ dans la card
export const CardField = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

// Label du champ
export const CardLabel = styled.label`
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
`;

// Valeur du champ
export const CardValue = styled.div`
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
export const CardFooter = styled.div`
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
`;

// Bouton d'action dans la card
export const CardActionButton = styled.button`
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