// alert.tsx
"use client";
import { useState, useEffect, useCallback } from "react"; 
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import {
  AlertContainer,
  AlertStyled,
  AlertContent,
  AlertIcon,
  AlertMessage,
  AlertClose,
  CloseIcon,
  AlertProgress,
} from "@/styles/alert-styles";

interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  message: string;
  isOpen: boolean;
  onClose?: () => void;
}

const AlertComponent: React.FC<AlertProps> = ({ type = "info", message, isOpen, onClose = () => {} }) => {
  const [visible, setVisible] = useState<boolean>(isOpen);
  const [closing, setClosing] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      if (typeof onClose === "function") {
        onClose();
      }
    }, 300); 
  }, [onClose]); 

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);

      const timer = setTimeout(() => {
        handleClose();
      }, 5000); 

      return () => clearTimeout(timer);
    }
  }, [isOpen, handleClose]); 

  if (!visible) return null;

  const getIcon = (): React.ReactElement => {
    switch (type) {
      case "success":
        return <CheckCircle size={16} />;
      case "error":
        return <AlertCircle size={16} />;
      case "warning":
        return <AlertTriangle size={16} />;
      case "info":
      default:
        return <Info size={16} />;
    }
  };

  return (
    <AlertContainer>
      <AlertStyled $type={type} $closing={closing}>
        <AlertContent>
          <AlertIcon>{getIcon()}</AlertIcon>
          <AlertMessage>{message}</AlertMessage>
          <AlertClose onClick={handleClose} aria-label="Fermer l'alerte">
            <CloseIcon size={18} />
          </AlertClose>
        </AlertContent>
        <AlertProgress />
      </AlertStyled>
    </AlertContainer>
  );
};

export default AlertComponent;