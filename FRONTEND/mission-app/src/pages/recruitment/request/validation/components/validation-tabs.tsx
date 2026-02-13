import React, { useMemo } from "react";

export type TabValidationKey = "demandes" | "tdr";

interface ValidationTabsProps {
  activeTab: TabValidationKey;
  onTabChange: (tab: TabValidationKey) => void;
  canViewRequests?: boolean;
  canViewJobDescriptions?: boolean;
}

const ValidationTabs: React.FC<ValidationTabsProps> = ({ activeTab, onTabChange, 
  canViewRequests = false, canViewJobDescriptions = false }) => {
  const tabs = useMemo(() => [
    ...(canViewRequests ? [{ key: "demandes" as TabValidationKey, label: "Demandes" }] : []),
    ...(canViewJobDescriptions ? [{ key: "tdr" as TabValidationKey, label: "Termes de référence" }] : []),
  ], [canViewRequests, canViewJobDescriptions]);

  return (
    <div style={{ display: "flex", gap: "12px", margin: "16px 0" }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          style={{
            padding: "8px 16px",
            background: tab.key === activeTab ? "var(--text-light)" : "#f0f0f0",
            color: tab.key === activeTab ? "#fff" : "#000",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer"
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ValidationTabs;
