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
import { useGetEmployees, useDeleteEmployee } from "@/api/collaborator/services";
import { useGetSites } from '@/api/site/services';
import { useGetGenders } from '@/api/gender/services';
import { useGetContractTypes } from '@/api/contract/services';
import { useGetAllDirections } from '@/api/direction/services';


import Alert from "@/components/alert";
import Modal from "@/components/modal";
import Pagination from "@/components/pagination";
import EmployeeForm from "../form/index";
import type { Employee, EmployeeSearchFiltersDTO } from "@/api/collaborator/services";
import type { Site } from '@/api/site/services';
import type { Gender } from '@/api/gender/services';
import type { ContractType } from '@/api/contract/services';
import type { Direction } from '@/api/direction/services';

interface FiltersState {
  jobTitle: string;
  lastName: string;
  firstName: string;
  directionSearch?: string;
  selectedDirection?: Direction | null;
  contractTypeSearch?: string;
  selectedContractType?: ContractType | null;
  employeeCode: string;
  siteSearch?: string;
  selectedSite?: Site | null;
  genderSearch?: string;
  selectedGender?: Gender | null;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const EmployeeList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });

  const [filters, setFilters] = useState<FiltersState>({
    jobTitle: '',
    lastName: '',
    firstName: '',
    directionSearch: '',
    selectedDirection: null,
    contractTypeSearch: '',
    selectedContractType: null,
    employeeCode: '',
    siteSearch: '',
    selectedSite: null,
    genderSearch: '',
    selectedGender: null,
  });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({
    jobTitle: '',
    lastName: '',
    firstName: '',
    directionSearch: '',
    selectedDirection: null,
    contractTypeSearch: '',
    selectedContractType: null,
    employeeCode: '',
    siteSearch: '',
    selectedSite: null,
    genderSearch: '',
    selectedGender: null,
  });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Fetch all for filters
  const { data: directionsResponse } = useGetAllDirections();
  const { data: contractTypesResponse } = useGetContractTypes();
  const { data: sitesResponse } = useGetSites();
  const { data: gendersResponse } = useGetGenders();

  const allDirections = useMemo(() => directionsResponse?.data || [], [directionsResponse]);
  const allContractTypes = useMemo(() => contractTypesResponse?.data || [], [contractTypesResponse]);
  const allSites = useMemo(() => sitesResponse?.data || [], [sitesResponse]);
  const allGenders = useMemo(() => gendersResponse?.data || [], [gendersResponse]);

  const directionSuggestions = useMemo(() => allDirections.map((dir: Direction) => dir.directionName), [allDirections]);
  const filteredDirectionSuggestions = useMemo(() =>
    directionSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.directionSearch || "").toLowerCase())
    ),
    [directionSuggestions, filters.directionSearch]
  );

  const contractTypeSuggestions = useMemo(() => allContractTypes.map((ct: ContractType) => ct.label), [allContractTypes]);
  const filteredContractTypeSuggestions = useMemo(() =>
    contractTypeSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.contractTypeSearch || "").toLowerCase())
    ),
    [contractTypeSuggestions, filters.contractTypeSearch]
  );

  const siteSuggestions = useMemo(() => allSites.map((site: Site) => site.siteName), [allSites]);
  const filteredSiteSuggestions = useMemo(() =>
    siteSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.siteSearch || "").toLowerCase())
    ),
    [siteSuggestions, filters.siteSearch]
  );

  const genderSuggestions = useMemo(() => allGenders.map((gender: Gender) => gender.label), [allGenders]);
  const filteredGenderSuggestions = useMemo(() =>
    genderSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.genderSearch || "").toLowerCase())
    ),
    [genderSuggestions, filters.genderSearch]
  );

  const searchFilters: EmployeeSearchFiltersDTO = useMemo(() => ({
    jobTitle: appliedFilters.jobTitle.trim() || undefined,
    lastName: appliedFilters.lastName.trim() || undefined,
    firstName: appliedFilters.firstName.trim() || undefined,
    directionId: appliedFilters.selectedDirection?.directionId,
    contractTypeId: appliedFilters.selectedContractType?.contractTypeId,
    employeeCode: appliedFilters.employeeCode.trim() || undefined,
    siteId: appliedFilters.selectedSite?.siteId,
    genderId: appliedFilters.selectedGender?.genderId,
  }), [appliedFilters]);

  const { data: searchResponse, isLoading, error, refetch } = useGetEmployees(searchFilters, page, pageSize);
  const deleteEmployeeMutation = useDeleteEmployee();

  const employees = useMemo(() => searchResponse?.data || [], [searchResponse]);

  const hasFilters = Object.values(searchFilters).some(f => f !== undefined && f !== '' && f !== null);

  useEffect(() => {
    if (searchResponse) {
      setTotalCount(searchResponse.totalCount || 0);
    } else {
      setTotalCount(0);
    }
  }, [searchResponse]);

  const handleAddClick = useCallback(() => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClick = useCallback((emp: Employee) => {
    setSelectedEmployee(emp);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (employeeToDelete) {
      deleteEmployeeMutation.mutate(employeeToDelete, {
        onSuccess: () => {
          setAlert({ isOpen: true, type: "success", message: "Employé supprimé avec succès." });
          setIsDeleteModalOpen(false);
          refetch();
        },
        onError: () => {
          setAlert({ isOpen: true, type: "error", message: "Erreur lors de la suppression de l'employé." });
        },
      });
    }
  }, [employeeToDelete, deleteEmployeeMutation, refetch]);

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
    const resetFilters: FiltersState = {
      jobTitle: '',
      lastName: '',
      firstName: '',
      directionSearch: '',
      selectedDirection: null,
      contractTypeSearch: '',
      selectedContractType: null,
      employeeCode: '',
      siteSearch: '',
      selectedSite: null,
      genderSearch: '',
      selectedGender: null,
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPage(1);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDirectionChange = useCallback((value: string): void => {
    setFilters((prev) => ({ ...prev, directionSearch: value }));
    const matchedDirection = allDirections.find((dir: Direction) => dir.directionName === value);
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
  }, [allDirections]);

  const handleContractTypeChange = useCallback((value: string): void => {
    setFilters((prev) => ({ ...prev, contractTypeSearch: value }));
    const matchedCT = allContractTypes.find((ct: ContractType) => ct.label === value);
    if (matchedCT) {
      setFilters((prev) => ({
        ...prev,
        selectedContractType: matchedCT,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        selectedContractType: null,
      }));
    }
  }, [allContractTypes]);

  const handleSiteChange = useCallback((value: string): void => {
    setFilters((prev) => ({ ...prev, siteSearch: value }));
    const matchedSite = allSites.find((site: Site) => site.siteName === value);
    if (matchedSite) {
      setFilters((prev) => ({
        ...prev,
        selectedSite: matchedSite,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        selectedSite: null,
      }));
    }
  }, [allSites]);

  const handleGenderChange = useCallback((value: string): void => {
    setFilters((prev) => ({ ...prev, genderSearch: value }));
    const matchedGender = allGenders.find((gender: Gender) => gender.label === value);
    if (matchedGender) {
      setFilters((prev) => ({
        ...prev,
        selectedGender: matchedGender,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        selectedGender: null,
      }));
    }
  }, [allGenders]);

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
        <EmployeeForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onFormSuccess={handleFormSuccess}
          employee={selectedEmployee}
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
                  <FormFieldCell style={{ width: "25%" }}>
                    <FormLabelSearch>Poste</FormLabelSearch>
                    <FormInputSearch
                      type="text"
                      value={filters.jobTitle}
                      onChange={handleInputChange}
                      name="jobTitle"
                      placeholder="Rechercher par poste..."
                      disabled={isLoading}
                    />
                  </FormFieldCell>
                  <FormFieldCell style={{ width: "25%" }}>
                    <FormLabelSearch>Nom</FormLabelSearch>
                    <FormInputSearch
                      type="text"
                      value={filters.lastName}
                      onChange={handleInputChange}
                      name="lastName"
                      placeholder="Rechercher par nom..."
                      disabled={isLoading}
                    />
                  </FormFieldCell>
                  <FormFieldCell style={{ width: "25%" }}>
                    <FormLabelSearch>Prénom</FormLabelSearch>
                    <FormInputSearch
                      type="text"
                      value={filters.firstName}
                      onChange={handleInputChange}
                      name="firstName"
                      placeholder="Rechercher par prénom..."
                      disabled={isLoading}
                    />
                  </FormFieldCell>
                  <FormFieldCell style={{ width: "25%" }}>
                    <FormLabelSearch>Code employé</FormLabelSearch>
                    <FormInputSearch
                      type="text"
                      value={filters.employeeCode}
                      onChange={handleInputChange}
                      name="employeeCode"
                      placeholder="Rechercher par code..."
                      disabled={isLoading}
                    />
                  </FormFieldCell>
                </FormRow>
                <FormRow>
                  <FormFieldCell style={{ width: "25%" }}>
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
                  <FormFieldCell style={{ width: "25%" }}>
                    <FormLabelSearch>Type de contrat</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.contractTypeSearch || ""}
                      onChange={handleContractTypeChange}
                      suggestions={filteredContractTypeSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner un type de contrat..."
                      disabled={isLoading}
                      fieldType="contractType"
                      fieldLabel="contractType"
                      showAddOption={false}
                    />
                  </FormFieldCell>
                  <FormFieldCell style={{ width: "25%" }}>
                    <FormLabelSearch>Site</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.siteSearch || ""}
                      onChange={handleSiteChange}
                      suggestions={filteredSiteSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner un site..."
                      disabled={isLoading}
                      fieldType="site"
                      fieldLabel="site"
                      showAddOption={false}
                    />
                  </FormFieldCell>
                  <FormFieldCell style={{ width: "25%" }}>
                    <FormLabelSearch>Genre</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.genderSearch || ""}
                      onChange={handleGenderChange}
                      suggestions={filteredGenderSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner un genre..."
                      disabled={isLoading}
                      fieldType="gender"
                      fieldLabel="gender"
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
          <TableTitle>Liste</TableTitle>
          <ButtonSearch title="Ajouter" onClick={handleAddClick}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Ajouter
          </ButtonSearch>
        </TableHeader>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Nom</TableHeadCell>
              <TableHeadCell>Prénom</TableHeadCell>
              <TableHeadCell>Code</TableHeadCell>
              <TableHeadCell>Poste</TableHeadCell>
              <TableHeadCell>Direction</TableHeadCell>
              <TableHeadCell style={{ width: "100px", textAlign: "center" }}>Actions</TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Loading>Chargement des données...</Loading>
                </TableCell>
              </TableRow>
            ) : employees.length > 0 ? (
              employees.map((emp) => (
                <TableRow key={emp.employeeId}>
                  <TableCell>{emp.lastName}</TableCell>
                  <TableCell>{emp.firstName}</TableCell>
                  <TableCell>{emp.employeeCode}</TableCell>
                  <TableCell>{emp.jobTitle}</TableCell>
                  <TableCell>{emp.direction?.directionName || 'N/A'}</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <EditButton onClick={() => handleEditClick(emp)}>
                      <Edit size={16} />
                    </EditButton>
                    <CancelButton onClick={() => handleDeleteClick(emp.employeeId)}>
                      <Trash2 size={16} />
                    </CancelButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <NoDataMessage>
                    {hasFilters ? "Aucun employé ne correspond aux critères." : "Aucun employé trouvé."}
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

export default EmployeeList;