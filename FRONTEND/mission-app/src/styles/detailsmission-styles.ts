import styled from "styled-components";
import isPropValid from "@emotion/is-prop-valid";
import type { Chart } from "chart.js";

interface AvatarProps {
  size?: string;
}

interface ValidatorNameProps {
  bold?: boolean;
  large?: boolean;
}

interface ChartWithCenterTextOptions {
  plugins?: {
    centerText?: {
      display: boolean;
      text: string;
    };
  };
}
export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-2xl);
  gap: 8px;
`

export const LoadingDot = styled.div<{ delay: number }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--primary-color);
  animation: bounce 1.4s infinite ease-in-out both;
  animation-delay: ${props => props.delay}s;

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`


export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--primary-color-rgb, 105, 180, 46), 0.1);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

export const ContentArea = styled.div`
  background: var(--bg-primary);
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 0;
  margin-bottom: var(--spacing-lg);
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  border: none;
  border-top: 5px solid var(--border-color);
  overflow: hidden;
  box-sizing: border-box;
  padding-left: var(--spacing-3xl);
  padding-right: var(--spacing-3xl);
  padding-bottom: var(--spacing-lg);
  padding-top: var(--spacing-md);

  @media (max-width: 768px) {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
    padding-bottom: var(--spacing-md);
  }
`

export const StepHeader = styled.div`
  margin-bottom: var(--spacing-lg)
`

export const StepTitle = styled.h2`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-family);

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
    font-family: var(--font-family);

    &.pending {
        background-color: var(--warning-bg);
        color: var(--warning-text);
    }

    &.approved {
        background-color: var(--success-bg);
        color: var(--success-text);
    }

    &.rejected {
        background-color: var(--error-bg);
        color: var(--error-text);
    }
`;

export const ValidatorCard = styled.div`
  background: var(--bg-primary);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
`

export const ValidatorTitle = styled.h3`
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-family);
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
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
  margin-top: var(--spacing-md);
  font-family: var(--font-family);

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
  color: var(--text-white);
  font-size: ${(props) => (props.size === "50px" ? "1rem" : "0.9rem")};
  font-weight: 600;
  flex-shrink: 0;
  font-family: var(--font-family);
`

export const ValidatorInfo = styled.div`
  display: flex;
  flex-direction: column;
`

export const ValidatorName = styled.div<ValidatorNameProps>`
  color: var(--text-color);
  font-weight: ${(props) => (props.bold ? "600" : "500")};
  font-size: ${(props) => (props.large ? "var(--font-size-sm)" : "var(--font-size-xs)")};
  font-family: var(--font-family);

  @media (max-width: 768px) {
    font-size: ${(props) => (props.large ? "var(--font-size-xs)" : "11px")};
  }
`

export const ValidatorRole = styled.div`
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-family: var(--font-family);

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
  border: 1px solid var(--border-light);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
`

export const InfoLabel = styled.label`
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--text-secondary);
  font-family: var(--font-family);

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

export const InfoValue = styled.div`
  color: var(--text-color);
  font-size: var(--font-size-xs);
  font-weight: 400;
  font-family: var(--font-family);

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
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-family);
`

export const CommentText = styled.div`
  color: var(--text-color);
  font-size: var(--font-size-xs);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
  font-family: var(--font-family);

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

export const CommentDate = styled.div`
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  border-top: 1px solid var(--border-light);
  padding-top: var(--spacing-md);
  font-family: var(--font-family);

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

export const InfoAlert = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  margin-top: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-family: var(--font-family);

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

export const AlertText = styled.span`
  color: var(--text-secondary);
  font-weight: 500;
  font-family: var(--font-family);
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
  color: var(--text-white);
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
  color: var(--text-white);
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
  color: var(--text-white);
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
  font-family: var(--font-family);

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

export const DetailSection = styled.div`
  background-color: var(--bg-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-lg);
`

export const ActionSection = styled.div`
  background: var(--bg-primary);
  padding: var(--spacing-lg) var(--spacing-3xl);
  border-top: 1px solid var(--border-light);
  margin-top: var(--spacing-lg);
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
`

export const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
`

export const SignatureUploadSection = styled.div`
  margin-bottom: var(--spacing-lg);
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
  padding: var(--spacing-xl) var(--spacing-lg);
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-sm);
  background-color: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: var(--font-size-sm);
  font-family: var(--font-family);

  &:hover {
    border-color: var(--primary-color);
    background-color: var(--bg-light);
  }

  &.has-file {
    border-color: var(--success-color);
    background-color: var(--success-bg);
    color: var(--success-text);
  }
