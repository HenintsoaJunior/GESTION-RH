"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import {
  TableContainer,
  DataTable,
  TableTitle,
  TableHeader,
  TableHeadCell,
  TableRow,
  TableCell,
  ButtonSearch,
  FiltersContainer,
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
  EditButton,
  CancelButton,
  StyledSelect,
} from "@/styles/table-styles";

import { useSearchRequests, useSearchRequestStatuses, type FilterRequestDTO, type DocumentDTO, useDeleteRequest } from "@/api/recruitment/service";
import { useGetContractTypes } from "@/api/contract/services";
import { useGetAllDirections } from "@/api/direction/services";

import Alert from "@/components/alert";
import Pagination from "@/components/pagination";

import type { ContractType } from "@/api/contract/services";
import type { Direction } from "@/api/direction/services";
import RecruitmentRequestForm from "./request-form";
import { useHasHabilitation } from "@/api/users/services";
import ProtectedRoute from "@/components/protected-route";
import axios from "axios";
import RequestTabs from "./components/request-tabs";

// Types
interface FiltersState {
    post: string;
    status: string;
    direction: string;
    contract: string;
    selectedStatus?: DocumentDTO | null;
    selectedDirection?: Direction | null;
    selectedContract?: ContractType | null;
    dateMin: string;
    dateMax: string;
}
interface AlertState {
    isOpen: boolean;
    type: "info" | "success" | "error" | "warning";
    message: string;
}

// Composant
const RequestList: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
    const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
    
    const [activeTab, setActiveTab] = useState<'mes' | 'toutes'>('mes');
    const tabTitles = useMemo(() => [
        { key: 'toutes', label: 'Toutes les demandes' },
        { key: 'mes', label: 'Mes demandes' },
    ], []);

    const handleTabChange = useCallback((tab: string) => {
        setActiveTab(tab as 'mes' | 'toutes');
        setPage(1); // reset pagination si nécessaire
    }, []);

    const [filters, setFilters] = useState<FiltersState>({
        post: "",
        status: "",
        direction: "",
        contract: "",
        dateMin: "",
        dateMax: "",
    });

// Paramètres d'affichage
    const [appliedFilters, setAppliedFilters] = useState<FiltersState>({ ...filters });
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalCount, setTotalCount] = useState<number>(0);  

// Récupération des listes pour les filtres
    const { data: directionsResponse } = useGetAllDirections();
    const { data: contractsResponse } = useGetContractTypes();
    const { data: requestStatusesResponse } = useSearchRequestStatuses();

    const allDirections = useMemo(() => directionsResponse?.data || [], [directionsResponse]);
    const allContracts = useMemo(() => contractsResponse?.data || [], [contractsResponse]);
    const allRequestStatuses = useMemo(() => requestStatusesResponse?.data || [], [requestStatusesResponse]);

// Filtres de recherche envoyés à l'API
    const searchFilters: FilterRequestDTO = useMemo(
        () => ({
            post: appliedFilters.post.trim() || undefined,
            direction: appliedFilters.direction.trim() || undefined,
            contract: appliedFilters.contract.trim() || undefined,
            status: appliedFilters.status || undefined,
            minDate: appliedFilters.dateMin.trim() || undefined,
            maxDate: appliedFilters.dateMax.trim() || undefined,
            scope: activeTab, // Onglet actif
        }),
        [appliedFilters, activeTab]
    );
    const { data: searchResponse, isLoading, error, refetch } = useSearchRequests(searchFilters, page, pageSize);

    const requests = useMemo(() => searchResponse?.list || [], [searchResponse]);
    const hasFilters = useMemo(
        () => Object.values(searchFilters).some((f) => f !== undefined && f !== null && f !== ""),
        [searchFilters]
    );

// Gestion Habilitations
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData?.userId || "";

    const canAddRequest = useHasHabilitation(userId, "Créer demande recrutement");
    const canViewDetails = useHasHabilitation(userId, "Afficher détails demande recrutement");
    const canCancelRequest = useHasHabilitation(userId, "Annuler demande recrutement");


// Queries pour API
    const deleteRequestMutation = useDeleteRequest();

    const handleDeleteRequest = (id: string) => {
        if(window.confirm("Voulez-vous vraiment supprimer cette demande ?")) {
            deleteRequestMutation.mutate(id, {
                onSuccess: (data) => {
                    setAlert({ isOpen: true, type: "success", message: data.message || "Demande supprimée !" });
                },
                onError: (error) => {
                    if(axios.isAxiosError(error) && error.response) {
                        setAlert({ isOpen: true, type: "error", message: error.response.data?.message || "Erreur lors de la suppression" });
                    }
                }
            });
        }
    };

    useEffect(() => {
        setTotalCount(searchResponse?.totalCount || 0);
    }, [searchResponse]);

    const handleFormSuccess = useCallback(
        (message: string) => {
            setIsFormOpen(false);
            setAlert({ isOpen: true, type: "success", message });
            refetch();
        }, [refetch]
    );

    const handleFilterSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            setAppliedFilters(filters);
            setPage(1);
        }, [filters]
    );

    const handleResetFilters = useCallback(() => {
        const reset = {
            post: "",
            status: "", selectedStatus: null,
            direction: "", selectedDirection: null,
            contract: "", selectedContract: null,
            dateMin: "",
            dateMax: "",
        };
        setFilters(reset);
        setAppliedFilters(reset);
        setPage(1);
    }, []);

    const handleOpenForm = useCallback((requestId?: string) => {
        setEditingRequestId(requestId || null);
        setIsFormOpen(true);
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
        ) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };


    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setPage(1);
    };

    if (error) return <div>Une erreur est survenue lors du chargement des données.</div>;

