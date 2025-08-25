"use client";

import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import {
  ModalBackdrop,
  ModalContainer,
  ModalHeader,
  ModalIconContainer,
  ModalTextContent,
  ModalTitle,
  ModalMessageList,
  ModalMessage,
  ModalCloseButton,
  ModalActions,
  DarkMode,
} from "styles/generaliser/modal";

const Modal = ({ type = "info", message, isOpen, onClose, title, children }) => {
  const [visible, setVisible] = useState(isOpen);

  const playNotificationSound = useCallback(() => {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch((error) => {
      console.warn("Impossible de jouer le son de notification:", error);
    });
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      try {
        playNotificationSound();
      } catch (error) {
        console.warn("Impossible de jouer le son de notification:", error);
      }
    } else {
      setVisible(false);
    }
  }, [isOpen, playNotificationSound]);

  if (!visible) return null;

  const getIcon = () => {
    const iconProps = { size: 28, strokeWidth: 2 };
    switch ( type ) {
      case "success":
        return <CheckCircle {...iconProps} />;
      case "error":
        return <AlertCircle {...iconProps} />;
      case "warning":
        return <AlertTriangle {...iconProps} />;
      case "info":
      default:
        return <Info {...iconProps} />;
    }
  };

  const messageLines = message.split('.').map(line => line.trim()).filter(line => line.length > 0);

  return (
    <DarkMode>
      <ModalBackdrop>
        <ModalContainer className={`modal-${type}`}>
          <ModalHeader>
            <ModalIconContainer className={`icon-${type}`}>
              {getIcon()}
            </ModalIconContainer>
            <ModalTextContent>
              {title && <ModalTitle>{title}</ModalTitle>}
              <ModalMessageList>
                {messageLines.map((line, index) => (
                  <ModalMessage key={index} className={`modal-${type}`}>{line}</ModalMessage>
                ))}
              </ModalMessageList>
            </ModalTextContent>
            <ModalCloseButton onClick={handleClose} aria-label="Fermer la notification">
              <X size={20} strokeWidth={2} />
            </ModalCloseButton>
          </ModalHeader>
          {children && <ModalActions>{children}</ModalActions>}
        </ModalContainer>
      </ModalBackdrop>
    </DarkMode>
  );
};

export default Modal;