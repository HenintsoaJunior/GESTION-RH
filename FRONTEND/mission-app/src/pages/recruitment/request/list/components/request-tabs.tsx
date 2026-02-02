import React, { useMemo } from "react";

export type TabKey = "mes" | "collaborateurs" | "toutes";

interface RequestTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  canViewAllRequests?: boolean;
  canViewCollaboratorRequests?: boolean;
}

const RequestTabs: React.FC<RequestTabsProps> = ({ activeTab, onTabChange, 
  canViewAllRequests = false, canViewCollaboratorRequests = false }) => {
  const tabs = useMemo(() => [
    { key: "mes" as TabKey, label: "Mes demandes" },
    ...(canViewCollaboratorRequests ? [{ key: "collaborateurs" as TabKey, label: "Collaborateurs" }] : []),
    ...(canViewAllRequests ? [{ key: "toutes" as TabKey, label: "Toutes les demandes" }] : [])
  ], [canViewAllRequests, canViewCollaboratorRequests]);

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

export default RequestTabs;
