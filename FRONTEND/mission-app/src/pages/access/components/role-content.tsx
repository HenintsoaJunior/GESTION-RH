import { useState } from "react";
import RoleGroupCard from "./role-group-card";
import type { HabilitationGroup, Role } from "..";

interface Props {
  roles: Role[];
  activeTab: string;
}

const RoleContent: React.FC<Props> = ({ roles, activeTab }) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  return (
    <>
      {roles.filter(r => r.roleId === activeTab).map(role => (
        <div key={role.roleId}>
          <p style={{ fontStyle: "italic", marginBottom: "16px" }}>
            {role.description || "-"}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {role.habilitationGroups.map((group: HabilitationGroup) => (
              <RoleGroupCard
                key={group.groupId}
                roleId={role.roleId}
                group={group}
                expandedGroups={expandedGroups}
                setExpandedGroups={setExpandedGroups}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default RoleContent;
