"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, RefreshCw, X, List } from "lucide-react";
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
  const [suggestions, setSuggestions] = useState({ users: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({ users: false, sync: false });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const hasFilters = Object.values(filters).some(val => (val || "").trim() !== "");

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
      () => {},
      (error) => setAlert(error)
    );
  }, []);

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

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    const updatedFilters = { ...filters };
    setFilters(updatedFilters);
    setAppliedFilters(updatedFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const resetFilters = { matricule: "", name: "", department: "", status: "" };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
    setAlert({ isOpen: true, type: "info", message: "Filtres réinitialisés." });
  };

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
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
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
                    {/* Affiche les deux champs sur la même ligne */}
                    <FormRow>
                      {/* Champ Matricule */}
                      <FormFieldCell style={{ width: "50%" }}>
                        <FormLabelSearch>Matricule</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.matricule || ""}
                          onChange={(value) => setFilters((prev) => ({ ...prev, matricule: value }))}
                          onSelect={(value) => {
                            const selectedUser = suggestions.users.find(
                              (user) => user.matricule === value
                            );
                            setFilters((prev) => ({
                              ...prev,
                              matricule: selectedUser ? selectedUser.matricule : value,
                            }));
                          }}
                          suggestions={suggestions.users
                            .filter((user) =>
                              user.matricule
                                ?.toLowerCase()
                                .includes(filters.matricule?.toLowerCase() || "")
                            )
                            .map((user) => user.matricule)}
                          maxVisibleItems={5}
                          placeholder="Rechercher par matricule..."
                          disabled={isLoading.users || isLoading.sync}
                          fieldType="user"
                          fieldLabel="matricule"
                          showAddOption={false}
                        />
                      </FormFieldCell>

                      {/* Champ Nom */}
                      <FormFieldCell style={{ width: "50%" }}>
                        <FormLabelSearch>Nom</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.name || ""}
                          onChange={(value) => setFilters((prev) => ({ ...prev, name: value }))}
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
                              user.displayName
                                .toLowerCase()
                                .includes(filters.name?.toLowerCase() || "")
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

                <Separator />

                <FiltersActions>
                  <ButtonReset
                    type="button"
                    onClick={handleResetFilters}
                    disabled={!hasFilters || isLoading.users || isLoading.sync}
                    title="Effacer"
                  >
                    Effacer
                  </ButtonReset>

                  <ButtonSearch
                    type="submit"
                    disabled={isLoading.users || isLoading.sync}
                    title="Rechercher"
                  >
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
          <TableTitle>Liste</TableTitle>
          <ButtonSearch onClick={handleSync} disabled={isLoading.sync} title="Actualiser">
            <RefreshCw size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            {isLoading.sync ? "..." : "Actualiser"}
          </ButtonSearch>
        </TableHeader>

        <div className="table-wrapper">
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
                    <TableCell>{formatDate(user.createdAt) || "Non spécifié"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
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
      </TableContainer>

      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalEntries={totalEntries}
        onPageChange={setCurrentPage}
        onPageSizeChange={(e) => setPageSize(Number(e.target.value))}
      />
    </>
  );
};

export default UserList;