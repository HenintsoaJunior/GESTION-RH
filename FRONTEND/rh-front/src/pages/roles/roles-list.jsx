"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  DashboardContainer,
  TableHeader,
  TableTitle,
  TableContainer,
  DataTable,
  TableHeadCell,
  TableRow,
  TableCell,
  ButtonAdd,
  ButtonUpdate,
  ButtonCancel,
  ActionButtons,
  Loading,
  NoDataMessage,
} from "styles/generaliser/table-container";
import Modal from "components/modal";
import { fetchAllRoles, deleteRole } from "services/users/roles";
import { formatDate } from "utils/dateConverter";

const RoleList = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({ roles: false, delete: false });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Gestion des erreurs
  const handleError = useCallback((error) => {
    setAlert({
      isOpen: true,
      type: "error",
      message: error.message || "Une erreur est survenue",
    });
    setIsLoading((prev) => ({ ...prev, delete: false }));
  }, []);

  // Charger les rôles
  useEffect(() => {
    fetchAllRoles(setRoles, setIsLoading, setTotalEntries, handleError);
  }, [handleError]);

  // Supprimer un rôle
  const handleDeleteRole = async (roleId) => {
    try {
      setIsLoading((prev) => ({ ...prev, delete: true }));
      await deleteRole(
        roleId,
        setIsLoading,
        (successAlert) => {
          setAlert({
            isOpen: true,
            type: "success",
            message: successAlert.message || "Rôle supprimé avec succès !",
          });
          fetchAllRoles(setRoles, setIsLoading, setTotalEntries, handleError);
        },
        handleError
      );
    } catch (error) {
      // Erreur gérée dans handleError
    }
  };

  // Afficher la modale de confirmation de suppression
  const handleShowDeleteModal = (roleId) => {
    setRoleToDelete(roleId);
    setShowDeleteModal(true);
  };

  // Confirmer la suppression
  const handleConfirmDelete = () => {
    if (roleToDelete) {
      handleDeleteRole(roleToDelete);
    }
    setShowDeleteModal(false);
    setRoleToDelete(null);
  };

  return (
    <DashboardContainer>
      <Modal
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title="Notification"
      />

      <Modal
        type="warning"
        message="Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action est irréversible."
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
      >
        <ActionButtons>
          <ButtonCancel onClick={() => setShowDeleteModal(false)}>Annuler</ButtonCancel>
          <ButtonUpdate onClick={handleConfirmDelete}>Confirmer</ButtonUpdate>
        </ActionButtons>
      </Modal>

      <TableHeader>
        <TableTitle>Liste des Rôles ({totalEntries})</TableTitle>
        <div>
          <ButtonAdd onClick={() => navigate("/role/form")}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Nouveau
          </ButtonAdd>
        </div>
      </TableHeader>

      <TableContainer>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Nom du Rôle</TableHeadCell>
              <TableHeadCell>Description</TableHeadCell>
              <TableHeadCell>Date de création</TableHeadCell>
              <TableHeadCell>Action</TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {isLoading.roles ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Loading>Chargement...</Loading>
                </TableCell>
              </TableRow>
            ) : roles.length > 0 ? (
              roles.map((role) => (
                <TableRow key={role.roleId}>
                  <TableCell>{role.name || "Non spécifié"}</TableCell>
                  <TableCell>{role.description || "Non spécifié"}</TableCell>
                  <TableCell>{formatDate(role.createdAt) || "Non spécifié"}</TableCell>
                  <TableCell>
                    <ActionButtons>
                      <ButtonUpdate
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/role/form/${role.roleId}`);
                        }}
                      >
                        <Edit size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Modifier
                      </ButtonUpdate>
                      <ButtonCancel
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowDeleteModal(role.roleId);
                        }}
                      >
                        <Trash2 size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Supprimer
                      </ButtonCancel>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  <NoDataMessage>Aucun rôle trouvé.</NoDataMessage>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </DataTable>
      </TableContainer>
    </DashboardContainer>
  );
};

export default RoleList;