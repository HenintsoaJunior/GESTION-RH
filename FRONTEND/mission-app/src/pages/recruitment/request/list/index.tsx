"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchRequests, useSearchRequestStatuses, type FilterRequestDTO, useDeleteRecruitmentRequest } from "@/api/recruitment/service";
import { useGetContractTypes } from "@/api/contract/services";
import { useGetAllDirections } from "@/api/direction/services";
import { useHasHabilitation } from "@/api/users/services";
import axios from "axios";
import RecruitmentRequestForm from "../form";
import RequestTabs, { type TabKey } from "./components/request-tabs";
import RequestFilters from "./components/request-filters";
import RequestTable from "./components/request-table";
import RequestAlert from "./components/request-alert";
import { addDays } from "date-fns";

interface FiltersState {
  post: string;
  status: string;
  direction: string;
  contract: string;
  dateRange: [Date | null, Date | null];
}


interface AlertState {
  isOpen: boolean;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

type FormMode = "create" | "regularisation" | "edit";

const RequestList: React.FC = () => {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.userId || "";

  const [formMode, setFormMode] = useState<FormMode>("create");

  // Habilitations
  const canAddRequest = useHasHabilitation(userId, "Créer demande recrutement");
  const canAddRegularisation = useHasHabilitation(userId, "Créer demande régularisation");
  const canViewDetails = useHasHabilitation(userId, "Afficher détails demande recrutement");
  const canEditRequest = useHasHabilitation(userId, "Créer demande recrutement");
  const canCancelRequest = useHasHabilitation(userId, "Annuler demande recrutement");
  const canViewAllRequests = useHasHabilitation(userId, "Lister demandes recrutement");
  const canViewCollaboratorRequests = useHasHabilitation(userId, "Lister demandes N-1");

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const saved = sessionStorage.getItem("lastActiveRequestTab") as TabKey | null;
    
    if (!canViewAllRequests && !canViewCollaboratorRequests) return "mes";
    return (saved==="mes" || saved==="toutes" || saved==="collaborateurs") ? saved : "mes";
  });

  useEffect(() => {
    if ((!canViewCollaboratorRequests && activeTab === "collaborateurs") ||
      (!canViewAllRequests && activeTab === "toutes")) {
      setActiveTab("mes");
    }

  }, [canViewAllRequests, canViewCollaboratorRequests, activeTab]);


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, type: "info", message: "" });
  const [filters, setFilters] = useState<FiltersState>({
    post: "",
    status: "",
    direction: "",
    contract: "",
    dateRange: [null, null],
  });
  
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({ ...filters });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Données pour filtres
  const { data: directionsResponse } = useGetAllDirections();
  const { data: contractsResponse } = useGetContractTypes();
  const { data: requestStatusesResponse } = useSearchRequestStatuses();

  const allDirections = useMemo(() => directionsResponse?.data || [], [directionsResponse]);
  const allContracts = useMemo(() => contractsResponse?.data || [], [contractsResponse]);
  const allRequestStatuses = useMemo(() => requestStatusesResponse?.data || [], [requestStatusesResponse]);

  // Recherche
  const searchFilters: FilterRequestDTO = useMemo(() => ({
    post: appliedFilters.post.trim() || undefined,
    direction: appliedFilters.direction.trim() || undefined,
    contract: appliedFilters.contract.trim() || undefined,
    status: appliedFilters.status || undefined,
    minDate: appliedFilters.dateRange[0]
      ? appliedFilters.dateRange[0].toISOString().split("T")[0]
      : undefined,
    maxDate: appliedFilters.dateRange[1]
      ? addDays(appliedFilters.dateRange[1], 1).toISOString().split("T")[0]
      : undefined,
    scope: activeTab,
  }), [appliedFilters, activeTab]);


  const { data: searchResponse, isLoading, error, refetch } = useSearchRequests(searchFilters, page, pageSize);
  const requests = useMemo(() => searchResponse?.list || [], [searchResponse]);
  // const hasFilters = useMemo(() => Object.values(searchFilters).some(f => f !== undefined && f !== null && f !== ""), [searchFilters]);

  // Mutations
  const deleteMutation = useDeleteRecruitmentRequest();

  const handleDeleteRequest = (id: string) => {
    if(window.confirm("Voulez-vous vraiment supprimer cette demande ?")) {
      deleteMutation.mutate(id, {
        onSuccess: data => setAlert({ isOpen: true, type: "success", message: data.message || "Demande supprimée !" }),
        onError: error => {
          if(axios.isAxiosError(error) && error.response) {
            setAlert({ 
              isOpen: true, type: "error", 
              message: error.response.data?.message || "Erreur lors de la suppression" 
            });
          }
        }
      });
    }
  };

  useEffect(() => {
    setTotalCount(searchResponse?.totalCount || 0);
  }, [searchResponse]);

  const handleFormSuccess = useCallback((message: string) => {
    setIsFormOpen(false);
    setAlert({ isOpen: true, type: "success", message });
    refetch();
  }, [refetch]);

  const handleResetFilters = useCallback(() => {
    const reset: FiltersState = {
      post: "",
      status: "",
      direction: "",
      contract: "",
      dateRange: [null, null],
    };
    setFilters(reset);
    setAppliedFilters(reset);
    setPage(1);
  }, []);


  const handleFilterSubmit = useCallback((values: FiltersState) => {
    setAppliedFilters(values);
    setPage(1);
  }, []);

  const handleOpenForm = useCallback((mode: FormMode = "create", requestId?: string) => {
    setFormMode(mode);
    setEditingRequestId(requestId || null);
    setIsFormOpen(true);
  }, []);

  if (error) return <div>Une erreur est survenue lors du chargement des données.</div>;
  // console.log("Mode de formulaire: ",formMode);

  return (<>
    <RequestAlert alert={alert} onClose={() => setAlert({ ...alert, isOpen: false })} />

    {isFormOpen && (
      <RecruitmentRequestForm
        isOpen={isFormOpen}
        requestId={editingRequestId || undefined}
        isRegularisation={formMode === "regularisation"}
        onClose={() => { 
          setIsFormOpen(false); 
          setEditingRequestId(null); 
          setFormMode("create");
        }}
        onFormSuccess={handleFormSuccess}
      />
    )}

    <RequestFilters
      filters={filters}
      setFilters={setFilters}
      onSubmit={handleFilterSubmit}
      allDirections={allDirections}
      allContracts={allContracts}
      allStatuses={allRequestStatuses}
      isLoading={isLoading}
      onReset={handleResetFilters}
    />

    <RequestTabs
      activeTab={activeTab}
      onTabChange={tab => { 
        setActiveTab(tab); setPage(1); 
        sessionStorage.setItem("lastActiveRequestTab", tab); 
      }}
      canViewAllRequests={canViewAllRequests}
      canViewCollaboratorRequests={canViewCollaboratorRequests}
    />

    <RequestTable
      requests={requests}
      isLoading={isLoading}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize} // maintenant, ce sera un nombre
      onEdit={(id) => handleOpenForm("edit", id)}
      onDelete={handleDeleteRequest}
      canAddRequest={canAddRequest}
      canAddRegularisation={canAddRegularisation}
      canEditRequest={canEditRequest}
      canCancelRequest={canCancelRequest}
      canViewDetails={canViewDetails}
      onAddRequest={() => handleOpenForm("create")}
      onAddRegularisation={() => handleOpenForm("regularisation")}
    />
  </>);
};

export default RequestList;