// CONTENU DE LA PAGE
    return ( <>
        <Alert type={alert.type}
            message={alert.message}
            isOpen={alert.isOpen}
            onClose={() => setAlert({ ...alert, isOpen: false })}
        />

        {isFormOpen && (
            <RecruitmentRequestForm
                isOpen={isFormOpen}
                requestId={editingRequestId || undefined}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingRequestId(null); // reset après fermeture
                }}
                onFormSuccess={handleFormSuccess}
            />
        )}

        {/* Filtres */}
        <FiltersContainer>
            <FiltersSection>
                <Separator />
                <form onSubmit={handleFilterSubmit}>
                    <FormTableSearch>
                        <tbody>
                            {/* Ligne 1 : Poste, Direction, Contrat, Statut */}
                            <FormRow>
                                <FormFieldCell style={{ width: "30%" }}>
                                    <FormLabelSearch>Poste</FormLabelSearch>
                                    <FormInputSearch
                                        name="post"
                                        value={filters.post}
                                        onChange={handleInputChange}
                                        placeholder="Rechercher par poste..."
                                        disabled={isLoading}
                                    />
                                </FormFieldCell>

                                <FormFieldCell style={{ width: "10%" }}>
                                    <FormLabelSearch>Direction</FormLabelSearch>
                                    <StyledSelect
                                        name="direction"
                                        value={filters.direction}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        >
                                        <option value="">Toutes</option>
                                        {allDirections.map((d) => (
                                            <option key={d.directionId} value={d.directionName}>
                                            {d.directionName}
                                            </option>
                                        ))}
                                    </StyledSelect>
                                </FormFieldCell>

                                <FormFieldCell style={{ width: "10%" }}>
                                    <FormLabelSearch>Contrat</FormLabelSearch>
                                    <StyledSelect
                                        name="contract"
                                        value={filters.contract}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        >
                                        <option value="">Tous</option>
                                        {allContracts.map((c) => (
                                            <option key={c.code} value={c.code}>
                                            {c.label}
                                            </option>
                                        ))}
                                    </StyledSelect>
                                </FormFieldCell>

                                <FormFieldCell style={{ width: "10%" }}>
                                    <FormLabelSearch>Statut</FormLabelSearch>
                                    <StyledSelect
                                    name="status"
                                    value={filters.status}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    >
                                    <option value="">Tous</option>
                                    {allRequestStatuses.map((s) => (
                                        <option key={s.name} value={s.name}>
                                        {s.name}
                                        </option>
                                    ))}
                                    </StyledSelect>
                                </FormFieldCell>
                            {/* </FormRow>

                            <FormRow> */}
                                <FormFieldCell style={{ width: "20%" }}>
                                    <FormLabelSearch>Début de demande</FormLabelSearch>
                                    <FormInputSearch
                                        name="dateMin" type="date"
                                        value={filters.dateMin}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                    />
                                </FormFieldCell>

                                <FormFieldCell style={{ width: "20%" }}>
                                    <FormLabelSearch>Fin de demande</FormLabelSearch>
                                    <FormInputSearch
                                        name="dateMax" type="date"
                                        value={filters.dateMax}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
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

        <RequestTabs
            activeTab={activeTab}
            tabTitles={tabTitles}
            onTabChange={handleTabChange}
        />

        <TableContainer>
            <TableHeader>
                <TableTitle>Liste des demandes de recrutement</TableTitle>

                { canAddRequest && (
                    <ButtonSearch onClick={() => handleOpenForm(undefined)}>
                        <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                        Créer une demande
                    </ButtonSearch>
                )}
            </TableHeader>

            <DataTable>
                <thead>
                    <tr>
                        <TableHeadCell>Référence</TableHeadCell>
                        <TableHeadCell>Poste</TableHeadCell>
                        <TableHeadCell>Efféctif</TableHeadCell>
                        <TableHeadCell>Contrat</TableHeadCell>
                        <TableHeadCell>Date souhaitée</TableHeadCell>
                        <TableHeadCell>Statut</TableHeadCell>
                        <TableHeadCell>Date de demande</TableHeadCell>
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
                    ) : requests.length > 0 ? (
                    requests.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell>
                                { canViewDetails ? (
                                    <Link to={`/recrutement/demandes/${req.id}/details`} className="link">{req.id}</Link>
                                ) : ( req.id ) }
                            </TableCell>
                            <TableCell>{req.post}</TableCell>
                            <TableCell>{req.effective}</TableCell>
                            <TableCell>{req.contract || "N/A"}</TableCell>
                            <TableCell>
                                {req.wishedDate ? new Date(req.wishedDate).toLocaleDateString("fr-FR") : "N/A"}
                            </TableCell>
                            <TableCell>{req.status || "N/A"}</TableCell>
                            <TableCell>
                                {req.sendingDate ? new Date(req.sendingDate).toLocaleDateString("fr-FR") : "N/A"}
                            </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                                <EditButton onClick={() => handleOpenForm(req.id)}>
                                    <Edit size={16} />
                                </EditButton>
                                { canCancelRequest && (
                                    <CancelButton onClick={() => handleDeleteRequest(req.id)}>
                                        <Trash2 size={16} />
                                    </CancelButton> )
                                }
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={7}>
                            <NoDataMessage>
                                {hasFilters ? "Aucune demande ne correspond aux critères." : "Aucune demande trouvée."}
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
    </> );
};

const ProtectedRequestList: React.FC = () => (
    <ProtectedRoute requiredHabilitation="Lister demandes recrutement">
        <RequestList />
    </ProtectedRoute>
);

export default ProtectedRequestList;
