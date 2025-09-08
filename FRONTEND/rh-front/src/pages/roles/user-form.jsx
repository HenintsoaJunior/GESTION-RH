"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, Save } from "lucide-react";
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupContent,
  PopupActions,
  ButtonPrimary,
  ButtonSecondary,
} from "styles/generaliser/popup-container";
import {
  CardsContainer,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardField,
  CardLabel,
  EmptyCardsState,
} from "styles/generaliser/card-container";
import { FormInputSearch, ActionButtons, ButtonUpdate, ButtonCancel, NoDataMessage } from "styles/generaliser/table-container";
import { ErrorMessage } from "styles/generaliser/form-container";
import AutoCompleteInput from "components/auto-complete-input";
import { fetchAllUsers, fetchUserRoles, searchUsers } from "services/users/users";
import { fetchAllRoles } from "services/users/roles";
import { createUserRoleBulk } from "services/users/user_role";
import Alert from "components/alert";
import Modal from "components/modal";

const UserListPopupComponent = ({ isOpen, onClose, selectedRole, onAssignUsers }) => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isLoading, setIsLoading] = useState({ users: false, roles: false, userRoles: false });
  const [error, setError] = useState({ isOpen: false, type: "", message: "" });
  const [alert, setAlert] = useState({ isOpen: false, type: "", message: "" });
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [fieldErrors, setFieldErrors] = useState({});
  const [autoCloseTimer, setAutoCloseTimer] = useState(null);

  // Fetch users and roles when the popup opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading((prev) => ({ ...prev, users: true, roles: true }));
      fetchAllUsers(
        (users) => {
          setUsers(users);
          setIsLoading((prev) => ({ ...prev, users: false }));
        },
        setIsLoading,
        (total) => {},
        (error) => {
          setError({
            isOpen: true,
            type: "error",
            message: error.message || "Une erreur est survenue lors du chargement des utilisateurs.",
          });
          setIsLoading((prev) => ({ ...prev, users: false }));
        }
      );
      fetchAllRoles(
        (roles) => {
          setRoles(roles);
          setFilteredRoles(roles);
          setIsLoading((prev) => ({ ...prev, roles: false }));
        },
        setIsLoading,
        (total) => {},
        (error) => {
          setAlert({
            isOpen: true,
            type: "error",
            message: error.message || "Une erreur est survenue lors du chargement des rôles.",
          });
          setIsLoading((prev) => ({ ...prev, roles: false }));
        }
      );
      setSelectedUser("");
      setSelectedUserId(null);
      setSelectedRoles(selectedRole ? [selectedRole.roleId] : []);
      setSearchTerm("");
      setFilterType("all");
      setFieldErrors({});
      setAlert({ isOpen: false, type: "", message: "" });
    }
  }, [isOpen, selectedRole]);

  // Cleanup timer when component unmounts or popup closes
  useEffect(() => {
    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [autoCloseTimer]);

  // Extract user names for autocomplete suggestions
  const userNames = users.map((user) => user.name || "N/A");

  // Handle autocomplete input change
  const handleUserChange = async (value) => {
    setSelectedUser(value);
    const selectedUserObj = users.find((user) => user.name === value);
    setSelectedUserId(selectedUserObj ? selectedUserObj.userId : null);

    // Set field errors for user selection
    setFieldErrors((prev) => ({
      ...prev,
      userId: selectedUserObj ? undefined : value ? ["Utilisateur non trouvé dans la liste."] : [""],
    }));

    // Fetch user's roles
    if (selectedUserObj) {
      await fetchUserRoles(
        selectedUserObj.userId,
        setIsLoading,
        (roleIds) => {
          // Combine user's roles with the selectedRole (if any), avoiding duplicates
          const combinedRoles = selectedRole
            ? [...new Set([...roleIds, selectedRole.roleId])]
            : roleIds;
          setSelectedRoles(combinedRoles);
        },
        (error) => {
          setAlert({
            isOpen: true,
            type: "error",
            message: error.message || "Erreur lors du chargement des rôles de l'utilisateur.",
          });
          setSelectedRoles(selectedRole ? [selectedRole.roleId] : []);
        }
      );
    } else {
      // If no user is selected, reset to selectedRole (if any)
      setSelectedRoles(selectedRole ? [selectedRole.roleId] : []);
    }
  };

  // Filter roles based on search term and filter type
  useEffect(() => {
    let filtered = roles.filter(
      (role) =>
        role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterType === "selected") {
      filtered = filtered.filter((role) => selectedRoles.includes(role.roleId));
    } else if (filterType === "unselected") {
      filtered = filtered.filter((role) => !selectedRoles.includes(role.roleId));
    }

    setFilteredRoles(filtered);
  }, [roles, searchTerm, filterType, selectedRoles]);

  // Handle checkbox change for role selection
  const handleCheckboxChange = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  // Select/deselect all roles
  const handleSelectAll = () => {
    if (selectedRoles.length === roles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(roles.map((role) => role.roleId));
    }
  };

  // Handle alert close with special logic for success messages
  const handleAlertClose = () => {
    const wasSuccess = alert.type === "success";
    setAlert({ isOpen: false, type: "", message: "" });
    
    // Fermer automatiquement le popup après une alerte de succès
    if (wasSuccess) {
      // Programmer la fermeture du popup après un délai
      const timer = setTimeout(() => {
        onClose();
      }, 500); // Délai de 500ms après la fermeture de l'alerte
      setAutoCloseTimer(timer);
    }
  };

  // Handle user and role assignment
  const handleAssign = async () => {
    if (!selectedUserId) {
      setFieldErrors((prev) => ({
        ...prev,
        userId: ["Veuillez sélectionner un utilisateur."],
      }));
      setAlert({
        isOpen: true,
        type: "warning",
        message: "Veuillez sélectionner un utilisateur avant d'assigner.",
      });
      return;
    }

    if (selectedRoles.length === 0) {
      setAlert({
        isOpen: true,
        type: "warning",
        message: "Veuillez sélectionner au moins un rôle.",
      });
      return;
    }

    try {
      setIsLoading((prev) => ({ ...prev, userRoles: true }));
      const userRoleData = {
        userId: selectedUserId,
        roleIds: selectedRoles,
      };

      await createUserRoleBulk(
        userRoleData,
        setIsLoading,
        (alertData) => {
          // Afficher l'alerte de succès
          setAlert({
            isOpen: true,
            type: "success",
            message: alertData.message || `Rôles assignés à ${selectedUser} avec succès.`,
          });
          
          // Réinitialiser les champs après succès
          setSelectedUser("");
          setSelectedUserId(null);
          setSelectedRoles(selectedRole ? [selectedRole.roleId] : []);
          setFieldErrors({});
        },
        (error) => {
          setAlert({
            isOpen: true,
            type: "error",
            message: error.message || "Une erreur est survenue lors de l'assignation des rôles.",
          });
        }
      );

      if (onAssignUsers) {
        await onAssignUsers([selectedUserId]);
      }
      
    } catch (error) {
      setAlert({
        isOpen: true,
        type: "error",
        message: error.message || "Une erreur est survenue lors de l'assignation des rôles.",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, userRoles: false }));
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
    
    setSelectedUser("");
    setSelectedUserId(null);
    setSelectedRoles(selectedRole ? [selectedRole.roleId] : []);
    setSearchTerm("");
    setFilterType("all");
    setFieldErrors({});
    setAlert({ isOpen: false, type: "", message: "" });
    onClose();
  };

  const selectedCount = selectedRoles.length;

  if (!isOpen) return null;

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>
            Assignation Utilisateur {selectedRole ? `pour ${selectedRole.name}` : ""}
          </PopupTitle>
          <PopupClose onClick={handleCancel} disabled={isLoading.users || isLoading.roles || isLoading.userRoles}>
            ×
          </PopupClose>
        </PopupHeader>

        <PopupContent>
          {/* Alerts */}
          {alert.isOpen && (
            <>
              {alert.type === "success" ? (
                <Alert
                  type="success"
                  message={alert.message}
                  isOpen={alert.isOpen}
                  onClose={handleAlertClose}
                />
              ) : (
                <Modal
                  type={alert.type}
                  message={alert.message}
                  isOpen={alert.isOpen}
                  onClose={handleAlertClose}
                  title="Notification"
                />
              )}
            </>
          )}

          {/* Autocomplete Input */}
          <div
            style={{
              background: "var(--bg-primary)",
              padding: "var(--spacing-md)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-sm)",
              marginBottom: "var(--spacing-lg)",
            }}
          >
            {isLoading.users ? (
              <NoDataMessage>Chargement des utilisateurs...</NoDataMessage>
            ) : (
              <>
                <AutoCompleteInput
                  value={selectedUser}
                  onChange={handleUserChange}
                  suggestions={userNames}
                  placeholder={
                    userNames.length === 0
                      ? "Aucun utilisateur disponible"
                      : "Saisir ou sélectionner un utilisateur..."
                  }
                  disabled={isLoading.users || isLoading.userRoles}
                  showAddOption={false}
                  fieldType="user"
                  fieldLabel="utilisateur"
                  className={error.isOpen || fieldErrors.userId ? "error" : "form-input"}
                />
                {error.isOpen && error.type === "error" && (
                  <ErrorMessage>{error.message}</ErrorMessage>
                )}
                {fieldErrors.userId && (
                  <ErrorMessage>
                    {Array.isArray(fieldErrors.userId) ? fieldErrors.userId.join(", ") : fieldErrors.userId}
                  </ErrorMessage>
                )}
              </>
            )}
            {/* Status Indicator */}
            <div
              style={{
                marginTop: "var(--spacing-xs)",
                fontSize: "var(--font-size-xs)",
                color: selectedUserId ? "var(--success-color)" : "var(--warning-color)",
                fontWeight: "500",
              }}
            >
            </div>
          </div>

          {/* Search and Filters for Roles */}
          <div
            style={{
              background: "var(--bg-primary)",
              padding: "var(--spacing-lg)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-sm)",
              marginBottom: "var(--spacing-lg)",
            }}
          >
            <div style={{ position: "relative", marginBottom: "var(--spacing-md)" }}>
              <FormInputSearch
                type="text"
                placeholder="Rechercher un rôle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "var(--spacing-xl)" }}
                disabled={isLoading.roles}
              />
            </div>
            <div style={{ display: "flex", gap: "var(--spacing-md)", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                <button
                  onClick={() => setFilterType("all")}
                  style={{
                    padding: "var(--spacing-xs) var(--spacing-md)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-md)",
                    background: filterType === "all" ? "var(--primary-color)" : "var(--bg-primary)",
                    color: filterType === "all" ? "#ffffff" : "var(--text-primary)",
                    cursor: "pointer",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "500",
                  }}
                  disabled={isLoading.roles}
                >
                  Toutes ({roles.length})
                </button>
                <button
                  onClick={() => setFilterType("selected")}
                  style={{
                    padding: "var(--spacing-xs) var(--spacing-md)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-md)",
                    background: filterType === "selected" ? "var(--primary-color)" : "var(--bg-primary)",
                    color: filterType === "selected" ? "#ffffff" : "var(--text-primary)",
                    cursor: "pointer",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "500",
                  }}
                  disabled={isLoading.roles}
                >
                  Sélectionnées ({selectedCount})
                </button>
                <button
                  onClick={() => setFilterType("unselected")}
                  style={{
                    padding: "var(--spacing-xs) var(--spacing-md)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-md)",
                    background: filterType === "unselected" ? "var(--primary-color)" : "var(--bg-primary)",
                    color: filterType === "unselected" ? "#ffffff" : "var(--text-primary)",
                    cursor: "pointer",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "500",
                  }}
                  disabled={isLoading.roles}
                >
                  Non sélectionnées ({roles.length - selectedCount})
                </button>
              </div>
              <button
                onClick={handleSelectAll}
                style={{
                  padding: "var(--spacing-xs) var(--spacing-md)",
                  border: "1px solid var(--primary-color)",
                  borderRadius: "var(--radius-md)",
                  background: "transparent",
                  color: "var(--primary-color)",
                  cursor: "pointer",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "500",
                }}
                disabled={isLoading.roles}
              >
                {selectedRoles.length === roles.length ? "Désélectionner tout" : "Sélectionner tout"}
              </button>
            </div>
          </div>

          {/* Role List */}
          <CardsContainer>
            {isLoading.roles ? (
              <EmptyCardsState>
                <NoDataMessage>Chargement...</NoDataMessage>
              </EmptyCardsState>
            ) : filteredRoles.length > 0 ? (
              filteredRoles.map((role) => {
                const isSelected = selectedRoles.includes(role.roleId);
                return (
                  <Card
                    key={role.roleId}
                    style={{
                      border: isSelected ? "2px solid var(--primary-color)" : "1px solid var(--border-light)",
                      cursor: "pointer",
                      opacity: 1,
                    }}
                    onClick={() => handleCheckboxChange(role.roleId)}
                  >
                    <CardHeader
                      style={{
                        background: isSelected ? "var(--primary-color)" : "var(--bg-secondary)",
                        color: isSelected ? "#ffffff" : "var(--text-primary)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            border: isSelected ? "2px solid #ffffff" : "2px solid var(--border-light)",
                            borderRadius: "var(--radius-sm)",
                            background: isSelected ? "#ffffff" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isSelected && <Check size={12} color="var(--primary-color)" />}
                        </div>
                        <CardTitle style={{ color: "inherit" }}>
                          {role.name || "Non spécifié"}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <CardField>
                        <CardLabel>Description</CardLabel>
                        <div
                          style={{
                            fontSize: "var(--font-size-sm)",
                            color: "var(--text-primary)",
                            lineHeight: "1.4",
                          }}
                        >
                          {role.description || "Aucune description disponible"}
                        </div>
                      </CardField>
                    </CardBody>
                  </Card>
                );
              })
            ) : (
              <EmptyCardsState>
                <NoDataMessage>
                  {searchTerm ? "Aucun rôle trouvé pour cette recherche." : "Aucun rôle trouvé."}
                </NoDataMessage>
              </EmptyCardsState>
            )}
          </CardsContainer>

          {/* Actions */}
          {roles.length > 0 && (
            <ActionButtons
              style={{
                marginTop: "var(--spacing-lg)",
                justifyContent: "flex-end",
              }}
            >
              <ButtonCancel onClick={handleCancel}>
                <X size={16} />
                Annuler
              </ButtonCancel>
              <ButtonUpdate
                onClick={handleAssign}
                disabled={isLoading.users || isLoading.roles || isLoading.userRoles || !selectedUserId || selectedRoles.length === 0}
                style={{
                  opacity: (selectedUserId && selectedRoles.length > 0 && !isLoading.users && !isLoading.roles && !isLoading.userRoles) ? 1 : 0.6,
                  cursor: (selectedUserId && selectedRoles.length > 0 && !isLoading.users && !isLoading.roles && !isLoading.userRoles) ? "pointer" : "not-allowed",
                }}
              >
                <Save size={16} />
                Assigner{" "}
                {selectedCount > 0 &&
                  `(${selectedCount} rôle${selectedCount !== 1 ? "s" : ""} sélectionné${selectedCount !== 1 ? "s" : ""})`}
              </ButtonUpdate>
            </ActionButtons>
          )}
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
};

export default UserListPopupComponent;
