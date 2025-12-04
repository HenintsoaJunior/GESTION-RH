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
import { useGetLieux, useDeleteLieu } from "@/api/lieu/services";
import { useGetAllGeoZones } from "@/api/zones/services";
import { useSearchParams, useNavigate } from 'react-router-dom';
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import Pagination from "@/components/pagination";
import LieuForm from "../form/index";
import type { Lieu } from "@/api/lieu/services";
import type { GeoZone } from "@/api/zones/services";

interface FiltersState {
  nom: string;
  ville: string;
  pays: string;
  zoneSearch?: string;
  selectedGeoZone?: GeoZone | null;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

type SelectedLieu = Lieu | Partial<Lieu> | null;

const LieuList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedLieu, setSelectedLieu] = useState<SelectedLieu>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [lieuToDelete, setLieuToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
  const [hasAutoOpened, setHasAutoOpened] = useState<boolean>(false);

  const [filters, setFilters] = useState<FiltersState>({ 
    nom: "", 
    ville: "", 
    pays: "", 
    zoneSearch: "", 
    selectedGeoZone: null 
  });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({ 
    nom: "", 
    ville: "", 
    pays: "", 
    zoneSearch: "", 
    selectedGeoZone: null 
  });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Récupération des paramètres d'URL pour l'ouverture automatique
  // Supporte plusieurs formats de paramètres
  const autoOpen = searchParams.get('autoOpen') === 'true' || 
                   searchParams.get('mode') === 'add' || 
                   searchParams.get('fieldType') === 'location';
  const fieldLabel = searchParams.get('fieldLabel') || 'nom'; // Valeur par défaut 'nom'
  const initialValue = searchParams.get('initialValue');
  const returnUrl = searchParams.get('returnUrl');

  const { data: geoZonesData } = useGetAllGeoZones();
  const geoZones = useMemo(() => geoZonesData?.data || [], [geoZonesData]);

  const zoneSuggestions = useMemo(() => 
    geoZones.map((zone: GeoZone) => zone.name), 
    [geoZones]
  );

  const filteredZoneSuggestions = useMemo(() =>
    zoneSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.zoneSearch || "").toLowerCase())
    ),
    [zoneSuggestions, filters.zoneSearch]
  );

  const searchFilters = {
    nom: appliedFilters.nom.trim() || undefined,
    ville: appliedFilters.ville.trim() || undefined,
    pays: appliedFilters.pays.trim() || undefined,
    zoneId: appliedFilters.selectedGeoZone?.zoneId || undefined,
  };
  
  const { 
    data: searchResponse, 
    isLoading, 
    error, 
    refetch 
  } = useGetLieux(searchFilters, page, pageSize);
  
  const deleteLieuMutation = useDeleteLieu();

  const lieux = useMemo(() => searchResponse?.data || [], [searchResponse]);

  const hasFilters = appliedFilters.nom.trim() !== "" || 
    appliedFilters.ville.trim() !== "" || 
    appliedFilters.pays.trim() !== "" || 
    !!appliedFilters.selectedGeoZone;

  // Effet pour ouvrir automatiquement le formulaire lors de la navigation
  useEffect(() => {
    if (autoOpen && !hasAutoOpened && !isFormOpen) {
      // Prépare un objet partiel avec la valeur pré-remplie
      const prefillData: Partial<Lieu> = {
        ville: '',
        codePostal: '',
        pays: '',
        // Pré-remplit le champ spécifié dans l'URL
        ...(fieldLabel && initialValue 
          ? { [fieldLabel]: decodeURIComponent(initialValue) } 
          : {})
      };
      
      setSelectedLieu(prefillData);
      setIsFormOpen(true);
      setHasAutoOpened(true);
      
      console.log("Lieu form auto-opened with prefill:", prefillData);
      
      // Pas besoin de nettoyer l'URL ici, laissez les paramètres
      // Ils seront utilisés pour le retour après création
    }
  }, [autoOpen, fieldLabel, initialValue, isFormOpen, hasAutoOpened]);

  const handleNavigateBack = useCallback(() => {
    if (returnUrl) {
      navigate(decodeURIComponent(returnUrl));
    } else {
      // Fallback: navigate to default mission page
      navigate('/mission');
    }
  }, [navigate, returnUrl]);

  useEffect(() => {
    if (searchResponse) {
      setTotalCount(searchResponse.totalCount || 0);
    } else {
      setTotalCount(0);
    }
  }, [searchResponse]);

  const handleAddClick = useCallback(() => {
    setSelectedLieu(null);
    setIsFormOpen(true);
    setHasAutoOpened(false);
  }, []);

  const handleEditClick = useCallback((lieu: Lieu) => {
    setSelectedLieu(lieu);
    setIsFormOpen(true);
    setHasAutoOpened(false);
  }, []);

  const handleDeleteClick = useCallback((lieuId: string) => {
    setLieuToDelete(lieuId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (lieuToDelete) {
      deleteLieuMutation.mutate(lieuToDelete, {
        onSuccess: () => {
          setAlert({ 
            isOpen: true, 
            type: "success", 
            message: "Lieu supprimé avec succès." 
          });
          setIsDeleteModalOpen(false);
          refetch();
        },
        onError: () => {
          setAlert({ 
            isOpen: true, 
            type: "error", 
            message: "Erreur lors de la suppression du lieu." 
          });
        },
      });
    }
  }, [lieuToDelete, deleteLieuMutation, refetch]);

  const handleFormSuccess = useCallback((message: string) => {
    setIsFormOpen(false);
    
    refetch();

    if (returnUrl && autoOpen) {
      handleNavigateBack();
    } else {
      console.log("Lieu form success:", message);
    }
  }, [refetch, returnUrl, autoOpen, handleNavigateBack]);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    if (autoOpen && returnUrl) {
      handleNavigateBack();
    }
  }, [autoOpen, returnUrl, handleNavigateBack]);

  const handleFilterSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setAppliedFilters(filters);
    setPage(1);
  }, [filters]);

  const handleResetFilters = useCallback((): void => {
    const resetFilters: FiltersState = { 
      nom: "", 
      ville: "", 
      pays: "", 
      zoneSearch: "", 
      selectedGeoZone: null 
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPage(1);
  }, []);

  const handleNomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, nom: e.target.value }));
  }, []);

  const handleVilleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, ville: e.target.value }));
  }, []);

  const handlePaysChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, pays: e.target.value }));
  }, []);

  const handleZoneChange = useCallback((value: string): void => {
    setFilters((prev) => ({ ...prev, zoneSearch: value }));
    const matchedZone = geoZones.find((zone: GeoZone) => zone.name === value);
    if (matchedZone) {
      setFilters((prev) => ({
        ...prev,
        selectedGeoZone: matchedZone,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        selectedGeoZone: null,
      }));
    }
  }, [geoZones]);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  }, []);

  // Reset hasAutoOpened quand le formulaire se ferme
  useEffect(() => {
    if (!isFormOpen) {
      setHasAutoOpened(false);
    }
  }, [isFormOpen]);

  if (error) return <div>Une erreur est survenue.</div>;

  return (
    <>
      {/* Alert seulement affiché quand on n'est pas en mode autoOpen */}
      {!autoOpen && (
        <Alert
          type={alert.type}
          message={alert.message}
          isOpen={alert.isOpen}
          onClose={() => setAlert({ ...alert, isOpen: false })}
        />
      )}
      
      {isFormOpen && (
        <LieuForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onFormSuccess={handleFormSuccess}
          lieu={selectedLieu as Lieu | null}
          prefillNom={fieldLabel === 'nom' && initialValue ? decodeURIComponent(initialValue) : ''}
        />
      )}
      
      {isDeleteModalOpen && (
        <Modal
          type="error"
          message="Voulez-vous vraiment supprimer ce lieu ?"
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
                <FormRow className="dual-field-row">
                  <FormFieldCell>
                    <FormLabelSearch>Nom</FormLabelSearch>
                    <FormInputSearch
                      type="text"
                      value={filters.nom}
                      onChange={handleNomChange}
                      placeholder="Rechercher par nom..."
                      disabled={isLoading}
                    />
                  </FormFieldCell>
                  <FormFieldCell>
                    <FormLabelSearch>Ville</FormLabelSearch>
                    <FormInputSearch
                      type="text"
                      value={filters.ville}
                      onChange={handleVilleChange}
                      placeholder="Rechercher par ville..."
                      disabled={isLoading}
                    />
                  </FormFieldCell>
                </FormRow>
                <FormRow className="dual-field-row">
                  <FormFieldCell>
                    <FormLabelSearch>Pays</FormLabelSearch>
                    <FormInputSearch
                      type="text"
                      value={filters.pays}
                      onChange={handlePaysChange}
                      placeholder="Rechercher par pays..."
                      disabled={isLoading}
                    />
                  </FormFieldCell>
                  <FormFieldCell>
                    <FormLabelSearch>Zone Géographique</FormLabelSearch>
                    <StyledAutoCompleteInput
                      value={filters.zoneSearch || ""}
                      onChange={handleZoneChange}
                      suggestions={filteredZoneSuggestions}
                      maxVisibleItems={5}
                      placeholder="Sélectionner une zone..."
                      disabled={isLoading}
                      fieldType="zone"
                      fieldLabel="zone"
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
          <TableTitle>Lieux</TableTitle>
          <ButtonSearch 
            title="Ajouter un lieu" 
            onClick={handleAddClick}
          >
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Ajouter un lieu
          </ButtonSearch>
        </TableHeader>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Nom</TableHeadCell>
              <TableHeadCell>Ville</TableHeadCell>
              <TableHeadCell>Code Postal</TableHeadCell>
              <TableHeadCell>Pays</TableHeadCell>
              <TableHeadCell>Zone Géographique</TableHeadCell>
              <TableHeadCell style={{ width: "100px", textAlign: "center" }}>
                Actions
              </TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Loading>Chargement des données...</Loading>
                </TableCell>
              </TableRow>
            ) : lieux.length > 0 ? (
              lieux.map((lieu) => (
                <TableRow key={lieu.lieuId}>
                  <TableCell>{lieu.nom}</TableCell>
                  <TableCell>{lieu.ville || ''}</TableCell>
                  <TableCell>{lieu.codePostal || ''}</TableCell>
                  <TableCell>{lieu.pays}</TableCell>
                  <TableCell>{lieu.geoZone?.name || ''}</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <EditButton onClick={() => handleEditClick(lieu)}>
                      <Edit size={16} />
                    </EditButton>
                    <CancelButton onClick={() => handleDeleteClick(lieu.lieuId)}>
                      <Trash2 size={16} />
                    </CancelButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <NoDataMessage>
                    {hasFilters 
                      ? "Aucun lieu ne correspond aux critères." 
                      : "Aucun lieu trouvé."}
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

export default LieuList;