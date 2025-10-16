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
  CenterContainer,
  PopupActionButtons,
} from "@/styles/popup-styles";
import { ButtonUpdate, ButtonCancel, NoDataMessage } from "@/styles/table-styles";
import { useRoles, useHabilitationsGroups, useHabilitationsByRoles, useBulkRoleHabilitation } from "@/api/access/services";
import Alert from "@/components/alert";
import axios from "axios";

interface Habilitation {
  habilitationId: string;
  groupId: string;
  label: string;
  group: null;
  roleHabilitations: any[];
  createdAt: string;
  updatedAt: string | null;
}

export interface HabilitationGroup {
  groupId: string;
  label: string;
  habilitations: Habilitation[];
  createdAt: string;
  updatedAt: string | null;
}

interface RoleFormProps {
  isOpen: boolean;
  initialRoleIds: string[];
  onClose: () => void;
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
      closeTimerRef.current = setTimeout(() => {
        onSuccessClose();
      }, 800);
    }
  }, [alert.type, onSuccessClose, clearTimers]);

  const resetAlert = useCallback(() => {
    clearTimers();
    setAlert({ isOpen: false, type: "info", message: "" });
  }, [clearTimers]);

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

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return { alert, showAlert, handleClose, resetAlert };
};

const useSelections = (initialRoles: string[]) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles);
  const [selectedHabilitations, setSelectedHabilitations] = useState<string[]>([]);

  const toggleHabilitation = useCallback((habId: string) => {
    setSelectedHabilitations((prev) =>
      prev.includes(habId) 
        ? prev.filter((id) => id !== habId) 
        : [...prev, habId]
    );
  }, []);

  const reset = useCallback(() => {
    setSelectedRoles(initialRoles);
    setSelectedHabilitations([]);
  }, [initialRoles]);

  const selectedRoleCount = useMemo(() => selectedRoles.length, [selectedRoles]);
  const selectedHabCount = useMemo(() => selectedHabilitations.length, [selectedHabilitations]);

  return {
    selectedRoles,
    selectedHabilitations,
    setSelectedHabilitations,
    toggleHabilitation,
    reset,
    selectedRoleCount,
    selectedHabCount,
  };
};

