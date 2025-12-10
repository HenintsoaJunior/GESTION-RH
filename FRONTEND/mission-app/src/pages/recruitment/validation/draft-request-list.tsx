"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { CheckLine, Search } from "lucide-react";
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
  EditButton,
} from "@/styles/table-styles";

import { useSearchRequests, type FilterRequestDTO } from "@/api/recruitment/service";
import { useGetContractTypes } from "@/api/contract/services";
import { useGetAllDirections } from "@/api/direction/services";

import Alert from "@/components/alert";
import Pagination from "@/components/pagination";

import type { ContractType } from "@/api/contract/services";
import type { Direction } from "@/api/direction/services";
import { useHasHabilitation } from "@/api/users/services";
import RequestValidationForm from "./request-validation-form";

// Types
interface FiltersState {
    post: string;
    direction: string;
    contract: string;
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
const DraftRequestList: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
  
    const [filters, setFilters] = useState<FiltersState>({
        post: "",
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
    const [requestId, setRequestId] = useState<string>("");

// Récupération des listes pour les filtres
    const { data: directionsResponse } = useGetAllDirections();
    const { data: contractsResponse } = useGetContractTypes();
    // const { data: requestStatusesResponse } = useSearchRequestStatuses();

    const allDirections = useMemo(() => directionsResponse?.data || [], [directionsResponse]);
    const allContracts = useMemo(() => contractsResponse?.data || [], [contractsResponse]);
    // const allRequestStatuses = useMemo(() => requestStatusesResponse?.data || [], [requestStatusesResponse]);
    
// Suggestions pour autocomplete
    const directionSuggestions = useMemo(() => allDirections.map((d) => d.directionName), [allDirections]);
    const filteredDirectionSuggestions = useMemo(
        () => directionSuggestions.filter((s) => s.toLowerCase().includes((filters.direction || "").toLowerCase())),
        [directionSuggestions, filters.direction]
    );

    const contractSuggestions = useMemo(() => allContracts.map((ct) => ct.label), [allContracts]);
    const filteredContractSuggestions = useMemo(
        () => contractSuggestions.filter((s) => s.toLowerCase().includes((filters.contract || "").toLowerCase())),
        [contractSuggestions, filters.contract]
    );

// Filtres de recherche envoyés à l'API
    const searchFilters: FilterRequestDTO = useMemo(
        () => ({
          post: appliedFilters.post.trim() || undefined,
          direction: appliedFilters.direction.trim() || undefined,
          contract: appliedFilters.contract.trim() || undefined,
          minDate: appliedFilters.dateMin.trim() || undefined,
          maxDate: appliedFilters.dateMax.trim() || undefined,
        }),
        [appliedFilters]
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

    const canViewDetails = useHasHabilitation(userId, "Afficher détails demande recrutement");

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

    const handleOpenValidationForm = useCallback((requestId:string) => {
        setRequestId(requestId);
        setIsFormOpen(true);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleDirectionChange = (value: string) => {
        setFilters((prev) => ({ ...prev, direction: value }));
        const matched = allDirections.find((d) => d.directionName === value);
        setFilters((prev) => ({ ...prev, selectedDirection: matched || null }));
    };

    const handleContractChange = (value: string) => {
        setFilters((prev) => ({ ...prev, contract: value }));
        const matched = allContracts.find((ct) => ct.code === value);
        setFilters((prev) => ({ ...prev, selectedContract: matched || null }));
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

        {(isFormOpen && requestId) && (
            <RequestValidationForm
                isOpen={isFormOpen}
                requestId={requestId}        // <-- ICI
                onClose={() => setIsFormOpen(false)}
                onFormSuccess={handleFormSuccess}
            />
        )}

        {/* Filtres */}
        <FiltersContainer>
            <FiltersHeader>
                <FiltersTitle>Filtrage des demandes</FiltersTitle>
            </FiltersHeader>
            <FiltersSection>
                <Separator />
                <form onSubmit={handleFilterSubmit}>
                    <FormTableSearch>
                        <tbody>
                            {/* Ligne 1 : Poste, Direction, Contrat */}
                            <FormRow>
                                <FormFieldCell style={{ width: "28%" }}>
                                    <FormLabelSearch>Poste</FormLabelSearch>
                                    <FormInputSearch
                                        name="post"
                                        value={filters.post}
                                        onChange={handleInputChange}
                                        placeholder="Rechercher par poste..."
                                        disabled={isLoading}
                                    />
                                </FormFieldCell>

                                <FormFieldCell style={{ width: "24%" }}>
                                    <FormLabelSearch>Direction</FormLabelSearch>
                                    <StyledAutoCompleteInput
                                        value={filters.direction || ""}
                                        onChange={handleDirectionChange}
                                        suggestions={filteredDirectionSuggestions}
                                        maxVisibleItems={5}
                                        placeholder="Sélectionner..."
                                        disabled={isLoading}
                                        fieldType="direction"
                                        fieldLabel="Direction"
                                    />
                                </FormFieldCell>

                                <FormFieldCell style={{ width: "24%" }}>
                                    <FormLabelSearch>Contrat</FormLabelSearch>
                                    <StyledAutoCompleteInput
                                        value={filters.contract || ""}
                                        onChange={handleContractChange}
                                        suggestions={filteredContractSuggestions}
                                        maxVisibleItems={5}
                                        placeholder="Sélectionner..."
                                        disabled={isLoading}
                                        fieldType="contract"
                                        fieldLabel="Contract"
                                    />
                                </FormFieldCell>

                            </FormRow>

                            {/* Ligne 2 : Date min, Date max*/}
                            <FormRow>
                                <FormFieldCell style={{ width: "28%" }}>
                                    <FormLabelSearch>Début d'envoi</FormLabelSearch>
                                    <FormInputSearch
                                        name="dateMin" type="date"
                                        value={filters.dateMin}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                    />
                                </FormFieldCell>

                                <FormFieldCell style={{ width: "28%" }}>
                                    <FormLabelSearch>Fin d'envoi</FormLabelSearch>
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

        <TableContainer>
            <TableHeader>
                <TableTitle>Liste des demandes non validées</TableTitle>
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
                        <TableHeadCell>Date d'envoi</TableHeadCell>
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
                                    <Link to={`/recrutement/demandes/${req.id}/details`} className="link">
                                    {req.id}
                                    </Link>
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
                                <EditButton onClick={() => handleOpenValidationForm(req.id)}>
                                    <CheckLine size={16} />
                                </EditButton>
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

export default DraftRequestList;
