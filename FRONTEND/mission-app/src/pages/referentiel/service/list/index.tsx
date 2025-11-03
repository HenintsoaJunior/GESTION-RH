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
import { useGetServices, useDeleteService } from "@/api/service/services";
import { useGetAllDepartments } from "@/api/department/services";
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import Pagination from "@/components/pagination";
import ServiceForm from "../form/index";
import type { Service } from "@/api/service/services";
import type { Department } from "@/api/department/services";

interface FiltersState {
  name: string;
  departmentSearch?: string;
  selectedDepartment?: Department | null;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const ServiceList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });

  const [filters, setFilters] = useState<FiltersState>({ name: "", departmentSearch: "", selectedDepartment: null });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({ name: "", departmentSearch: "", selectedDepartment: null });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { data: allDeptsResponse } = useGetAllDepartments();
  const allDepartments = useMemo(() => allDeptsResponse?.data || [], [allDeptsResponse]);

  const departmentSuggestions = useMemo(() => allDepartments.map((dept: Department) => dept.departmentName), [allDepartments]);

  const filteredDepartmentSuggestions = useMemo(() =>
    departmentSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.departmentSearch || "").toLowerCase())
    ),
    [departmentSuggestions, filters.departmentSearch]
  );

  const searchName = appliedFilters.name.trim() || undefined;
  const searchDepartmentId = appliedFilters.selectedDepartment?.departmentId || undefined;
  const { data: searchResponse, isLoading, error, refetch } = useGetServices(searchName, searchDepartmentId, page, pageSize);
  const deleteServiceMutation = useDeleteService();

  const services = useMemo(() => searchResponse?.data || [], [searchResponse]);

  const hasFilters = appliedFilters.name.trim() !== "" || !!appliedFilters.selectedDepartment;

  useEffect(() => {
    if (searchResponse) {
      setTotalCount(searchResponse.totalCount || 0);
    } else {
      setTotalCount(0);
    }
  }, [searchResponse]);

  const handleAddClick = useCallback(() => {
    setSelectedService(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClick = useCallback((service: Service) => {
    setSelectedService(service);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((serviceId: string) => {
    setServiceToDelete(serviceId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (serviceToDelete) {
      deleteServiceMutation.mutate(serviceToDelete, {
        onSuccess: () => {
          setAlert({ isOpen: true, type: "success", message: "Service supprimé avec succès." });
          setIsDeleteModalOpen(false);
          refetch();
        },
        onError: () => {
          setAlert({ isOpen: true, type: "error", message: "Erreur lors de la suppression du service." });
        },
      });
    }
  }, [serviceToDelete, deleteServiceMutation, refetch]);

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
    const resetFilters: FiltersState = { name: "", departmentSearch: "", selectedDepartment: null };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPage(1);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  const handleDepartmentChange = useCallback((value: string): void => {
    setFilters((prev) => ({ ...prev, departmentSearch: value }));
    const matchedDepartment = allDepartments.find((dept: Department) => dept.departmentName === value);
    if (matchedDepartment) {
      setFilters((prev) => ({
        ...prev,
        selectedDepartment: matchedDepartment,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        selectedDepartment: null,
      }));
    }
  }, [allDepartments]);

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
        <ServiceForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onFormSuccess={handleFormSuccess}
          service={selectedService}
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
                    <FormLabelSearch>Département</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.departmentSearch || ""}
                      onChange={handleDepartmentChange}
                      suggestions={filteredDepartmentSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner un département..."
                      disabled={isLoading}
                      fieldType="department"
                      fieldLabel="department"
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
          <TableTitle>Services</TableTitle>
          <ButtonSearch title="Ajouter" onClick={handleAddClick}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Ajouter
          </ButtonSearch>
        </TableHeader>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Nom</TableHeadCell>
              <TableHeadCell>Département</TableHeadCell>
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
            ) : services.length > 0 ? (
              services.map((serviceItem) => (
                <TableRow key={serviceItem.serviceId}>
                  <TableCell>{serviceItem.serviceName}</TableCell>
                  <TableCell>{serviceItem.department?.departmentName || 'N/A'}</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <EditButton onClick={() => handleEditClick(serviceItem)}>
                      <Edit size={16} />
                    </EditButton>
                    <CancelButton onClick={() => handleDeleteClick(serviceItem.serviceId)}>
                      <Trash2 size={16} />
                    </CancelButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>
                  <NoDataMessage>
                    {hasFilters ? "Aucun service ne correspond aux critères." : "Aucun service trouvé."}
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

export default ServiceList;