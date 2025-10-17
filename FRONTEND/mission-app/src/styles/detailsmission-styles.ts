import styled from "styled-components";

interface AvatarProps {
  size?: string;
}

interface ValidatorNameProps {
  bold?: boolean;
  large?: boolean;
}

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
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    line-height: 1.4;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;

    &.pending {
        background-color: var(--warning-light, #fefce8);
        color: var(--warning-dark, #a16207);
    }

    &.approved {
        background-color: var(--success-light, #ecfdf5);
        color: var(--success-dark, #065f46);
    }

    &.rejected {
        background-color: var(--error-light, #fef2f2);
        color: var(--error-dark, #b91c1c);
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

export const Avatar = styled.div<AvatarProps>`
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

export const ValidatorName = styled.div<ValidatorNameProps>`
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

export const OMPaymentButton = styled(ActionButton)`
  background-color: var(--success-color, #28a745);
  border-color: var(--success-color, #28a745);

  &:hover {
    background-color: #ffffff;
    color: var(--success-color, #28a745);
    border-color: var(--success-color, #28a745);
  }
`;

export const ButtonOMPDF = styled(ActionButton)`
  background-color: var(--pdf-color);
  border-color: var(--pdf-color);
  margin-left: var(--spacing-sm, 10px);

  &:hover {
    background-color: var(--pdf-hover);
    color: #ffffff;
    border-color: var(--pdf-hover);
  }
`;

export const MissionReportButton = styled(ActionButton)`
  width: 103px;
  background-color: var(--success-color, #28a745);
  border-color: var(--success-color, #28a745);

  &:hover {
    background-color: #ffffff;
    color: var(--success-color, #28a745);
    border-color: var(--success-color, #28a745);
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 10px);
  margin-top: var(--spacing-sm, 10px);
`;