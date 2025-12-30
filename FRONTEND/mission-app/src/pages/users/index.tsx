/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, RefreshCw, X, List, Search, Filter } from "lucide-react";

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
  CheckboxCell,
  CheckboxHeadCell,
  FiltersToggle,
  ButtonShowFilters,
  Loading,
  NoDataMessage,
  Separator,
  ActionsSelect,
  SelectionInfo,
  RoleBadge,
  RolesContainer
} from "@/styles/table-styles";
import {
  useUsers,
  useSearchUsers,
  useDepartments,
  USERS_KEY,
  SEARCH_USERS_BASE_KEY,
  useHasHabilitation
} from "@/api/users/services";
import { useRoles } from "@/api/access/services";
import ProtectedRoute from "@/components/protected-route";
import type { User, UserSearchFilters } from "@/api/users/services";
import Alert from "@/components/alert";
import Pagination from "@/components/pagination";
import RoleModifPopupComponent from "@/pages/users/access/modif-role";
import RemoveRolePopupComponent from "@/pages/users/access/remove-role";
import { useSyncUsers } from "@/api/ldap/service";

interface UserSuggestion {
  id: string;
  name: string;
  displayName: string;
  matricule: string;
}

interface SuggestionsState {
  users: UserSuggestion[];
  matricules: string[];
}

interface FiltersState {
  name: string;
  matricule: string;
  department: string;
  role: string;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error";
  message: string;
}

