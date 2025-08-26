"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Check, X, Save, Plus } from "lucide-react";
import {
  DashboardContainer,
  TableHeader,
  TableTitle,
  Loading,
  NoDataMessage,
  FormInputSearch,
  ActionButtons,
  ButtonUpdate,
  ButtonCancel,
} from "styles/generaliser/table-container";
import {
  CardsContainer,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardField,
  CardLabel,
  EmptyCardsState,
  LoadingCardsState,
} from "styles/generaliser/card-container";
import Modal from "components/modal";
import Alert from "components/alert"; // Import the Alert component
import { fetchAllHabilitations, createHabilitation } from "services/users/habilitation";
import { createRoleHabilitation } from "services/users/role_habilitation";

const HabilitationAssign = () => {
  const location = useLocation();
  const { roleId, roleName, initialHabilitations = [] } = location.state || {};
  const [habilitations, setHabilitations] = useState([]);
  const [filteredHabilitations, setFilteredHabilitations] = useState([]);
  const [selectedHabilitations, setSelectedHabilitations] = useState(
    initialHabilitations.map((h) => h.habilitationId)
  );
  const [isLoading, setIsLoading] = useState({ habilitations: false });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [totalEntries, setTotalEntries] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, selected, unselected
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newHabilitation, setNewHabilitation] = useState({ label: "", description: "" });

  // Gestion des erreurs
  const handleError = useCallback((error) => {
    setAlert({
      isOpen: true,
      type: "error",
      message: error.message || "Une erreur est survenue",
    });
  }, []);

  // Gestion du succès
  const handleSuccess = useCallback((alertData) => {
    setAlert({
      isOpen: true,
      type: "success",
      message: alertData.message,
    });
  }, []);

  // Charger les habilitations
  useEffect(() => {
    fetchAllHabilitations(setHabilitations, setIsLoading, setTotalEntries, handleError);
  }, [handleError]);

  // Initialiser les habilitations sélectionnées
  useEffect(() => {
    setSelectedHabilitations(initialHabilitations.map((h) => h.habilitationId));
  }, [initialHabilitations]);

  // Filtrer les habilitations selon la recherche et le filtre
  useEffect(() => {
    let filtered = habilitations.filter((hab) =>
      hab.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hab.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterType === "selected") {
      filtered = filtered.filter((hab) => selectedHabilitations.includes(hab.habilitationId));
    } else if (filterType === "unselected") {
      filtered = filtered.filter((hab) => !selectedHabilitations.includes(hab.habilitationId));
    }

    setFilteredHabilitations(filtered);
  }, [habilitations, searchTerm, filterType, selectedHabilitations]);

  // Gérer la sélection/désélection des habilitations
  const handleCheckboxChange = (habilitationId) => {
    setSelectedHabilitations((prev) =>
      prev.includes(habilitationId)
        ? prev.filter((id) => id !== habilitationId)
        : [...prev, habilitationId]
    );
  };

  // Sélectionner/désélectionner tout
  const handleSelectAll = () => {
    if (selectedHabilitations.length === habilitations.length) {
      setSelectedHabilitations([]);
    } else {
      setSelectedHabilitations(habilitations.map((h) => h.habilitationId));
    }
  };

  const handleSave = async () => {
    if (!roleId) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Aucun rôle sélectionné.",
      });
      return;
    }

    try {
      // Prepare data for createRoleHabilitation
      const roleHabilitationData = {
        roleIds: [roleId], // Sending a single roleId as an array
        habilitationIds: selectedHabilitations, // The current selected habilitations
      };

      // Call createRoleHabilitation to update role-habilitation relationships
      await createRoleHabilitation(
        roleHabilitationData,
        setIsLoading,
        handleSuccess,
        handleError
      );
    } catch (error) {
      // Error handling is already managed by createRoleHabilitation via handleError
      console.error("Erreur lors de la sauvegarde des habilitations:", error);
    }
  };

  // Annuler les modifications
  const handleCancel = () => {
    setSelectedHabilitations(initialHabilitations.map((h) => h.habilitationId));
    setSearchTerm("");
    setFilterType("all");
  };

  // Gérer la création d'une nouvelle habilitation
  const handleCreateHabilitation = async () => {
    if (!newHabilitation.label.trim()) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Le label de l'habilitation est requis.",
      });
      return;
    }

    await createHabilitation(
      newHabilitation,
      setIsLoading,
      handleSuccess,
      handleError
    );
    setNewHabilitation({ label: "", description: "" });
    setIsCreateModalOpen(false);
    fetchAllHabilitations(setHabilitations, setIsLoading, setTotalEntries, handleError);
  };

  const selectedCount = selectedHabilitations.length;
  const hasChanges =
    JSON.stringify([...selectedHabilitations].sort()) !==
    JSON.stringify([...initialHabilitations.map((h) => h.habilitationId)].sort());

  return (
    <DashboardContainer>
      {/* Conditional rendering for alerts */}
      {alert.isOpen && (
        <>
          {alert.type === "success" ? (
            <Alert
              type="success"
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
        </>
      )}

      {/* Modal for creating new habilitation */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Créer une nouvelle habilitation"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <div>
            <CardLabel>Label</CardLabel>
            <FormInputSearch
              type="text"
              placeholder="Entrez le label..."
              value={newHabilitation.label}
              onChange={(e) =>
                setNewHabilitation({ ...newHabilitation, label: e.target.value })
              }
            />
          </div>
          <div>
            <CardLabel>Description</CardLabel>
            <FormInputSearch
              type="text"
              placeholder="Entrez la description (optionnel)..."
              value={newHabilitation.description}
              onChange={(e) =>
                setNewHabilitation({ ...newHabilitation, description: e.target.value })
              }
            />
          </div>
          <ActionButtons>
            <ButtonCancel onClick={() => setIsCreateModalOpen(false)}>
              <X size={16} />
              Annuler
            </ButtonCancel>
            <ButtonUpdate onClick={handleCreateHabilitation}>
              <Save size={16} />
              Créer
            </ButtonUpdate>
          </ActionButtons>
        </div>
      </Modal>

      <TableHeader>
        <TableTitle>
          Assigner des Habilitations pour "{roleName || "Rôle"}"
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", fontWeight: "normal" }}>
            {selectedCount} habilitation{selectedCount !== 1 ? "s" : ""} sélectionnée
            {selectedCount !== 1 ? "s" : ""} sur {totalEntries}
          </div>
        </TableTitle>
      </TableHeader>

      {/* Filtres et recherche */}
      <div
        style={{
          background: "var(--bg-primary)",
          padding: "var(--spacing-lg)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "var(--spacing-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-md)",
        }}
      >
        {/* Barre de recherche */}
        <div style={{ position: "relative" }}>
          <FormInputSearch
            type="text"
            placeholder="Rechercher une habilitation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "var(--spacing-xl)" }}
          />
        </div>

        {/* Filtres */}
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
            >
              Toutes ({habilitations.length})
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
            >
              Non sélectionnées ({habilitations.length - selectedCount})
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
          >
            {selectedHabilitations.length === habilitations.length
              ? "Désélectionner tout"
              : "Sélectionner tout"}
          </button>
        </div>
      </div>

      {/* Liste des habilitations */}
      <CardsContainer>
        {isLoading.habilitations ? (
          <LoadingCardsState>
            <Loading>Chargement...</Loading>
          </LoadingCardsState>
        ) : filteredHabilitations.length > 0 ? (
          filteredHabilitations.map((habilitation) => {
            const isSelected = selectedHabilitations.includes(habilitation.habilitationId);
            return (
              <Card
                key={habilitation.habilitationId}
                style={{
                  border: isSelected ? "2px solid var(--primary-color)" : "1px solid var(--border-light)",
                  cursor: "pointer",
                }}
                onClick={() => handleCheckboxChange(habilitation.habilitationId)}
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
                      {habilitation.label || "Non spécifié"}
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
                      {habilitation.description || "Aucune description disponible"}
                    </div>
                  </CardField>
                </CardBody>
              </Card>
            );
          })
        ) : (
          <EmptyCardsState>
            <NoDataMessage>
              {searchTerm ? "Aucune habilitation trouvée pour cette recherche." : "Aucune habilitation trouvée."}
            </NoDataMessage>
          </EmptyCardsState>
        )}
      </CardsContainer>

      {/* Actions */}
      {habilitations.length > 0 && (
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
            onClick={handleSave}
            disabled={!hasChanges}
            style={{ opacity: hasChanges ? 1 : 0.6 }}
          >
            <Save size={16} />
            Sauvegarder{" "}
            {hasChanges &&
              `(${Math.abs(selectedCount - initialHabilitations.length)} modification${
                Math.abs(selectedCount - initialHabilitations.length) !== 1 ? "s" : ""
              })`}
          </ButtonUpdate>
        </ActionButtons>
      )}
    </DashboardContainer>
  );
};

export default HabilitationAssign;