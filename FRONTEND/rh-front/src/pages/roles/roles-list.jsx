"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Users, Zap, Trash2, Edit } from "lucide-react"; // Ajout d'icônes pour les actions
import { useNavigate } from "react-router-dom";
import {
  DashboardContainer,
  TableHeader,
  TableTitle,
  ButtonAdd,
  Loading,
  NoDataMessage,
} from "styles/generaliser/table-container";
import Modal from "components/modal";
import Alert from "components/alert";
import RolePopupComponent from "./role-form";
import UserListPopupComponent from "./user-form";
import { fetchAllRoles, createRole, updateRole, deleteRole } from "services/users/roles";
import { formatDate } from "utils/dateConverter";

// --------------------------------------------------------------------------------
// NOUVEAU COMPOSANT : ROLE INFO CARD (Carte d'Information de Rôle)
// --------------------------------------------------------------------------------

// Définition des couleurs personnalisées
const COLORS = {
    primary: "#69b42e", // Votre couleur primaire
    primaryHover: "#5a9625",
    danger: "#dc3545",
    dangerLight: "#f8d7da",
    textPrimary: "#333",
    textSecondary: "#666",
    background: "#ffffff",
    border: "#e0e0e0",
};

const RoleCardStyle = {
  display: "grid",
  gridTemplateColumns: "100px 1fr auto", // Indicateur | Détails | Actions
  alignItems: "center",
  gap: "16px",
  backgroundColor: COLORS.background,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  padding: "12px 16px",
  minHeight: "80px",
};

const IndicatorBlockStyle = (isCritical) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    borderRadius: "6px",
    backgroundColor: isCritical ? COLORS.dangerLight : "#ebf5e3", // Vert très clair
    color: isCritical ? COLORS.danger : COLORS.primary,
    fontWeight: "bold",
    height: "100%",
});

const DetailBlockTitleStyle = {
    fontSize: "16px",
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: "4px",
};

const DetailBlockTextStyle = {
    fontSize: "12px",
    color: COLORS.textSecondary,
    lineHeight: "1.4",
};

const ActionsBlockStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    paddingLeft: "16px",
    borderLeft: `1px solid ${COLORS.border}`,
};

const CardActionButtonStyle = (isPrimary) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s",
    border: isPrimary ? `1px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
    backgroundColor: isPrimary ? COLORS.primary : COLORS.background,
    color: isPrimary ? COLORS.background : COLORS.textPrimary,
    "&:hover": {
        backgroundColor: isPrimary ? COLORS.primaryHover : COLORS.border,
    },
});

const CardActionButtonDangerStyle = {
    ...CardActionButtonStyle(false),
    color: COLORS.danger,
    border: `1px solid ${COLORS.danger}`,
    "&:hover": {
        backgroundColor: COLORS.dangerLight,
    },
};


const RoleInfoCard = ({ role, onEdit, onDelete, onAssignUsers, getHabilitationCount, isSubmitting }) => {
    const isCritical = role.name?.toLowerCase().includes("admin") || role.name?.toLowerCase().includes("root");
    const habilitationCount = getHabilitationCount(role);
    
    // Style du bouton d'assignation
    const AssignButtonStyle = {
        ...CardActionButtonStyle(true),
        backgroundColor: COLORS.primary,
        color: COLORS.background,
        border: `1px solid ${COLORS.primary}`,
        // Note: Les pseudo-classes :hover ne sont pas supportées directement en style inline React
    };

    return (
        <div style={RoleCardStyle}>
            {/* BLOC INDICATEUR */}
            <div style={IndicatorBlockStyle(isCritical)}>
                <Zap size={20} />
                <div style={{ fontSize: "20px", marginTop: "4px" }}>
                    {habilitationCount}
                </div>
                <div style={{ fontSize: "10px", fontWeight: "normal", textAlign: "center" }}>
                    Habilitation{habilitationCount > 1 ? 's' : ''}
                </div>
            </div>

            {/* BLOC DÉTAILS */}
            <div>
                <div style={DetailBlockTitleStyle}>
                    {role.name || "Rôle sans nom"}
                </div>
                <div style={DetailBlockTextStyle}>
                    **Description:** {role.description ? role.description.substring(0, 80) + (role.description.length > 80 ? '...' : '') : "Non spécifiée"}
                </div>
                <div style={DetailBlockTextStyle}>
                    **Création:** {formatDate(role.createdAt) || "Non spécifié"}
                </div>
            </div>
            
            {/* BLOC ACTIONS */}
            <div style={ActionsBlockStyle}>
                <button 
                    onClick={() => onAssignUsers(role)}
                    disabled={isSubmitting}
                    style={AssignButtonStyle}
                    title="Gérer l'assignation des utilisateurs à ce rôle"
                >
                    <Users size={14} style={{ marginRight: "4px" }}/> Assigner
                </button>
                <button
                    onClick={() => onEdit(role)}
                    disabled={isSubmitting}
                    style={CardActionButtonStyle(false)}
                >
                    <Edit size={14} style={{ marginRight: "4px" }}/> Modifier
                </button>
                <button
                    onClick={() => onDelete(role.roleId)}
                    disabled={isSubmitting}
                    style={CardActionButtonDangerStyle}
                >
                    <Trash2 size={14} style={{ marginRight: "4px" }}/> Supprimer
                </button>
            </div>
        </div>
    );
};


// --------------------------------------------------------------------------------
// COMPOSANT PRINCIPAL : ROLE LIST
// --------------------------------------------------------------------------------

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
  const handleDelete = async (roleId) => {
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
        roleId,
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
    }
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
      {/* Alertes et Modals */}
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

      {/* Entête du tableau de bord */}
      <TableHeader>
        <TableTitle>Liste des Rôles ({totalEntries})</TableTitle>
        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
          <ButtonAdd
            className="assign-user"
            onClick={() => handleAssignUsers(null)}
          >
            Assignation Utilisateur
          </ButtonAdd>
          <ButtonAdd onClick={handleAddNew} style={{ 
            backgroundColor: COLORS.primary, 
            borderColor: COLORS.primary,
            color: COLORS.background
          }}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Nouveau
          </ButtonAdd>
        </div>
      </TableHeader>

      {/* AFFICHAGE DES CARTES D'INFORMATION */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px", // Espacement vertical entre les cartes
          padding: "var(--spacing-md) 0 0 0",
        }}
      >
        {isLoading.roles ? (
          <div style={{ width: "100%", textAlign: "center", padding: "var(--spacing-xl)" }}>
            <Loading>Chargement des rôles...</Loading>
          </div>
        ) : roles.length > 0 ? (
          roles.map((role) => (
            <RoleInfoCard
              key={role.roleId}
              role={role}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAssignUsers={handleAssignUsers}
              getHabilitationCount={getHabilitationCount}
              isSubmitting={isSubmitting}
            />
          ))
        ) : (
          <div style={{ width: "100%", textAlign: "center", padding: "var(--spacing-xl)" }}>
            <NoDataMessage>Aucun rôle trouvé.</NoDataMessage>
          </div>
        )}
      </div>

      {/* Popups (inchangés) */}
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
        selectedRole={selectedRole}
      />
    </DashboardContainer>
  );
};

export default RoleList;