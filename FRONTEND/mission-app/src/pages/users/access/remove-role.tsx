import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { X, Save } from "lucide-react";
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupContent,
  SelectedUsersContainer,
  SelectedUsersTitle,
  SelectedUsersList,
  SelectedUserTag,
  SectionContainer,
  SectionHeader,
  SectionTitle,
  ItemsList,
  RoleItem,
  CheckboxContainer,
  ItemContent,
  RoleCheckbox,
  RoleLabel,
  RoleDescription,
  CenterContainer,
  PopupActionButtons,
} from "@/styles/popup-styles";
import { ButtonUpdate, ButtonCancel, NoDataMessage } from "@/styles/table-styles";
import { RolesContainer, RoleBadge } from "@/styles/table-styles";
import { useUsers, useBulkRemoveUserRoles } from "@/api/users/services";
import { useRoles, type Role } from "@/api/access/services";
import Alert from "@/components/alert";
import type { User } from "@/api/users/services";
import axios from "axios";

interface RemoveRolePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userIds?: string[];
  users?: User[];
}

type AlertType = "error" | "success" | "info" | "warning";

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  message: string;
}

const useAlert = (onSuccessClose?: () => void) => {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    type: "info",
    message: "",
  });
  
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Nettoyage des timers
  const clearTimers = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }
  }, []);

  const showAlert = useCallback((type: AlertType, message: string) => {
    clearTimers();
    setAlert({ isOpen: true, type, message });
  }, [clearTimers]);

  const handleClose = useCallback(() => {
    const wasSuccess = alert.type === "success";
    setAlert({ isOpen: false, type: "info", message: "" });
    
    if (wasSuccess && onSuccessClose) {
      // Fermeture automatique du popup après un délai
      closeTimerRef.current = setTimeout(() => {
        onSuccessClose();
      }, 800); // Délai optimisé pour UX fluide
    }
  }, [alert.type, onSuccessClose]);

  const resetAlert = useCallback(() => {
    clearTimers();
    setAlert({ isOpen: false, type: "info", message: "" });
  }, [clearTimers]);

  // Auto-fermeture de l'alerte après 3 secondes pour les succès
  useEffect(() => {
    if (alert.isOpen && alert.type === "success") {
      alertTimerRef.current = setTimeout(() => {
        handleClose();
      }, 3000);
    }
    
    return () => {
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
    };
  }, [alert.isOpen, alert.type, handleClose]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return { alert, showAlert, handleClose, resetAlert };
};

const useSelections = () => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const toggleRole = useCallback((roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) 
        ? prev.filter((id) => id !== roleId) 
        : [...prev, roleId]
    );
  }, []);

  const reset = useCallback(() => {
    setSelectedRoles([]);
  }, []);

  const selectedCount = useMemo(() => selectedRoles.length, [selectedRoles.length]);

  return {
    selectedRoles,
    setSelectedRoles,
    toggleRole,
    reset,
    selectedCount,
  };
};

const useFilteredRoles = (
  roles: Role[],
  selectedRoles: string[],
  searchTerm: string,
  filterType: "all" | "selected" | "unselected"
) => {
  return useMemo(() => {
    let filtered = roles.filter((role) =>
      role.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterType === "selected") {
      filtered = filtered.filter((role) => selectedRoles.includes(role.roleId));
    } else if (filterType === "unselected") {
      filtered = filtered.filter((role) => !selectedRoles.includes(role.roleId));
    }

    return filtered;
  }, [roles, searchTerm, filterType, selectedRoles]);
};

