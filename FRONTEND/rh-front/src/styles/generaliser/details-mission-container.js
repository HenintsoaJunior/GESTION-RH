import styled from "styled-components"

export const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

export const PopupContainer = styled.div`
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: var(--radius-sm);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: var(--radius-sm);

    &:hover {
      background: var(--primary-hover);
    }
  }

  @media (max-width: 768px) {
    width: 95%;
    max-height: 85vh;
  }
`

export const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  background: var(--bg-primary);
  z-index: 10;
`

export const PopupTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;

  @media (max-width: 768px) {
    font-size: var(--font-size-md);
  }
`

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: var(--primary-color);
    background-color: var(--bg-secondary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const PopupContent = styled.div`
  padding: var(--spacing-lg);
  flex: 1;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: var(--radius-sm);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: var(--radius-sm);

    &:hover {
      background: var(--primary-hover);
    }
  }
`

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-style: italic;
`

export const ContentArea = styled.div`
  background: #f8f9fa;
  border-radius: var(--radius-sm);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
`

export const StepHeader = styled.div`
  margin-bottom: var(--spacing-lg);
`

export const StepTitle = styled.h2`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);

  @media (max-width: 768px) {
    font-size: var(--font-size-md);
  }
`

export const StatusBadge = styled.span`
    /* Ajustements généraux */
    padding: 2px 8px; /* Réduit l'espacement pour un look plus compact */
    border-radius: 4px; /* Rend les coins plus subtils et modernes */
    font-size: 10px; /* Légèrement plus petit pour les badges */
    line-height: 1.4; /* Assure un bon alignement vertical du texte */
    font-weight: 700; /* Plus de gras pour l'impact */
    letter-spacing: 0.5px; /* Ajoute un peu d'espace entre les lettres */
    text-transform: uppercase; /* Optionnel : en majuscules pour un style 'tag' */
    
    /* Nettoyage et affichage */
    display: inline-flex; /* Utilisation de flex pour un centrage facile (si besoin) */
    align-items: center; /* Centrage vertical du contenu */
    white-space: nowrap;
    /* margin-top: 0; */ /* Supprimez le margin-top si possible pour un meilleur flux */

    /* Couleurs */
    &.pending {
        /* On utilise souvent des couleurs d'avertissement plus neutres ou orangées */
        background-color: var(--warning-light, #fefce8); /* Jaune très clair */
        color: var(--warning-dark, #a16207); /* Marron/Or foncé */
    }

    &.approved {
        /* Couleurs de succès */
        background-color: var(--success-light, #ecfdf5); /* Vert très clair */
        color: var(--success-dark, #065f46); /* Vert foncé */
    }

    &.rejected {
        /* Couleurs d'erreur/danger */
        background-color: var(--error-light, #fef2f2); /* Rouge très clair */
        color: var(--error-dark, #b91c1c); /* Rouge foncé */
    }
`;

export const ValidatorCard = styled.div`
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
`

export const ValidatorTitle = styled.h3`
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
`

export const ValidatorGrid = styled.div`
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-md);
  }
`

export const ValidatorSection = styled.div`
  flex: 1;
`

export const SectionTitle = styled.h4`
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  margin-top: var(--spacing-md);

  @media (max-width: 768px) {
    font-size: var(--font-size-xs);
  }
`

export const ValidatorItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
`

export const Avatar = styled.div`
  width: ${(props) => props.size || "40px"};
  height: ${(props) => props.size || "40px"};
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: ${(props) => (props.size === "50px" ? "1rem" : "0.9rem")};
  font-weight: 600;
  flex-shrink: 0;
`

export const ValidatorInfo = styled.div`
  display: flex;
  flex-direction: column;
`

export const ValidatorName = styled.div`
  color: var(--text-primary);
  font-weight: ${(props) => (props.bold ? "600" : "500")};
  font-size: ${(props) => (props.large ? "var(--font-size-sm)" : "var(--font-size-xs)")};

  @media (max-width: 768px) {
    font-size: ${(props) => (props.large ? "var(--font-size-xs)" : "11px")};
  }
`

export const ValidatorRole = styled.div`
  color: var(--text-secondary);
  font-size: var(--font-size-xs);

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
`

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  border: 1px solid var(--border-light, #e0e0e0);
  padding: var(--spacing-sm);
  border-radius: var(--radius-xs, 4px);
`

export const InfoLabel = styled.label`
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--text-secondary);

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

export const InfoValue = styled.div`
  color: var(--text-primary);
  font-size: var(--font-size-xs);
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

export const CommentCard = styled.div`
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
`

export const CommentTitle = styled.h3`
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
`

export const CommentText = styled.div`
  color: var(--text-primary);
  font-size: var(--font-size-xs);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

export const CommentDate = styled.div`
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  border-top: 1px solid var(--border-light);
  padding-top: var(--spacing-md);

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

export const InfoAlert = styled.div`
  background: #f8f9fa;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  margin-top: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

export const AlertText = styled.span`
  color: var(--text-secondary);
  font-weight: 500;
`

export const PopupFooter = styled.div`
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-primary);
`

export const FooterActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`

export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
  background-color: var(--primary-color);
  color: #ffffff;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-xs);
  }
`

export const RejectButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
  background-color: var(--danger-color);
  color: #ffffff;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--danger-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-xs);
  }
`

export const ActionButtonPDF = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
  background-color: var(--pdf-color);
  color: #ffffff;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--pdf-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-xs);
  }
`

export const StepCounter = styled.div`
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

export const DetailSection = styled.div`
  background-color: var(--bg-primary, #ffffff);
  padding: var(--spacing-md, 15px);
  border-radius: var(--radius-sm, 8px);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
  margin-bottom: var(--spacing-lg, 20px);
`

export const ActionSection = styled.div`
  background: var(--bg-primary, #ffffff);
  padding: var(--spacing-lg, 20px 30px);
  border-top: 1px solid var(--border-light, #e0e0e0);
  margin-top: var(--spacing-lg, 20px);
  border-radius: 0 0 var(--radius-sm, 8px) var(--radius-sm, 8px);
`

export const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-md, 15px);
  margin-bottom: var(--spacing-lg, 20px);
  flex-wrap: wrap;
`

export const SignatureUploadSection = styled.div`
  margin-bottom: var(--spacing-lg, 20px);
`

export const FileInputWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`

export const FileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`

export const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl, 30px) var(--spacing-lg, 20px);
  border: 2px dashed var(--border-color, #ced4da);
  border-radius: var(--radius-sm, 8px);
  background-color: var(--bg-secondary, #f9f9f9);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  color: var(--text-secondary, #6c757d);
  font-weight: 500;
  font-size: var(--font-size-sm, 0.875rem);

  &:hover {
    border-color: var(--primary-color, #007bff);
    background-color: var(--bg-hover, #f0f0f0);
  }

  &.has-file {
    border-color: var(--success-color, #28a745);
    background-color: var(--success-light, #d4edda);
    color: var(--success-dark, #155724);
  }
`

export const SignaturePreview = styled.div`
  margin-top: var(--spacing-md, 15px);
  text-align: center;

  ${InfoLabel} {
    font-size: var(--font-size-xs, 0.75rem);
    color: var(--text-muted, #adb5bd);
  }

  img {
    max-width: 200px;
    max-height: 80px;
    border: 1px solid var(--border-light, #e0e0e0);
    border-radius: var(--radius-xs, 4px);
    object-fit: contain;
    margin-top: var(--spacing-xs, 5px);
  }
`

export const Separator = styled.div`
  height: 1px;
  background-color: var(--border-light, #e0e0e0);
  margin: var(--spacing-lg, 20px) 0;
`

export const SuccessMessage = styled.div`
  text-align: center;
  padding: var(--spacing-xl, 30px);

  h3 {
    color: var(--success-color, #28a745);
    margin-bottom: var(--spacing-sm, 10px);
    font-size: var(--font-size-lg, 1.25rem);
    font-weight: 600;
  }

  p {
    color: var(--text-secondary, #6c757d);
    margin-bottom: var(--spacing-md, 15px);
    font-size: var(--font-size-sm, 0.875rem);
    line-height: 1.5;
  }
`

export const PagePopup = styled.div`
  background: var(--bg-primary, #ffffff);
  border-radius: var(--radius-md, 10px);
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
  max-width: 800px;
  box-shadow: var(--shadow-xl, 0 10px 25px rgba(0, 0, 0, 0.2));
`

export const PopupClose = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary, #6c757d);
  transition: color 0.2s;

  &:hover {
    color: var(--text-primary, #343a40);
  }
`

export const PopupActions = styled.div`
  padding: 20px 30px;
  display: flex;
  gap: var(--spacing-md, 15px);
  justify-content: flex-end;
`

export const ButtonPrimary = styled.button`
  padding: var(--spacing-sm, 10px) var(--spacing-lg, 20px);
  background-color: var(--primary-color, #007bff);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md, 6px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--primary-dark, #0056b3);
  }

  &.reject {
    background-color: var(--error-color, #dc3545);

    &:hover {
      background-color: var(--error-dark, #c82333);
    }
  }
`

export const ButtonSecondary = styled.button`
  padding: var(--spacing-sm, 10px) var(--spacing-lg, 20px);
  background-color: var(--bg-secondary, #f9f9f9);
  color: var(--text-primary, #343a40);
  border: 1px solid var(--border-color, #ced4da);
  border-radius: var(--radius-md, 6px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--bg-hover, #e9ecef);
  }
`

export const IndemnityTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--spacing-lg, 20px);
  background-color: var(--bg-primary, #ffffff);
`

export const TableHeader = styled.th`
  padding: var(--spacing-sm, 10px);
  background-color: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-light, #e0e0e0);
  font-weight: 600;
  text-align: left;
  font-size: var(--font-size-sm, 0.875rem);
`

export const TableCell = styled.td`
  padding: var(--spacing-sm, 10px);
  border: 1px solid var(--border-light, #e0e0e0);
  font-size: var(--font-size-sm, 0.875rem);
  background-color: var(--bg-primary, #ffffff);
`

export const TotalRow = styled.tr`
  font-weight: 600;
`