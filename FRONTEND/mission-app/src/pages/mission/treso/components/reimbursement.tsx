/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import {
    X,
    List,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
} from "lucide-react";
import {
    Loading,
    NoDataMessage,
    FiltersContainer,
    FiltersHeader,
    FiltersTitle,
    FiltersControls,
    FilterControlButton,
    FiltersSection,
    FormTableSearch,
    FormRow,
    FormFieldCell,
    FormLabelSearch,
    FormInputSearch,
    FiltersActions,
    ButtonReset,
    ButtonSearch,
    FiltersToggle,
    ButtonShowFilters,
    StyledAutoCompleteInput,
} from "@/styles/table-styles";
import {
    CardsPaginationContainer,
    CardsContainer,
} from "@/styles/card-styles";
import Pagination from "@/components/pagination";
import { useExpenseReportsByFilters, useReimburseByMissionId } from "@/api/mission/expense_report/services";
import { useGetAllEmployeesSimple } from "@/api/collaborator/services";
import type { Employee as CollabEmployee } from "@/api/collaborator/services";
import Modal from "@/components/modal";
import AlertComponent from "@/components/alert";
import { ReimbursementCard } from "./reimbursement-card";
import type { FormattedRemboursement, Filter, LoadingState } from "./types/reimbursement";