const useFilteredGroups = (
  groups: HabilitationGroup[],
  selectedHabIds: string[],
  searchTerm: string,
  filterType: "all" | "selected" | "unselected"
) => {
  return useMemo(() => {
    return groups
      .map(group => ({
        ...group,
        habilitations: group.habilitations.filter((hab) =>
          hab.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter(group => group.habilitations.length > 0)
      .map(group => ({
        ...group,
        habilitations: filterType === "selected"
          ? group.habilitations.filter((hab) => selectedHabIds.includes(hab.habilitationId))
          : filterType === "unselected"
          ? group.habilitations.filter((hab) => !selectedHabIds.includes(hab.habilitationId))
          : group.habilitations
      }))
      .filter(group => group.habilitations.length > 0);
  }, [groups, selectedHabIds, searchTerm, filterType]);
};

const UpdateRoleFormPopup: React.FC<RoleFormProps> = ({ 
  isOpen, 
  initialRoleIds = [],
  onClose
}) => {
  const [searchTermHabs, setSearchTermHabs] = useState("");
  const [filterTypeHabs, setFilterTypeHabs] = useState<"all" | "selected" | "unselected">("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { 
    data: rolesResponse, 
    isLoading: rolesLoading, 
    error: rolesError, 
    refetch: refetchRoles 
  } = useRoles();

  const { 
    data: groupsResponse, 
    isLoading: groupsLoading, 
    error: groupsError, 
    refetch: refetchGroups 
  } = useHabilitationsGroups();

  const initialHabsQuery = useHabilitationsByRoles(initialRoleIds);

  const roles = useMemo(() => rolesResponse?.data || [], [rolesResponse?.data]);
  const allGroups = useMemo(() => groupsResponse?.data || [], [groupsResponse?.data]) as HabilitationGroup[];

  const {
    selectedRoles,
    selectedHabilitations,
    setSelectedHabilitations,
    toggleHabilitation,
    reset,
    selectedRoleCount,
    selectedHabCount,
  } = useSelections(initialRoleIds);

  const { alert, showAlert, handleClose: handleAlertClose, resetAlert } = useAlert(onClose);

  const bulkMutation = useBulkRoleHabilitation();

  const filteredGroups = useFilteredGroups(allGroups, selectedHabilitations, searchTermHabs, filterTypeHabs);

  const resetAllStates = useCallback(() => {
    setSearchTermHabs("");
    setFilterTypeHabs("all");
    setIsUpdating(false);
    setIsInitialized(false);
    resetAlert();
    reset();
  }, [resetAlert, reset]);

  useEffect(() => {
    if (isOpen) {
      resetAllStates();
    }
  }, [isOpen, resetAllStates]);

  useEffect(() => {
    if (isOpen) {
      refetchRoles();
      refetchGroups();
    }
  }, [isOpen, refetchRoles, refetchGroups]);

  useEffect(() => {
    if (!isInitialized && initialHabsQuery.data?.status === 200 && initialHabsQuery.data.data) {
      setSelectedHabilitations(initialHabsQuery.data.data);
      setIsInitialized(true);
    }
  }, [initialHabsQuery.data, isInitialized, setSelectedHabilitations]);

  useEffect(() => {
    if (rolesError && isOpen) {
      const errorMessage = rolesError.message || "Erreur lors du chargement des rôles.";
      showAlert("error", errorMessage);
    }
  }, [rolesError, isOpen, showAlert]);

  useEffect(() => {
    if (groupsError && isOpen) {
      const errorMessage = groupsError.message || "Erreur lors du chargement des groupes d'habilitations.";
      showAlert("error", errorMessage);
    }
  }, [groupsError, isOpen, showAlert]);

  const handleUpdate = useCallback(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData?.userId;

    if (selectedRoles.length === 0) {
      showAlert("warning", "Veuillez sélectionner au moins un rôle.");
      return;
    }

    if (selectedHabCount === 0) {
      showAlert("warning", "Veuillez sélectionner au moins une habilitation.");
      return;
    }

    if (isUpdating) {
      return;
    }

    setIsUpdating(true);

    bulkMutation.mutate(
      {
        userIdLog: userId,
        habilitationIds: selectedHabilitations,
        roleIds: selectedRoles
      },
      {
        onSuccess: (data) => {
          setIsUpdating(false);
          if (data.status === 200) {
            const roleText = selectedRoleCount > 1 ? "rôles" : "rôle";
            const habText = selectedHabCount > 1 ? "habilitations" : "habilitation";
            
            showAlert(
              "success",
              `${selectedHabCount} ${habText} assignées à ${selectedRoleCount} ${roleText} avec succès.`
            );
          } else {
            showAlert("error", data.message || "Erreur lors de la mise à jour.");
          }
        },
        onError: (err: any) => {
          setIsUpdating(false);
          const errorMessage = 
            axios.isAxiosError(err) 
              ? err.response?.data?.message || err.message 
              : err.message || 
              "Une erreur est survenue lors de la mise à jour.";
          showAlert("error", errorMessage);
        }
      }
    );
  }, [selectedRoles, selectedHabilitations, selectedRoleCount, selectedHabCount, showAlert, isUpdating, bulkMutation]);

  const handleCancel = useCallback(() => {
    resetAllStates();
    onClose();
  }, [resetAllStates, onClose]);

  if (!isOpen) return null;

  const isLoading = rolesLoading || groupsLoading;
  const isDisabled = isLoading || isUpdating;

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>
            Modification des Habilitations ({initialRoleIds.length} rôle{initialRoleIds.length > 1 ? "s" : ""})
          </PopupTitle>
          <PopupClose onClick={handleCancel} disabled={isDisabled}>
            ×
          </PopupClose>
        </PopupHeader>
        
        <PopupContent>
          {alert.isOpen && (
            <Alert
              type={alert.type}
              message={alert.message}
              isOpen={alert.isOpen}
              onClose={handleAlertClose}
            />
          )}

          <SelectedUsersContainer>
            <SelectedUsersTitle>
              Rôles sélectionnés :
            </SelectedUsersTitle>
            <SelectedUsersList>
              {initialRoleIds.length > 0 ? (
                initialRoleIds.map((roleId) => {
                  const role = roles.find(r => r.roleId === roleId);
                  return (
                    <SelectedUserTag key={roleId}>
                      {role?.name || roleId}
                    </SelectedUserTag>
                  );
                })
              ) : (
                <NoDataMessage>Aucun rôle sélectionné</NoDataMessage>
              )}
            </SelectedUsersList>
          </SelectedUsersContainer>

          <SectionContainer>
            <SectionHeader>
              <SectionTitle>
                Habilitations disponibles {selectedHabCount > 0 && `(${selectedHabCount} sélectionné${selectedHabCount > 1 ? "s" : ""})`}
              </SectionTitle>
            </SectionHeader>

            {groupsLoading ? (
              <CenterContainer>
                <NoDataMessage>Chargement des groupes d'habilitations...</NoDataMessage>
              </CenterContainer>
            ) : filteredGroups.length > 0 ? (
              <ItemsList>
                {filteredGroups.map((group) => (
                  <React.Fragment key={group.groupId}>
                    <div style={{ padding: "8px 0", fontWeight: "bold", borderBottom: "1px solid var(--border-color)" }}>
                      {group.label}
                    </div>
                    {group.habilitations.map((hab: Habilitation) => {
                      const isSelected = selectedHabilitations.includes(hab.habilitationId);
                      return (
                        <RoleItem key={hab.habilitationId} selected={isSelected}>
                          <CheckboxContainer>
                            <RoleCheckbox
                              type="checkbox"
                              id={`hab-${hab.habilitationId}`}
                              checked={isSelected}
                              onChange={() => toggleHabilitation(hab.habilitationId)}
                              disabled={isDisabled}
                            />
                            <ItemContent>
                              <RoleLabel htmlFor={`hab-${hab.habilitationId}`}>
                                {hab.label || "Non spécifié"}
                              </RoleLabel>
                            </ItemContent>
                          </CheckboxContainer>
                        </RoleItem>
                      );
                    })}
                  </React.Fragment>
                ))}
              </ItemsList>
            ) : (
              <CenterContainer>
                <NoDataMessage>
                  {searchTermHabs 
                    ? "Aucune habilitation trouvée pour cette recherche." 
                    : "Aucune habilitation disponible."}
                </NoDataMessage>
              </CenterContainer>
            )}
          </SectionContainer>

          <PopupActionButtons>
            <ButtonCancel onClick={handleCancel} disabled={isDisabled}>
              <X size={16} />
              Annuler
            </ButtonCancel>
            <ButtonUpdate
              onClick={handleUpdate}
              disabled={isDisabled || selectedRoles.length === 0 || selectedHabCount === 0}
            >
              <Save size={16} />
              {isUpdating ? "Mise à jour..." : "Mettre à jour"}
              {selectedHabCount > 0 && !isUpdating && (
                <> ({selectedHabCount} hab{selectedHabCount > 1 ? "s" : ""})</>
              )}
            </ButtonUpdate>
          </PopupActionButtons>
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
};

export default UpdateRoleFormPopup;