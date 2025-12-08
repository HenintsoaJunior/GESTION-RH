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
import { useGetSites, useDeleteSite } from "@/api/site/services";
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import SiteForm from "../form/index";
import type { Site } from "@/api/site/services";

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

const SiteList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ 
    isOpen: false, 
    type: "info", 
    message: "" 
  });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);

  const [filters, setFilters] = useState<FiltersState>({ name: "" });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({ name: "" });

  const { data: sitesResponse, isLoading, error, refetch } = useGetSites();
  const deleteSiteMutation = useDeleteSite();

  const sites = useMemo(() => sitesResponse?.data || [], [sitesResponse]);

  const filteredSites = useMemo(() => {
    if (!appliedFilters.name.trim()) return sites;
    return sites.filter((site) =>
      site.siteName.toLowerCase().includes(appliedFilters.name.toLowerCase())
    );
  }, [sites, appliedFilters]);

  const hasFilters = useMemo(() => {
    return Object.values(filters).some((val) => (val || "").trim() !== "");
  }, [filters]);

  const handleAddClick = useCallback(() => {
    setSelectedSite(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClick = useCallback((site: Site) => {
    setSelectedSite(site);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((siteId: string) => {
    setSiteToDelete(siteId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (siteToDelete) {
      deleteSiteMutation.mutate(siteToDelete, {
        onSuccess: () => {
          setAlert({ 
            isOpen: true, 
            type: "success", 
            message: "Site supprimé avec succès." 
          });
          setIsDeleteModalOpen(false);
          refetch();
        },
        onError: () => {
          setAlert({ 
            isOpen: true, 
            type: "error", 
            message: "Erreur lors de la suppression du site." 
          });
        },
      });
    }
  }, [siteToDelete, deleteSiteMutation, refetch]);

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
    const resetFilters: FiltersState = { name: "" };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, name: e.target.value }));
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
        <SiteForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onFormSuccess={handleFormSuccess}
          site={selectedSite}
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
          <TableTitle>Sites</TableTitle>
          <ButtonSearch title="Ajouter" onClick={handleAddClick}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Ajouter
          </ButtonSearch>
        </TableHeader>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Nom</TableHeadCell>
              <TableHeadCell>Code</TableHeadCell>
              <TableHeadCell>Longitude</TableHeadCell>
              <TableHeadCell>Latitude</TableHeadCell>
              <TableHeadCell style={{ width: "100px", textAlign: "center" }}>
                Actions
              </TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Loading>Chargement des données...</Loading>
                </TableCell>
              </TableRow>
            ) : filteredSites.length > 0 ? (
              filteredSites.map((site) => (
                <TableRow key={site.siteId}>
                  <TableCell>{site.siteName}</TableCell>
                  <TableCell>{site.code || '-'}</TableCell>
                  <TableCell>{site.longitude ?? '-'}</TableCell>
                  <TableCell>{site.latitude ?? '-'}</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <EditButton onClick={() => handleEditClick(site)}>
                      <Edit size={16} />
                    </EditButton>
                    <CancelButton onClick={() => handleDeleteClick(site.siteId)}>
                      <Trash2 size={16} />
                    </CancelButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <NoDataMessage>
                    {hasFilters 
                      ? "Aucun site ne correspond aux critères." 
                      : "Aucun site trouvé."
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

export default SiteList;