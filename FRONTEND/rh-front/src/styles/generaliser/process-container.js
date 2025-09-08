import styled from "styled-components";

// Conteneur principal pour les validations
export const ValidationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
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
    left: 28px;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to bottom, var(--primary-color) 0%, var(--border-light) 100%);
    border-radius: 2px;
    z-index: 1;
  }

  @media (max-width: 768px) {
    &::before {
      left: 20px;
    }
  }
`;

// Étape de validation
export const ValidationStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) 0;
  }
`;

// Conteneur pour l'icône et le numéro d'étape
export const StepIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: row;
    gap: var(--spacing-sm);
  }
`;

// Numéro de l'étape
export const StepNumber = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 50%;
  font-size: var(--font-size-sm);
  font-weight: 600;
  border: 2px solid var(--border-light);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: var(--font-size-xs);
  }
`;

// Icône de statut de validation
export const ValidationStatusIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-md);
  font-weight: bold;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  transition: all 0.3s ease;
  
  &.pending {
    background: var(--neutral-light);
    color: var(--neutral);
  }
  
  &.in-progress {
    background: var(--warning-light);
    color: var(--warning);
    animation: pulse 2s infinite;
  }
  
  &.approved {
    background: var(--success-light);
    color: var(--success);
  }
  
  &.rejected {
    background: var(--danger-light);
    color: var(--danger);
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: var(--font-size-sm);
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
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
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
  font-size: var(--font-size-md);
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
    background: var(--neutral-light);
    color: var(--neutral);
    border: 1px solid var(--border-light);
  }
  
  &.in-progress {
    background: var(--warning-light);
    color: var(--warning);
    border: 1px solid var(--warning);
  }
  
  &.approved {
    background: var(--success-light);
    color: var(--success);
    border: 1px solid var(--success);
  }
  
  &.rejected {
    background: var(--danger-light);
    color: var(--danger);
    border: 1px solid var(--danger);
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
  line-height: 1.4;
`;

// Date et heure
export const ValidationDateTime = styled.div`
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: right;
  margin-top: var(--spacing-xs);
`;

// Message pour absence de validateur
export const NoValidatorMessage = styled.div`
  text-align: center;
  padding: var(--spacing-md);
  color: var(--text-secondary);
  font-style: italic;
  font-size: var(--font-size-sm);
`;

// Message pour validation en cours
export const InProgressMessage = styled.div`
  text-align: center;
  padding: var(--spacing-sm);
  color: var(--warning);
  font-style: italic;
  font-size: var(--font-size-sm);
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
    font-size: var(--font-size-md);
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
  height: 10px;
  background: var(--border-light);
  border-radius: 5px;
  overflow: hidden;
  
  .fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--primary-hover));
    border-radius: 5px;
    transition: width 0.5s ease-in-out;
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