"use client";
import { useState, useCallback, useMemo } from "react";
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
import { useTransports, useDeleteTransport } from "@/api/transport/services";
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import TransportForm from "../form/index";
import type { Transport } from "@/api/transport/services";

interface FiltersState {
  type: string;
}

interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

const TransportList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedTransport, setSelectedTransport] = useState<Transport | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [transportToDelete, setTransportToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });

  const [filters, setFilters] = useState<FiltersState>({ type: "" });

  const { data: searchResponse, isLoading, error, refetch } = useTransports();
  const deleteTransportMutation = useDeleteTransport();

  const allTransports = useMemo(() => searchResponse?.data || [], [searchResponse]);
  const filteredTransports = useMemo(() => {
    if (!filters.type.trim()) return allTransports;
    return allTransports.filter(transport =>
      transport.type.toLowerCase().includes(filters.type.toLowerCase())
    );
  }, [allTransports, filters.type]);

  const hasFilters = filters.type.trim() !== "";

  const handleAddClick = useCallback(() => {
    setSelectedTransport(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClick = useCallback((transport: Transport) => {
    setSelectedTransport(transport);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((transportId: string) => {
    setTransportToDelete(transportId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (transportToDelete) {
      deleteTransportMutation.mutate(transportToDelete, {
        onSuccess: () => {
          setAlert({ isOpen: true, type: "success", message: "Transport supprimé avec succès." });
          setIsDeleteModalOpen(false);
          refetch();
        },
        onError: () => {
          setAlert({ isOpen: true, type: "error", message: "Erreur lors de la suppression du transport." });
        },
      });
    }
  }, [transportToDelete, deleteTransportMutation, refetch]);

  const handleFormSuccess = useCallback((message: string) => {
    setIsFormOpen(false);
    setAlert({ isOpen: true, type: "success", message });
    refetch();
  }, [refetch]);

  const handleFilterSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
  }, []);

  const handleResetFilters = useCallback((): void => {
    setFilters({ type: "" });
  }, []);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, type: e.target.value }));
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
        <TransportForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onFormSuccess={handleFormSuccess}
          transport={selectedTransport}
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
                    <FormLabelSearch>Type</FormLabelSearch>
                    <FormInputSearch
                      type="text"
                      value={filters.type}
                      onChange={handleTypeChange}
                      placeholder="Rechercher par type..."
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
          <TableTitle>Transports</TableTitle>
          <ButtonSearch title="Ajouter" onClick={handleAddClick}>
            <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Ajouter
          </ButtonSearch>
        </TableHeader>
        <DataTable>
          <thead>
            <tr>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell style={{ width: "100px", textAlign: "center" }}>Actions</TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2}>
                  <Loading>Chargement des données...</Loading>
                </TableCell>
              </TableRow>
            ) : filteredTransports.length > 0 ? (
              filteredTransports.map((transport) => (
                <TableRow key={transport.transportId}>
                  <TableCell>{transport.type}</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <EditButton onClick={() => handleEditClick(transport)}>
                      <Edit size={16} />
                    </EditButton>
                    <CancelButton onClick={() => handleDeleteClick(transport.transportId)}>
                      <Trash2 size={16} />
                    </CancelButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2}>
                  <NoDataMessage>
                    {hasFilters ? "Aucun transport ne correspond aux critères." : "Aucun transport trouvé."}
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

export default TransportList;