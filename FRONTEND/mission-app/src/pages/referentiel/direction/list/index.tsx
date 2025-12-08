"use client";
import { useState, useMemo, useCallback } from "react";
import { Plus, Edit, Trash2, Search, Filter, X, ChevronDown, ChevronUp, List } from "lucide-react";
import {
  TableContainer,
  DataTable,
  TableTitle,
  TableHeader,
  TableHeadCell,
  TableRow,
  TableCell,
  EditButton,
  CancelButton,
  ButtonSearch,
  FiltersContainer,
  FiltersHeader,
  FiltersTitle,
  FiltersControls,
  FilterControlButton,
  FiltersSection,
  FormLabelSearch,
  FormInputSearch,
  Separator,
  FiltersActions,
  ButtonReset,
  Loading,
  NoDataMessage,
  FiltersToggle,
  ButtonShowFilters,
  FormFieldCell,
} from "@/styles/table-styles";
import styled from "styled-components";
import { useGetDirections, useDeleteDirection } from "@/api/direction/services";
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import Pagination from "@/components/pagination";
import DirectionForm from "../form/index";
import type { Direction } from "@/api/direction/services";

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

interface FiltersState {
  name: string;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const DirectionList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [directionToDelete, setDirectionToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);

  const [filters, setFilters] = useState<FiltersState>({ name: "" });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({ name: "" });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const searchName = appliedFilters.name.trim() || undefined;
  const { data: searchResponse, isLoading, error, refetch } = useGetDirections(searchName, page, pageSize);
  const deleteDirectionMutation = useDeleteDirection();

  const directions = searchResponse?.data || [];

  const hasFilters = useMemo(() => {
    return Object.values(filters).some((val) => (val || "").trim() !== "");
  }, [filters]);

  const totalCountMemo = useMemo(() => searchResponse?.totalCount || 0, [searchResponse]);

  const handleAddClick = useCallback(() => {
    setSelectedDirection(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClick = useCallback((direction: Direction) => {
    setSelectedDirection(direction);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((directionId: string) => {
    setDirectionToDelete(directionId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (directionToDelete) {
      deleteDirectionMutation.mutate(directionToDelete, {
        onSuccess: () => {
          setAlert({ isOpen: true, type: "success", message: "Direction supprimée avec succès." });
          setIsDeleteModalOpen(false);
          refetch();
        },
        onError: () => {
          setAlert({ isOpen: true, type: "error", message: "Erreur lors de la suppression de la direction." });
        },
      });
    }
  }, [directionToDelete, deleteDirectionMutation, refetch]);

  const handleFormSuccess = useCallback((message: string) => {
    setIsFormOpen(false);
    setAlert({ isOpen: true, type: "success", message });
    refetch();
  }, [refetch]);

  const handleFilterSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setAppliedFilters(filters);
    setPage(1);
  }, [filters]);

  const handleResetFilters = useCallback((): void => {
    const resetFilters: FiltersState = { name: "" };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPage(1);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  }, []);

  if (error) return <div>Une erreur est survenue.</div>;

  if (isHidden) {
    return (
      <FiltersToggle>
        <ButtonShowFilters type="button" onClick={() => setIsHidden(false)}>
          <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
          Afficher les filtres
        </ButtonShowFilters>
      </FiltersToggle>
    );
  }

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      {isFormOpen && (
        <DirectionForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onFormSuccess={handleFormSuccess}
          direction={selectedDirection}
        />
      )}
      {isDeleteModalOpen && (
        <Modal
          type="error"
          message="Voulez-vous vraiment supprimer cet élément ?"
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirmer la suppression"
          confirmAction={handleConfirmDelete}
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          showActions={true}
        />
      )}
      
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
              <FilterGrid>
                <FormFieldCell as="div">
                  <FormLabelSearch>Nom</FormLabelSearch>
                  <FormInputSearch
                    type="text"
                    value={filters.name}
                    onChange={handleNameChange}
                    placeholder="Rechercher par nom..."
                    disabled={isLoading}
                  />
                </FormFieldCell>
              </FilterGrid>
              
              <Separator />
              
              <FiltersActions>
                <ButtonReset
                  type="button"
                  onClick={handleResetFilters}
                  disabled={!hasFilters || isLoading}
                  title="Effacer filtre"
                >
                  <X size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                  Effacer filtres
                </ButtonReset>
                <ButtonSearch type="submit" disabled={isLoading} title="Rechercher">
                  <Search size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                  Rechercher
                </ButtonSearch>
              </FiltersActions>
            </form>
          </FiltersSection>
        )}
      </FiltersContainer>
      
      <TableContainer>
        <TableHeader>
          <TableTitle>Directions</TableTitle>
          <ButtonSearch title="Ajouter" onClick={handleAddClick}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Ajouter
          </ButtonSearch>
        </TableHeader>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Nom</TableHeadCell>
              <TableHeadCell>Acronyme</TableHeadCell>
              <TableHeadCell style={{ width: "100px", textAlign: "center" }}>Actions</TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <Loading>Chargement des données...</Loading>
                </TableCell>
              </TableRow>
            ) : directions.length > 0 ? (
              directions.map((direction) => (
                <TableRow key={direction.directionId}>
                  <TableCell>{direction.directionName}</TableCell>
                  <TableCell>{direction.acronym}</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <EditButton onClick={() => handleEditClick(direction)}>
                      <Edit size={16} />
                    </EditButton>
                    <CancelButton onClick={() => handleDeleteClick(direction.directionId)}>
                      <Trash2 size={16} />
                    </CancelButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>
                  <NoDataMessage>
                    {hasFilters ? "Aucune direction ne correspond aux critères." : "Aucune direction trouvée."}
                  </NoDataMessage>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </DataTable>
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalEntries={totalCountMemo}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </TableContainer>
    </>
  );
};

export default DirectionList;