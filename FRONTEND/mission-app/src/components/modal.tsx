"use client";

import React from "react";
import { CheckCircle, XCircle, FileText, X } from "lucide-react";
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupContent,
  ButtonPrimary,
} from "@/styles/popup-styles";
import styled from "styled-components";

const PopupActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 20px 30px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
`;

const ButtonSecondary = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--secondary-color, #6c757d);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--secondary-hover, #5a6268);
  }

  &:disabled {
    background: var(--disabled-color, #dee2e6);
    color: var(--disabled-text, #6c757d);
    cursor: not-allowed;
  }

  &.reject {
    background: var(--danger-color, #dc3545);

    &:hover {
      background: var(--danger-hover, #c82333);
    }
  }
`;

interface ModalProps {
  type?: "success" | "error" | "warning" | "info";
  message: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  confirmAction?: () => void;
  cancelAction?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  showActions?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  type = "info",
  message,
  title,
  isOpen,
  onClose,
  children,
  confirmAction,
  cancelAction,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  showActions = true,
}) => {
  if (!isOpen) return null;

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "var(--success-color, #28a745)";
      case "error":
        return "var(--danger-color, #dc3545)";
      case "warning":
        return "var(--warning-color, #ffc107)";
      case "info":
        return "var(--info-color, #17a2b8)";
      default:
        return "var(--text-color, #333)";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={24} color={getIconColor()} />;
      case "error":
        return <XCircle size={24} color={getIconColor()} />;
      case "warning":
        return <XCircle size={24} color={getIconColor()} />;
      case "info":
        return <FileText size={24} color={getIconColor()} />;
      default:
        return <FileText size={24} color={getIconColor()} />;
    }
  };

  const handleConfirm = () => {
    confirmAction?.();
    onClose();
  };

  const handleCancel = () => {
    cancelAction?.();
    onClose();
  };

  return (
    <PopupOverlay onClick={onClose} role="dialog" aria-labelledby="modal-title" aria-modal="true">
      <PagePopup
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{ maxWidth: "500px", padding: "0" }}
      >
        <PopupHeader style={{ padding: "20px 30px", borderBottom: "1px solid var(--border-light)" }}>
          <PopupTitle id="modal-title" style={{ display: "flex", alignItems: "center", fontSize: "1.2rem" }}>
            {getIcon()} {title}
          </PopupTitle>
          <button
            onClick={onClose}
            aria-label="Fermer la modale"
            title="Fermer la modale"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
            }}
          >
            <X size={24} />
          </button>
        </PopupHeader>
        <PopupContent style={{ padding: "30px" }}>
          <p style={{ marginBottom: "20px", lineHeight: 1.6 }}>{message}</p>
          {children}
        </PopupContent>
        {showActions && (
          <PopupActions>
            <ButtonSecondary type="button" onClick={handleCancel}>
              {cancelLabel}
            </ButtonSecondary>
            {confirmAction && (
              <ButtonPrimary type="button" onClick={handleConfirm} className={type === "error" ? "reject" : ""}>
                {confirmLabel}
              </ButtonPrimary>
            )}
          </PopupActions>
        )}
      </PagePopup>
    </PopupOverlay>
  );
};

export default Modal;