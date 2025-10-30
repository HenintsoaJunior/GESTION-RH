"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, ChevronUp, X, List, Search } from "lucide-react";
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
  FormInputSearch,
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
} from "@/styles/table-styles";
import { useHabilitationsPaginated } from "@/api/access/services";
import type { Habilitation } from "@/api/access/services";
import Alert from "@/components/alert";
import Pagination from "@/components/pagination";
import ProtectedRoute from "@/components/protected-route";

interface FiltersState {
  search: string;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const HabilitationList: React.FC = () => {
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({
    search: "",
  });
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { data: searchResponse, isLoading: isSearchLoading } = useHabilitationsPaginated(
    page,
    pageSize,
    appliedFilters.search
  );

  const habilitations = useMemo(() => searchResponse?.data?.items || [], [searchResponse?.data?.items]);

  const hasFilters: boolean = Object.values({ 
    ...filters, 
    search: filters.search || "",
  }).some((val) => (val || "").trim() !== "");

  const handleFilterSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setAppliedFilters(filters);
    setPage(1);
  }, [filters]);

  const handleResetFilters = useCallback((): void => {
    const resetFilters: FiltersState = {
      search: "",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setAlert({ isOpen: true, type: "info", message: "Filtres réinitialisés." });
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  }, []);

  useEffect(() => {
    if (searchResponse) {
      if (searchResponse.status === 200 && searchResponse.data) {
        setTotalCount(searchResponse.data.total || 0);
      } else {
        setTotalCount(0);
        setAlert({
          isOpen: true,
          type: "error",
          message: searchResponse.message || "Erreur lors du chargement des habilitations",
        });
      }
    }
  }, [searchResponse]);

  const appliedFiltersStr = useMemo(() => JSON.stringify(appliedFilters), [appliedFilters]);

  useEffect(() => {
    setPage(1);
  }, [appliedFiltersStr]);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  }, []);

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

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
                      <FormFieldCell style={{ width: "100%" }}>
                        <FormLabelSearch>Nom (Label)</FormLabelSearch>
                        <FormInputSearch
                          type="text"
                          value={filters.search || ""}
                          onChange={handleSearchChange}
                          placeholder="Rechercher par nom..."
                          disabled={isSearchLoading}
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
                    disabled={!hasFilters || isSearchLoading}
                    title="Effacer"
                  >
                    Effacer filtres
                  </ButtonReset>
                  <ButtonSearch type="submit" disabled={isSearchLoading} title="Rechercher">
                    <Search size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                    Rechercher
                  </ButtonSearch>
                </FiltersActions>
              </form>
            </FiltersSection>
          )}
        </FiltersContainer>
      )}

      {isHidden && (
        <FiltersToggle>
          <ButtonShowFilters type="button" onClick={() => setIsHidden(false)}>
            <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Afficher les filtres
          </ButtonShowFilters>
        </FiltersToggle>
      )}

      <TableContainer>
        <TableHeader>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
            <TableTitle>Liste</TableTitle>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
            {/* Ajouter un bouton pour créer si permission */}
          </div>
        </TableHeader>

        <div className="table-wrapper" style={{ overflowX: "auto" }}>
          <DataTable>
            <thead>
              <tr>
                <TableHeadCell>ID</TableHeadCell>
                <TableHeadCell>Label</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
              </tr>
            </thead>
            <tbody>
              {isSearchLoading ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Loading>Chargement des données...</Loading>
                  </TableCell>
                </TableRow>
              ) : habilitations.length > 0 ? (
                habilitations.map((habilitation: Habilitation) => (
                  <TableRow
                    key={habilitation.habilitationId}
                  >
                    <TableCell>{habilitation.habilitationId}</TableCell>
                    <TableCell>{habilitation.label}</TableCell>
                    <TableCell>{habilitation.description}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>
                    <NoDataMessage>
                      {Object.values(appliedFilters).some(Boolean) ? "Aucune habilitation ne correspond aux critères." : "Aucune habilitation trouvée."}
                    </NoDataMessage>
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </DataTable>
        </div>
      </TableContainer>
      <Pagination
        currentPage={page}
        pageSize={pageSize}
        totalEntries={totalCount}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
};

const ProtectedHabilitationList: React.FC = () => (
  <ProtectedRoute requiredHabilitation="voir page access">
    <HabilitationList />
  </ProtectedRoute>
);

export default ProtectedHabilitationList;