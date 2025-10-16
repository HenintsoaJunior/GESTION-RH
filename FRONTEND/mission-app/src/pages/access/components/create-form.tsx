import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { X, Save } from "lucide-react";
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupContent,
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
import { 
  ButtonUpdate, 
  ButtonCancel, 
  NoDataMessage, 
  FormTableSearch,
  FormRow,
  FormFieldCell,
  FormLabelSearch,
  FormInputSearch 
} from "@/styles/table-styles";
import { useHabilitationsGroups, useCreateRoleWithHabilitations } from "@/api/access/services";
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

interface CreateRoleProps {
  isOpen: boolean;
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

const CreateRolePopup: React.FC<CreateRoleProps> = ({ 
  isOpen, 
  onClose
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedHabilitations, setSelectedHabilitations] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const { 
    data: groupsResponse, 
    isLoading: groupsLoading, 
    error: groupsError, 
    refetch: refetchGroups 
  } = useHabilitationsGroups();

  const createMutation = useCreateRoleWithHabilitations();

  const allGroups = useMemo(() => groupsResponse?.data || [], [groupsResponse?.data]) as HabilitationGroup[];

  const { alert, showAlert, handleClose: handleAlertClose, resetAlert } = useAlert(onClose);

  const filteredGroups = useMemo(() => {
    return allGroups.filter(group => group.habilitations.length > 0);
  }, [allGroups]);

  const selectedHabCount = useMemo(() => selectedHabilitations.length, [selectedHabilitations]);

  const toggleHabilitation = useCallback((habId: string) => {
    setSelectedHabilitations((prev) =>
      prev.includes(habId) 
        ? prev.filter((id) => id !== habId) 
        : [...prev, habId]
    );
  }, []);

  const resetAllStates = useCallback(() => {
    setName("");
    setDescription("");
    setSelectedHabilitations([]);
    setIsCreating(false);
    resetAlert();
  }, [resetAlert]);

  useEffect(() => {
    if (isOpen) {
      resetAllStates();
    }
  }, [isOpen, resetAllStates]);

  useEffect(() => {
    if (isOpen) {
      refetchGroups();
    }
  }, [isOpen, refetchGroups]);

  useEffect(() => {
    if (groupsError && isOpen) {
      const errorMessage = groupsError.message || "Erreur lors du chargement des groupes d'habilitations.";
      showAlert("error", errorMessage);
    }
  }, [groupsError, isOpen, showAlert]);

  const handleCreate = useCallback(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData?.userId;

    if (!name.trim()) {
      showAlert("warning", "Veuillez saisir un nom pour le rôle.");
      return;
    }

    if (!description.trim()) {
      showAlert("warning", "Veuillez saisir une description pour le rôle.");
      return;
    }

    if (selectedHabCount === 0) {
      showAlert("warning", "Veuillez sélectionner au moins une habilitation.");
      return;
    }

    if (isCreating) {
      return;
    }

    setIsCreating(true);

    createMutation.mutate(
      {
        userIdLog: userId,
        name: name.trim(),
        description: description.trim(),
        habilitationIds: selectedHabilitations
      },
      {
        onSuccess: (data) => {
          setIsCreating(false);
          if (data.status === 200) {
            const habText = selectedHabCount > 1 ? "habilitations" : "habilitation";
            showAlert(
              "success",
              `Rôle "${name}" créé avec succès avec ${selectedHabCount} ${habText}.`
            );
          } else {
            showAlert("error", data.message || "Erreur lors de la création du rôle.");
          }
        },
        onError: (err: any) => {
          setIsCreating(false);
          const errorMessage = 
            axios.isAxiosError(err) 
              ? err.response?.data?.message || err.message 
              : err.message || 
              "Une erreur est survenue lors de la création du rôle.";
          showAlert("error", errorMessage);
        }
      }
    );
  }, [name, description, selectedHabilitations, selectedHabCount, showAlert, isCreating, createMutation]);

  const handleCancel = useCallback(() => {
    resetAllStates();
    onClose();
  }, [resetAllStates, onClose]);

  if (!isOpen) return null;

  const isLoading = groupsLoading;
  const isDisabled = isLoading || isCreating;

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>Création d'un nouveau rôle</PopupTitle>
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

          <SectionContainer>
            <SectionHeader>
              <SectionTitle>Informations du rôle</SectionTitle>
            </SectionHeader>
            <div style={{ padding: "1rem" }}>
              <FormTableSearch>
                <tbody>
                  <FormRow>
                    <FormFieldCell style={{ width: "50%" }}>
                      <FormLabelSearch>Nom du rôle</FormLabelSearch>
                      <FormInputSearch
                        type="text"
                        value={name || ""}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isDisabled}
                        placeholder="Saisir le nom du rôle..."
                      />
                    </FormFieldCell>

                    <FormFieldCell style={{ width: "50%" }}>
                      <FormLabelSearch>Description</FormLabelSearch>
                      <FormInputSearch
                        type="text"
                        value={description || ""}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isDisabled}
                        placeholder="Saisir la description du rôle..."
                      />
                    </FormFieldCell>
                  </FormRow>
                </tbody>
              </FormTableSearch>
            </div>
          </SectionContainer>

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
              <div style={{ padding: "1rem" }}>
                <ItemsList>
                  {filteredGroups.map((group) => (
                    <React.Fragment key={group.groupId}>
                      <div style={{ padding: "8px 1rem", fontWeight: "bold", borderBottom: "1px solid var(--border-color)" }}>
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
              </div>
            ) : (
              <CenterContainer>
                <NoDataMessage>
                  Aucune habilitation disponible.
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
              onClick={handleCreate}
              disabled={isDisabled || !name.trim() || !description.trim() || selectedHabCount === 0}
            >
              <Save size={16} />
              {isCreating ? "Création..." : "Créer"}
              {selectedHabCount > 0 && !isCreating && (
                <> ({selectedHabCount} hab{selectedHabCount > 1 ? "s" : ""})</>
              )}
            </ButtonUpdate>
          </PopupActionButtons>
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
};

export default CreateRolePopup;