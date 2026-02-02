"use client";
import { useState, useEffect, useMemo } from "react";
import { useRolesInfo } from "@/api/access/services";
import { useHasHabilitation } from "@/api/users/services";
import RoleFormPopup from "./components/update-form";
import CreateRolePopup from "./components/create-form";
import RoleActions from "./components/role-actions";
import RoleTabs from "./components/role-tabs";
import RoleContent from "./components/role-content";

export interface Habilitation {
  habilitationId: string;
  label: string;
}

export interface HabilitationGroup {
  groupId: string;
  label: string;
  habilitations: Habilitation[];
}

export interface Role {
  roleId: string;
  name: string;
  description?: string;
  habilitationGroups: HabilitationGroup[];
}


const RoleTabsList: React.FC = () => {
  const { data: rolesResponse, isLoading } = useRolesInfo();
  const roles: Role[] = useMemo(() => rolesResponse?.data || [], [rolesResponse?.data]);

  const [activeTab, setActiveTab] = useState("");
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.userId;

  const canCreateRole = useHasHabilitation(userId, "Créer un rôle et ses habilitations");
  const canModifyRole = useHasHabilitation(userId, "Modifier un rôle");

  useEffect(() => {
    if (!roles.length) return;
    const adminRole = roles.find(r => r.name.toLowerCase() === "admin");
    setActiveTab(adminRole?.roleId || roles[0].roleId);
  }, [roles]);

  if (isLoading) return <p>Chargement des rôles...</p>;
  if (!roles.length) return <p>Aucun rôle trouvé.</p>;

  return (
    <div>
      <RoleActions
        canCreateRole={canCreateRole}
        onCreate={() => setIsCreatePopupOpen(true)}
      />

      <RoleTabs
        roles={roles}
        activeTab={activeTab}
        onChange={setActiveTab}
        canModifyRole={canModifyRole}
        onEditRole={(roleId) => {
          setEditingRoleId(roleId);
          setIsEditPopupOpen(true);
        }}
      />

      <RoleContent roles={roles} activeTab={activeTab} />

      {editingRoleId && (
        <RoleFormPopup
          isOpen={isEditPopupOpen}
          initialRoleIds={[editingRoleId]}
          onClose={() => {
            setIsEditPopupOpen(false);
            setEditingRoleId(null);
          }}
        />
      )}

      {canCreateRole && (
        <CreateRolePopup
          isOpen={isCreatePopupOpen}
          onClose={() => setIsCreatePopupOpen(false)}
        />
      )}
    </div>
  );
};

export default RoleTabsList;
