"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ChevronDown, ChevronUp, X, List, Search, Plus } from "lucide-react";
import {
  FiltersContainer,
  FiltersHeader,
  FiltersTitle,
  FiltersControls,
  FilterControlButton,
  FiltersSection,
  FormTableSearch,
  FormRow,
  FormFieldCell,
  FormLabelSearch,
  StyledAutoCompleteInput,
  FiltersActions,
  ButtonReset,
  ButtonSearch,
  TableContainer,
  DataTable,
  TableTitle,
  TableHeader,
  TableHeadCell,
  TableRow,
  TableCell,
  FiltersToggle,
  ButtonShowFilters,
  Loading,
  NoDataMessage,
  Separator,
  ActionsSelect,
  SelectionInfo,
} from "@/styles/table-styles";
import { useRolesInfo, useUpdateRole, useDeleteRole } from "@/api/access/services";
import { useHasHabilitation } from "@/api/users/services";
import type { RoleWithGroupedHabilitations } from "@/api/access/services";
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import RoleFormPopup from "./components/update-form";
import CreateRolePopup from "./components/create-form";
import ProtectedRoute from "@/components/protected-route";
import axios from 'axios';

interface FiltersState {
  name: string;
  description: string;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const RoleList: React.FC = () => {
  const [filters, setFilters] = useState<FiltersState>({
    name: "",
    description: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({
    name: "",
    description: "",
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [editingRole, setEditingRole] = useState<RoleWithGroupedHabilitations | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; description: string } | null>(null);
  const [originalValues, setOriginalValues] = useState<{ name: string; description: string } | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState<boolean>(false);
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());

  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.userId;

  const canCreateRole = useHasHabilitation(userId, "creer role et habilitation(s)");
  const canModifyRole = useHasHabilitation(userId, "modifier role");
  const canModifyHabilities = useHasHabilitation(userId, "modifier habilitation(s) du role");
  const canDeleteRole = useHasHabilitation(userId, "suprimer role");
  const hasAnyHabilitation = canCreateRole || canModifyRole || canModifyHabilities || canDeleteRole;

  const { data: rolesResponse, isLoading: isRolesLoading, refetch: refetchRoles } = useRolesInfo();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  const roles = useMemo(() => rolesResponse?.data || [], [rolesResponse?.data]);
  
  const allGroups = useMemo(() => {
    const groupsMap = new Map<string, { groupId: string; label: string }>();
    roles.forEach(role => {
      role.habilitationGroups.forEach(group => {
        if (!groupsMap.has(group.groupId)) {
          groupsMap.set(group.groupId, { 
            groupId: group.groupId, 
            label: group.label 
          });
        }
      });
    });
    return Array.from(groupsMap.values());
  }, [roles]);

  const hasFilters: boolean = Object.values(filters).some((val: string) => (val || "").trim() !== "");

  const filteredRoles = useMemo(() => {
    let filtered = roles;

    if (appliedFilters.name) {
      filtered = filtered.filter((role) =>
        role.name.toLowerCase().includes(appliedFilters.name.toLowerCase())
      );
    }

    if (appliedFilters.description) {
      filtered = filtered.filter((role) =>
        role.description.toLowerCase().includes(appliedFilters.description.toLowerCase())
      );
    }

    return filtered;
  }, [roles, appliedFilters]);

  // Sélection via clic simple sur la ligne entière
  const handleRowSelection = useCallback((roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles([roleId]);
    }
  }, [selectedRoles]);

  // Édition via double-clic sur la ligne entière
  const handleRowDoubleClick = useCallback((role: RoleWithGroupedHabilitations) => {
    if (!canModifyRole) {
      setAlert({ isOpen: true, type: "warning", message: "Vous n'avez pas les droits pour modifier ce rôle." });
      return;
    }
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (editingRole?.roleId !== role.roleId) {
      setEditingRole(role);
      const originalDesc = role.description || '';
      setOriginalValues({ name: role.name, description: originalDesc });
      setEditValues({ name: role.name, description: originalDesc });
    }
  }, [editingRole?.roleId, canModifyRole]);

  const handleBlur = useCallback(() => {
    if (!editingRole || !editValues || !originalValues || !userId) {
      setEditingRole(null);
      setEditValues(null);
      setOriginalValues(null);
      if (!userId) {
        setAlert({ isOpen: true, type: "error", message: "User ID non trouvé" });
      }
      return;
    }

    const hasChanged =
      editValues.name !== originalValues.name || editValues.description !== originalValues.description;

    if (hasChanged) {
      const request = {
        name: editValues.name,
        description: editValues.description,
      };

      updateRoleMutation.mutate(
        { id: editingRole.roleId, request },
        {
          onSuccess: () => {
            setAlert({ isOpen: true, type: "success", message: "Rôle mis à jour avec succès" });
            // Sortir du mode édition immédiatement après succès
            setEditingRole(null);
            setEditValues(null);
            setOriginalValues(null);
          },
          onError: (error: unknown) => {
            let errorMessage = "Échec de la mise à jour du rôle";
            if (axios.isAxiosError(error)) {
              errorMessage = error.response?.data?.message || error.message || errorMessage;
            } else if (error instanceof Error) {
              errorMessage = error.message;
            }
            setAlert({
              isOpen: true,
              type: "error",
              message: errorMessage,
            });
          },
        }
      );
    } else {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      blurTimeoutRef.current = setTimeout(() => {
        setEditingRole(null);
        setEditValues(null);
        setOriginalValues(null);
      }, 150);
    }
  }, [editingRole, editValues, originalValues, userId, updateRoleMutation]);

  const handleFocus = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleBlur();
      }
    },
    [handleBlur]
  );

  const handleFilterSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setAppliedFilters(filters);
  }, [filters]);

  const handleResetFilters = useCallback((): void => {
    const resetFilters: FiltersState = { name: "", description: "" };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setAlert({ isOpen: true, type: "info", message: "Filtres réinitialisés." });
  }, []);

  const handleActionsChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const action = e.target.value;
    if (action === "modify" && canModifyHabilities) {
      if (selectedRoles.length === 0) {
        setAlert({ isOpen: true, type: "warning", message: "Veuillez sélectionner au moins un rôle." });
      } else {
        setIsPopupOpen(true);
      }
    } else if (action === "delete" && canDeleteRole) {
      if (selectedRoles.length === 0) {
        setAlert({ isOpen: true, type: "warning", message: "Veuillez sélectionner au moins un rôle." });
      } else if (userId) {
        setShowDeleteModal(true);
      }
    } else if (action === "modify" && !canModifyHabilities) {
      setAlert({ isOpen: true, type: "warning", message: "Vous n'avez pas les droits pour modifier les habilitations." });
    } else if (action === "delete" && !canDeleteRole) {
      setAlert({ isOpen: true, type: "warning", message: "Vous n'avez pas les droits pour supprimer les rôles." });
    }
    e.target.value = "";
  }, [selectedRoles, userId, canModifyHabilities, canDeleteRole]);

  const handleDeleteConfirm = useCallback(() => {
    if (!userId) {
      setAlert({ isOpen: true, type: "error", message: "User ID non trouvé" });
      setShowDeleteModal(false);
      return;
    }
    selectedRoles.forEach((roleId) => {
      deleteRoleMutation.mutate(
        { id: roleId, userId },
        {
          onSuccess: () => {
            setAlert({ isOpen: true, type: "success", message: "Rôles supprimés avec succès." });
            setSelectedRoles([]);
            refetchRoles();
          },
          onError: (error: unknown) => {
            let errorMessage = "Échec de la suppression du rôle";
            if (axios.isAxiosError(error)) {
              errorMessage = error.response?.data?.message || error.message || errorMessage;
            } else if (error instanceof Error) {
              errorMessage = error.message;
            }
            setAlert({
              isOpen: true,
              type: "error",
              message: errorMessage,
            });
          },
        }
      );
    });
    setShowDeleteModal(false);
  }, [selectedRoles, userId, deleteRoleMutation, refetchRoles]);

  const handleNameChange = useCallback((value: string): void => {
    setFilters((prev) => ({ ...prev, name: value }));
  }, []);

  const handleDescriptionChange = useCallback((value: string): void => {
    setFilters((prev) => ({ ...prev, description: value }));
  }, []);

  const nameSuggestions = useMemo(() => roles.map((role) => role.name), [roles]);
  const descriptionSuggestions = useMemo(() => [...new Set(roles.map((role) => role.description))], [roles]);

  const selectedCountText = useMemo(
    () => `${selectedRoles.length} élément${selectedRoles.length !== 1 ? "s" : ""} sélectionné${selectedRoles.length !== 1 ? "s" : ""}`,
    [selectedRoles.length]
  );

  const filtersString = useMemo(() => JSON.stringify(appliedFilters), [appliedFilters]);

  useEffect(() => {
    setSelectedRoles([]);
    setEditingRole(null);
    setEditValues(null);
    setOriginalValues(null);
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }, [filtersString]);

  useEffect(() => {
    if (rolesResponse) {
      if (rolesResponse.status !== 200 || !rolesResponse.data) {
        setAlert({
          isOpen: true,
          type: "error",
          message: rolesResponse.message || "Erreur lors du chargement des rôles",
        });
      }
    }
  }, [rolesResponse]);

  const handlePopupClose = useCallback(() => {
    setIsPopupOpen(false);
    refetchRoles();
  }, [refetchRoles]);

  const handleCreatePopupClose = useCallback(() => {
    setIsCreatePopupOpen(false);
    refetchRoles();
  }, [refetchRoles]);

  const toggleCellExpansion = useCallback((roleId: string, groupId: string) => {
    const cellKey = `${roleId}-${groupId}`;
    setExpandedCells((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cellKey)) {
        newSet.delete(cellKey);
      } else {
        newSet.add(cellKey);
      }
      return newSet;
    });
  }, []);

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      <RoleFormPopup
        isOpen={isPopupOpen}
        initialRoleIds={selectedRoles}
        onClose={handlePopupClose}
      />

      <CreateRolePopup
        isOpen={isCreatePopupOpen}
        onClose={handleCreatePopupClose}
      />

      <Modal
        type="error"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedRoles.length} rôle${selectedRoles.length > 1 ? 's' : ''} sélectionné${selectedRoles.length > 1 ? 's' : ''} ?`}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
        confirmAction={handleDeleteConfirm}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        showActions={true}
      />

      {/* === SECTION FILTRES === */}
      {!isHidden && (
        <FiltersContainer $isMinimized={isMinimized}>
          <FiltersHeader>
            <FiltersTitle>Filtre</FiltersTitle>
            <FiltersControls>
              <FilterControlButton
                $isMinimized={isMinimized}
                onClick={() => setIsMinimized((p) => !p)}
                title={isMinimized ? "Développer" : "Réduire"}
              >
                {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </FilterControlButton>
              <FilterControlButton $isClose onClick={() => setIsHidden(true)} title="Fermer">
                <X size={16} />
              </FilterControlButton>
            </FiltersControls>
          </FiltersHeader>

          {!isMinimized && (
            <FiltersSection>
              <Separator />
              <form onSubmit={handleFilterSubmit}>
                <FormTableSearch>
                  <tbody>
                    <FormRow>
                      <FormFieldCell style={{ width: "50%" }}>
                        <FormLabelSearch>Nom du rôle</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.name || ""}
                          onChange={handleNameChange}
                          suggestions={nameSuggestions}
                          maxVisibleItems={5}
                          placeholder="Rechercher par nom..."
                          disabled={isRolesLoading}
                          fieldType="role"
                          fieldLabel="rôle"
                          showAddOption={false}
                        />
                      </FormFieldCell>

                      <FormFieldCell style={{ width: "50%" }}>
                        <FormLabelSearch>Description</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.description || ""}
                          onChange={handleDescriptionChange}
                          suggestions={descriptionSuggestions}
                          maxVisibleItems={5}
                          placeholder="Rechercher par description..."
                          disabled={isRolesLoading}
                          fieldType="description"
                          fieldLabel="description"
                          showAddOption={false}
                        />
                      </FormFieldCell>
                    </FormRow>
                  </tbody>
                </FormTableSearch>

                <Separator />

                <FiltersActions>
                  <ButtonReset
                    type="button"
                    onClick={handleResetFilters}
                    disabled={!hasFilters || isRolesLoading}
                    title="Effacer"
                  >
                    Effacer
                  </ButtonReset>
                  <ButtonSearch type="submit" disabled={isRolesLoading} title="Rechercher">
                    <Search size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                    Rechercher
                  </ButtonSearch>
                </FiltersActions>
              </form>
            </FiltersSection>
          )}
        </FiltersContainer>
      )}

      {/* === TOGGLE FILTRES === */}
      {isHidden && (
        <FiltersToggle>
          <ButtonShowFilters type="button" onClick={() => setIsHidden(false)}>
            <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Afficher les filtres
          </ButtonShowFilters>
        </FiltersToggle>
      )}

      {/* === TABLEAU === */}
      <TableContainer>
        <TableHeader>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
            <TableTitle>Liste</TableTitle>
            {hasAnyHabilitation && selectedRoles.length > 0 && <SelectionInfo>{selectedCountText}</SelectionInfo>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
            {hasAnyHabilitation && selectedRoles.length > 0 && (
              <ActionsSelect value="" onChange={handleActionsChange}>
                <option value="">Actions</option>
                {canModifyHabilities && <option value="modify">Modifier</option>}
                {canDeleteRole && <option value="delete">Supprimer</option>}
              </ActionsSelect>
            )}
            {canCreateRole && (
              <ButtonSearch onClick={() => setIsCreatePopupOpen(true)} title="Ajouter">
                <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                Ajouter
              </ButtonSearch>
            )}
          </div>
        </TableHeader>

        <div className="table-wrapper" style={{ overflowX: "auto" }}>
          <DataTable>
            <thead>
              <tr>
                <TableHeadCell style={{ minWidth: "150px", position: "sticky", left: 0, zIndex: 10 }}>
                  Nom du rôle
                </TableHeadCell>
                <TableHeadCell style={{ minWidth: "200px" }}>Description</TableHeadCell>
                {allGroups.map((group) => (
                  <TableHeadCell key={group.groupId} style={{ minWidth: "150px" }}>
                    {group.label}
                  </TableHeadCell>
                ))}
              </tr>
            </thead>
            <tbody>
              {isRolesLoading ? (
                <TableRow>
                  <TableCell colSpan={2 + allGroups.length}>
                    <Loading>Chargement des données...</Loading>
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length > 0 ? (
                filteredRoles.map((role: RoleWithGroupedHabilitations, index: number) => {
                  const isSelected = selectedRoles.includes(role.roleId);
                  return (
                    <TableRow 
                      key={`${role.roleId}-${index}`}
                      style={{ 
                        cursor: hasAnyHabilitation ? "pointer" : "default",
                        backgroundColor: isSelected ? "var(--primary-light)" : "transparent",
                      }}
                      onClick={hasAnyHabilitation ? () => handleRowSelection(role.roleId) : undefined}
                      onDoubleClick={canModifyRole ? () => handleRowDoubleClick(role) : undefined}
                      title={hasAnyHabilitation ? "Clic pour sélectionner, double-clic pour éditer" : ""}
                    >
                      <TableCell 
                        style={{ 
                          fontWeight: "600", 
                          position: "sticky", 
                          left: 0, 
                          zIndex: 5,
                          padding: "var(--spacing-xs)",
                        }}
                      >
                        {editingRole?.roleId === role.roleId ? (
                          <input
                            type="text"
                            value={editValues?.name || role.name}
                            onChange={(e) =>
                              setEditValues((prev) => ({ ...prev!, name: e.target.value }))
                            }
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            style={{
                              width: "100%",
                              boxSizing: "border-box",
                              border: "1px solid var(--color-border)",
                              padding: "var(--spacing-xs)",
                              background: "white",
                              margin: 0,
                            }}
                          />
                        ) : (
                          role.name
                        )}
                      </TableCell>
                      <TableCell 
                        style={{ 
                          padding: "var(--spacing-xs)",
                        }}
                      >
                        {editingRole?.roleId === role.roleId ? (
                          <input
                            type="text"
                            value={editValues?.description || ""}
                            onChange={(e) =>
                              setEditValues((prev) => ({ ...prev!, description: e.target.value }))
                            }
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            onKeyDown={handleKeyDown}
                            style={{
                              width: "100%",
                              boxSizing: "border-box",
                              border: "1px solid var(--color-border)",
                              padding: "var(--spacing-xs)",
                              minHeight: "var(--spacing-md)",
                              background: "white",
                              margin: 0,
                            }}
                          />
                        ) : (
                          role.description || "-"
                        )}
                      </TableCell>
                      {allGroups.map((group) => {
                        const groupHabs = role.habilitationGroups.find(g => g.groupId === group.groupId)?.habilitations || [];
                        if (groupHabs.length === 0) {
                          return (
                            <TableCell key={group.groupId} style={{ fontSize: "0.875rem" }}>
                              -
                            </TableCell>
                          );
                        }
                        const cellKey = `${role.roleId}-${group.groupId}`;
                        const isExpanded = expandedCells.has(cellKey);
                        const displayHabs = isExpanded ? groupHabs : groupHabs.slice(0, 3);
                        const hasMore = groupHabs.length > 3;
                        return (
                          <TableCell key={group.groupId} style={{ fontSize: "0.875rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {displayHabs.map((hab) => (
                                <div
                                  key={hab.habilitationId}
                                  style={{
                                    padding: "4px 8px",
                                    background: "var(--primary-light)",
                                    fontSize: "0.8rem",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <span style={{ marginRight: "6px", fontWeight: "bold", color: "var(--primary-color)" }}>-</span>
                                  {hab.label}
                                </div>
                              ))}
                              {hasMore && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCellExpansion(role.roleId, group.groupId);
                                  }}
                                  style={{
                                    background: "var(--primary-light)",
                                    border: "1px solid var(--primary-color)",
                                    color: "var(--primary-color)",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    transition: "all 0.2s ease",
                                    width: "fit-content",
                                    marginTop: "8px",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "var(--primary-color)";
                                    e.currentTarget.style.color = "var(--text-white)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "var(--primary-light)";
                                    e.currentTarget.style.color = "var(--primary-color)";
                                  }}
                                >
                                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                  {isExpanded ? "Réduire" : "Afficher plus"}
                                </button>
                              )}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={2 + allGroups.length}>
                    <NoDataMessage>
                      {Object.values(appliedFilters).some(Boolean)
                        ? "Aucun rôle ne correspond aux critères."
                        : "Aucun rôle trouvé."}
                    </NoDataMessage>
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </DataTable>
        </div>
      </TableContainer>
    </>
  );
};

const ProtectedRoleList: React.FC = () => (
  <ProtectedRoute requiredHabilitation="voir page access">
    <RoleList />
  </ProtectedRoute>
);

export default ProtectedRoleList;