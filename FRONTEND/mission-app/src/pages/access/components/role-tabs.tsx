import { Edit } from "lucide-react";

interface Role {
  roleId: string;
  name: string;
}

interface Props {
  roles: Role[];
  activeTab: string;
  onChange: (id: string) => void;
  canModifyRole?: boolean;
  onEditRole: (id: string) => void;
}

const RoleTabs: React.FC<Props> = ({
  roles,
  activeTab,
  onChange,
  canModifyRole,
  onEditRole
}) => {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
      {roles.map(role => (
        <button
          key={role.roleId}
          onClick={() => onChange(role.roleId)}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: activeTab === role.roleId ? "2px solid var(--primary-color)" : "1px solid #ccc",
            background: activeTab === role.roleId ? "var(--primary-light)" : "#f9f9f9",
            cursor: "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          {role.name}
          {canModifyRole && activeTab === role.roleId && (
            <Edit
              size={14}
              onClick={(e) => {
                e.stopPropagation();
                onEditRole(role.roleId);
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default RoleTabs;