// Interface pour les props des filtres
interface RemboursementFiltersProps {
  isHidden: boolean;
  setIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
  filters: Filter;
  setFilters: React.Dispatch<React.SetStateAction<Filter>>;
  isLoading: LoadingState;
  handleFilterSubmit: () => void;
  handleResetFilters: () => void;
  filteredEmployeeSuggestions: string[];
  filteredMatriculeSuggestions: string[];
  missionTypes: string[];
  handleEmployeeChange: (value: string) => void;
  handleMatriculeChange: (value: string) => void;
  handleMissionTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handlePaymentDateMinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePaymentDateMaxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Composant de filtres
const RemboursementFilters: React.FC<RemboursementFiltersProps> = ({
  isHidden,
  setIsHidden,
  filters,
  setFilters,
  isLoading,
  handleFilterSubmit,
  handleResetFilters,
  filteredEmployeeSuggestions,
  filteredMatriculeSuggestions,
  missionTypes,
  handleEmployeeChange,
  handleMatriculeChange,
  handleMissionTypeChange,
  handlePaymentDateMinChange,
  handlePaymentDateMaxChange,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  
  const handleFilterChange = (name: keyof Filter, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  
  const toggleMinimize = () => setIsMinimized((prev) => !prev);
  const toggleHide = () => setIsHidden((prev) => !prev);

  const isFilterEmpty = (): boolean => {
    return Object.values(filters).every((val) => (val || "").trim() === "");
  };

  return (
    <>
      {!isHidden && (
        <FiltersContainer $isMinimized={isMinimized}>
          <FiltersHeader>
            <FiltersTitle>Filtres de Recherche</FiltersTitle>
            <FiltersControls>
              <FilterControlButton
                $isMinimized={isMinimized}
                onClick={toggleMinimize}
                title={isMinimized ? "Développer" : "Réduire"}
              >
                {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </FilterControlButton>
              <FilterControlButton $isClose onClick={toggleHide} title="Fermer">
                <X size={16} />
              </FilterControlButton>
            </FiltersControls>
          </FiltersHeader>
          {!isMinimized && (
            <FiltersSection>
              <form
                onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  handleFilterSubmit();
                }}
              >
                <FormTableSearch>
                  <tbody>
                    <FormRow>
                      <FormFieldCell>
                        <FormLabelSearch>Matricule</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.employeeCode || ""}
                          onChange={handleMatriculeChange}
                          suggestions={filteredMatriculeSuggestions}
                          maxVisibleItems={5}
                          placeholder="Recherche par matricule ..."
                          disabled={isLoading.employees || isLoading.remboursements}
                          fieldType="employee"
                          fieldLabel="matricule"
                          showAddOption={false}
                        />
                      </FormFieldCell>
                      <FormFieldCell>
                        <FormLabelSearch>Collaborateur</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.employeeSearch || ""}
                          onChange={handleEmployeeChange}
                          suggestions={filteredEmployeeSuggestions}
                          maxVisibleItems={5}
                          placeholder="Recherche par collaborateur ..."
                          disabled={isLoading.employees || isLoading.remboursements}
                          fieldType="employee"
                          fieldLabel="collaborateur"
                          showAddOption={false}
                        />
                      </FormFieldCell>
                      <FormFieldCell>
                        <FormLabelSearch>Statut</FormLabelSearch>
                        <FormInputSearch
                          as="select"
                          name="status"
                          value={filters.status}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange("status", e.target.value)}
                          disabled={isLoading.remboursements}
                        >
                          <option value="">Tous</option>
                          <option value="notreimbursed">Non remboursé</option>
                          <option value="reimbursed">Remboursé</option>
                        </FormInputSearch>
                      </FormFieldCell>
                      <FormFieldCell>
                        <FormLabelSearch>Type de mission</FormLabelSearch>
                        <FormInputSearch
                          as="select"
                          value={filters.missionType}
                          onChange={handleMissionTypeChange}
                          disabled={isLoading.remboursements}
                        >
                          <option value="">Tous</option>
                          {missionTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </FormInputSearch>
                      </FormFieldCell>
                    </FormRow>
                    
                    <FormRow>
                      <FormFieldCell colSpan={2}>
                        <fieldset style={{ 
                          display: "grid", 
                          gridTemplateColumns: "1fr 1fr", 
                          gap: "var(--spacing-md)",
                          background: "var(--bg-primary, #ffffff)",
                          padding: "var(--spacing-md)",
                          border: "1px solid var(--border-color, #ddd)",
                          borderRadius: "var(--border-radius, 4px)",
                          margin: "0"
                        }}>
                          <legend style={{ 
                            fontWeight: "var(--font-weight-semibold)",
                            color: "var(--text-color)",
                            padding: "0 var(--spacing-sm)",
                            fontSize: "0.75rem"
                          }}>
                            Date de Remboursement
                          </legend>
                          <div>
                            <FormLabelSearch>Du</FormLabelSearch>
                            <FormInputSearch
                              type="date"
                              value={filters.paymentDateMin}
                              onChange={handlePaymentDateMinChange}
                              disabled={isLoading.remboursements}
                            />
                          </div>
                          <div>
                            <FormLabelSearch>Au</FormLabelSearch>
                            <FormInputSearch
                              type="date"
                              value={filters.paymentDateMax}
                              onChange={handlePaymentDateMaxChange}
                              disabled={isLoading.remboursements}
                            />
                          </div>
                        </fieldset>
                      </FormFieldCell>
                    </FormRow>
                  </tbody>
                </FormTableSearch>
                <FiltersActions>
                  <ButtonReset
                    type="button"
                    onClick={handleResetFilters}
                    disabled={isLoading.remboursements || isFilterEmpty()}
                  >
                    Effacer filtres
                  </ButtonReset>
                  <ButtonSearch type="submit" disabled={isLoading.remboursements}>
                    {isLoading.remboursements ? "Recherche..." : "Rechercher"}
                  </ButtonSearch>
                </FiltersActions>
              </form>
            </FiltersSection>
          )}
        </FiltersContainer>
      )}
      {isHidden && (
        <FiltersToggle>
          <ButtonShowFilters type="button" onClick={toggleHide}>
            <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Afficher les filtres
          </ButtonShowFilters>
        </FiltersToggle>
      )}
    </>
  );
};

