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
import { useGetSites } from "@/api/site/services";
import { useGetGenders } from "@/api/gender/services";
import { useGetContractTypes } from "@/api/contract/services";
import { useGetAllDirections } from "@/api/direction/services";

import Alert from "@/components/alert";
import Modal from "@/components/modal";
import Pagination from "@/components/pagination";
import EmployeeForm from "../form/index";

import type { Employee, EmployeeSearchFiltersDTO } from "@/api/collaborator/services";
import type { Site } from "@/api/site/services";
import type { Gender } from "@/api/gender/services";
import type { ContractType } from "@/api/contract/services";
import type { Direction } from "@/api/direction/services";

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
    jobTitle: "",
    lastName: "",
    firstName: "",
    directionSearch: "",
    selectedDirection: null,
    contractTypeSearch: "",
    selectedContractType: null,
    employeeCode: "",
    siteSearch: "",
    selectedSite: null,
    genderSearch: "",
    selectedGender: null,
  });

  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({ ...filters });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Récupération des listes pour les filtres
  const { data: directionsResponse } = useGetAllDirections();
  const { data: contractTypesResponse } = useGetContractTypes();
  const { data: sitesResponse } = useGetSites();
  const { data: gendersResponse } = useGetGenders();

  const allDirections = useMemo(() => directionsResponse?.data || [], [directionsResponse]);
  const allContractTypes = useMemo(() => contractTypesResponse?.data || [], [contractTypesResponse]);
  const allSites = useMemo(() => sitesResponse?.data || [], [sitesResponse]);
  const allGenders = useMemo(() => gendersResponse?.data || [], [gendersResponse]);

  // Suggestions pour autocomplete
  const directionSuggestions = useMemo(() => allDirections.map((d) => d.directionName), [allDirections]);
  const filteredDirectionSuggestions = useMemo(
    () => directionSuggestions.filter((s) => s.toLowerCase().includes((filters.directionSearch || "").toLowerCase())),
    [directionSuggestions, filters.directionSearch]
  );

  const contractTypeSuggestions = useMemo(() => allContractTypes.map((ct) => ct.label), [allContractTypes]);
  const filteredContractTypeSuggestions = useMemo(
    () => contractTypeSuggestions.filter((s) => s.toLowerCase().includes((filters.contractTypeSearch || "").toLowerCase())),
    [contractTypeSuggestions, filters.contractTypeSearch]
  );

  const siteSuggestions = useMemo(() => allSites.map((s) => s.siteName), [allSites]);
  const filteredSiteSuggestions = useMemo(
    () => siteSuggestions.filter((s) => s.toLowerCase().includes((filters.siteSearch || "").toLowerCase())),
    [siteSuggestions, filters.siteSearch]
  );

  const genderSuggestions = useMemo(() => allGenders.map((g) => g.label), [allGenders]);
  const filteredGenderSuggestions = useMemo(
    () => genderSuggestions.filter((s) => s.toLowerCase().includes((filters.genderSearch || "").toLowerCase())),
    [genderSuggestions, filters.genderSearch]
  );

  // Filtres de recherche envoyés à l'API
  const searchFilters: EmployeeSearchFiltersDTO = useMemo(
    () => ({
      jobTitle: appliedFilters.jobTitle.trim() || undefined,
      lastName: appliedFilters.lastName.trim() || undefined,
      firstName: appliedFilters.firstName.trim() || undefined,
      directionId: appliedFilters.selectedDirection?.directionId,
      contractTypeId: appliedFilters.selectedContractType?.contractTypeId,
      employeeCode: appliedFilters.employeeCode.trim() || undefined,
      siteId: appliedFilters.selectedSite?.siteId,
      genderId: appliedFilters.selectedGender?.genderId,
    }),
    [appliedFilters]
  );

  const { data: searchResponse, isLoading, error, refetch } = useGetEmployees(searchFilters, page, pageSize);
  const deleteEmployeeMutation = useDeleteEmployee();

  const employees = useMemo(() => searchResponse?.data || [], [searchResponse]);
  const hasFilters = useMemo(
    () => Object.values(searchFilters).some((f) => f !== undefined && f !== null && f !== ""),
    [searchFilters]
  );

  useEffect(() => {
    setTotalCount(searchResponse?.totalCount || 0);
  }, [searchResponse]);

  // Handlers
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
          setAlert({ isOpen: true, type: "error", message: "Erreur lors de la suppression." });
        },
      });
    }
  }, [employeeToDelete, deleteEmployeeMutation, refetch]);

  const handleFormSuccess = useCallback(
    (message: string) => {
      setIsFormOpen(false);
      setAlert({ isOpen: true, type: "success", message });
      refetch();
    },
    [refetch]
  );

  const handleFilterSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setAppliedFilters(filters);
      setPage(1);
    },
    [filters]
  );

  const handleResetFilters = useCallback(() => {
    const reset = {
      jobTitle: "",
      lastName: "",
      firstName: "",
      employeeCode: "",
      directionSearch: "",
      selectedDirection: null,
      contractTypeSearch: "",
      selectedContractType: null,
      siteSearch: "",
      selectedSite: null,
      genderSearch: "",
      selectedGender: null,
    };
    setFilters(reset);
    setAppliedFilters(reset);
    setPage(1);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDirectionChange = (value: string) => {
    setFilters((prev) => ({ ...prev, directionSearch: value }));
    const matched = allDirections.find((d) => d.directionName === value);
    setFilters((prev) => ({ ...prev, selectedDirection: matched || null }));
  };

  const handleContractTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, contractTypeSearch: value }));
    const matched = allContractTypes.find((ct) => ct.label === value);
    setFilters((prev) => ({ ...prev, selectedContractType: matched || null }));
  };

  const handleSiteChange = (value: string) => {
    setFilters((prev) => ({ ...prev, siteSearch: value }));
    const matched = allSites.find((s) => s.siteName === value);
    setFilters((prev) => ({ ...prev, selectedSite: matched || null }));
  };

  const handleGenderChange = (value: string) => {
    setFilters((prev) => ({ ...prev, genderSearch: value }));
    const matched = allGenders.find((g) => g.label === value);
    setFilters((prev) => ({ ...prev, selectedGender: matched || null }));
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  if (error) return <div>Une erreur est survenue lors du chargement des données.</div>;

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
          title="Confirmer la suppression"
          message="Voulez-vous vraiment supprimer cet employé ?"
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          confirmAction={handleConfirmDelete}
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          showActions={true}
        />
      )}

      {/* Filtres */}
      <FiltersContainer>
        <FiltersHeader>
          <FiltersTitle>Filtre</FiltersTitle>
        </FiltersHeader>
        <FiltersSection>
          <Separator />
          <form onSubmit={handleFilterSubmit}>
            <FormTableSearch>
              <tbody>
                {/* Ligne 1 : Nom, Prénom, Matricule */}
                <FormRow>
                  <FormFieldCell style={{ width: "33.33%" }}>
                    <FormLabelSearch>Nom</FormLabelSearch>
                    <FormInputSearch
                      name="lastName"
                      value={filters.lastName}
                      onChange={handleInputChange}
                      placeholder="Rechercher par nom..."
                      disabled={isLoading}
                    />
                  </FormFieldCell>
                  <FormFieldCell style={{ width: "33.33%" }}>
                    <FormLabelSearch>Prénom</FormLabelSearch>
                    <FormInputSearch
                      name="firstName"
                      value={filters.firstName}
                      onChange={handleInputChange}
                      placeholder="Rechercher par prénom..."
                      disabled={isLoading}
                    />
                  </FormFieldCell>
                  <FormFieldCell style={{ width: "33.33%" }}>
                    <FormLabelSearch>Matricule</FormLabelSearch>
                    <FormInputSearch
                      name="employeeCode"
                      value={filters.employeeCode}
                      onChange={handleInputChange}
                      placeholder="Rechercher par matricule..."
                      disabled={isLoading}
                    />
                  </FormFieldCell>

                  <FormFieldCell style={{ width: "25%" }}>
                    <FormLabelSearch>Direction</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.directionSearch || ""}
                      onChange={handleDirectionChange}
                      suggestions={filteredDirectionSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner..."
                      disabled={isLoading}
                      fieldType="direction"
                      fieldLabel="Direction"
                    />
                  </FormFieldCell>
                </FormRow>

                {/* Ligne 2 : Direction, Type contrat, Site, Genre */}
                <FormRow>
                  

                  <FormFieldCell style={{ width: "25%" }}>
                    <FormLabelSearch>Type de contrat</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.contractTypeSearch || ""}
                      onChange={handleContractTypeChange}
                      suggestions={filteredContractTypeSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner..."
                      disabled={isLoading}
                      fieldType="contractType"
                      fieldLabel="Type de contrat"
                    />
                  </FormFieldCell>

                  <FormFieldCell style={{ width: "25%" }}>
                    <FormLabelSearch>Site</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.siteSearch || ""}
                      onChange={handleSiteChange}
                      suggestions={filteredSiteSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner..."
                      disabled={isLoading}
                      fieldType="site"
                      fieldLabel="Site"
                    />
                  </FormFieldCell>

                  <FormFieldCell style={{ width: "25%" }}>
                    <FormLabelSearch>Genre</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.genderSearch || ""}
                      onChange={handleGenderChange}
                      suggestions={filteredGenderSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner..."
                      disabled={isLoading}
                      fieldType="gender"
                      fieldLabel="Genre"
                    />
                  </FormFieldCell>
                </FormRow>
              </tbody>
            </FormTableSearch>

            <Separator />
            <FiltersActions>
              <ButtonReset type="button" onClick={handleResetFilters} disabled={!hasFilters || isLoading}>
                Effacer filtres
              </ButtonReset>
              <ButtonSearch type="submit" disabled={isLoading}>
                <Search size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                Rechercher
              </ButtonSearch>
            </FiltersActions>
          </form>
        </FiltersSection>
      </FiltersContainer>

      {/* Tableau des employés */}
      <TableContainer>
        <TableHeader>
          <TableTitle>Liste des employés</TableTitle>
          <ButtonSearch onClick={handleAddClick}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Ajouter
          </ButtonSearch>
        </TableHeader>

        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Nom</TableHeadCell>
              <TableHeadCell>Prénom</TableHeadCell>
              <TableHeadCell>Matricule</TableHeadCell>
              <TableHeadCell>Date de naissance</TableHeadCell>
              <TableHeadCell>Poste</TableHeadCell>
              <TableHeadCell>Direction</TableHeadCell>
              <TableHeadCell style={{ width: "100px", textAlign: "center" }}>Actions</TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Loading>Chargement des données...</Loading>
                </TableCell>
              </TableRow>
            ) : employees.length > 0 ? (
              employees.map((emp) => (
                <TableRow key={emp.employeeId}>
                  <TableCell>{emp.lastName}</TableCell>
                  <TableCell>{emp.firstName || "N/A"}</TableCell>
                  <TableCell>{emp.employeeCode}</TableCell>
                  <TableCell>
                    {emp.birthDate ? new Date(emp.birthDate).toLocaleDateString("fr-FR") : "N/A"}
                  </TableCell>
                  <TableCell>{emp.jobTitle || "N/A"}</TableCell>
                  <TableCell>{emp.direction?.directionName || "N/A"}</TableCell>
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
                <TableCell colSpan={7}>
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