`

export const SignaturePreview = styled.div`
  margin-top: var(--spacing-md);
  text-align: center;

  ${InfoLabel} {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
  }

  img {
    max-width: 200px;
    max-height: 80px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    object-fit: contain;
    margin-top: var(--spacing-xs);
  }
`

export const Separator = styled.hr`
  border: none;
  border-top: 1px solid var(--border-light);
  margin: var(--spacing-md) 0;
  width: calc(100% + 2 * var(--spacing-3xl));
  margin-left: calc(-1 * var(--spacing-3xl));
  opacity: 0.6;

  @media (max-width: 768px) {
    width: calc(100% + 2 * var(--spacing-md));
    margin-left: calc(-1 * var(--spacing-md));
  }
`

export const SeparatorStyle = styled.div`
  height: 2px;
  background: linear-gradient(to right, var(--primary-color), transparent);
  margin: var(--spacing-md) 0;
  width: calc(100% + 2 * var(--spacing-3xl));
  margin-left: calc(-1 * var(--spacing-3xl));
  border-radius: 1px;
  opacity: 0.6;

  @media (max-width: 768px) {
    width: calc(100% + 2 * var(--spacing-md));
    margin-left: calc(-1 * var(--spacing-md));
  }
`;

export const SuccessMessage = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  font-family: var(--font-family);

  h3 {
    color: var(--success-color);
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-lg);
    font-weight: 600;
    font-family: var(--font-family);
  }

  p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-sm);
    line-height: 1.5;
    font-family: var(--font-family);
  }
`

export const IndemnityTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--spacing-lg);
  background-color: var(--bg-primary);
`

export const TableHeader = styled.th`
  padding: var(--spacing-sm);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  font-weight: 600;
  text-align: left;
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
`

export const TableCell = styled.td`
  padding: var(--spacing-sm);
  border: 1px solid var(--border-light);
  font-size: var(--font-size-sm);
  background-color: var(--bg-primary);
  font-family: var(--font-family);
`

export const TotalRow = styled.tr`
  font-weight: 600;
`

export const OMPaymentButton = styled(ActionButton)`
  background-color: var(--success-color);
  border: 1px solid var(--success-color);

  &:hover {
    background-color: var(--bg-primary);
    color: var(--success-color);
    border-color: var(--success-color);
  }
`;

export const ButtonOMPDF = styled(ActionButton)`
  background-color: var(--pdf-color);
  border: 1px solid var(--pdf-color);
  margin-left: var(--spacing-sm);

  &:hover {
    background-color: var(--pdf-hover);
    color: var(--text-white);
    border-color: var(--pdf-hover);
  }
`;

export const MissionReportButton = styled(ActionButton)`
  width: 103px;
  background-color: var(--success-color);
  border: 1px solid var(--success-color);

  &:hover {
    background-color: var(--bg-primary);
    color: var(--success-color);
    border-color: var(--success-color);
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-3xl);
  background: var(--bg-primary);
  margin-bottom: var(--spacing-lg);

  @media (max-width: 768px) {
    padding: var(--spacing-sm) var(--spacing-md);
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

export const BtnBack = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs);
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  color: var(--text-secondary);

  &:hover {
    background-color: var(--bg-light);
    color: var(--text-color);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xs);
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

export const SaveButton = styled(ActionButton)`
    color: var(--white);
    background-color: var(--primary-color);
    border: 1px solid var(--primary-color);

    &:hover {
        background-color: var(--primary-hover);
        color: var(--white);
        border-color: var(--primary-color);
    }
`;

export const ToggleButton = styled(ActionButton)`
    background-color: var(--primary-color);
    border: 1px solid var(--primary-color);
    margin-right: 10px;

    &:hover {
        background-color: var(--bg-primary);
        color: var(--primary-color);
        border-color: var(--primary-color);
    }
`;

export const EditButton = styled(ActionButton)`
    background-color: var(--warning-color);
    border: 1px solid var(--warning-color);
    color: var(--text-color);
    margin-right: 10px;

    &:hover {
        background-color: var(--bg-primary);
        color: var(--warning-color);
        border-color: var(--warning-color);
    }
`;

export const DeleteButton = styled(ActionButton)`
    background-color: var(--danger-color);
    border: 1px solid var(--danger-color);

    &:hover {
        background-color: var(--bg-primary);
        color: var(--danger-color);
        border-color: var(--danger-color);
    }
`;