const RemoveRolePopupComponent: React.FC<RemoveRolePopupProps> = ({ 
  isOpen, 
  onClose,
  userIds = [],
  users: selectedUsers = []
}) => {
  const [searchTermRoles, setSearchTermRoles] = useState("");
  const [filterTypeRoles, setFilterTypeRoles] = useState<"all" | "selected" | "unselected">("all");
  const [isRemoving, setIsRemoving] = useState(false);

  const { 
    data: usersResponse, 
    isLoading: usersLoading, 
    error: usersError, 
    refetch: refetchUsers 
  } = useUsers();
  
  const { 
    data: rolesResponse, 
    isLoading: rolesLoading, 
    error: rolesError, 
    refetch: refetchRoles 
  } = useRoles();

  const bulkMutation = useBulkRemoveUserRoles();

  const allUsers = useMemo(() => usersResponse?.data || [], [usersResponse?.data]);
  const roles = useMemo(() => rolesResponse?.data || [], [rolesResponse?.data]);

  const resolvedSelectedUsers = useMemo(() => {
    if (selectedUsers.length > 0) return selectedUsers;
    return allUsers.filter((u) => userIds.includes(u.userId || u.matricule));
  }, [selectedUsers, allUsers, userIds]);

  const {
    selectedRoles,
    toggleRole,
    reset: resetSelections,
    selectedCount,
  } = useSelections();

  const { alert, showAlert, handleClose: handleAlertClose, resetAlert } = useAlert(onClose);

  const filteredRoles = useFilteredRoles(roles, selectedRoles, searchTermRoles, filterTypeRoles);

  const getUserName = useCallback((userId: string): string => {
    const user = [...resolvedSelectedUsers, ...allUsers].find((u) => u.userId === userId);
    return user?.name || userId;
  }, [resolvedSelectedUsers, allUsers]);

  const resetAllStates = useCallback(() => {
    setSearchTermRoles("");
    setFilterTypeRoles("all");
    setIsRemoving(false);
    resetAlert();
    resetSelections();
  }, [resetAlert, resetSelections]);

  useEffect(() => {
    if (isOpen) {
      resetAllStates();
    }
  }, [isOpen, resetAllStates]);

  useEffect(() => {
    if (isOpen) {
      refetchUsers();
      refetchRoles();
    }
  }, [isOpen, refetchUsers, refetchRoles]);

  useEffect(() => {
    if (usersError && isOpen) {
      const errorMessage = usersError.message || "Erreur lors du chargement des utilisateurs.";
      showAlert("error", errorMessage);
    }
  }, [usersError, isOpen, showAlert]);

  useEffect(() => {
    if (rolesError && isOpen) {
      const errorMessage = rolesError.message || "Erreur lors du chargement des rôles.";
      showAlert("error", errorMessage);
    }
  }, [rolesError, isOpen, showAlert]);

  const handleRemove = useCallback(async () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData?.userId;

    if (resolvedSelectedUsers.length === 0) {
      showAlert("warning", "Aucun utilisateur sélectionné.");
      return;
    }

    if (selectedCount === 0) {
      showAlert("warning", "Veuillez sélectionner au moins un rôle à supprimer.");
      return;
    }

    if (bulkMutation.isPending || isRemoving) {
      return;
    }

    setIsRemoving(true);

    try {
      await bulkMutation.mutateAsync({
        userIds,
        roleIds: selectedRoles,
        userIdLog: userId,
      });

      const userText = resolvedSelectedUsers.length > 1 ? "utilisateurs" : "utilisateur";
      const roleText = selectedCount > 1 ? "rôles supprimés" : "rôle supprimé";
      
      showAlert(
        "success",
        `${selectedCount} ${roleText} pour ${resolvedSelectedUsers.length} ${userText} avec succès.`
      );
      
    } catch (err: unknown) {
      let errorMessage = "Une erreur est survenue lors de la suppression.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      showAlert("error", errorMessage);
    } finally {
      setIsRemoving(false);
    }
  }, [resolvedSelectedUsers.length, selectedCount, selectedRoles, showAlert, bulkMutation, isRemoving, userIds]);

  const handleCancel = useCallback(() => {
    resetAllStates();
    onClose();
  }, [resetAllStates, onClose]);

  if (!isOpen) return null;

  const isLoading = usersLoading || rolesLoading;
  const isDisabled = isLoading || isRemoving || bulkMutation.isPending;

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>
            Suppression de Rôles ({resolvedSelectedUsers.length} utilisateur{resolvedSelectedUsers.length > 1 ? "s" : ""})
          </PopupTitle>
          <PopupClose onClick={handleCancel} disabled={isDisabled}>
            <X size={16} />
          </PopupClose>
        </PopupHeader>
        
        <PopupContent>
          {/* Alerte avec auto-fermeture */}
          {alert.isOpen && (
            <Alert
              type={alert.type}
              message={alert.message}
              isOpen={alert.isOpen}
              onClose={handleAlertClose}
            />
          )}

          {/* Liste des utilisateurs sélectionnés avec leurs rôles actuels */}
          <SelectedUsersContainer>
            <SelectedUsersTitle>
              Utilisateurs sélectionnés :
            </SelectedUsersTitle>
            <SelectedUsersList>
              {resolvedSelectedUsers.length > 0 ? (
                resolvedSelectedUsers.map((user) => (
                  <div key={user.userId || user.matricule} style={{ marginBottom: "var(--spacing-md)", padding: "var(--spacing-sm)", border: "1px solid var(--border-light)", borderRadius: "var(--border-radius-sm)" }}>
                    <SelectedUserTag>{getUserName(user.userId || user.matricule)}</SelectedUserTag>
                    <div style={{ marginTop: "var(--spacing-xs)" }}>
                      <small style={{ color: "var(--text-secondary)" }}>Rôles actuels :</small>
                      {user.userRoles && user.userRoles.length > 0 ? (
                        <RolesContainer style={{ marginTop: "var(--spacing-xs)" }}>
                          {user.userRoles.map((ur, idx) => (
                            <RoleBadge key={idx}>{ur.role.name}</RoleBadge>
                          ))}
                        </RolesContainer>
                      ) : (
                        <span style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>Aucun rôle</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <NoDataMessage>Aucun utilisateur sélectionné</NoDataMessage>
              )}
            </SelectedUsersList>
          </SelectedUsersContainer>

          {/* Section des rôles */}
          <SectionContainer>
            <SectionHeader>
              <SectionTitle>
                Rôles disponibles à Supprimer {selectedCount > 0 && `(${selectedCount} sélectionné${selectedCount > 1 ? "s" : ""})`}
              </SectionTitle>
            </SectionHeader>

            {rolesLoading ? (
              <CenterContainer>
                <NoDataMessage>Chargement des rôles...</NoDataMessage>
              </CenterContainer>
            ) : filteredRoles.length > 0 ? (
              <ItemsList>
                {filteredRoles.map((role) => {
                  const isSelected = selectedRoles.includes(role.roleId);
                  return (
                    <RoleItem key={role.roleId} selected={isSelected}>
                      <CheckboxContainer>
                        <RoleCheckbox
                          type="checkbox"
                          id={`role-remove-${role.roleId}`}
                          checked={isSelected}
                          onChange={() => toggleRole(role.roleId)}
                          disabled={isDisabled}
                        />
                        <ItemContent>
                          <RoleLabel htmlFor={`role-remove-${role.roleId}`}>
                            {role.name || "Non spécifié"}
                          </RoleLabel>
                          <RoleDescription>
                            {role.description || "Aucune description"}
                          </RoleDescription>
                        </ItemContent>
                      </CheckboxContainer>
                    </RoleItem>
                  );
                })}
              </ItemsList>
            ) : (
              <CenterContainer>
                <NoDataMessage>
                  {searchTermRoles 
                    ? "Aucun rôle trouvé pour cette recherche." 
                    : "Aucun rôle disponible."}
                </NoDataMessage>
              </CenterContainer>
            )}
          </SectionContainer>

          {/* Boutons d'action */}
          <PopupActionButtons>
            <ButtonCancel onClick={handleCancel} disabled={isDisabled}>
              <X size={16} />
              Annuler
            </ButtonCancel>
            <ButtonUpdate
              onClick={handleRemove}
              disabled={isDisabled || resolvedSelectedUsers.length === 0 || selectedCount === 0}
            >
              <Save size={16} />
              {isRemoving ? "Suppression..." : "Supprimer"}
              {selectedCount > 0 && !isRemoving && (
                <> ({selectedCount} rôle{selectedCount > 1 ? "s" : ""})</>
              )}
            </ButtonUpdate>
          </PopupActionButtons>
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
};

export default RemoveRolePopupComponent;