const Reimbursement: React.FC = () => {
  const navigate = useNavigate();
  
  // États pour les filtres
  const [filters, setFilters] = useState<Filter>({
    status: "",
    missionType: "",
    employeeSearch: "",
    employeeCode: "",
    paymentDateMin: "",
    paymentDateMax: "",
    fictionalFilter: "",
  });
  
  const [appliedFilters, setAppliedFilters] = useState<Filter>({
    status: "",
    missionType: "",
    employeeSearch: "",
    employeeCode: "",
    paymentDateMin: "",
    paymentDateMax: "",
    fictionalFilter: "",
  });
  
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedRemboursement, setSelectedRemboursement] = useState<{ missionId: string; employeeId: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [remboursements, setRemboursements] = useState<FormattedRemboursement[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  
  const [isLoading, setIsLoading] = useState<LoadingState>({
    remboursements: true,
    employees: true,
  });

  // État pour l'alert toast
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
    isOpen: boolean;
  }>({ message: "", type: "info", isOpen: false });

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.userId || "";

  const missionTypes = ["National", "International"];

  const { data: employeesResponse, isLoading: employeesLoading } = useGetAllEmployeesSimple();
  
  // Utiliser le nouveau hook avec tous les filtres
  const { data: remboursementsResponse, isLoading: remboursementsLoading } = useExpenseReportsByFilters({ 
    status: appliedFilters.status || undefined,
    employeeName: appliedFilters.employeeSearch || undefined,
    employeeCode: appliedFilters.employeeCode || undefined,
    missionType: appliedFilters.missionType || undefined,
    paymentDateMin: appliedFilters.paymentDateMin || undefined,
    paymentDateMax: appliedFilters.paymentDateMax || undefined,
    page: currentPage, 
    pageSize 
  });

  const { mutate: reimburseMutation, isPending: isReimbursing } = useReimburseByMissionId();

  const employees = useMemo(() => employeesResponse?.data || [], [employeesResponse?.data]) as CollabEmployee[];

  // Préparer les suggestions pour l'autocomplete de matricule (codes seulement)
  const matriculeSuggestions = useMemo(() =>
    employees
      .filter((emp: CollabEmployee) => emp.employeeCode)
      .map((emp: CollabEmployee) => emp.employeeCode || ""),
    [employees]
  );

  // Préparer les suggestions pour l'autocomplete de collaborateur (noms seulement)
  const employeeNameSuggestions = useMemo(() =>
    employees
      .filter((emp: CollabEmployee) => emp.firstName && emp.lastName)
      .map((emp: CollabEmployee) => `${emp.lastName} ${emp.firstName}`),
    [employees]
  );

  // Filtrer les suggestions de matricule
  const filteredMatriculeSuggestions = useMemo(() =>
    matriculeSuggestions.filter((code) =>
      code.toLowerCase().includes((filters.employeeCode || "").toLowerCase())
    ),
    [matriculeSuggestions, filters.employeeCode]
  );

  // Filtrer les suggestions de collaborateur
  const filteredEmployeeSuggestions = useMemo(() =>
    employeeNameSuggestions.filter((name) =>
      name.toLowerCase().includes((filters.employeeSearch || "").toLowerCase())
    ),
    [employeeNameSuggestions, filters.employeeSearch]
  );

  useEffect(() => {
    setIsLoading((prev) => ({ 
      ...prev, 
      remboursements: remboursementsLoading,
      employees: employeesLoading,
    }));
    
    if (remboursementsResponse && userId && !employeesLoading) {
      if (!remboursementsResponse.data || !remboursementsResponse.data.reports || !Array.isArray(remboursementsResponse.data.reports)) {
        console.warn("La réponse ne contient pas un tableau de résultats:", remboursementsResponse);
        setRemboursements([]);
        setTotalEntries(0);
        return;
      }

      const apiData = remboursementsResponse.data.reports;

      const formattedRemboursements: FormattedRemboursement[] = apiData.map((item: any) => {
        return {
          missionId: item.missionId,
          employeeId: item.employeeCode || "N/A", 
          employeeName: item.employeeName || "Inconnu",
          employeeCode: item.employeeCode || "N/A",
          missionName: item.missionTitled || "Mission sans nom",
          missionType: item.missionType || "Non spécifié", 
          lieuName: item.lieuName || "Non spécifié",
          totalAmount: item.totalAmount,
          status: item.status,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || null, 
          isValidated: item.isValidated || null, 
          allocatedFund: item.allocatedFund || 0,
        };
      });

      const total = remboursementsResponse.data.totalCount;

      setRemboursements(formattedRemboursements);
      setTotalEntries(total);
    }
  }, [remboursementsResponse, remboursementsLoading, employeesLoading, currentPage, pageSize, userId]);

  const handleFilterSubmit = useCallback(() => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
  }, [filters]);

  const handleResetFilters = useCallback(() => {
    const resetFilters = { 
      status: "",
      missionType: "",
      employeeSearch: "",
      employeeCode: "",
      paymentDateMin: "",
      paymentDateMax: "",
      fictionalFilter: "",
    };
    
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value);
    if (newPageSize > 0 && Number.isInteger(newPageSize)) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
  }, []);

  const handleBack = useCallback(() => {
    navigate("/treasury");
  }, [navigate]);

  const openConfirmModal = useCallback((missionId: string, employeeId: string) => {
    setSelectedRemboursement({ missionId, employeeId });
    setIsConfirmModalOpen(true);
  }, []);

  const closeConfirmModal = useCallback(() => {
    setIsConfirmModalOpen(false);
    setSelectedRemboursement(null);
  }, []);

  const confirmAction = useCallback(() => {
    if (selectedRemboursement && userId) {
      reimburseMutation(
        {
          missionId: selectedRemboursement.missionId,
          userId,
        },
        {
          onSuccess: () => {
            console.log(`Remboursement confirmé pour ${selectedRemboursement.missionId}`);
            setAlert({
              message: "Remboursement confirmé avec succès !",
              type: "success",
              isOpen: true,
            });
            closeConfirmModal();
            // Recharger les données après remboursement
            handleFilterSubmit();
          },
          onError: (error: any) => {
            console.error("Erreur lors de la mise à jour du statut:", error);
            setAlert({
              message: "Erreur lors de la confirmation du remboursement.",
              type: "error",
              isOpen: true,
            });
          },
        }
      );
    }
  }, [selectedRemboursement, userId, reimburseMutation, closeConfirmModal, handleFilterSubmit]);

  const handleAlertClose = useCallback(() => {
    setAlert({ message: "", type: "info", isOpen: false });
  }, []);

  const handleEmployeeChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, employeeSearch: value }));
  }, []);

  const handleMatriculeChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, employeeCode: value }));
  }, []);

  const handleMissionTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, missionType: e.target.value }));
  }, []);

  const handlePaymentDateMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, paymentDateMin: e.target.value }));
  }, []);

  const handlePaymentDateMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, paymentDateMax: e.target.value }));
  }, []);

  const hasFilters = useMemo(() =>
    Object.values(appliedFilters).some((val) => (val || "").trim() !== ""),
    [appliedFilters]
  );

  return (
      <>
        {/* Nouvel en-tête avec le même style que CompensationMission */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <button
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-light)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-light)'}
              title="Retour aux missions"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: 0,
                color: 'var(--text-color)',
              }}>
                Remboursements
              </h1>
              <p style={{
                fontSize: '0.875rem',
                margin: 0,
                color: 'var(--text-secondary)',
              }}>
                Gestion des remboursements
              </p>
            </div>
          </div>
        </div>

        <CardsPaginationContainer>
            <RemboursementFilters
                isHidden={isHidden}
                setIsHidden={setIsHidden}
                filters={filters}
                setFilters={setFilters}
                isLoading={isLoading}
                handleFilterSubmit={handleFilterSubmit}
                handleResetFilters={handleResetFilters}
                filteredEmployeeSuggestions={filteredEmployeeSuggestions}
                filteredMatriculeSuggestions={filteredMatriculeSuggestions}
                missionTypes={missionTypes}
                handleEmployeeChange={handleEmployeeChange}
                handleMatriculeChange={handleMatriculeChange}
                handleMissionTypeChange={handleMissionTypeChange}
                handlePaymentDateMinChange={handlePaymentDateMinChange}
                handlePaymentDateMaxChange={handlePaymentDateMaxChange}
            />
            
            <CardsContainer
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--spacing-md, 1rem)',
                alignItems: 'stretch',
              }}
            >
                {isLoading.remboursements || isLoading.employees ? (
                    <Loading>Chargement des remboursements...</Loading>
                ) : remboursements.length > 0 ? (
                    remboursements.map((remboursement: FormattedRemboursement) => (
                        <ReimbursementCard
                            key={remboursement.missionId}
                            remboursement={remboursement}
                            onReimburse={openConfirmModal}
                            isReimbursing={isReimbursing}
                        />
                    ))
                ) : (
                    <NoDataMessage>
                        {hasFilters
                          ? "Aucun remboursement ne correspond aux critères de recherche."
                          : "Aucun remboursement trouvé."
                        }
                    </NoDataMessage>
                )}
            </CardsContainer>
            
            {totalEntries > 0 && (
                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalEntries={totalEntries}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </CardsPaginationContainer>
        
        <Modal
            type="success"
            message="Êtes-vous sûr de vouloir rembourser ces frais ? Cette action est irréversible et passera les rapports au statut 'Remboursé'."
            isOpen={isConfirmModalOpen}
            onClose={closeConfirmModal}
            title="Confirmer le remboursement"
            confirmAction={confirmAction}
            confirmLabel={isReimbursing ? "Mise à jour..." : "Confirmer le Remboursement"}
            cancelLabel="Annuler"
            showActions={true}
        />
        
        <AlertComponent
          type={alert.type}
          message={alert.message}
          isOpen={alert.isOpen}
          onClose={handleAlertClose}
        />
      </>
  );
};

export default Reimbursement;