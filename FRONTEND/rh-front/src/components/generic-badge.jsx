import React from "react";

export function GenericBadge({
  value,
  statusConfig = {},
  defaultStatus = "default",
  className = "",
  onClick,
  customRenderer,
}) {
  const defaultConfig = {
    default: { class: "status-default", label: "Défaut" },
    success: { class: "status-success", label: "Succès" },
    error: { class: "status-error", label: "Erreur" },
    warning: { class: "status-warning", label: "Attention" },
    info: { class: "status-info", label: "Info" },
    pending: { class: "status-pending", label: "En attente" },
    progress: { class: "status-progress", label: "En cours" },
    approved: { class: "status-approved", label: "Approuvé" },
    cancelled: { class: "status-cancelled", label: "Annulé" },
  };

  const config = { ...defaultConfig, ...statusConfig };
  const statusKey = value?.toLowerCase() || defaultStatus;
  const statusInfo = config[statusKey] || config[defaultStatus];

  if (customRenderer) {
    return customRenderer(value, statusInfo, config);
  }

  const handleClick = () => {
    if (onClick) {
      onClick(value, statusInfo);
    }
  };

  return (
    <span
      className={`status-badge ${statusInfo.class} ${className} ${onClick ? "clickable" : ""}`}
      onClick={handleClick}
      title={statusInfo.label}
    >
      {statusInfo.label || value || "N/A"}
    </span>
  );
}