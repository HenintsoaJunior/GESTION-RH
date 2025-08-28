import styled from "styled-components";

// Conteneur principal pour les validations
export const ValidationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);

  @media (max-width: 768px) {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }
`;

// Timeline des validations
export const ValidationTimeline = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 32px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--border-light);
    z-index: 1;
  }

  @media (max-width: 768px) {
    &::before {
      left: 24px;
    }
  }
`;

// Étape de validation
export const ValidationStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) 0;
  position: relative;

  &:not(:last-child) {
    border-bottom: 1px solid var(--border-light);
  }

  @media (max-width: 768px) {
    gap: var(--spacing-sm);
    padding: var(--spacing-md) 0;
  }
`;

// Icône de statut de validation
export const ValidationStatusIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: bold;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  
  &.pending {
    background: var(--bg-secondary);
    border: 3px solid var(--border-light);
    color: var(--text-secondary);
  }
  
  &.in-progress {
    background: #fff3cd;
    border: 3px solid #ffc107;
    color: #856404;
    animation: pulse 2s infinite;
  }
  
  &.approved {
    background: #d4edda;
    border: 3px solid #28a745;
    color: #155724;
  }
  
  &.rejected {
    background: #f8d7da;
    border: 3px solid #dc3545;
    color: #721c24;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    font-size: var(--font-size-md);
  }
`;

// Contenu de l'étape de validation
export const ValidationStepContent = styled.div`
  flex: 1;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

// Header de l'étape
export const ValidationStepHeader = styled.div`
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
`;

// Titre de l'étape
export const ValidationStepTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

// Badge de statut
export const ValidationStatusBadge = styled.span`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.pending {
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border: 1px solid var(--border-light);
  }
  
  &.in-progress {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffc107;
  }
  
  &.approved {
    background: #d4edda;
    color: #155724;
    border: 1px solid #28a745;
  }
  
  &.rejected {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #dc3545;
  }
`;

// Corps de l'étape
export const ValidationStepBody = styled.div`
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

// Détails du validateur
export const ValidatorDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
`;

// Champ de détail
export const ValidationDetailField = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

// Label du champ
export const ValidationDetailLabel = styled.label`
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
`;

// Valeur du champ
export const ValidationDetailValue = styled.div`
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.4;
`;

// Section des commentaires
export const ValidationCommentSection = styled.div`
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-light);
`;

// Commentaire de validation
export const ValidationComment = styled.div`
  background: var(--bg-secondary);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  border-left: 4px solid var(--primary-color);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-style: italic;
  line-height: 1.4;
`;

// Date et heure
export const ValidationDateTime = styled.div`
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: right;
  margin-top: var(--spacing-xs);
`;

// État de chargement pour les validations
export const LoadingValidationState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  font-size: var(--font-size-md);
`;

// État vide pour les validations
export const EmptyValidationState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  text-align: center;
  gap: var(--spacing-md);
  
  .icon {
    font-size: 48px;
    opacity: 0.5;
  }
  
  .message {
    font-size: var(--font-size-md);
  }
`;

// Barre de progression globale
export const ValidationProgress = styled.div`
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-md);
`;

export const ValidationProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  
  h2 {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
  
  .percentage {
    font-size: var(--font-size-md);
    font-weight: 600;
    color: var(--primary-color);
  }
`;

export const ValidationProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: var(--border-light);
  border-radius: 4px;
  overflow: hidden;
  
  .fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--primary-hover));
    border-radius: 4px;
    transition: width 0.3s ease;
  }
`;

export const ValidationProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
`;