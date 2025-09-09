"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, X, List } from "lucide-react";
import { formatDateTime } from "utils/dateConverter";
import Alert from "components/alert";
import Pagination from "components/pagination";
import { fetchLogs } from "services/logs/logs";
import { fetchAllUsers } from "services/users/users";
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
  StyledAutoCompleteInput,
  FiltersActions,
  ButtonReset,
  ButtonSearch,
  FiltersToggle,
  ButtonShowFilters,
  TableContainer,
  DataTable,
  TableHeader,
  TableTitle,
  TableRow,
  TableCell,
  TableHeadCell,
  Loading,
  NoDataMessage,
} from "styles/generaliser/table-container";
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupContent,
  ButtonPrimary,
  PopupActions
} from "styles/generaliser/popup-container";

// New LogDetailsPopup Component
const LogDetailsPopup = ({ isOpen, onClose, oldValues, newValues }) => {
  if (!isOpen) return null;

  // Parse JSON strings to objects, handling potential errors
  const parseJson = (value) => {
    try {
      return JSON.parse(value || "{}");
    } catch {
      return {};
    }
  };

  const oldData = parseJson(oldValues);
  const newData = parseJson(newValues);

  // Combine keys from both old and new values for consistent table rendering
  const allKeys = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])];

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>Détails du Log</PopupTitle>
          <PopupClose onClick={onClose}>
            ×
          </PopupClose>
        </PopupHeader>
        <PopupContent>
          <DataTable>
            <thead>
              <tr>
                <TableHeadCell>Champ</TableHeadCell>
                <TableHeadCell>Ancienne Valeur</TableHeadCell>
                <TableHeadCell>Nouvelle Valeur</TableHeadCell>
              </tr>
            </thead>
            <tbody>
              {allKeys.length > 0 ? (
                allKeys.map((key) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>{oldData[key] || "Aucune"}</TableCell>
                    <TableCell>{newData[key] || "Aucune"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>
                    <NoDataMessage>Aucune donnée disponible</NoDataMessage>
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </DataTable>
        </PopupContent>
        <PopupActions>
          <ButtonPrimary type="button" onClick={onClose}>
            Fermer
          </ButtonPrimary>
        </PopupActions>
      </PagePopup>
    </PopupOverlay>
  );
};

const LogList = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: "",
    tableName: "",
    userId: "",
    userName: "",
    minCreatedAt: "",
    maxCreatedAt: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });
  const [suggestions, setSuggestions] = useState({
    users: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({
    logs: false,
    users: false,
  });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null); // State for popup

  // Fetch users for autocomplete suggestions
  useEffect(() => {
    fetchAllUsers(
      (data) => {
        setSuggestions((prev) => ({
          ...prev,
          users: data.map((user) => ({
            id: user.userId,
            name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Non spécifié",
            displayName: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Non spécifié",
          })),
        }));
      },
      setIsLoading,
      (total) => {}, // setTotalEntries not needed for suggestions
      (error) => setAlert(error)
    );
  }, []);

  // Fetch logs when filters or pagination change
  useEffect(() => {
    fetchLogs(
      setLogs,
      setIsLoading,
      setTotalEntries,
      {
        action: appliedFilters.action || "",
        tableName: appliedFilters.tableName || "",
        userId: appliedFilters.userId || "",
        minCreatedAt: appliedFilters.minCreatedAt || "",
        maxCreatedAt: appliedFilters.maxCreatedAt || "",
      },
      currentPage,
      pageSize,
      (error) => setAlert(error)
    );
  }, [appliedFilters, currentPage, pageSize]);

  // Handle filter input changes
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle filter form submission
  const handleFilterSubmit = (event) => {
    event.preventDefault();
    let updatedFilters = { ...filters };

    // Validate and set userId based on userName
    if (filters.userName && !filters.userId) {
      const selectedUser = suggestions.users.find(
        (user) => user.displayName === filters.userName
      );
      if (!selectedUser) {
        setAlert({
          isOpen: true,
          type: "error",
          message: "Veuillez sélectionner un utilisateur valide dans la liste des suggestions.",
        });
        return;
      }
      updatedFilters.userId = selectedUser.id;
      updatedFilters.userName = selectedUser.displayName;
    }

    setFilters(updatedFilters);
    setAppliedFilters(updatedFilters);
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      action: "",
      tableName: "",
      userId: "",
      userName: "",
      minCreatedAt: "",
      maxCreatedAt: "",
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

  // Handle details button click
  const handleDetailsClick = (log) => {
    setSelectedLog(log);
  };

  // Close popup
  const handleClosePopup = () => {
    setSelectedLog(null);
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
                        <FormLabelSearch>Action</FormLabelSearch>
                        <FormInputSearch
                          name="action"
                          type="text"
                          value={filters.action}
                          onChange={(e) => handleFilterChange("action", e.target.value)}
                          placeholder="Saisir l'action..."
                          disabled={isLoading.logs}
                        />
                      </FormFieldCell>

                      <FormFieldCell>
                        <FormLabelSearch>Nom de la table</FormLabelSearch>
                        <FormInputSearch
                          name="tableName"
                          type="text"
                          value={filters.tableName}
                          onChange={(e) => handleFilterChange("tableName", e.target.value)}
                          placeholder="Saisir le nom de la table..."
                          disabled={isLoading.logs}
                        />
                      </FormFieldCell>

                      <FormFieldCell>
                        <FormLabelSearch>Utilisateur</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.userName || ""}
                          onChange={(value) => {
                            setFilters((prev) => ({
                              ...prev,
                              userName: value,
                              userId: value ? prev.userId : "",
                            }));
                          }}
                          onSelect={(value) => {
                            const selectedUser = suggestions.users.find(
                              (user) => user.displayName === value
                            );
                            setFilters((prev) => ({
                              ...prev,
                              userId: selectedUser ? selectedUser.id : "",
                              userName: selectedUser ? selectedUser.displayName : value,
                            }));
                          }}
                          suggestions={suggestions.users
                            .filter((user) =>
                              user.displayName.toLowerCase().includes(filters.userName?.toLowerCase() || "")
                            )
                            .map((user) => user.displayName)}
                          maxVisibleItems={5}
                          placeholder="Rechercher par utilisateur..."
                          disabled={isLoading.users || isLoading.logs}
                          fieldType="user"
                          fieldLabel="utilisateur"
                          showAddOption={false}
                        />
                      </FormFieldCell>

                      <FormFieldCell>
                        <FormLabelSearch>Date de création min</FormLabelSearch>
                        <FormInputSearch
                          name="minCreatedAt"
                          type="date"
                          value={filters.minCreatedAt}
                          onChange={(e) => handleFilterChange("minCreatedAt", e.target.value)}
                          disabled={isLoading.logs}
                        />
                      </FormFieldCell>

                      <FormFieldCell>
                        <FormLabelSearch>Date de création max</FormLabelSearch>
                        <FormInputSearch
                          name="maxCreatedAt"
                          type="date"
                          value={filters.maxCreatedAt}
                          onChange={(e) => handleFilterChange("maxCreatedAt", e.target.value)}
                          disabled={isLoading.logs}
                        />
                      </FormFieldCell>
                    </FormRow>
                  </tbody>
                </FormTableSearch>

                <FiltersActions>
                  <ButtonReset type="button" onClick={handleResetFilters} disabled={isLoading.logs}>
                    Réinitialiser
                  </ButtonReset>
                  <ButtonSearch type="submit" disabled={isLoading.logs}>
                    {isLoading.logs ? "Recherche..." : "Rechercher"}
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
        <TableTitle>Liste des Logs</TableTitle>
      </TableHeader>

      <TableContainer>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>ID Log</TableHeadCell>
              <TableHeadCell>Action</TableHeadCell>
              <TableHeadCell>Nom de la table</TableHeadCell>
              <TableHeadCell>Utilisateur</TableHeadCell>
              
              <TableHeadCell>Date</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {isLoading.logs ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Loading>Chargement des données...</Loading>
                </TableCell>
              </TableRow>
            ) : logs.length > 0 ? (
              logs.map((log, index) => (
                <TableRow
                  key={`${log.logId}-${index}`}
                >
                  <TableCell>{log.logId || "Non spécifié"}</TableCell>
                  <TableCell>{log.action || "Non spécifié"}</TableCell>
                  <TableCell>{log.tableName || "Non spécifié"}</TableCell>
                  <TableCell>{log.user.name || "Non spécifié"}</TableCell>
                  <TableCell>{formatDateTime(log.createdAt) || "Non spécifié"}</TableCell>
                  <TableCell>
                    {(log.oldValues || log.newValues) && (
                      <ButtonPrimary
                        type="button"
                        onClick={() => handleDetailsClick(log)}
                      >
                        Détails
                      </ButtonPrimary>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>
                  <NoDataMessage>
                    {appliedFilters.action ||
                    appliedFilters.tableName ||
                    appliedFilters.userId ||
                    appliedFilters.minCreatedAt ||
                    appliedFilters.maxCreatedAt
                      ? "Aucun log ne correspond aux critères de recherche."
                      : "Aucun log trouvé."}
                  </NoDataMessage>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </DataTable>
      </TableContainer>

      <LogDetailsPopup
        isOpen={!!selectedLog}
        onClose={handleClosePopup}
        oldValues={selectedLog?.oldValues}
        newValues={selectedLog?.newValues}
      />

      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalEntries={totalEntries}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        disabled={isLoading.logs}
      />
    </DashboardContainer>
  );
};

export default LogList;