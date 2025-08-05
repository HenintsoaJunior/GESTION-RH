import React from "react";
import PropTypes from "prop-types";

export function GenericStats({
  stats = {},
  statsConfig = [],
  isLoading = false,
  className = "",
}) {
  return (
    <div className={`stats-container ${className}`}>
      <div className="stats-grid">
        {statsConfig.map((config) => (
          <div
            key={config.key}
            className={`stat-card ${config.className || ""}`}
          >
            <div className="stat-icon">
              {config.icon ? <config.icon className="w-6 h-6" /> : null}
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {isLoading ? "..." : (stats[config.key] ?? 0)}
              </div>
              <div className="stat-label">{config.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

GenericStats.propTypes = {
  stats: PropTypes.object,
  statsConfig: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
      className: PropTypes.string,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
};