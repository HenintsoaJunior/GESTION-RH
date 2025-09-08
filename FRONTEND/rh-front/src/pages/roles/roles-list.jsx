"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DashboardContainer,
  TableHeader,
  TableTitle,
  ButtonAdd,
  Loading,
  NoDataMessage,
  ButtonCancel,
  ButtonConfirm,
  ModalActions,
} from "styles/generaliser/table-container";
import {
  CardsContainer,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardField,
  CardLabel,
  CardValue,
  CardFooter,
  CardActionButton,
  EmptyCardsState,
  LoadingCardsState,
} from "styles/generaliser/card-container";
import Modal from "components/modal";
import Alert from "components/alert";
import RolePopupComponent from "./role-form";
import UserListPopupComponent from "./user-form";
import { fetchAllRoles, createRole, updateRole, deleteRole } from "services/users/roles";
import { formatDate } from "utils/dateConverter";

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({ roles: false });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [isRolePopupOpen, setIsRolePopupOpen] = useState(false);
  const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [role, setRole] = useState({ name: "", description: "", habilitations: [], habilitationIds: [] });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const navigate = useNavigate();

  // Récupérer userId depuis localStorage
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUserId(userData?.userId || null);
  }, []);

  // Gestion des erreurs
  const handleError = useCallback((error) => {
    setAlert({
      isOpen: true,
      type: "error",
      message: error.message || "Une erreur est survenue",
    });
    setIsLoading((prev) => ({ ...prev, roles: false }));
    setIsSubmitting(false);
  }, []);

  // Charger les rôles
  useEffect(() => {
    fetchAllRoles(setRoles, setIsLoading, setTotalEntries, handleError);
  }, [handleError]);

  // Gestion des changements dans les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRole((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (roleData) => {
    if (!userId) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Utilisateur non authentifié. Veuillez vous connecter.",
      });
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      if (roleData.roleId) {
        await updateRole(
          userId,
          roleData,
          setIsLoading,
          (successAlert) => {
            setAlert({
              isOpen: true,
              type: "success",
              message: successAlert.message || "Rôle mis à jour avec succès",
            });
            resetRoleForm();
            setIsRolePopupOpen(false);
            fetchAllRoles(setRoles, setIsLoading, setTotalEntries, handleError);
          },
          (error) => {
            setFieldErrors(error.errors || { name: ["Erreur lors de la mise à jour du rôle"] });
            setAlert({
              isOpen: true,
              type: "error",
              message: error.message || "Erreur lors de la mise à jour du rôle",
            });
          }
        );
      } else {
        await createRole(
          userId,
          roleData,
          setIsLoading,
          (successAlert) => {
            setAlert({
              isOpen: true,
              type: "success",
              message: successAlert.message || "Rôle créé avec succès",
            });
            resetRoleForm();
            setIsRolePopupOpen(false);
            fetchAllRoles(setRoles, setIsLoading, setTotalEntries, handleError);
          },
          (error) => {
            setFieldErrors(error.errors || { name: ["Erreur lors de la création du rôle"] });
            setAlert({
              isOpen: true,
              type: "error",
              message: error.message || "Erreur lors de la création du rôle",
            });
          }
        );
      }
    } catch (error) {
      console.error("Erreur dans handleSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion de la suppression d'un rôle
  const handleDelete = async () => {
    if (!userId) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Utilisateur non authentifié. Veuillez vous connecter.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteRole(
        roleToDelete,
        userId,
        setIsLoading,
        (successAlert) => {
          setAlert({
            isOpen: true,
            type: "success",
            message: successAlert.message || "Rôle supprimé avec succès",
          });
          fetchAllRoles(setRoles, setIsLoading, setTotalEntries, handleError);
        },
        (error) => {
          setAlert({
            isOpen: true,
            type: "error",
            message: error.message || "Erreur lors de la suppression du rôle",
          });
        }
      );
    } catch (error) {
      console.error("Erreur dans handleDelete:", error);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setRoleToDelete(null);
    }
  };

  // Afficher la modale de confirmation de suppression
  const handleShowDeleteModal = (roleId) => {
    setRoleToDelete(roleId);
    setShowDeleteModal(true);
  };

  // Fonction pour réinitialiser le formulaire
  const resetRoleForm = () => {
    setRole({ 
      name: "", 
      description: "", 
      habilitations: [], 
      habilitationIds: [] 
    });
  };

  // Fonctions d'actions
  const handleEdit = (roleToEdit) => {
    console.log("Modification du rôle:", roleToEdit);
    
    // Extraire les habilitations du rôle
    const existingHabilitations = roleToEdit.roleHabilitations || [];
    const habilitationIds = existingHabilitations.map(rh => rh.habilitation?.habilitationId || rh.habilitationId).filter(Boolean);
    
    setRole({
      roleId: roleToEdit.roleId,
      name: roleToEdit.name,
      description: roleToEdit.description || "",
      habilitations: existingHabilitations.map(rh => rh.habilitation || rh),
      habilitationIds: habilitationIds,
    });
    
    setFieldErrors({});
    setIsRolePopupOpen(true);
  };

  const handleAssignUsers = (role) => {
    console.log("Assigner des utilisateurs au rôle:", role?.roleId || "Aucun rôle sélectionné");
    setSelectedRole(role);
    setIsUserPopupOpen(true);
  };

  const handleCloseRolePopup = () => {
    setIsRolePopupOpen(false);
    resetRoleForm();
    setFieldErrors({});
  };

  const handleCloseUserPopup = () => {
    setIsUserPopupOpen(false);
    setSelectedRole(null);
  };

  const handleAddNew = () => {
    resetRoleForm();
    setFieldErrors({});
    setIsRolePopupOpen(true);
  };

  // Compter les habilitations pour chaque rôle
  const getHabilitationCount = (role) => {
    return role.roleHabilitations?.length || 0;
  };

  return (
    <DashboardContainer>
      {alert.type === "success" ? (
        <Alert
          type={alert.type}
          message={alert.message}
          isOpen={alert.isOpen}
          onClose={() => setAlert({ ...alert, isOpen: false })}
        />
      ) : (
        <Modal
          type={alert.type}
          message={alert.message}
          isOpen={alert.isOpen}
          onClose={() => setAlert({ ...alert, isOpen: false })}
          title="Notification"
        />
      )}

      <Modal
        type="warning"
        message="Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action est irréversible."
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
      >
        <ModalActions>
          <ButtonCancel onClick={() => setShowDeleteModal(false)}>Annuler</ButtonCancel>
          <ButtonConfirm onClick={handleDelete}>Confirmer</ButtonConfirm>
        </ModalActions>
      </Modal>

      <TableHeader>
        <TableTitle>Liste des Rôles ({totalEntries})</TableTitle>
        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
          <ButtonAdd
            className="assign-user"
            onClick={() => handleAssignUsers(null)}
          >
            Assignation Utilisateur
          </ButtonAdd>
          <ButtonAdd onClick={handleAddNew}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Nouveau
          </ButtonAdd>
        </div>
      </TableHeader>

      {/* Container avec espacement réduit */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "var(--spacing-xs)", // Espacement réduit entre les cartes
        padding: "0"
      }}>
        {isLoading.roles ? (
          <div style={{ 
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "center",
            padding: "var(--spacing-xl)"
          }}>
            <Loading>Chargement...</Loading>
          </div>
        ) : roles.length > 0 ? (
          roles.map((role) => (
            <Card 
              key={role.roleId}
              style={{
                margin: "0", // Supprime les marges par défaut
                height: "fit-content" // Ajuste la hauteur au contenu
              }}
            >
              <CardHeader>
                <CardTitle>{role.name || "Non spécifié"}</CardTitle>
              </CardHeader>
              <CardBody style={{ 
                padding: "var(--spacing-xs)", // Padding réduit pour compacter
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-xs)" // Espacement réduit entre les champs
              }}>
                <CardField style={{ margin: "0" }}>
                  <CardLabel>Description</CardLabel>
                  <CardValue>{role.description || "Non spécifié"}</CardValue>
                </CardField>
                <CardField style={{ margin: "0" }}>
                  <CardLabel>Habilitations</CardLabel>
                  <CardValue>
                    {getHabilitationCount(role)} habilitation{getHabilitationCount(role) > 1 ? 's' : ''} associée{getHabilitationCount(role) > 1 ? 's' : ''}
                  </CardValue>
                </CardField>
                <CardField style={{ margin: "0" }}>
                  <CardLabel>Date de création</CardLabel>
                  <CardValue>{formatDate(role.createdAt) || "Non spécifié"}</CardValue>
                </CardField>
              </CardBody>
              <CardFooter style={{ 
                padding: "var(--spacing-xs)", // Padding réduit
                gap: "var(--spacing-xs)" // Espacement réduit entre les boutons
              }}>
                <CardActionButton
                  className="edit"
                  onClick={() => handleEdit(role)}
                  disabled={isSubmitting}
                >
                  Modifier
                </CardActionButton>
                
                <CardActionButton
                  className="delete"
                  onClick={() => handleShowDeleteModal(role.roleId)}
                  disabled={isSubmitting}
                >
                  Supprimer
                </CardActionButton>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div style={{ 
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "center",
            padding: "var(--spacing-xl)"
          }}>
            <NoDataMessage>Aucun rôle trouvé.</NoDataMessage>
          </div>
        )}
      </div>

      <RolePopupComponent
        isOpen={isRolePopupOpen}
        onClose={handleCloseRolePopup}
        onSubmit={handleSubmit}
        role={role}
        isSubmitting={isSubmitting}
        fieldErrors={fieldErrors}
        handleInputChange={handleInputChange}
        buttonText={role.roleId ? "Modifier" : "Ajouter"}
      />

      <UserListPopupComponent
        isOpen={isUserPopupOpen}
        onClose={handleCloseUserPopup}
      />
    </DashboardContainer>
  );
};

export default RoleList;