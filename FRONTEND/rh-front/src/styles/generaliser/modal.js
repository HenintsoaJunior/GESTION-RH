import styled from "styled-components";

export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: var(--spacing-xl);
  z-index: 9999;

  @media (max-width: 768px) {
    padding-top: var(--spacing-md);
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
  }
`;

export const ModalContainer = styled.div`
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border-left: 4px solid;
  box-shadow: var(--shadow-sm);
  width: 90%;
  max-width: 480px;
  min-height: 80px;
  position: relative;
  overflow: hidden;

  &.modal-success {
    border-left-color: var(--success-color, #10b981);
    background-color: #d4edda;
  }
  &.modal-error {
    border-left-color: var(--error-color, #ef4444);
    background-color: #f8d7da;
  }
  &.modal-warning {
    border-left-color: var(--warning-color, #f59e0b);
    background-color: #fff3cd;
  }
  &.modal-info {
    border-left-color: var(--primary-color, #3b82f6);
    background-color: #cce5ff;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);

  @media (max-width: 768px) {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }
`;

export const ModalIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
  margin-top: var(--spacing-xs);

  &.icon-success {
    background-color: #d4edda;
    color: var(--success-color, #10b981);
  }
  &.icon-error {
    background-color: #f8d7da;
    color: var(--error-color, #ef4444);
  }
  &.icon-warning {
    background-color: #fff3cd;
    color: var(--warning-color, #f59e0b);
  }
  &.icon-info {
    background-color: #cce5ff;
    color: var(--primary-color, #3b82f6);
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

export const ModalTextContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ModalTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: var(--font-size-md);
  }
`;

export const ModalMessageList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const ModalMessage = styled.li`
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin: var(--spacing-xs) 0;
  line-height: 1.5;
  padding-left: var(--spacing-md);
  position: relative;

  &::before {
    content: "•";
    position: absolute;
    left: 0;

    &.modal-success {
      color: var(--success-color, #10b981);
    }
    &.modal-error {
      color: var(--error-color, #ef4444);
    }
    &.modal-warning {
      color: var(--warning-color, #f59e0b);
    }
    &.modal-info {
      color: var(--primary-color, #3b82f6);
    }
  }

  @media (max-width: 768px) {
    font-size: var(--font-size-xs);
  }
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-secondary);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xs);
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-light);

  @media (max-width: 768px) {
    padding: var(--spacing-sm) var(--spacing-md);
  }
`;

export const ButtonCancel = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-xs);
  box-shadow: var(--shadow-sm);
  height: 32px;
  line-height: 1;
  transition: all 0.2s ease;
  background-color: var(--error-color, #ef4444);
  color: #ffffff;
  min-width: 70px;

  &:hover {
    background-color: var(--error-hover, #dc2626);
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

export const ButtonConfirm = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-family);
  font-size: var(--font-size-xs);
  box-shadow: var(--shadow-sm);
  height: 32px;
  line-height: 1;
  transition: all 0.2s ease;
  background-color: var(--primary-color, #3b82f6);
  color: #ffffff;
  min-width: 70px;

  &:hover {
    background-color: var(--primary-hover, #2563eb);
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

export const DarkMode = styled.div`
  @media (prefers-color-scheme: dark) {
    ${ModalContainer} {
      background: #1e293b;
      box-shadow: var(--shadow-md);
      &.modal-success {
        background-color: #2a4e3a;
      }
      &.modal-error {
        background-color: #4b2e2e;
      }
      &.modal-warning {
        background-color: #4f3a1b;
      }
      &.modal-info {
        background-color: #2a3c5f;
      }
    }

    ${ModalIconContainer} {
      &.icon-success {
        background-color: #2a4e3a;
        color: var(--success-color, #10b981);
      }
      &.icon-error {
        background-color: #4b2e2e;
        color: var(--error-color, #ef4444);
      }
      &.icon-warning {
        background-color: #4f3a1b;
        color: var(--warning-color, #f59e0b);
      }
      &.icon-info {
        background-color: #2a3c5f;
        color: var(--primary-color, #3b82f6);
      }
    }

    ${ModalTitle} {
      color: var(--text-primary, #f1f5f9);
    }

    ${ModalMessage} {
      color: var(--text-muted, #cbd5e1);
    }

    ${ModalCloseButton} {
      color: var(--text-muted, #94a3b8);
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }

    ${ModalActions} {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    ${ButtonCancel} {
      background-color: var(--error-color, #ef4444);
      &:hover {
        background-color: var(--error-hover, #dc2626);
      }
    }

    ${ButtonConfirm} {
      background-color: var(--primary-color, #3b82f6);
      &:hover {
        background-color: var(--primary-hover, #2563eb);
      }
    }
  }
`;