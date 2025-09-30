"use client";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import "styles/alert.css";

const Alert = ({ type = "info", message, isOpen, onClose = () => {} }) => {
  const [visible, setVisible] = useState(isOpen);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      if (typeof onClose === "function") {
        onClose();
      }
    }, 300); // Delay for closing animation
  };

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);

      const timer = setTimeout(() => {
        handleClose();
      }, 5000); // Auto-dismiss after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, handleClose]);

  if (!visible) return null;

  const getIcon = () => {
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
    <div className="alert-container">
      <div className={`alert alert-${type} ${closing ? "closing" : ""}`}>
        <div className="alert-content">
          <div className="alert-icon">{getIcon()}</div>
          <div className="alert-message">{message}</div>
          <button onClick={handleClose} className="alert-close" aria-label="Fermer l'alerte">
            <X size={18} />
          </button>
        </div>
        <div className="alert-progress"></div>
      </div>
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(["success", "error", "warning", "info"]),
  message: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default Alert;