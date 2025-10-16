/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useMemo, type JSX } from "react";
import { X, ChevronDown, ChevronUp, List, Search, Eye } from "lucide-react";
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
  FormInputSearch,
  FiltersActions,
  ButtonReset,
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
  ButtonSearch,
  ButtonDetails,
} from "@/styles/table-styles";
import { useUsers } from "@/api/users/services";
import { useSearchLogs } from "@/api/logs/services";
import type { LogSearchFilters } from "@/api/logs/services";
import type { User } from "@/api/users/services";
import type { Log } from "@/api/logs/services";
import Alert from "@/components/alert";
import Pagination from "@/components/pagination";
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupContent,
} from "@/styles/popup-styles";
import ProtectedRoute from "@/components/protected-route";

interface UserSuggestion {
  id: string;
  name: string;
  displayName: string;
  matricule: string;
}

interface SuggestionsState {
  users: UserSuggestion[];
}

interface FiltersState {
  userName: string;
  tableName: string;
  action: string;
  minCreatedAt: string;
  maxCreatedAt: string;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error";
  message: string;
}

interface LogDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  log: Log | null;
  userMap: Record<string, string>;
}

const LogDetailsPopup: React.FC<LogDetailsPopupProps> = ({ isOpen, onClose, log, userMap }) => {
  if (!isOpen || !log) return null;

  const { oldValues, newValues } = log;
  const hasChanges = oldValues || newValues;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "Aucun";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  };

  const getDisplayName = (key: string): string => {
    return userMap[key] || key || "Non spécifié";
  };

  const isUserField = (fieldKey: string): boolean => {
    return fieldKey === "UserNames" || fieldKey === "RoleNamesPerUser";
  };

  const renderChanges = () => {
    const oldKeys = oldValues ? Object.keys(oldValues) : [];
    const newKeys = newValues ? Object.keys(newValues) : [];
    const allKeys = [...new Set([...oldKeys, ...newKeys])];

    // Collect simple changes
    const simpleChanges: { field: string; old: string; new: string }[] = [];
    // Collect nested renders
    const nestedRenders: JSX.Element[] = [];

    allKeys.forEach((key) => {
      const oldVal = oldValues?.[key];
      const newVal = newValues?.[key];

      const isNested =
        (oldVal && typeof oldVal === "object" && !Array.isArray(oldVal) && oldVal !== null) ||
        (newVal && typeof newVal === "object" && !Array.isArray(newVal) && newVal !== null);

      if (isNested) {
        const oldSub = oldVal as Record<string, any> || {};
        const newSub = newVal as Record<string, any> || {};
        const allSubKeys = [...new Set([...Object.keys(oldSub), ...Object.keys(newSub)])];

        if (allSubKeys.length === 0) return;

        const table = (
          <div key={key} style={{ marginTop: "var(--spacing-lg)" }}>
            <h4 style={{ margin: "0 0 var(--spacing-md) 0", fontSize: "var(--font-size-md)" }}>
              Changements pour {key}
            </h4>
            <DataTable>
              <thead>
                <tr>
                  <TableHeadCell>Élément</TableHeadCell>
                  <TableHeadCell>Valeur Ancienne</TableHeadCell>
                  <TableHeadCell>Valeur Nouvelle</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {allSubKeys.map((subKey) => {
                  const oldSubVal = oldSub[subKey];
                  const newSubVal = newSub[subKey];
                  const subDisplay = isUserField(key) ? getDisplayName(subKey) : subKey;
                  const oldDisplay = formatValue(oldSubVal);
                  const newDisplay = formatValue(newSubVal);
                  return (
                    <TableRow key={subKey}>
                      <TableCell>{subDisplay}</TableCell>
                      <TableCell>{oldDisplay}</TableCell>
                      <TableCell>{newDisplay}</TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </DataTable>
          </div>
        );
        nestedRenders.push(table);
      } else {
        const oldDisplay = formatValue(oldVal);
        const newDisplay = formatValue(newVal);
        if (oldDisplay === newDisplay && oldDisplay !== "Aucun") return;
        simpleChanges.push({ field: key, old: oldDisplay, new: newDisplay });
      }
    });

    const renders: JSX.Element[] = [];

    if (simpleChanges.length > 0) {
      renders.push(
        <div key="simple-changes" style={{ marginTop: "var(--spacing-lg)" }}>
          <h4 style={{ margin: "0 0 var(--spacing-md) 0", fontSize: "var(--font-size-md)" }}>
            Changements simples
          </h4>
          <DataTable>
            <thead>
              <tr>
                <TableHeadCell>Champ</TableHeadCell>
                <TableHeadCell>Valeur Ancienne</TableHeadCell>
                <TableHeadCell>Valeur Nouvelle</TableHeadCell>
              </tr>
            </thead>
            <tbody>
              {simpleChanges.map(({ field, old, new: newVal }) => (
                <TableRow key={field}>
                  <TableCell>{field}</TableCell>
                  <TableCell>{old}</TableCell>
                  <TableCell>{newVal}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </DataTable>
        </div>
      );
    }

    renders.push(...nestedRenders);

    return renders;
  };

  const changes = renderChanges();
  const hasRenderedChanges = changes.length > 0;

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>Détails du Log - {log.logId}</PopupTitle>
          <PopupClose onClick={onClose}>
            <X size={16} />
          </PopupClose>
        </PopupHeader>
        <PopupContent>
          {hasChanges ? (
            hasRenderedChanges ? (
              changes
            ) : (
              <NoDataMessage>Aucun détail de changement.</NoDataMessage>
            )
          ) : (
            <NoDataMessage>Aucun détail disponible.</NoDataMessage>
          )}
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
};

const LogList: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SuggestionsState>({ users: [] });
  const [displayFilters, setDisplayFilters] = useState<FiltersState>({
    userName: "",
    tableName: "",
    action: "",
    minCreatedAt: "",
    maxCreatedAt: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({
    userName: "",
    tableName: "",
    action: "",
    minCreatedAt: "",
    maxCreatedAt: "",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [detailsPopupOpen, setDetailsPopupOpen] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const { data: allUsersResponse } = useUsers();

  const userMap = useMemo(
    () =>
      Object.fromEntries(
        suggestions.users.map((u: UserSuggestion) => [u.id, u.displayName])
      ),
    [suggestions.users]
  );

  const searchFilters: LogSearchFilters = {
    userId: suggestions.users.find((u) => u.displayName === appliedFilters.userName)?.id || undefined,
    tableName: appliedFilters.tableName || undefined,
    action: appliedFilters.action || undefined,
    minCreatedAt: appliedFilters.minCreatedAt || null,
    maxCreatedAt: appliedFilters.maxCreatedAt || null,
  };

  const { data: searchResponse, isLoading: isLogsLoading } = useSearchLogs(
    searchFilters,
    currentPage,
    pageSize
  );

  const actionSuggestions = ["Créer", "Lire", "Mettre à jour", "Supprimer"];
  const userNameSuggestions = suggestions.users
    .filter((u) =>
      !displayFilters.userName || u.displayName.toLowerCase().includes(displayFilters.userName.toLowerCase())
    )
    .map((u) => u.displayName);

  const hasFilters: boolean = Object.values(appliedFilters).some((val: string) => (val || "").trim() !== "");

  const handleUserNameChange = (value: string): void => {
    setDisplayFilters((prev) => ({ ...prev, userName: value }));
  };

  const handleTableNameChange = (value: string): void => {
    setDisplayFilters((prev) => ({ ...prev, tableName: value }));
  };

  const handleActionChange = (value: string): void => {
    setDisplayFilters((prev) => ({ ...prev, action: value }));
  };

  const handleMinCreatedAtChange = (value: string): void => {
    setDisplayFilters((prev) => ({ ...prev, minCreatedAt: value }));
  };

  const handleMaxCreatedAtChange = (value: string): void => {
    setDisplayFilters((prev) => ({ ...prev, maxCreatedAt: value }));
  };

  const handleSearch = (): void => {
    setAppliedFilters(displayFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = (): void => {
    setDisplayFilters({
      userName: "",
      tableName: "",
      action: "",
      minCreatedAt: "",
      maxCreatedAt: "",
    });
    setAppliedFilters({
      userName: "",
      tableName: "",
      action: "",
      minCreatedAt: "",
      maxCreatedAt: "",
    });
    setCurrentPage(1);
    setAlert({ isOpen: true, type: "info", message: "Filtres réinitialisés." });
  };

  const handleDetailsClick = (log: Log): void => {
    setSelectedLog(log);
    setDetailsPopupOpen(true);
  };

  const handleCloseDetails = (): void => {
    setDetailsPopupOpen(false);
    setSelectedLog(null);
  };

  useEffect(() => {
    if (searchResponse && searchResponse.status !== 200) {
      setAlert({
        isOpen: true,
        type: "error",
        message: searchResponse.message || "Erreur lors de la recherche de logs",
      });
    }
  }, [searchResponse]);

  useEffect(() => {
    if (allUsersResponse) {
      if (allUsersResponse.status === 200 && allUsersResponse.data) {
        const mappedUsers: UserSuggestion[] = (allUsersResponse.data || []).map((user: User) => ({
          id: user.userId,
          name: user.name || "Non spécifié",
          displayName: user.name || "Non spécifié",
          matricule: user.matricule || "",
        }));
        setSuggestions({ users: mappedUsers });
      } else {
        setAlert({
          isOpen: true,
          type: "error",
          message: allUsersResponse.message || "Erreur lors du chargement des suggestions",
        });
      }
    }
  }, [allUsersResponse]);

  const logs = searchResponse?.data?.logs || [];
  const totalEntries = searchResponse?.data?.totalCount || 0;

  const fieldCellStyle = (width: string) => ({
    width,
    padding: "0 var(--spacing-md)",
  });

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      <LogDetailsPopup
        isOpen={detailsPopupOpen}
        onClose={handleCloseDetails}
        log={selectedLog}
        userMap={userMap}
      />
      {/* === SECTION FILTRES === */}
      {!isHidden && (
        <FiltersContainer $isMinimized={isMinimized}>
          <FiltersHeader>
            <FiltersTitle>Filtres</FiltersTitle>
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
              <FormTableSearch>
                <tbody>
                  <FormRow>
                    {/* Champ Utilisateur */}
                    <FormFieldCell style={fieldCellStyle("33.33%")}>
                      <FormLabelSearch>Utilisateur</FormLabelSearch>
                      <StyledAutoCompleteInput
                        value={displayFilters.userName || ""}
                        onChange={handleUserNameChange}
                        suggestions={userNameSuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner un utilisateur..."
                        disabled={isLogsLoading}
                        fieldType="user"
                        fieldLabel="utilisateur"
                        showAddOption={false}
                      />
                    </FormFieldCell>
                    {/* Champ Nom de la table */}
                    <FormFieldCell style={fieldCellStyle("33.33%")}>
                      <FormLabelSearch>Nom de la table</FormLabelSearch>
                      <FormInputSearch
                        type="text"
                        value={displayFilters.tableName || ""}
                        onChange={(e) => handleTableNameChange(e.target.value)}
                        disabled={isLogsLoading}
                        placeholder="Nom de la table..."
                      />
                    </FormFieldCell>
                    {/* Champ Action */}
                    <FormFieldCell style={fieldCellStyle("33.33%")}>
                      <FormLabelSearch>Action</FormLabelSearch>
                      <StyledAutoCompleteInput
                        value={displayFilters.action || ""}
                        onChange={handleActionChange}
                        suggestions={actionSuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner une action..."
                        disabled={isLogsLoading}
                        fieldType="action"
                        fieldLabel="action"
                        showAddOption={false}
                      />
                    </FormFieldCell>
                  </FormRow>
                  <FormRow style={{ marginTop: "var(--spacing-md)" }}>
                    {/* Champ Date min */}
                    <FormFieldCell style={fieldCellStyle("50%")}>
                      <FormLabelSearch>Date minimale</FormLabelSearch>
                      <FormInputSearch
                        type="date"
                        value={displayFilters.minCreatedAt || ""}
                        onChange={(e) => handleMinCreatedAtChange(e.target.value)}
                        disabled={isLogsLoading}
                      />
                    </FormFieldCell>
                    {/* Champ Date max */}
                    <FormFieldCell style={fieldCellStyle("50%")}>
                      <FormLabelSearch>Date maximale</FormLabelSearch>
                      <FormInputSearch
                        type="date"
                        value={displayFilters.maxCreatedAt || ""}
                        onChange={(e) => handleMaxCreatedAtChange(e.target.value)}
                        disabled={isLogsLoading}
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
                  disabled={!hasFilters || isLogsLoading}
                  title="Effacer"
                >
                  Effacer
                </ButtonReset>
                <ButtonSearch
                  type="button"
                  onClick={handleSearch}
                  disabled={isLogsLoading}
                  title="Rechercher"
                >
                  <Search size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                  Rechercher
                </ButtonSearch>
              </FiltersActions>
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
          </div>
        </TableHeader>
        <div className="table-wrapper">
          <DataTable>
            <thead>
              <tr>
                <TableHeadCell>Adresse Ip</TableHeadCell>
                <TableHeadCell>Action</TableHeadCell>
                <TableHeadCell>Table</TableHeadCell>
                <TableHeadCell>Utilisateur</TableHeadCell>
                <TableHeadCell>Date</TableHeadCell>
                <TableHeadCell>Détails</TableHeadCell>
              </tr>
            </thead>
            <tbody>
              {isLogsLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Loading>Chargement des données...</Loading>
                  </TableCell>
                </TableRow>
              ) : logs.length > 0 ? (
                logs.map((log, index) => (
                  <TableRow key={`${log.logId}-${index}`}>
                    <TableCell>{log.ipAddress || "Non spécifié"}</TableCell>
                    <TableCell>{log.action || "Non spécifié"}</TableCell>
                    <TableCell>{log.tableName || "Non spécifié"}</TableCell>
                    <TableCell>{log.user?.name || "Non spécifié"}</TableCell>
                    <TableCell>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString("fr-FR") : "Non spécifié"}
                    </TableCell>
                    <TableCell>
                      {log.oldValues || log.newValues ? (
                        <ButtonDetails
                          type="button"
                          onClick={() => handleDetailsClick(log)}
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </ButtonDetails>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <NoDataMessage>
                      {hasFilters
                        ? "Aucun log ne correspond aux critères."
                        : "Aucun log trouvé."}
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
        onPageSizeChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setPageSize(Number(e.target.value))
        }
      />
    </>
  );
};

const ProtectedLogList: React.FC = () => (
  <ProtectedRoute requiredHabilitation="voir page logs">
    <LogList />
  </ProtectedRoute>
);

export default ProtectedLogList;