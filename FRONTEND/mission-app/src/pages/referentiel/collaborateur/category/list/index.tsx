"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
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
  FiltersSection,
  FormTableSearch,
  FormRow,
  FormFieldCell,
  FormLabelSearch,
  FormInputSearch,
  Separator,
  FiltersActions,
  ButtonReset,
  Loading,
  NoDataMessage,
} from "@/styles/table-styles";
import { useGetAllCollaboratorCategories, useDeleteCollaboratorCategory } from "@/api/collaborator/category/services";
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import Pagination from "@/components/pagination";
import CollaboratorCategoryForm from "../form/index";
import type { CollaboratorCategory } from "@/api/collaborator/category/services";

interface FiltersState {
  search: string;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const CollaboratorCategoryList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedCollaboratorCategory, setSelectedCollaboratorCategory] = useState<CollaboratorCategory | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [collaboratorCategoryToDelete, setCollaboratorCategoryToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });

  const [filters, setFilters] = useState<FiltersState>({ search: "" });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({ search: "" });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { data: response, isLoading, error, refetch } = useGetAllCollaboratorCategories();
  const deleteCollaboratorCategoryMutation = useDeleteCollaboratorCategory();

  const allCollaboratorCategories = useMemo(() => response?.data || [], [response]);

  const searchTerm = appliedFilters.search.trim();

  const filteredCategories = useMemo(() => {
    let categories = allCollaboratorCategories;
    if (searchTerm) {
      categories = categories.filter(category =>
        category.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Trier les catégories par code (ordre numérique croissant)
    return categories.sort((a, b) => parseInt(a.code) - parseInt(b.code));
  }, [allCollaboratorCategories, searchTerm]);

  const paginatedCategories = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredCategories.slice(startIndex, startIndex + pageSize);
  }, [filteredCategories, page, pageSize]);

  const hasFilters = appliedFilters.search.trim() !== "";

  useEffect(() => {
    setTotalCount(filteredCategories.length);
  }, [filteredCategories]);

  const handleAddClick = useCallback(() => {
    setSelectedCollaboratorCategory(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClick = useCallback((collaboratorCategory: CollaboratorCategory) => {
    setSelectedCollaboratorCategory(collaboratorCategory);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((collaboratorCategoryId: string) => {
    setCollaboratorCategoryToDelete(collaboratorCategoryId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (collaboratorCategoryToDelete) {
      // Temporarily remove the item from the list
      deleteCollaboratorCategoryMutation.mutate(collaboratorCategoryToDelete, {
        onSuccess: () => {
          setAlert({ isOpen: true, type: "success", message: "Catégorie de collaborateur supprimée avec succès." });
          setIsDeleteModalOpen(false);
          refetch();
        },
        onError: () => {
          setAlert({ isOpen: true, type: "error", message: "Erreur lors de la suppression de la catégorie de collaborateur." });
        },
      });
    }
  }, [collaboratorCategoryToDelete, deleteCollaboratorCategoryMutation, refetch]);

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
    const resetFilters: FiltersState = { search: "" };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  }, []);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  }, []);

  if (error) return <div>Une erreur est survenue.</div>;

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      {isFormOpen && (
        <CollaboratorCategoryForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onFormSuccess={handleFormSuccess}
          collaboratorCategory={selectedCollaboratorCategory}
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
      <FiltersContainer>
        <FiltersHeader>
          <FiltersTitle>Filtre</FiltersTitle>
        </FiltersHeader>
        <FiltersSection>
          <Separator />
          <form onSubmit={handleFilterSubmit}>
            <FormTableSearch>
              <tbody>
                <FormRow>
                  <FormFieldCell style={{ width: "100%" }}>
                    <FormLabelSearch>Rechercher</FormLabelSearch>
                    <FormInputSearch
                      type="text"
                      value={filters.search}
                      onChange={handleSearchChange}
                      placeholder="Rechercher par code ou libellé..."
                      disabled={isLoading}
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
                disabled={!hasFilters || isLoading}
                title="Effacer filtre"
              >
                Effacer filtres
              </ButtonReset>
              <ButtonSearch type="submit" disabled={isLoading} title="Rechercher">
                <Search size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                Rechercher
              </ButtonSearch>
            </FiltersActions>
          </form>
        </FiltersSection>
      </FiltersContainer>
      <TableContainer>
        <TableHeader>
          <TableTitle>Catégories de Collaborateurs</TableTitle>
          <ButtonSearch title="Ajouter" onClick={handleAddClick}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Ajouter
        </ButtonSearch>
        </TableHeader>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Code</TableHeadCell>
              <TableHeadCell>Libellé</TableHeadCell>
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
            ) : paginatedCategories.length > 0 ? (
              paginatedCategories.map((collaboratorCategory) => (
                <TableRow key={collaboratorCategory.employeeCategoryId}>
                  <TableCell>{collaboratorCategory.code}</TableCell>
                  <TableCell>{collaboratorCategory.label}</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <EditButton onClick={() => handleEditClick(collaboratorCategory)}>
                      <Edit size={16} />
                    </EditButton>
                    <CancelButton onClick={() => handleDeleteClick(collaboratorCategory.employeeCategoryId)}>
                      <Trash2 size={16} />
                    </CancelButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>
                  <NoDataMessage>
                    {hasFilters ? "Aucune catégorie de collaborateur ne correspond aux critères." : "Aucune catégorie de collaborateur trouvée."}
                  </NoDataMessage>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </DataTable>
        <Pagination
        currentPage={page}
        pageSize={pageSize}
        totalEntries={totalCount}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />
      </TableContainer>
      
    </>
  );
};

export default CollaboratorCategoryList;