"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp,RefreshCw, X, List } from "lucide-react";
import {
  DashboardContainer,
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
} from "styles/generaliser/table-container";
import { searchUsers, syncLdap, fetchAllUsers } from "services/users/users";
import { formatDate } from "utils/dateConverter";
import Alert from "components/alert";
import Pagination from "components/pagination";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    matricule: "",
    name: "",
    department: "",
    status: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });
  const [suggestions, setSuggestions] = useState({
    users: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({ users: false, sync: false });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Fetch users for autocomplete suggestions
  useEffect(() => {
    fetchAllUsers(
      (data) => {
        setSuggestions({
          users: data.map((user) => ({
            id: user.matricule || user.userId,
            name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Non spécifié",
            displayName: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Non spécifié",
            matricule: user.matricule,
          })),
        });
      },
      setIsLoading,
      () => {}, // setTotalEntries not needed for suggestions
      (error) => setAlert(error)
    );
  }, []);

  // Fetch users when filters or pagination change
  useEffect(() => {
    searchUsers(
      setUsers,
      setIsLoading,
      setTotalEntries,
      {
        matricule: appliedFilters.matricule || "",
        name: appliedFilters.name || "",
        department: appliedFilters.department || "",
        status: appliedFilters.status || "",
      },
      currentPage,
      pageSize,
      (error) => setAlert(error)
    );
  }, [appliedFilters, currentPage, pageSize]);

  // Handle filter input changes
  // const handleFilterChange = (name, value) => {
  //   setFilters((prev) => ({ ...prev, [name]: value }));
  // };

  // Handle filter form submission
  const handleFilterSubmit = (event) => {
    event.preventDefault();
    
    // Apply filters directly without additional validation for now
    const updatedFilters = { ...filters };
    
    setFilters(updatedFilters);
    setAppliedFilters(updatedFilters);
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      matricule: "",
      name: "",
      department: "",
      status: "",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
    setAlert({ isOpen: true, type: "info", message: "Filtres réinitialisés." });
  };

  // Handle pagination changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  // Toggle filter section minimize state
  const toggleMinimize = () => setIsMinimized((prev) => !prev);

  // Toggle filter section visibility
  const toggleHide = () => setIsHidden((prev) => !prev);

  // Synchronize users
  const handleSync = () => {
    setIsLoading((prev) => ({ ...prev, sync: true }));
    syncLdap(
      (successAlert) => {
        setAlert({
          isOpen: true,
          type: "success",
          message: successAlert.message || "Synchronisation LDAP réussie!",
        });
        setIsLoading((prev) => ({ ...prev, sync: false }));
        // Refresh users after sync
        searchUsers(
          setUsers,
          setIsLoading,
          setTotalEntries,
          appliedFilters,
          currentPage,
          pageSize,
          (error) => setAlert(error)
        );
      },
      (error) => {
        setAlert({
          isOpen: true,
          type: "error",
          message: error.message || "Erreur lors de la synchronisation LDAP",
        });
        setIsLoading((prev) => ({ ...prev, sync: false }));
      }
    );
  };

  return (
    <DashboardContainer>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      {!isHidden && (
        <FiltersContainer $isMinimized={isMinimized}>
          <FiltersHeader>
            <FiltersTitle>Filtres de Recherche</FiltersTitle>
            <FiltersControls>
              <FilterControlButton
                $isMinimized={isMinimized}
                onClick={toggleMinimize}
                title={isMinimized ? "Développer" : "Réduire"}
              >
                {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </FilterControlButton>
              <FilterControlButton $isClose onClick={toggleHide} title="Fermer">
                <X size={16} />
              </FilterControlButton>
            </FiltersControls>
          </FiltersHeader>

          {!isMinimized && (
            <FiltersSection>
              <form onSubmit={handleFilterSubmit}>
                <FormTableSearch>
                  <tbody>
                    <FormRow>

                      <FormFieldCell>
                        <FormLabelSearch>Nom</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.name || ""}
                          onChange={(value) => {
                            setFilters((prev) => ({
                              ...prev,
                              name: value,
                            }));
                          }}
                          onSelect={(value) => {
                            const selectedUser = suggestions.users.find(
                              (user) => user.displayName === value
                            );
                            setFilters((prev) => ({
                              ...prev,
                              name: selectedUser ? selectedUser.displayName : value,
                            }));
                          }}
                          suggestions={suggestions.users
                            .filter((user) =>
                              user.displayName.toLowerCase().includes(filters.name?.toLowerCase() || "")
                            )
                            .map((user) => user.displayName)}
                          maxVisibleItems={5}
                          placeholder="Rechercher par nom..."
                          disabled={isLoading.users || isLoading.sync}
                          fieldType="user"
                          fieldLabel="utilisateur"
                          showAddOption={false}
                        />
                      </FormFieldCell>

                      
                    </FormRow>
                  </tbody>
                </FormTableSearch>

                <FiltersActions>
                  <ButtonReset 
                    type="button" 
                    onClick={handleResetFilters} 
                    disabled={isLoading.users || isLoading.sync}
                  >
                    Réinitialiser
                  </ButtonReset>
                  <ButtonSearch 
                    type="submit" 
                    disabled={isLoading.users || isLoading.sync}
                  >
                    {isLoading.users ? "Recherche..." : "Rechercher"}
                  </ButtonSearch>
                </FiltersActions>
              </form>
            </FiltersSection>
          )}
        </FiltersContainer>
      )}

      {isHidden && (
        <FiltersToggle>
          <ButtonShowFilters type="button" onClick={toggleHide}>
            <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Afficher les filtres
          </ButtonShowFilters>
        </FiltersToggle>
      )}

      <TableHeader>
        <TableTitle>Liste des Utilisateurs</TableTitle>
        <ButtonSearch onClick={handleSync} disabled={isLoading.sync}>
          <RefreshCw size={16} style={{ marginRight: "var(--spacing-sm)" }} />
          {isLoading.sync ? "Synchronisation..." : "Synchroniser"}
        </ButtonSearch>
      </TableHeader>

      <TableContainer>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Matricule</TableHeadCell>
              <TableHeadCell>Nom</TableHeadCell>
              <TableHeadCell>Email</TableHeadCell>
              <TableHeadCell>Département</TableHeadCell>
              <TableHeadCell>Poste</TableHeadCell>
              <TableHeadCell>Date de création</TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {isLoading.users ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Loading>Chargement des données...</Loading>
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user, index) => (
                <TableRow key={`${user.userId || user.matricule}-${index}`}>
                  <TableCell>{user.matricule || "Non spécifié"}</TableCell>
                  <TableCell>{user.name || "Non spécifié"}</TableCell>
                  <TableCell>{user.email || "Non spécifié"}</TableCell>
                  <TableCell>{user.department || "Non spécifié"}</TableCell>
                  <TableCell>{user.position || "Non spécifié"}</TableCell>
                  <TableCell>
                    {formatDate(user.createdAt) || "Non spécifié"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <NoDataMessage>
                    {appliedFilters.matricule ||
                    appliedFilters.name ||
                    appliedFilters.department ||
                    appliedFilters.status
                      ? "Aucun utilisateur ne correspond aux critères de recherche."
                      : "Aucun utilisateur trouvé."}
                  </NoDataMessage>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </DataTable>
      </TableContainer>

      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalEntries={totalEntries}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        disabled={isLoading.users}
      />
    </DashboardContainer>
  );
};

export default UserList;