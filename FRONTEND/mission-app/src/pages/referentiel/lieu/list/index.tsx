"use client";
import { useState, useEffect, useCallback } from "react";
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
import { useGetLieux, useDeleteLieu } from "@/api/lieu/services";
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import Pagination from "@/components/pagination";
import LieuForm from "../form/index";
import type { Lieu } from "@/api/lieu/services";

interface FiltersState {
  nom: string;
  pays: string;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const LieuList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedLieu, setSelectedLieu] = useState<Lieu | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [lieuToDelete, setLieuToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });

  const [filters, setFilters] = useState<FiltersState>({ nom: "", pays: "" });
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({ nom: "", pays: "" });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const searchFilters = {
    nom: appliedFilters.nom.trim() || undefined,
    pays: appliedFilters.pays.trim() || undefined,
  };
  const { data: searchResponse, isLoading, error, refetch } = useGetLieux(searchFilters, page, pageSize);
  const deleteLieuMutation = useDeleteLieu();

  const lieux = searchResponse?.data || [];

  const hasFilters = appliedFilters.nom.trim() !== "" || appliedFilters.pays.trim() !== "";

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
  }, []);

  const handleEditClick = useCallback((lieu: Lieu) => {
    setSelectedLieu(lieu);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((lieuId: string) => {
    setLieuToDelete(lieuId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (lieuToDelete) {
      deleteLieuMutation.mutate(lieuToDelete, {
        onSuccess: () => {
          setAlert({ isOpen: true, type: "success", message: "Lieu supprimé avec succès." });
          setIsDeleteModalOpen(false);
          refetch();
        },
        onError: () => {
          setAlert({ isOpen: true, type: "error", message: "Erreur lors de la suppression du lieu." });
        },
      });
    }
  }, [lieuToDelete, deleteLieuMutation, refetch]);

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
    const resetFilters: FiltersState = { nom: "", pays: "" };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPage(1);
  }, []);

  const handleNomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, nom: e.target.value }));
  }, []);

  const handlePaysChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, pays: e.target.value }));
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
        <LieuForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onFormSuccess={handleFormSuccess}
          lieu={selectedLieu}
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
                    <FormLabelSearch>Pays</FormLabelSearch>
                    <FormInputSearch
                      type="text"
                      value={filters.pays}
                      onChange={handlePaysChange}
                      placeholder="Rechercher par pays..."
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
          <TableTitle>Lieux</TableTitle>
          <ButtonSearch title="Ajouter un lieu" onClick={handleAddClick}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Ajouter un lieu
          </ButtonSearch>
        </TableHeader>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Nom</TableHeadCell>
              <TableHeadCell>Adresse</TableHeadCell>
              <TableHeadCell>Ville</TableHeadCell>
              <TableHeadCell>Code Postal</TableHeadCell>
              <TableHeadCell>Pays</TableHeadCell>
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
            ) : lieux.length > 0 ? (
              lieux.map((lieu) => (
                <TableRow key={lieu.lieuId}>
                  <TableCell>{lieu.nom}</TableCell>
                  <TableCell>{lieu.adresse}</TableCell>
                  <TableCell>{lieu.ville}</TableCell>
                  <TableCell>{lieu.codePostal}</TableCell>
                  <TableCell>{lieu.pays}</TableCell>
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
                    {hasFilters ? "Aucun lieu ne correspond aux critères." : "Aucun lieu trouvé."}
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