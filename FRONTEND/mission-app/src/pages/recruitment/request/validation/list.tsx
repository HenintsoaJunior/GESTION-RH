"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TableContainer,
  TableTitle,
  TableHeader,
} from "@/styles/table-styles";

import { useSearchPendedRequests, type FilterPendedRequestDTO } from "@/api/recruitment/service";
import { useGetContractTypes } from "@/api/contract/services";
import { useGetAllDirections } from "@/api/direction/services";

import Alert from "@/components/alert";
import type { ContractType } from "@/api/contract/services";
import type { Direction } from "@/api/direction/services";
import { useNavigate } from "react-router-dom";
import DraftRequestCards from "./components/draft-request-card";
import DraftRequestFilters from "./components/draft-request-filters";
import { formatDate } from "date-fns";

// Types pour filtres
interface FiltersState {
    post: string;
    direction: string;
    contract: string;
    status: string;
    selectedDirection?: Direction | null;
    selectedContract?: ContractType | null;
    dateRange: [Date | null, Date | null];
}

interface AlertState {
    isOpen: boolean;
    type: "info" | "success" | "error" | "warning";
    message: string;
}

const DraftRequestList: React.FC = () => {
    const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });

    const [filters, setFilters] = useState<FiltersState>({
        post: "",
        direction: "",
        contract: "",
        status: "",
        selectedDirection: null,
        selectedContract: null,
        dateRange: [null, null],
    });

    const [appliedFilters, setAppliedFilters] = useState<FiltersState>({ ...filters });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const navigate = useNavigate();

    // Récupération des listes pour les filtres
    const { data: directionsResponse } = useGetAllDirections();
    const { data: contractsResponse } = useGetContractTypes();

    const allDirections = useMemo(() => directionsResponse?.data || [], [directionsResponse]);
    const allContracts = useMemo(() => contractsResponse?.data || [], [contractsResponse]);

    // Préparer filtres pour le backend
    const searchFilters: FilterPendedRequestDTO = useMemo(() => {
        const [startDate, endDate] = appliedFilters.dateRange;
        return {
            post: appliedFilters.post || undefined,
            direction: appliedFilters.direction || undefined,
            contract: appliedFilters.contract || undefined,
            status: appliedFilters.status || undefined,
            minDate: startDate ? startDate.toISOString().split("T")[0] : undefined,
            maxDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
        };
    }, [appliedFilters]);

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData?.userId || "";

    const { data: searchResponse, isLoading, error, refetch } = useSearchPendedRequests(userId, searchFilters, page, pageSize);
    const requests = useMemo(() => searchResponse?.list || [], [searchResponse]);

    // Mise à jour totalCount
    useEffect(() => {
        setTotalCount(searchResponse?.totalCount || 0);
    }, [searchResponse]);

    // Refetch quand appliedFilters, page ou pageSize changent
    useEffect(() => {
        refetch();
    }, [appliedFilters, page, pageSize, refetch]);

    const handleFilterSubmit = useCallback(() => {
        setAppliedFilters(filters);
        setPage(1);
    }, [filters]);

    const handleResetFilters = useCallback(() => {
        const reset: FiltersState = {
            post: "",
            direction: "",
            contract: "",
            status: "",
            selectedDirection: null,
            selectedContract: null,
            dateRange: [null, null],
        };
        setFilters(reset);
        setAppliedFilters(reset);
        setPage(1);
    }, []);

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setPage(1);
    };

    if (error) return <div>Une erreur est survenue lors du chargement des données.</div>;

    return (<>
        <Alert
            type={alert.type}
            message={alert.message}
            isOpen={alert.isOpen}
            onClose={() => setAlert({ ...alert, isOpen: false })}
        />

        {/* Filtres */}
        <DraftRequestFilters
            filters={filters}
            setFilters={setFilters}
            isLoading={isLoading}
            allDirections={allDirections}
            allContracts={allContracts}
            onSubmit={handleFilterSubmit}
            onReset={handleResetFilters}
        />

        <TableContainer>
            <TableHeader>
                <TableTitle>Liste des demandes en attente</TableTitle>
            </TableHeader>

            <DraftRequestCards
                requests={requests}
                isLoading={isLoading}
                totalEntries={totalCount}
                currentPage={page}
                pageSize={pageSize}
                handlePageChange={setPage}
                handlePageSizeChange={handlePageSizeChange}
                formatDate={(date) => formatDate(new Date(date), "dd/MM/yyyy à HH:mm")}
                handleRowClick={(id) => {
                    navigate(`/recrutement/demandes/${id}/details?validateur=${userId}`);
                }}
            />
        </TableContainer>
    </>);
};

export default DraftRequestList;
