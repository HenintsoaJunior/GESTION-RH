"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, X, RefreshCw, List } from "lucide-react";
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
  FormInputSearch,
  FiltersActions,
  ButtonReset,
  ButtonSearch,
  TableHeader,
  TableTitle,
  TableContainer,
  DataTable,
  TableHeadCell,
  TableRow,
  TableCell,
  FiltersToggle,
  ButtonShowFilters,
  Loading,
  NoDataMessage,
} from "styles/generaliser/table-container";
import { searchUsers, syncLdap } from "services/users/users";
import { formatDate } from "utils/dateConverter";
import Modal from "components/modal";
import Pagination from "components/pagination";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    matricule: "",
    name: "",
    department: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({ users: false, sync: false });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Gestion de l'erreur
  const handleError = useCallback((error) => {
    setAlert({
      show: true,
      type: 'error',
      message: error.message || 'LDAP synchronization failed',
    });
    setIsLoading((prev) => ({ ...prev, sync: false }));
  }, []);

  // Gestion du succès
  const handleSuccess = useCallback((alert) => {
    setAlert({
      ...alert,
      show: true,
      type: 'success',
      message: alert.message || 'LDAP synchronization completed successfully!',
    });
    setIsLoading((prev) => ({ ...prev, sync: false }));
    // Refresh the user list after successful sync
    searchUsers(setUsers, setIsLoading, setTotalEntries, filters, currentPage, pageSize, handleError);
  }, [filters, currentPage, pageSize]);

  // Charger les utilisateurs avec searchUsers
  useEffect(() => {
    searchUsers(setUsers, setIsLoading, setTotalEntries, filters, currentPage, pageSize, handleError);
  }, [currentPage, pageSize, filters, handleError]);

  // Gérer les changements de filtres
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Soumettre les filtres de recherche
  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    searchUsers(setUsers, setIsLoading, setTotalEntries, filters, 1, pageSize, handleError);
  };

  // Réinitialiser les filtres et actualiser
  const handleResetFilters = () => {
    const resetFilters = {
      matricule: "",
      name: "",
      department: "",
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    searchUsers(setUsers, setIsLoading, setTotalEntries, resetFilters, 1, pageSize, handleError);
  };

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // searchUsers is called via useEffect due to currentPage dependency
  };

  // Gérer le changement de taille de page
  const handlePageSizeChange = (event) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1);
    // searchUsers is called via useEffect due to pageSize dependency
  };

  // Synchroniser les utilisateurs
  const handleSync = () => {
    setIsLoading((prev) => ({ ...prev, sync: true }));
    syncLdap(handleSuccess, handleError);
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

      {!isHidden && (
        <FiltersContainer $isMinimized={isMinimized}>
          <FiltersHeader>
            <FiltersTitle>Filtres de Recherche</FiltersTitle>
            <FiltersControls>
              <FilterControlButton
                $isMinimized
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Développer" : "Réduire"}
              >
                {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </FilterControlButton>
              <FilterControlButton $isClose onClick={() => setIsHidden(!isHidden)} title="Fermer">
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
                        <FormLabelSearch>Matricule</FormLabelSearch>
                        <FormInputSearch
                          name="matricule"
                          type="text"
                          value={filters.matricule}
                          onChange={(e) => handleFilterChange("matricule", e.target.value)}
                          placeholder="Recherche par matricule"
                        />
                      </FormFieldCell>

                      <FormFieldCell>
                        <FormLabelSearch>Nom</FormLabelSearch>
                        <FormInputSearch
                          name="name"
                          type="text"
                          value={filters.name}
                          onChange={(e) => handleFilterChange("name", e.target.value)}
                          placeholder="Recherche par nom"
                        />
                      </FormFieldCell>

                      <FormFieldCell>
                        <FormLabelSearch>Département</FormLabelSearch>
                        <FormInputSearch
                          name="department"
                          type="text"
                          value={filters.department}
                          onChange={(e) => handleFilterChange("department", e.target.value)}
                          placeholder="Recherche par département"
                        />
                      </FormFieldCell>
                    </FormRow>
                  </tbody>
                </FormTableSearch>

                <FiltersActions>
                  <ButtonReset type="button" onClick={handleResetFilters}>
                    Réinitialiser
                  </ButtonReset>
                  <ButtonSearch type="submit">Rechercher</ButtonSearch>
                </FiltersActions>
              </form>
            </FiltersSection>
          )}
        </FiltersContainer>
      )}

      {isHidden && (
        <FiltersToggle>
          <ButtonShowFilters type="button" onClick={() => setIsHidden(!isHidden)}>
            <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Afficher les filtres
          </ButtonShowFilters>
        </FiltersToggle>
      )}

      <TableHeader>
        <TableTitle>Liste des Utilisateurs</TableTitle>
        <ButtonSearch onClick={handleSync} disabled={isLoading.sync}>
          <RefreshCw size={16} style={{ marginRight: "var(--spacing-sm)" }} />
          Synchroniser
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
                  <Loading>Chargement...</Loading>
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.matricule || "Non spécifié"}</TableCell>
                  <TableCell>{user.name || "Non spécifié"}</TableCell>
                  <TableCell>{user.email || "Non spécifié"}</TableCell>
                  <TableCell>{user.department || "Non spécifié"}</TableCell>
                  <TableCell>{user.position || "Non spécifié"}</TableCell>
                  <TableCell>{formatDate(user.createdAt) || "Non spécifié"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <NoDataMessage>Aucune donnée trouvée.</NoDataMessage>
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