export const CancelButton = styled(ActionButton)`
    background-color: var(--accent-color);
    border: 1px solid var(--accent-color);
    margin-right: 10px;

    &:hover {
        background-color: var(--bg-primary);
        color: var(--accent-color);
        border-color: var(--accent-color);
    }
`;

export const ReportTextContainer = styled.div`
    background-color: var(--bg-primary);
    padding: 20px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    margin-bottom: 20px;
    font-family: var(--font-family);
    font-size: var(--font-size-md);
    line-height: 1.6;
    color: var(--text-color);

    & p {
        margin: 0 0 10px 0;
        font-family: var(--font-family);
    }

    & + & {
        border-top: 1px solid var(--border-light);
    }
`;

export const ReportHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--border-light);
`;

export const ReportActions = styled.div`
    display: flex;
    gap: 10px;
`;

// === STYLED COMPONENTS AMÉLIORÉS ===
export const ModernCard = styled.div`
    background: var(--bg-primary);
    padding: var(--spacing-3xl);
    margin-bottom: var(--spacing-3xl);
    width: 100%;
    box-sizing: border-box;
`;

export const TwoColumnLayout = styled.div<{ $hasLeft?: boolean }>`
    display: grid;
    grid-template-columns: ${({ $hasLeft = false }) => ($hasLeft ? "1fr 1fr" : "1fr")};
    gap: var(--spacing-3xl);
    margin-bottom: var(--spacing-4xl);

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

export const ResponsiveTableWrapper = styled.div`
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;

    @media (max-width: 768px) {
        font-size: var(--font-size-sm);
    }
`;

export const FolderContainer = styled.div`
    background: #FEF3C7;
    margin-bottom: var(--spacing-lg);
    overflow: hidden;
    transition: all var(--transition-speed) ease;
    width: 100%;
    box-sizing: border-box;
`;

export const FolderHeader = styled.button.withConfig({
    shouldForwardProp: (prop: string) => isPropValid(prop) && !prop.startsWith('$'),
})<{ $isOpen: boolean }>`
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg) var(--spacing-xl);
    background: ${(props) => (props.$isOpen ? "var(--warning-bg)" : "transparent")};
    border: none;
    cursor: pointer;
    transition: all var(--transition-speed) ease;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-semibold);
    color: var(--text-color);
    box-sizing: border-box;
    font-family: var(--font-family);

    &:hover {
        background: var(--warning-icon-bg);
    }

    .folder-icon {
        font-size: 1.5rem;
    }

    .chevron {
        margin-left: auto;
        transition: transform var(--transition-speed) ease;
        transform: ${(props) => (props.$isOpen ? "rotate(0deg)" : "rotate(-90deg)")};
    }
`;

export const AttachmentsList = styled.div`
    padding: var(--spacing-sm);
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    width: 100%;
    box-sizing: border-box;
`;

export const AttachmentItem = styled.div`
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--bg-primary);
    margin-bottom: var(--spacing-sm);
    transition: all 0.2s ease;
    width: 100%;
    box-sizing: border-box;

    &:hover {
        transform: translateX(4px);
    }

    .file-info {
        flex: 1;
        min-width: 0;

        .file-name {
            font-weight: var(--font-weight-semibold);
            color: var(--text-color);
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: var(--font-family);
        }

        .file-size {
            font-size: var(--font-size-xs);
            color: var(--text-muted);
            font-family: var(--font-family);
        }
    }

    .actions {
        display: flex;
        gap: var(--spacing-sm);
        flex-shrink: 0;
    }
`;

export const IconButton = styled.button.withConfig({
    shouldForwardProp: (prop: string) => isPropValid(prop) && !prop.startsWith('$'),
})<{ $variant?: "primary"; $download?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-sm);
    background: ${(props) => (props.$variant === "primary" ? "var(--primary-color)" : "var(--bg-secondary)")};
    color: ${(props) =>
        props.$variant === "primary" ? "var(--text-white)" : props.$download ? "var(--primary-color)" : "var(--text-color)"};
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: var(--border-radius-sm);
    font-family: var(--font-family);

    &:hover {
        background: ${(props) => (props.$variant === "primary" ? "var(--primary-hover)" : "var(--border-color)")};
        transform: scale(1.05);
    }

    &:active {
        transform: scale(0.95);
    }
`;

export const ChartCard = styled(ModernCard)`
    display: flex;
    flex-direction: column;
    min-height: 300px;

    h4 {
        margin: 0 0 var(--spacing-xl) 0;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color);
        font-family: var(--font-family);
    }

    .chart-content {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 250px;
    }
