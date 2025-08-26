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
import { fetchAllRoles, createRole, updateRole } from "services/users/roles";
import { formatDate } from "utils/dateConverter";

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({ roles: false });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [role, setRole] = useState({ name: "", description: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
    
    // Supprimer les erreurs pour le champ modifié
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (roleData) => {
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      if (roleData.roleId) {
        // Mise à jour d'un rôle existant
        await updateRole(
          roleData,
          setIsLoading,
          (successAlert) => {
            setAlert({
              isOpen: true,
              type: "success", // Use Alert for success
              message: successAlert.message || "Rôle mis à jour avec succès",
            });
            setRole({ name: "", description: "" });
            setIsPopupOpen(false);
            fetchAllRoles(setRoles, setIsLoading, setTotalEntries, handleError);
          },
          (error) => {
            setFieldErrors(error.errors || { name: ["Erreur lors de la mise à jour du rôle"] });
            setAlert({
              isOpen: true,
              type: "error", // Use Modal for error
              message: error.message || "Erreur lors de la mise à jour du rôle",
            });
          }
        );
      } else {
        // Création d'un nouveau rôle
        await createRole(
          roleData,
          setIsLoading,
          (successAlert) => {
            setAlert({
              isOpen: true,
              type: "success", // Use Alert for success
              message: successAlert.message || "Rôle créé avec succès",
            });
            setRole({ name: "", description: "" });
            setIsPopupOpen(false);
            fetchAllRoles(setRoles, setIsLoading, setTotalEntries, handleError);
          },
          (error) => {
            setFieldErrors(error.errors || { name: ["Erreur lors de la création du rôle"] });
            setAlert({
              isOpen: true,
              type: "error", // Use Modal for error
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

  // Fonctions d'actions
  const handleEdit = (roleToEdit) => {
    setRole({
      roleId: roleToEdit.roleId,
      name: roleToEdit.name,
      description: roleToEdit.description || "",
    });
    setFieldErrors({});
    setIsPopupOpen(true);
  };

  const handleAssignUsers = (role) => {
    console.log("Assigner des utilisateurs au rôle:", role.roleId);
    // TODO: Implémenter la navigation ou le modal d'assignation d'utilisateurs
  };

  const handleAssignHabilitations = (role) => {
    navigate("/habilitation/list", {
      state: {
        roleId: role.roleId,
        roleName: role.name,
        initialHabilitations: role.roleHabilitations || [],
      },
    });
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setRole({ name: "", description: "" });
    setFieldErrors({});
  };

  const handleAddNew = () => {
    setRole({ name: "", description: "" });
    setFieldErrors({});
    setIsPopupOpen(true);
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

      <TableHeader>
        <TableTitle>Liste des Rôles ({totalEntries})</TableTitle>
        <div>
          <ButtonAdd onClick={handleAddNew}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Nouveau
          </ButtonAdd>
        </div>
      </TableHeader>

      <CardsContainer>
        {isLoading.roles ? (
          <LoadingCardsState>
            <Loading>Chargement...</Loading>
          </LoadingCardsState>
        ) : roles.length > 0 ? (
          roles.map((role) => (
            <Card key={role.roleId}>
              <CardHeader>
                <CardTitle>{role.name || "Non spécifié"}</CardTitle>
              </CardHeader>
              
              <CardBody>
                <CardField>
                  <CardLabel>Description</CardLabel>
                  <CardValue>{role.description || "Non spécifié"}</CardValue>
                </CardField>
                
                <CardField>
                  <CardLabel>Date de création</CardLabel>
                  <CardValue>{formatDate(role.createdAt) || "Non spécifié"}</CardValue>
                </CardField>
                
              </CardBody>
              
              <CardFooter>
                <CardActionButton 
                  className="edit" 
                  onClick={() => handleEdit(role)}
                  disabled={isSubmitting}
                >
                  Modifier
                </CardActionButton>
                <CardActionButton 
                  className="assign" 
                  onClick={() => handleAssignHabilitations(role)}
                >
                  Assignation Habilitation
                </CardActionButton>
                <CardActionButton 
                  className="assign-user" 
                  onClick={() => handleAssignUsers(role)}
                >
                  Assignation Utilisateur
                </CardActionButton>
              </CardFooter>
            </Card>
          ))
        ) : (
          <EmptyCardsState>
            <NoDataMessage>Aucun rôle trouvé.</NoDataMessage>
          </EmptyCardsState>
        )}
      </CardsContainer>

      <RolePopupComponent
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onSubmit={handleSubmit}
        role={role}
        isSubmitting={isSubmitting}
        fieldErrors={fieldErrors}
        handleInputChange={handleInputChange}
        buttonText={role.roleId ? "Modifier" : "Ajouter"}
      />
    </DashboardContainer>
  );
};

export default RoleList;