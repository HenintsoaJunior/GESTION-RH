"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search } from "lucide-react";
import {
  TableContainer,
  TableTitle,
  TableHeader,
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
} from "@/styles/table-styles";

import { useSearchPendedRequests, type FilterRequestDTO } from "@/api/recruitment/service";
import { useGetContractTypes } from "@/api/contract/services";
import { useGetAllDirections } from "@/api/direction/services";

import Alert from "@/components/alert";
import type { ContractType } from "@/api/contract/services";
import type { Direction } from "@/api/direction/services";
import { useHasHabilitation } from "@/api/users/services";
import RequestValidationForm from "./request-validation-form";
import PendingRequestCards from "./components/pended-request-card";
import { useNavigate } from "react-router-dom";

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

const DraftRequestList: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });

    const [filters, setFilters] = useState<FiltersState>({
        post: "",
        direction: "",
        contract: "",
        dateMin: "",
        dateMax: "",
    });
    const navigate = useNavigate();

    const [appliedFilters, setAppliedFilters] = useState<FiltersState>({ ...filters });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [requestId, setRequestId] = useState("");

    // Récupération des listes pour les filtres
    const { data: directionsResponse } = useGetAllDirections();
    const { data: contractsResponse } = useGetContractTypes();

    const allDirections = useMemo(() => directionsResponse?.data || [], [directionsResponse]);
    const allContracts = useMemo(() => contractsResponse?.data || [], [contractsResponse]);

    // Suggestions autocomplete
    const directionSuggestions = useMemo(() => allDirections.map(d => d.directionName), [allDirections]);
    const filteredDirectionSuggestions = useMemo(
        () => directionSuggestions.filter(s => s.toLowerCase().includes((filters.direction || "").toLowerCase())),
        [directionSuggestions, filters.direction]
    );

    const contractSuggestions = useMemo(() => allContracts.map(ct => ct.label), [allContracts]);
    const filteredContractSuggestions = useMemo(
        () => contractSuggestions.filter(s => s.toLowerCase().includes((filters.contract || "").toLowerCase())),
        [contractSuggestions, filters.contract]
    );

    // Filtres envoyés au backend
    const searchFilters: FilterRequestDTO = useMemo(() => ({
        post: appliedFilters.post.trim() || undefined,
        direction: appliedFilters.direction.trim() || undefined,
        contract: appliedFilters.contract.trim() || undefined,
        minDate: appliedFilters.dateMin ? new Date(appliedFilters.dateMin).toISOString().split('T')[0] : undefined,
        maxDate: appliedFilters.dateMax ? new Date(appliedFilters.dateMax).toISOString().split('T')[0] : undefined,
    }), [appliedFilters]);

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData?.userId || "";

    const { data: searchResponse, isLoading, error, refetch } = useSearchPendedRequests(userId, searchFilters, page, pageSize);

    const requests = useMemo(() => searchResponse?.list || [], [searchResponse]);
    const hasFilters = useMemo(
        () => Object.values(searchFilters).some(f => f !== undefined && f !== null && f !== ""),
        [searchFilters]
    );

    // Habilitations
    const canViewDetails = useHasHabilitation(userId, "Afficher détails demande recrutement");

    // Mise à jour totalCount
    useEffect(() => {
        setTotalCount(searchResponse?.totalCount || 0);
    }, [searchResponse]);

    // Refetch automatique quand appliedFilters, page ou pageSize changent
    useEffect(() => {
        refetch();
    }, [appliedFilters, page, pageSize]);

    // Handlers
    const handleFormSuccess = useCallback((message: string) => {
        setIsFormOpen(false);
        setAlert({ isOpen: true, type: "success", message });
        refetch();
    }, [refetch]);

    const handleFilterSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setAppliedFilters(filters);
        setPage(1);
    }, [filters]);

    const handleResetFilters = useCallback(() => {
        const reset: FiltersState = {
            post: "",
            direction: "",
            contract: "",
            selectedDirection: null,
            selectedContract: null,
            dateMin: "",
            dateMax: "",
        };
        setFilters(reset);
        setAppliedFilters(reset);
        setPage(1);
    }, []);

    const handleOpenValidationForm = useCallback((requestId: string) => {
        setRequestId(requestId);
        setIsFormOpen(true);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDirectionChange = (value: string) => {
        const matched = allDirections.find(d => d.directionName === value) || null;
        setFilters(prev => ({ ...prev, direction: value, selectedDirection: matched }));
    };

    const handleContractChange = (value: string) => {
        const matched = allContracts.find(ct => ct.code === value) || null;
        setFilters(prev => ({ ...prev, contract: value, selectedContract: matched }));
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

            {isFormOpen && requestId && (
                <RequestValidationForm
                    isOpen={isFormOpen}
                    requestId={requestId}
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

                                <FormRow>
                                    <FormFieldCell style={{ width: "28%" }}>
                                        <FormLabelSearch>Début d'envoi</FormLabelSearch>
                                        <FormInputSearch
                                            name="dateMin"
                                            type="date"
                                            value={filters.dateMin}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                        />
                                    </FormFieldCell>

                                    <FormFieldCell style={{ width: "28%" }}>
                                        <FormLabelSearch>Fin d'envoi</FormLabelSearch>
                                        <FormInputSearch
                                            name="dateMax"
                                            type="date"
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
                    <TableTitle>Liste des demandes en attente</TableTitle>
                </TableHeader>

                <PendingRequestCards
                    requests={requests}
                    isLoading={isLoading}
                    totalEntries={totalCount}
                    currentPage={page}
                    pageSize={pageSize}
                    handlePageChange={setPage}
                    handlePageSizeChange={handlePageSizeChange}
                    formatDate={(date) => new Date(date).toLocaleDateString("fr-FR")}
                    handleRowClick={(id) => {
                        if(canViewDetails) navigate(`/recrutement/demandes/${id}/details`);
                    }}
                    handleOpenValidationForm={handleOpenValidationForm}
                />
            </TableContainer>
        </>
    );
};

export default DraftRequestList;
