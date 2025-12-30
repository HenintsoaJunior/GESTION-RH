"use client";
import { useState, useCallback, useMemo } from "react";
import { Plus, Edit, Trash2, Search, Filter, X, ChevronDown, ChevronUp, List } from "lucide-react";
import styled from "styled-components";
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
import { useGetContractTypes, useDeleteContractType } from "@/api/contract/services";
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import ContractTypeForm from "../form/index";
import type { ContractType } from "@/api/contract/services";

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

interface FiltersState {
  label: string;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const ContractTypeList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedContractType, setSelectedContractType] = useState<ContractType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [contractTypeToDelete, setContractTypeToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ 
    isOpen: false, 
    type: "info", 
    message: "" 
  });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);

  const [filters, setFilters] = useState<FiltersState>({ label: "" });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({ label: "" });

  const { data: contractTypesResponse, isLoading, error, refetch } = useGetContractTypes();
  const deleteContractTypeMutation = useDeleteContractType();

  const contractTypes = useMemo(() => contractTypesResponse?.data || [], [contractTypesResponse]);

  const filteredContractTypes = useMemo(() => {
    if (!appliedFilters.label.trim()) return contractTypes;
    return contractTypes.filter((ct) =>
      ct.label.toLowerCase().includes(appliedFilters.label.toLowerCase())
    );
  }, [contractTypes, appliedFilters]);

  const hasFilters = useMemo(() => {
    return Object.values(filters).some((val) => (val || "").trim() !== "");
  }, [filters]);

  const handleAddClick = useCallback(() => {
    setSelectedContractType(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClick = useCallback((ct: ContractType) => {
    setSelectedContractType(ct);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((contractTypeId: string) => {
    setContractTypeToDelete(contractTypeId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (contractTypeToDelete) {
      deleteContractTypeMutation.mutate(contractTypeToDelete, {
        onSuccess: () => {
          setAlert({ 
            isOpen: true, 
            type: "success", 
            message: "Type de contrat supprimé avec succès." 
          });
          setIsDeleteModalOpen(false);
          refetch();
        },
        onError: () => {
          setAlert({ 
            isOpen: true, 
            type: "error", 
            message: "Erreur lors de la suppression du type de contrat." 
          });
        },
      });
    }
  }, [contractTypeToDelete, deleteContractTypeMutation, refetch]);

  const handleFormSuccess = useCallback((message: string) => {
    setIsFormOpen(false);
    setAlert({ isOpen: true, type: "success", message });
    refetch();
  }, [refetch]);

  const handleFilterSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setAppliedFilters(filters);
  }, [filters]);

  const handleResetFilters = useCallback((): void => {
    const resetFilters: FiltersState = { label: "" };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  }, []);

  const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, label: e.target.value }));
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
        <ContractTypeForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onFormSuccess={handleFormSuccess}
          contractType={selectedContractType}
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
            <FilterControlButton 
              $isClose 
              onClick={() => setIsHidden(true)} 
              title="Fermer"
            >
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
                  <FormLabelSearch>Label</FormLabelSearch>
                  <FormInputSearch
                    type="text"
                    value={filters.label}
                    onChange={handleLabelChange}
                    placeholder="Rechercher par label..."
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
          <TableTitle>Types de Contrats</TableTitle>
          <ButtonSearch title="Ajouter" onClick={handleAddClick}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Ajouter
          </ButtonSearch>
        </TableHeader>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Code</TableHeadCell>
              <TableHeadCell>Label</TableHeadCell>
              <TableHeadCell style={{ width: "100px", textAlign: "center" }}>
                Actions
              </TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <Loading>Chargement des données...</Loading>
                </TableCell>
              </TableRow>
            ) : filteredContractTypes.length > 0 ? (
              filteredContractTypes.map((ct) => (
                <TableRow key={ct.contractTypeId}>
                  <TableCell>{ct.code || '-'}</TableCell>
                  <TableCell>{ct.label}</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <EditButton onClick={() => handleEditClick(ct)}>
                      <Edit size={16} />
                    </EditButton>
                    <CancelButton onClick={() => handleDeleteClick(ct.contractTypeId)}>
                      <Trash2 size={16} />
                    </CancelButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>
                  <NoDataMessage>
                    {hasFilters 
                      ? "Aucun type de contrat ne correspond aux critères." 
                      : "Aucun type de contrat trouvé."
                    }
                  </NoDataMessage>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </DataTable>
      </TableContainer>
    </>
  );
};

export default ContractTypeList;