const UserList: React.FC = () => {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.userId;

  const canModifyRoles = useHasHabilitation(userId, "Modifier le rôle des utilisateur(s)");
  const canDeleteRoles = useHasHabilitation(userId, "Supprimer le rôle des utilisateur(s)");
  const hasAnyHabilitation = canModifyRoles || canDeleteRoles;

  const [suggestions, setSuggestions] = useState<SuggestionsState>({ 
    users: [], 
    matricules: [] 
  });
  const [filters, setFilters] = useState<FiltersState>({
    name: "",
    matricule: "",
    department: "",
    role: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({
    name: "",
    matricule: "",
    department: "",
    role: "",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [isHabilitationPopupOpen, setIsHabilitationPopupOpen] = useState<boolean>(false);
  const [isRemoveRolesOpen, setIsRemoveRolesOpen] = useState<boolean>(false);
  const [selectedUsersWithRoles, setSelectedUsersWithRoles] = useState<User[]>([]);

  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const navigate = useNavigate();

  const { data: allUsersResponse } = useUsers();
  const { data: departmentsResponse } = useDepartments();
  const { data: rolesResponse } = useRoles();

  // Utilisation du hook useSyncUsers
  const { syncUsers, isLoading: isSyncLoading } = useSyncUsers();

  useEffect(() => {
    const roleParam = searchParams[0].get("role");
    if (roleParam && filters.role !== roleParam) {
      setFilters((prev) => ({ ...prev, role: decodeURIComponent(roleParam) }));
      setAppliedFilters((prev) => ({ ...prev, role: decodeURIComponent(roleParam) }));
      setCurrentPage(1); 
    }
  }, [searchParams]);

  const searchFilters: UserSearchFilters = {
    name: appliedFilters.name || undefined,
    matricule: appliedFilters.matricule || undefined,
    department: appliedFilters.department || undefined,
    role: appliedFilters.role || undefined,
  };

  const { data: searchResponse, isLoading: isUsersLoading } = useSearchUsers(
    searchFilters,
    currentPage,
    pageSize
  );

  const handleSync = async (): Promise<void> => {
    try {
      const result = await syncUsers();
      
      // Afficher l'alerte de succès avec les statistiques
      let successMessage = result.message;
      if (result.statistics) {
        const stats = result.statistics;
        successMessage += `\n- Utilisateurs ajoutés: ${stats.usersAdded}\n- Utilisateurs mis à jour: ${stats.usersUpdated}\n- Utilisateurs supprimés: ${stats.usersDeleted}\n- Total traité: ${stats.totalProcessed}`;
      }
      
      setAlert({
        isOpen: true,
        type: "success",
        message: successMessage,
      });
      
      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      queryClient.invalidateQueries({ queryKey: SEARCH_USERS_BASE_KEY });
      
    } catch (error) {
      // Gestion des erreurs
      let errorMessage = "Erreur lors de la synchronisation LDAP";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setAlert({
        isOpen: true,
        type: "error",
        message: errorMessage,
      });
    }
  };

  const hasFilters: boolean = Object.values(filters).some((val: string) => (val || "").trim() !== "");

  const toggleSelection = (userId: string, checked: boolean) => {
    setSelectedUsers((prev) => {
      if (checked) {
        return prev.includes(userId) ? prev : [...prev, userId];
      } else {
        return prev.filter((id) => id !== userId);
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    const allUserIds = users.map((user) => user.userId || user.matricule);
    if (checked) {
      setSelectedUsers((prev) => [...new Set([...prev, ...allUserIds])]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => !allUserIds.includes(id)));
    }
  };

  const isSelectAllChecked = users.length > 0 && users.every((user) => selectedUsers.includes(user.userId || user.matricule));

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setAppliedFilters(filters);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams[0]);
    if (filters.role) {
      newParams.set("role", encodeURIComponent(filters.role));
    } else {
      newParams.delete("role");
    }
    navigate(`?${newParams.toString()}`);
  };

  const handleResetFilters = (): void => {
    const resetFilters: FiltersState = { 
      name: "", 
      matricule: "", 
      department: "", 
      role: "" 
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
    navigate("/utilisateur");
  };

  const handleActionsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const action = e.target.value;
    const selectedUserObjects = users.filter((user) =>
      selectedUsers.includes(user.userId || user.matricule)
    );
    setSelectedUsersWithRoles(selectedUserObjects);
    if (action === "modify" && canModifyRoles) {
      setIsHabilitationPopupOpen(true);
    } else if (action === "remove" && canDeleteRoles) {
      setIsRemoveRolesOpen(true);
    }
    e.target.value = "";
  };

  const handleNameChange = (value: string): void => {
    setFilters((prev) => ({ ...prev, name: value }));
  };

  const handleMatriculeChange = (value: string): void => {
    setFilters((prev) => ({ ...prev, matricule: value }));
  };

  const handleDepartmentChange = (value: string): void => {
    setFilters((prev) => ({ ...prev, department: value }));
  };

  const handleRoleChange = (value: string): void => {
    setFilters((prev) => ({ ...prev, role: value }));
  };

  const nameSuggestions = (suggestions.users || [])
    .filter((user: UserSuggestion) =>
      user.displayName
        .toLowerCase()
        .includes((filters.name || "").toLowerCase())
    )
    .map((user: UserSuggestion) => user.displayName);

  const matriculeSuggestions = (suggestions.users || [])
    .filter((user: UserSuggestion) =>
      user.matricule
        .toLowerCase()
        .includes((filters.matricule || "").toLowerCase())
    )
    .map((user: UserSuggestion) => user.matricule);

  const selectedCountText = `${selectedUsers.length} élément${selectedUsers.length !== 1 ? "s" : ""} sélectionné${selectedUsers.length !== 1 ? "s" : ""}`;

  const handleHabilitationClose = () => {
    queryClient.invalidateQueries({ queryKey: SEARCH_USERS_BASE_KEY });
    setIsHabilitationPopupOpen(false);
    setSelectedUsers([]);
    setSelectedUsersWithRoles([]);
  };

  const handleRemoveClose = () => {
    queryClient.invalidateQueries({ queryKey: SEARCH_USERS_BASE_KEY });
    setIsRemoveRolesOpen(false);
    setSelectedUsers([]);
    setSelectedUsersWithRoles([]);
  };

  const filtersString = useMemo(() => JSON.stringify(appliedFilters), [appliedFilters]);

  useEffect(() => {
    setSelectedUsers([]);
  }, [currentPage, filtersString]);

  useEffect(() => {
    if (searchResponse) {
      if (searchResponse.status === 200 && searchResponse.data) {
        setUsers(searchResponse.data.users || []);
        setTotalEntries(searchResponse.data.totalCount || 0);
      } else {
        setUsers([]);
        setTotalEntries(0);
        setAlert({
          isOpen: true,
          type: "error",
          message: searchResponse.message || "Erreur lors de la recherche",
        });
      }
    }
  }, [searchResponse]);

  useEffect(() => {
    if (allUsersResponse) {
      if (allUsersResponse.status === 200 && allUsersResponse.data) {
        const mappedUsers: UserSuggestion[] = (allUsersResponse.data || []).map((user: User) => ({
          id: user.matricule || user.userId,
          name: user.name || "Non spécifié",
          displayName: user.name || "Non spécifié",
          matricule: user.matricule || "",
        }));
        
        const uniqueMatricules = Array.from(
          new Set(
            mappedUsers
              .filter(user => user.matricule && user.matricule.trim() !== "")
              .map(user => user.matricule)
          )
        );
        
        setSuggestions({ 
          users: mappedUsers, 
          matricules: uniqueMatricules 
        });
      } else {
        setAlert({
          isOpen: true,
          type: "error",
          message: allUsersResponse.message || "Erreur lors du chargement des suggestions",
        });
      }
    }
  }, [allUsersResponse]);

  useEffect(() => {
    if (departmentsResponse) {
      if (departmentsResponse.status === 200 && departmentsResponse.data) {
        setDepartments(departmentsResponse.data || []);
      }
    }
  }, [departmentsResponse]);

  useEffect(() => {
    if (rolesResponse) {
      if (rolesResponse.status === 200 && rolesResponse.data) {
        setRoles(rolesResponse.data.map((role: { name: string }) => role.name) || []);
      }
    }
  }, [rolesResponse]);

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      
      {canModifyRoles && (
        <RoleModifPopupComponent
          isOpen={isHabilitationPopupOpen}
          onClose={handleHabilitationClose}
          userIds={selectedUsers}
          users={selectedUsersWithRoles}
        />
      )}
      
      {canDeleteRoles && (
        <RemoveRolePopupComponent
          isOpen={isRemoveRolesOpen}
          onClose={handleRemoveClose}
          userIds={selectedUsers}
          users={selectedUsersWithRoles}
        />
      )}

      {/* === SECTION FILTRES === */}
      {!isHidden && (
        <FiltersContainer $isMinimized={isMinimized}>
          <FiltersHeader>
            <FiltersTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} />
              Filtres avancés
            </FiltersTitle>
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
                      {/* Champ Nom */}
                      <FormFieldCell style={{ width: "25%" }}>
                        <FormLabelSearch>Nom</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.name || ""}
                          onChange={handleNameChange}
                          suggestions={nameSuggestions}
                          maxVisibleItems={5}
                          placeholder="Rechercher par nom..."
                          disabled={isUsersLoading || isSyncLoading}
                          fieldType="user"
                          fieldLabel="utilisateur"
                          showAddOption={false}
                        />
                      </FormFieldCell>
                      
                      {/* Champ Matricule */}
                      <FormFieldCell style={{ width: "25%" }}>
                        <FormLabelSearch>Matricule</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.matricule || ""}
                          onChange={handleMatriculeChange}
                          suggestions={matriculeSuggestions}
                          maxVisibleItems={5}
                          placeholder="Rechercher par matricule..."
                          disabled={isUsersLoading || isSyncLoading}
                          fieldType="matricule"
                          fieldLabel="matricule"
                          showAddOption={false}
                        />
                      </FormFieldCell>
                      
                      {/* Champ Département */}
                      <FormFieldCell style={{ width: "25%" }}>
                        <FormLabelSearch>Département</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.department || ""}
                          onChange={handleDepartmentChange}
                          suggestions={departments}
                          maxVisibleItems={5}
                          placeholder="Rechercher par département..."
                          disabled={isUsersLoading || isSyncLoading}
                          fieldType="department"
                          fieldLabel="département"
                          showAddOption={false}
                        />
                      </FormFieldCell>
                      
                      {/* Champ Rôle */}
                      <FormFieldCell style={{ width: "25%" }}>
                        <FormLabelSearch>Accèss</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.role || ""}
                          onChange={handleRoleChange}
                          suggestions={roles}
                          maxVisibleItems={5}
                          placeholder="Rechercher par access..."
                          disabled={isUsersLoading || isSyncLoading}
                          fieldType="role"
                          fieldLabel="rôle"
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
                    disabled={!hasFilters || isUsersLoading || isSyncLoading}
                    title="Effacer"
                  >
                    Effacer filtres
                  </ButtonReset>
                  <ButtonSearch
                    type="submit"
                    disabled={isUsersLoading || isSyncLoading}
                    title="Rechercher"
                  >
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
            {hasAnyHabilitation && selectedUsers.length > 0 && (
              <SelectionInfo>{selectedCountText}</SelectionInfo>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
            {hasAnyHabilitation && selectedUsers.length > 0 && (
              <ActionsSelect
                value=""
                onChange={handleActionsChange}
              >
                <option value="">Actions</option>
                {canModifyRoles && <option value="modify">Modifier Role(s)</option>}
                {canDeleteRoles && <option value="remove">Supprimer Role(s)</option>}
              </ActionsSelect>
            )}
            <ButtonSearch onClick={handleSync} disabled={isSyncLoading} title="Actualiser">
              <RefreshCw size={16} style={{ marginRight: "var(--spacing-sm)" }} />
              {isSyncLoading ? "Synchronisation..." : "Actualiser"}
            </ButtonSearch>
          </div>
        </TableHeader>
        <div className="table-wrapper">
          <DataTable>
            <thead>
              <tr>
                {hasAnyHabilitation && (
                  <CheckboxHeadCell>
                    <input
                      type="checkbox"
                      checked={isSelectAllChecked}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </CheckboxHeadCell>
                )}
                <TableHeadCell>Matricule</TableHeadCell>
                <TableHeadCell>Nom</TableHeadCell>
                <TableHeadCell>Email</TableHeadCell>
                <TableHeadCell>Département</TableHeadCell>
                <TableHeadCell>Supérieur direct</TableHeadCell>
                <TableHeadCell>Access</TableHeadCell>
              </tr>
            </thead>
            <tbody>
              {isUsersLoading ? (
                <TableRow>
                  <TableCell colSpan={hasAnyHabilitation ? 7 : 6}>
                    <Loading>Chargement des données...</Loading>
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user: User, index: number) => {
                  const userId = user.userId || user.matricule;
                  return (
                    <TableRow key={`${userId}-${index}`}>
                      {hasAnyHabilitation && (
                        <CheckboxCell>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(userId)}
                            onChange={(e) => toggleSelection(userId, e.target.checked)}
                          />
                        </CheckboxCell>
                      )}
                      <TableCell>{user.matricule || "Non spécifié"}</TableCell>
                      <TableCell>{user.name || "Non spécifié"}</TableCell>
                      <TableCell>{user.email || "Non spécifié"}</TableCell>
                      <TableCell>{user.department || "Non spécifié"}</TableCell>
                      <TableCell>{user.superiorName || "Non spécifié"}</TableCell>
                      <TableCell>
                        {user.userRoles && user.userRoles.length > 0 ? (
                          <RolesContainer>
                            {user.userRoles.map((ur, idx) => (
                              <RoleBadge key={idx}>{ur.role.name}</RoleBadge>
                            ))}
                          </RolesContainer>
                        ) : (
                          "Non spécifié"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={hasAnyHabilitation ? 7 : 6}>
                    <NoDataMessage>
                      {Object.values(appliedFilters).some(Boolean)
                        ? "Aucun utilisateur ne correspond aux critères."
                        : "Aucun utilisateur trouvé."}
                    </NoDataMessage>
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </DataTable>
        </div>
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalEntries={totalEntries}
          onPageChange={setCurrentPage}
          onPageSizeChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setPageSize(Number(e.target.value))
          }
        />
      </TableContainer>
    </>
  );
};

const ProtectedUserList: React.FC = () => (
  <ProtectedRoute requiredHabilitation="Voir la page des utilisateurs">
    <UserList />
  </ProtectedRoute>
);

export default ProtectedUserList;