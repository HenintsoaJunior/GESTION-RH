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
import { useGetUnits, useDeleteUnit } from "@/api/unit/services";
import { useGetAllServices } from "@/api/service/services";
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import Pagination from "@/components/pagination";
import UnitForm from "../form/index";
import type { Unit } from "@/api/unit/services";
import type { Service } from "@/api/service/services";

interface FiltersState {
  name: string;
  serviceSearch?: string;
  selectedService?: Service | null;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const UnitList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });

  const [filters, setFilters] = useState<FiltersState>({ name: "", serviceSearch: "", selectedService: null });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({ name: "", serviceSearch: "", selectedService: null });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { data: allServicesResponse } = useGetAllServices();
  const allServices = useMemo(() => allServicesResponse?.data || [], [allServicesResponse]);

  const serviceSuggestions = useMemo(() => allServices.map((svc: Service) => svc.serviceName), [allServices]);

  const filteredServiceSuggestions = useMemo(() =>
    serviceSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.serviceSearch || "").toLowerCase())
    ),
    [serviceSuggestions, filters.serviceSearch]
  );

  const searchName = appliedFilters.name.trim() || undefined;
  const searchServiceId = appliedFilters.selectedService?.serviceId || undefined;
  const { data: searchResponse, isLoading, error, refetch } = useGetUnits(searchName, searchServiceId, page, pageSize);
  const deleteUnitMutation = useDeleteUnit();

  const units = useMemo(() => searchResponse?.data || [], [searchResponse]);

  const hasFilters = appliedFilters.name.trim() !== "" || !!appliedFilters.selectedService;

  useEffect(() => {
    if (searchResponse) {
      setTotalCount(searchResponse.totalCount || 0);
    } else {
      setTotalCount(0);
    }
  }, [searchResponse]);

  const handleAddClick = useCallback(() => {
    setSelectedUnit(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClick = useCallback((unitItem: Unit) => {
    setSelectedUnit(unitItem);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((unitId: string) => {
    setUnitToDelete(unitId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (unitToDelete) {
      deleteUnitMutation.mutate(unitToDelete, {
        onSuccess: () => {
          setAlert({ isOpen: true, type: "success", message: "Unité supprimée avec succès." });
          setIsDeleteModalOpen(false);
          refetch();
        },
        onError: () => {
          setAlert({ isOpen: true, type: "error", message: "Erreur lors de la suppression de l'unité." });
        },
      });
    }
  }, [unitToDelete, deleteUnitMutation, refetch]);

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
    const resetFilters: FiltersState = { name: "", serviceSearch: "", selectedService: null };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPage(1);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  const handleServiceChange = useCallback((value: string): void => {
    setFilters((prev) => ({ ...prev, serviceSearch: value }));
    const matchedService = allServices.find((svc: Service) => svc.serviceName === value);
    if (matchedService) {
      setFilters((prev) => ({
        ...prev,
        selectedService: matchedService,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        selectedService: null,
      }));
    }
  }, [allServices]);

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
        <UnitForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onFormSuccess={handleFormSuccess}
          unit={selectedUnit}
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
                    <FormLabelSearch>Service</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.serviceSearch || ""}
                      onChange={handleServiceChange}
                      suggestions={filteredServiceSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner un service..."
                      disabled={isLoading}
                      fieldType="service"
                      fieldLabel="service"
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
          <TableTitle>Unités</TableTitle>
          <ButtonSearch title="Ajouter" onClick={handleAddClick}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Ajouter
          </ButtonSearch>
        </TableHeader>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Nom</TableHeadCell>
              <TableHeadCell>Service</TableHeadCell>
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
            ) : units.length > 0 ? (
              units.map((unitItem) => (
                <TableRow key={unitItem.unitId}>
                  <TableCell>{unitItem.unitName}</TableCell>
                  <TableCell>{unitItem.service?.serviceName || 'N/A'}</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <EditButton onClick={() => handleEditClick(unitItem)}>
                      <Edit size={16} />
                    </EditButton>
                    <CancelButton onClick={() => handleDeleteClick(unitItem.unitId)}>
                      <Trash2 size={16} />
                    </CancelButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>
                  <NoDataMessage>
                    {hasFilters ? "Aucune unité ne correspond aux critères." : "Aucune unité trouvée."}
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

export default UnitList;