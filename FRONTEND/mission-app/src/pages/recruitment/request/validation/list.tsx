"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TableContainer,
  TableTitle,
  TableHeader,
} from "@/styles/table-styles";

import { useCanValidateJobDescription, useHasValidationInRecruitment, useSearchPendedJobDescriptions, useSearchPendedRequests, type FilterPendedRequestDTO } from "@/api/recruitment/service";
import { useGetContractTypes } from "@/api/contract/services";
import { useGetAllDirections } from "@/api/direction/services";

import Alert from "@/components/alert";
import type { ContractType } from "@/api/contract/services";
import type { Direction } from "@/api/direction/services";
import { useNavigate } from "react-router-dom";
import DraftRequestCards from "./components/draft-request-card";
import DraftRequestFilters from "./components/draft-request-filters";
import { formatDate } from "date-fns";
import type { TabValidationKey } from "./components/validation-tabs";
import ValidationTabs from "./components/validation-tabs";
import DraftJobCards from "./components/draft-job-card";
import { formatRequestId } from "../form";

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

    const validator = JSON.parse(localStorage.getItem("user") || "{}");
    const validatorId = validator?.userId || "";

// Gestion des habilitations
    const {data: requestValidator} = useHasValidationInRecruitment(validatorId);
    const canViewRequests = requestValidator?.hasValidation;

    const {data: tdrValidator} = useCanValidateJobDescription(validatorId);
    const canViewJobDescriptions = tdrValidator?.hasValidation;
    
    const [activeTab, setActiveTab] = useState<TabValidationKey>(() => {
        let saved = sessionStorage.getItem("lastActiveValidationTab") as TabValidationKey | null;
        if(canViewJobDescriptions) saved = "tdr";
        else saved = "demandes";

        return saved;
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

// Demandes en attente / TDR en attente
    const { data: requestResponse, isLoading, error, refetch } 
        = useSearchPendedRequests(userId, searchFilters, page, pageSize);
    const requests = useMemo(() => requestResponse?.list || [], [requestResponse]);

    const { data: jobDescriptionResponse, isLoading: isLoadingJobDesc, error: errorJobDesc, refetch: refetchJobDesc } 
        = useSearchPendedJobDescriptions(searchFilters, page, pageSize);
    const jobDescriptions = useMemo(() => jobDescriptionResponse?.list || [], [jobDescriptionResponse]);

    // Mise à jour totalCount
    useEffect(() => {
        setTotalCount(requestResponse?.totalCount || 0);
    }, [requestResponse]);

    // Refetch quand appliedFilters, page ou pageSize changent
    useEffect(() => {
        refetch();
        refetchJobDesc();
    }, [appliedFilters, page, pageSize, refetch, refetchJobDesc]);

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

    if (error || errorJobDesc) return <div>Une erreur est survenue lors du chargement des données.</div>;

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

        <ValidationTabs
            activeTab={activeTab}
            onTabChange={tab => { 
                setActiveTab(tab); setPage(1); 
                sessionStorage.setItem("lastActiveValidationTab", tab); 
            }}
            canViewRequests={canViewRequests}
            canViewJobDescriptions={canViewJobDescriptions}
        />

        <TableContainer>
            {activeTab === "demandes" && (<>
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
                        navigate(`/recrutement/demandes/${formatRequestId(id)}/details?validateur=${userId}`);
                    }}
                />
            </>)}
            
            {activeTab === "tdr" && (<>
                <TableHeader>
                    <TableTitle>Liste des TDR en attente</TableTitle>
                </TableHeader>

                <DraftJobCards
                    jobDescriptions={jobDescriptions}
                    isLoading={isLoadingJobDesc}
                    totalEntries={totalCount}
                    currentPage={page}
                    pageSize={pageSize}
                    handlePageChange={setPage}
                    handlePageSizeChange={handlePageSizeChange}
                    formatDate={(date) => formatDate(new Date(date), "dd/MM/yyyy à HH:mm")}
                    handleRowClick={(requestId) => {
                        navigate(`/recrutement/demandes/${formatRequestId(requestId)}/details?validateur=${userId}`);
                    }}
                />
            </>)}
        </TableContainer>
    </>);
};

export default DraftRequestList;