`;

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--overlay-bg);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const ModalContentStyled = styled.div`
    background: var(--bg-primary);
    padding: var(--spacing-3xl);
    border-radius: var(--border-radius-md);
    max-width: 90vw;
    max-height: 90vh;
    width: 800px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
`;

export const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
`;

export const ModalTitle = styled.h3`
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-color);
    font-family: var(--font-family);
`;

export const ModalCloseButton = styled(IconButton)`
    background: var(--bg-secondary);
    &:hover {
        background: var(--border-color);
    }
`;

export const ModalBody = styled.div`
    flex: 1;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const FilePreview = styled.iframe`
    width: 100%;
    height: 500px;
    border: none;
`;

export const ImagePreview = styled.img`
    max-width: 100%;
    max-height: 500px;
    object-fit: contain;
`;

export const ErrorMessage = styled.p`
    color: var(--error-color);
    text-align: center;
    font-size: var(--font-size-md);
    font-family: var(--font-family);
`;

// === PLUGIN CENTER TEXT (avec protection) ===
export const centerTextPlugin = {
    id: "centerText",
    beforeDraw(chart: Chart & { options: ChartWithCenterTextOptions }) {
        // Vérification critique : ne s'exécute que si explicitement activé
        if (!chart.options.plugins?.centerText?.display) {
            return;
        }
        
        const { ctx, chartArea } = chart;
        const text = chart.options.plugins.centerText.text;
        
        // Vérifier que toutes les données nécessaires existent
        if (!ctx || !chartArea || !text) {
            return;
        }
        
        ctx.save();
        ctx.font = "bold 16px Century Gothic, sans-serif";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        ctx.fillText(text, centerX, centerY);
        ctx.restore();
    },
};

export const Badge = styled.span<{ $type: string }>`
    display: inline-block;
    padding: 4px 12px;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    background: ${(props) => {
        const colors = {
            Transport: "var(--info-bg)",
            Hébergement: "var(--warning-bg)",
            Restauration: "var(--success-bg)",
            Autres: "var(--info-icon-bg)",
        };
        return colors[props.$type as keyof typeof colors] || "var(--bg-light)";
    }};
    color: var(--text-color);
    border-radius: var(--border-radius-sm);
    font-family: var(--font-family);
`;

export const ExpenseTypeContainer = styled.div`
  background: var(--bg-primary);
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

export const AccordionHeaderStyled = styled.button.withConfig({
  shouldForwardProp: (prop: string) => isPropValid(prop) && !prop.startsWith('$'),
})<{ $isOpen: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${(props) => (props.$isOpen ? 'var(--warning-bg)' : 'var(--bg-secondary)')};
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  font-family: var(--font-family);

  &:hover {
    background: var(--warning-icon-bg);
  }

  .chevron {
    margin-left: auto;
    transition: transform 0.3s ease;
    transform: ${(props) => (props.$isOpen ? "rotate(0deg)" : "rotate(-90deg)")};
  }
`;

export const AccordionContentStyled = styled.div<{ $isOpen: boolean }>`
  display: ${(props) => (props.$isOpen ? "block" : "none")};
  padding: 1rem;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
`;

export const AttachmentSection = styled.div`
  padding: 1.5rem;
  border: 2px dashed var(--primary-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  margin-top: 1rem;
`;


export const AttachmentCategory = styled.div`
  margin-bottom: 1.5rem;
`;

export const CategoryTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  font-style: italic;
  font-family: var(--font-family);
`;

export const DraftBadge = styled.span`
  font-size: 10px;
  color: var(--primary-color);
  font-style: italic;
  background: var(--warning-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-family);
`;

export const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--success-color);
  color: var(--text-white);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-family: var(--font-family);

  &:hover {
    background: var(--success-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;


export const ModalContent = styled.div`
  background: var(--bg-primary);
  padding: 24px;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  width: 800px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

// === NOUVEAUX STYLED COMPONENTS POUR LE HEADER CENTER ===
export const HeaderCenter = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  @media (max-width: 768px) {
    order: -1;
    width: 100%;
    margin-bottom: var(--spacing-sm);
  }
`;

export const HeaderTitleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-color);
  font-family: var(--font-family);
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: var(--font-size-xl);
  }
`;

export const PageSubtitle = styled.p`
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
  font-family: var(--font-family);
  font-style: italic;

  @media (max-width: 768px) {
    font-size: var(--font-size-xs);
  }
`;