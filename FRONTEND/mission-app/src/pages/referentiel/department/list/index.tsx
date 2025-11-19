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
  StyledAutoCompleteInput,
  Separator,
  FiltersActions,
  ButtonReset,
  Loading,
  NoDataMessage,
} from "@/styles/table-styles";
import { useGetDepartments, useDeleteDepartment } from "@/api/department/services";
import { useGetAllDirections } from "@/api/direction/services";

import Alert from "@/components/alert";
import Modal from "@/components/modal";
import Pagination from "@/components/pagination";
import DepartmentForm from "../form/index";
import type { Department } from "@/api/department/services";
import type { Direction } from "@/api/direction/services";

interface FiltersState {
  name: string;
  directionSearch?: string;
  selectedDirection?: Direction | null;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const DepartmentList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });

  const [filters, setFilters] = useState<FiltersState>({ name: "", directionSearch: "", selectedDirection: null });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({ name: "", directionSearch: "", selectedDirection: null });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { data: allDirectionsResponse } = useGetAllDirections();
  const directions = useMemo(() => allDirectionsResponse?.data || [], [allDirectionsResponse]);

  const directionSuggestions = useMemo(() => directions.map((dir: Direction) => dir.directionName), [directions]);

  const filteredDirectionSuggestions = useMemo(() =>
    directionSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.directionSearch || "").toLowerCase())
    ),
    [directionSuggestions, filters.directionSearch]
  );

  const searchName = appliedFilters.name.trim() || undefined;
  const searchDirectionId = appliedFilters.selectedDirection?.directionId || undefined;
  const { data: searchResponse, isLoading, error, refetch } = useGetDepartments(searchName, searchDirectionId, page, pageSize);
  const deleteDepartmentMutation = useDeleteDepartment();

  const departments = useMemo(() => searchResponse?.data || [], [searchResponse]);

  const hasFilters = appliedFilters.name.trim() !== "" || !!appliedFilters.selectedDirection;

  useEffect(() => {
    if (searchResponse) {
      setTotalCount(searchResponse.totalCount || 0);
    } else {
      setTotalCount(0);
    }
  }, [searchResponse]);

  const handleAddClick = useCallback(() => {
    setSelectedDepartment(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClick = useCallback((department: Department) => {
    setSelectedDepartment(department);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((departmentId: string) => {
    setDepartmentToDelete(departmentId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (departmentToDelete) {
      deleteDepartmentMutation.mutate(departmentToDelete, {
        onSuccess: () => {
          setAlert({ isOpen: true, type: "success", message: "Département supprimé avec succès." });
          setIsDeleteModalOpen(false);
          refetch();
        },
        onError: () => {
          setAlert({ isOpen: true, type: "error", message: "Erreur lors de la suppression du département." });
        },
      });
    }
  }, [departmentToDelete, deleteDepartmentMutation, refetch]);

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
    const resetFilters: FiltersState = { name: "", directionSearch: "", selectedDirection: null };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPage(1);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  const handleDirectionChange = useCallback((value: string): void => {
    setFilters((prev) => ({ ...prev, directionSearch: value }));
    const matchedDirection = directions.find((dir: Direction) => dir.directionName === value);
    if (matchedDirection) {
      setFilters((prev) => ({
        ...prev,
        selectedDirection: matchedDirection,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        selectedDirection: null,
      }));
    }
  }, [directions]);

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
        <DepartmentForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onFormSuccess={handleFormSuccess}
          department={selectedDepartment}
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
                  <FormFieldCell style={{ width: "50%" }}>
                    <FormLabelSearch>Nom</FormLabelSearch>
                    <FormInputSearch
                      type="text"
                      value={filters.name}
                      onChange={handleNameChange}
                      placeholder="Rechercher par nom..."
                      disabled={isLoading}
                    />
                  </FormFieldCell>
                  <FormFieldCell style={{ width: "50%" }}>
                    <FormLabelSearch>Direction</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.directionSearch || ""}
                      onChange={handleDirectionChange}
                      suggestions={filteredDirectionSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner une direction..."
                      disabled={isLoading}
                      fieldType="direction"
                      fieldLabel="direction"
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
          <TableTitle>Départements</TableTitle>
          <ButtonSearch title="Ajouter" onClick={handleAddClick}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Ajouter
          </ButtonSearch>
        </TableHeader>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Nom</TableHeadCell>
              <TableHeadCell>Direction</TableHeadCell>
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
            ) : departments.length > 0 ? (
              departments.map((department) => (
                <TableRow key={department.departmentId}>
                  <TableCell>{department.departmentName}</TableCell>
                  <TableCell>{department.direction?.directionName || "N/A"}</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <EditButton onClick={() => handleEditClick(department)}>
                      <Edit size={16} />
                    </EditButton>
                    <CancelButton onClick={() => handleDeleteClick(department.departmentId)}>
                      <Trash2 size={16} />
                    </CancelButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>
                  <NoDataMessage>
                    {hasFilters ? "Aucun département ne correspond aux critères." : "Aucun département trouvé."}
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

export default DepartmentList;