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
  max-width: 800px; /* Reduced from 1000px */
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

export const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 20px;
  color: #ffffff;
  font-size: var(--font-size-xs);
  font-weight: 600;
  background-color: ${(props) => {
    if (props.status === "approved") return "var(--success-color)"
    if (props.status === "in-progress") return "var(--primary-color)"
    return "var(--text-muted)"
  }};

  @media (max-width: 768px) {
    font-size: 11px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
`

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
  margin-bottom: var(--spacing-md);
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
  grid-template-columns: 1fr;
  gap: var(--spacing-sm);
`

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`

export const InfoLabel = styled.label`
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

export const InfoValue = styled.div`
  color: var(--text-primary);
  font-size: var(--font-size-xs);

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

export const StepCounter = styled.div`
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`