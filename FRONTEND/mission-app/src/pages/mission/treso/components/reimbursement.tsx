"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import {
    Clock as ClockIcon,
    CheckCircle as CheckIcon,
    XCircle,
    Calendar,
    MapPin,
    AlertTriangle,
    DollarSign,
    X,
    List,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    Eye, 
    User,
} from "lucide-react";
import {
    Loading,
    NoDataMessage,
    StatusBadge,
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
    PageHeader as DetailsPageHeader,
    HeaderLeft as DetailsHeaderLeft,
    BtnBack as DetailsBtnBack,
    HeaderActions as DetailsHeaderActions,
    Separator as DetailsSeparator,
} from "@/styles/detailsmission-styles";
import {
    CardsPaginationContainer,
    CardsContainer,
    Card,
    IndicatorBlock,
    IndicatorValue,
    IndicatorText,
    CardHeader,
    CardTitle,
    CardInfo,
    ActionButton,
    ActionsContainer,
} from "@/styles/card-styles";
import Pagination from "@/components/pagination";
import { useExpenseReportsByStatus, useReimburseByAssignationId, type ExpenseSummary } from "@/api/mission/expense_report/services";
import { useCurrencies } from '@/api/currency/services';
import { useGetAllEmployeesSimple } from "@/api/collaborator/services";
import type { Employee as CollabEmployee } from "@/api/collaborator/services";
import Modal from "@/components/modal";
import AlertComponent from "@/components/alert"; // Ajustez le chemin d'import selon votre structure de dossiers

interface Filter {
  status: string;
  missionType: string;
  employeeSearch: string;
  paymentDateMin: string;
  paymentDateMax: string;
  fictionalFilter: string;
}

interface LoadingState {
  remboursements: boolean;
  currencies: boolean;
  employees: boolean;
}

interface RemboursementFiltersProps {
  isHidden: boolean;
  setIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
  filters: Filter;
  setFilters: React.Dispatch<React.SetStateAction<Filter>>;
  isLoading: LoadingState;
  handleFilterSubmit: () => void;
  handleResetFilters: () => void;
  filteredEmployeeSuggestions: string[];
  missionTypes: string[];
  handleEmployeeChange: (value: string) => void;
  handleMissionTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handlePaymentDateMinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePaymentDateMaxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFictionalFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const RemboursementFilters: React.FC<RemboursementFiltersProps> = ({
  isHidden,
  setIsHidden,
  filters,
  setFilters,
  isLoading,
  handleFilterSubmit,
  handleResetFilters,
  filteredEmployeeSuggestions,
  missionTypes,
  handleEmployeeChange,
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
                        <FormLabelSearch>Collaborateur</FormLabelSearch>
                        <StyledAutoCompleteInput
                          value={filters.employeeSearch || ""}
                          onChange={handleEmployeeChange}
                          suggestions={filteredEmployeeSuggestions}
                          maxVisibleItems={5}
                          placeholder="Sélectionner un employé..."
                          disabled={isLoading.employees || isLoading.remboursements || isLoading.currencies}
                          fieldType="employee"
                          fieldLabel="employé"
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
                          disabled={isLoading.remboursements || isLoading.currencies}
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
                          disabled={isLoading.remboursements || isLoading.currencies}
                        >
                          <option value="">Tous</option>
                          {missionTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </FormInputSearch>
                      </FormFieldCell>
                    </FormRow>
                    
                    <FormRow>
                      <FormFieldCell colSpan={3}>
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
                              disabled={isLoading.remboursements || isLoading.currencies}
                            />
                          </div>
                          <div>
                            <FormLabelSearch>Au</FormLabelSearch>
                            <FormInputSearch
                              type="date"
                              value={filters.paymentDateMax}
                              onChange={handlePaymentDateMaxChange}
                              disabled={isLoading.remboursements || isLoading.currencies}
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
                    disabled={isLoading.remboursements || isLoading.currencies || isFilterEmpty()}
                  >
                    Effacer filtres
                  </ButtonReset>
                  <ButtonSearch type="submit" disabled={isLoading.remboursements || isLoading.currencies}>
                    {isLoading.remboursements || isLoading.currencies ? "Recherche..." : "Rechercher"}
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

interface FormattedRemboursement {
  assignationId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  missionId: string;
  missionName: string;
  missionType: string;
  lieuName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  isValidated: boolean | null;
  allocatedFund: number;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const Reimbursement: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filter>({
    status: "",
    missionType: "",
    employeeSearch: "",
    paymentDateMin: "",
    paymentDateMax: "",
    fictionalFilter: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<Filter>({
    status: "",
    missionType: "",
    employeeSearch: "",
    paymentDateMin: "",
    paymentDateMax: "",
    fictionalFilter: "",
  });
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedRemboursement, setSelectedRemboursement] = useState<{ assignationId: string; employeeId: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [remboursements, setRemboursements] = useState<FormattedRemboursement[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState<LoadingState>({
    remboursements: true,
    currencies: true,
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

  const statusParam = appliedFilters.status || undefined;
  const { data: remboursementsResponse, isLoading: remboursementsLoading } = useExpenseReportsByStatus({ 
    status: statusParam, 
    page: currentPage, 
    pageSize 
  });

  const { data: currenciesData, isLoading: currenciesLoading } = useCurrencies();

  const { mutate: reimburseMutation, isPending: isReimbursing } = useReimburseByAssignationId();

  // Récupération du taux de change EUR -> MGA (assumant que currenciesData est un objet avec des clés comme 'EUR_MGA' ou un tableau d'objets)
  const eurToMgaRate = useMemo(() => {
    if (!currenciesData) return 1; // Taux par défaut si pas de données (pas de conversion)
    // Ajustez cette logique selon la structure exacte de currenciesData
    // Exemple si c'est un objet: return currenciesData['EUR_MGA'] || 1;
    // Exemple si c'est un tableau: return currenciesData.find(c => c.from === 'EUR' && c.to === 'MGA')?.rate || 1;
    return 4800; // Taux fictif pour l'exemple ; remplacez par la vraie logique
  }, [currenciesData]);

  const employees = useMemo(() => employeesResponse?.data || [], [employeesResponse?.data]) as CollabEmployee[];

  const employeeSuggestions = useMemo(() =>
    employees.map((emp: CollabEmployee) => `${emp.firstName} ${emp.lastName}`),
    [employees]
  );

  const filteredEmployeeSuggestions = useMemo(() =>
    employeeSuggestions.filter((sug) =>
      sug.toLowerCase().includes((filters.employeeSearch || "").toLowerCase())
    ),
    [employeeSuggestions, filters.employeeSearch]
  );

  useEffect(() => {
    if (!userId) {
      console.warn("No userId found, skipping remboursement fetch");
      setIsLoading({ remboursements: false, currencies: false, employees: false });
      setRemboursements([]);
      setTotalEntries(0);
      return;
    }
  }, [userId]);

  useEffect(() => {
    setIsLoading((prev) => ({ 
      ...prev, 
      remboursements: remboursementsLoading,
      currencies: currenciesLoading,
      employees: employeesLoading,
    }));
    if (remboursementsResponse && userId && !currenciesLoading && !employeesLoading) {
      if (!remboursementsResponse.data || !remboursementsResponse.data.reports || !Array.isArray(remboursementsResponse.data.reports)) {
        console.warn("La réponse ne contient pas un tableau de résultats:", remboursementsResponse);
        setRemboursements([]);
        setTotalEntries(0);
        return;
      }

      const apiData: ExpenseSummary[] = remboursementsResponse.data.reports;

      const formattedRemboursements: FormattedRemboursement[] = apiData.map((item) => {
        // Conversion du montant depuis EUR vers MGA
        const convertedAmount = item.totalAmount * eurToMgaRate;
        return {
          assignationId: item.assignationId || "N/A",
          employeeId: "N/A", 
          employeeName: item.employeeName || "Inconnu",
          employeeCode: item.employeeCode || "N/A",
          missionId: item.missionId, 
          missionName: item.missionTitled || "Mission sans nom",
          missionType: "Non spécifié", 
          lieuName: item.lieuName || "Non spécifié",
          totalAmount: convertedAmount, // Montant converti
          status: item.status,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: null, 
          isValidated: null, 
          allocatedFund: 0,
        };
      });

      const total = remboursementsResponse.data.totalCount;

      setRemboursements(formattedRemboursements);
      setTotalEntries(total);
    }
  }, [remboursementsResponse, remboursementsLoading, currenciesLoading, employeesLoading, statusParam, currentPage, pageSize, userId, eurToMgaRate]);

  const handleFilterSubmit = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({ 
      status: "",
      missionType: "",
      employeeSearch: "",
      paymentDateMin: "",
      paymentDateMax: "",
      fictionalFilter: "",
    });
    setAppliedFilters({ 
      status: "",
      missionType: "",
      employeeSearch: "",
      paymentDateMin: "",
      paymentDateMax: "",
      fictionalFilter: "",
    });
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value);
    if (newPageSize > 0 && Number.isInteger(newPageSize)) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
  };

  const handleBack = () => {
    navigate("/treasury");
  };

  const openConfirmModal = (assignationId: string, employeeId: string) => {
    setSelectedRemboursement({ assignationId, employeeId });
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedRemboursement(null);
  };

  const confirmAction = () => {
    if (selectedRemboursement && userId) {
      reimburseMutation(
        {
          assignationId: selectedRemboursement.assignationId,
          userId,
        },
        {
          onSuccess: () => {
            console.log(`Remboursement confirmé pour ${selectedRemboursement.assignationId}`);
            // Affichage du toast alert de succès
            setAlert({
              message: "Remboursement confirmé avec succès !",
              type: "success",
              isOpen: true,
            });
            closeConfirmModal();
          },
          onError: (error) => {
            console.error("Erreur lors de la mise à jour du statut:", error);
            // Optionnel: Afficher une alerte d'erreur ici
            setAlert({
              message: "Erreur lors de la confirmation du remboursement.",
              type: "error",
              isOpen: true,
            });
          },
        }
      );
    }
  };

  // Fonction pour fermer l'alert
  const handleAlertClose = () => {
    setAlert({ message: "", type: "info", isOpen: false });
  };

  const formatDate = useCallback((dateString?: string | null): string => {
    if (!dateString) return "Date non spécifiée";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  const getDaysUntilDue = useCallback((dueDate?: string | null): number => {
    if (!dueDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  const filteredRemboursements = useMemo(() => {
    return remboursements.filter((c) => {
      // Filter by mission type
      if (appliedFilters.missionType && c.missionType !== appliedFilters.missionType) return false;

      // Filter by employee search
      if (appliedFilters.employeeSearch && !c.employeeName.toLowerCase().includes(appliedFilters.employeeSearch.toLowerCase())) return false;

      // Filter by fictional filter (dummy)
      if (appliedFilters.fictionalFilter && c.status !== appliedFilters.fictionalFilter) return false;

      // Filter by payment dates (existing logic)
      if (appliedFilters.paymentDateMin || appliedFilters.paymentDateMax) {
        if (c.status === "notreimbursed") return true; // Show all unreimbursed regardless of date filters
        if (!c.updatedAt) return false;
        const paymentDate = new Date(c.updatedAt);
        if (appliedFilters.paymentDateMin) {
          const minDate = new Date(appliedFilters.paymentDateMin);
          if (paymentDate < minDate) return false;
        }
        if (appliedFilters.paymentDateMax) {
          const maxDate = new Date(appliedFilters.paymentDateMax);
          if (paymentDate > maxDate) return false;
        }
      }
      return true;
    });
  }, [remboursements, appliedFilters]);

  const paginatedRemboursements = useMemo(
    () =>
      filteredRemboursements.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ),
    [filteredRemboursements, currentPage, pageSize]
  );

  const hasFilters = useMemo(() =>
    Object.values(appliedFilters).some((val) => (val || "").trim() !== ""),
    [appliedFilters]
  );

  const handleEmployeeChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, employeeSearch: value }));
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

  const handleFictionalFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, fictionalFilter: e.target.value }));
  }, []);

  const getStatusBadge = (status: string) => {
      const statusInfo = {
          "notreimbursed": { icon: XCircle, text: "Non remboursé", class: "status-pending" },
          "reimbursed": { icon: CheckIcon, text: "Remboursé", class: "status-approved" },
      }[status] || { icon: ClockIcon, text: "Inconnu", class: "status-pending" };
      const Icon = statusInfo.icon;
      return (
          <StatusBadge className={statusInfo.class}>
              <Icon size={10} /> {statusInfo.text}
          </StatusBadge>
      );
  };

  const renderDueIndicator = (daysUntilDue: number, status: string) => {
      const neutralDays = 999;
      if (status === 'reimbursed') {
          return (
              <IndicatorBlock $daysUntilDue={neutralDays} style={{
                  backgroundColor: 'var(--success-bg)',
                  color: 'var(--success-color)',
                  border: '2px solid var(--success-border)',
                  boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)',
              }}>
                  <CheckIcon size={24} style={{ color: 'var(--success-color)' }} />
                  <IndicatorValue style={{
                      color: 'var(--success-color)',
                      fontSize: '20px',
                      fontWeight: 'bold',
                  }}>
                  </IndicatorValue>
                  <IndicatorText style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                  }}>
                      REMBOURSÉ
                  </IndicatorText>
              </IndicatorBlock>
          );
      }
      const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;
      const isDueSoon = daysUntilDue <= 7 && daysUntilDue > 3;
      let Icon: React.ComponentType<{ size?: number }>, text: string, displayValue: string | number;
      let borderColor: string, shadow: string;
      if (daysUntilDue < 0) {
          Icon = XCircle;
          text = `RETARD`;
          displayValue = `+${Math.abs(daysUntilDue)}j`;
          borderColor = 'var(--danger-border)';
          shadow = '0 2px 8px rgba(239, 68, 68, 0.2)';
      } else if (isUrgent) {
          Icon = AlertTriangle;
          text = daysUntilDue === 0 ? "AUJOURD'HUI" : `URGENT`;
          displayValue = `${daysUntilDue}j`;
          borderColor = 'var(--error-border)';
          shadow = '0 2px 8px rgba(239, 68, 68, 0.2)';
      } else if (isDueSoon) {
          Icon = ClockIcon;
          text = `BIENTÔT`;
          displayValue = `${daysUntilDue}j`;
          borderColor = 'var(--warning-border)';
          shadow = '0 2px 8px rgba(245, 158, 11, 0.2)';
      } else if (daysUntilDue >= 0) {
          Icon = CheckIcon;
          text = "OK";
          displayValue = `${daysUntilDue}j`;
          borderColor = 'var(--success-border)';
          shadow = '0 2px 8px rgba(34, 197, 94, 0.2)';
      } else {
          Icon = ClockIcon;
          text = "N/A";
          displayValue = '--';
          borderColor = 'var(--border-color)';
          shadow = 'none';
      }
      return (
          <IndicatorBlock $daysUntilDue={daysUntilDue} style={{
              border: `2px solid ${borderColor}`,
              boxShadow: shadow,
          }}>
              <Icon size={24} />
              <IndicatorValue style={{
                  fontSize: '20px',
                  fontWeight: 'bold'
              }}>
                  {displayValue}
              </IndicatorValue>
              <IndicatorText style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
              }}>
                  {text}
              </IndicatorText>
      </IndicatorBlock>
      );
  };

  const formatEmployeeName = (fullName: string): string => {
      return fullName || "Non spécifié";
  };

  return (
      <>
          <DetailsPageHeader>
              <DetailsHeaderLeft>
                  <DetailsBtnBack onClick={handleBack} title="Retour aux missions">
                      <ArrowLeft className="w-5 h-5" />
                  </DetailsBtnBack>
              </DetailsHeaderLeft>
              <div className="header-center">
                  <div className="header-title-section">
                      <h1 className="page-title">Remboursements</h1>
                      <p className="page-subtitle">Gestion des remboursements</p>
                  </div>
              </div>
              <DetailsHeaderActions />
          </DetailsPageHeader>
          <DetailsSeparator />
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
                  missionTypes={missionTypes}
                  handleEmployeeChange={handleEmployeeChange}
                  handleMissionTypeChange={handleMissionTypeChange}
                  handlePaymentDateMinChange={handlePaymentDateMinChange}
                  handlePaymentDateMaxChange={handlePaymentDateMaxChange}
                  handleFictionalFilterChange={handleFictionalFilterChange}
              />
              <CardsContainer
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--spacing-md, 1rem)',
                  alignItems: 'stretch',
                }}
              >
                  {isLoading.remboursements || isLoading.currencies || isLoading.employees ? (
                      <Loading>Chargement des remboursements...</Loading>
                  ) : paginatedRemboursements.length > 0 ? (
                      paginatedRemboursements.map((remboursement: FormattedRemboursement) => {
                          const createdDate = new Date(remboursement.createdAt);
                          const dueDate = new Date(createdDate);
                          dueDate.setDate(createdDate.getDate() + 5);
                          const daysUntilDue = getDaysUntilDue(dueDate.toISOString());
                          return (
                              <Card key={remboursement.assignationId} style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  height: '100%',
                              }}>
                                  {renderDueIndicator(daysUntilDue, remboursement.status)}
                                  <CardHeader style={{ marginBottom: '0.5rem' }}>
                                      <CardTitle title={remboursement.missionName} style={{ fontSize: '0.875rem' }}>
                                          {remboursement.missionName}
                                      </CardTitle>
                                      {getStatusBadge(remboursement.status)}
                                  </CardHeader>
                                  <CardInfo style={{ gap: '0.25rem', flex: 1 }}>
                                      <div style={{
                                          background: 'var(--bg-light)',
                                          padding: '8px',
                                          borderRadius: '4px',
                                          border: '1px solid var(--border-color)',
                                      }}>
                                          <div style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              gap: '8px',
                                              flexWrap: 'wrap',
                                          }}>
                                              <div style={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '6px',
                                                  flex: 1,
                                                  minWidth: 0,
                                              }}>
                                                  <User size={16} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                                                  <div style={{
                                                      fontSize: '13px',
                                                      fontWeight: '600',
                                                      color: 'var(--text-color)',
                                                      overflow: 'hidden',
                                                      textOverflow: 'ellipsis',
                                                      whiteSpace: 'nowrap',
                                                  }}>
                                                      {formatEmployeeName(remboursement.employeeName || "Non spécifié")}
                                                  </div>
                                              </div>
                                              <div style={{
                                                  background: 'var(--bg-primary)',
                                                  padding: '6px 8px',
                                                  borderRadius: '3px',
                                                  border: '1px solid var(--border-color)',
                                                  flexShrink: 0,
                                              }}>
                                                  <div style={{
                                                      fontSize: '8px',
                                                      color: 'var(--text-secondary)',
                                                      marginBottom: '1px',
                                                      textAlign: 'center'
                                                  }}>
                                                      MAT.
                                                  </div>
                                                  <div style={{
                                                      fontSize: '11px',
                                                      fontWeight: '600',
                                                      color: 'var(--primary-color)',
                                                      textAlign: 'center'
                                                  }}>
                                                      {remboursement.employeeCode || "N/A"}
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                      <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          padding: '6px 0',
                                          borderBottom: '1px solid var(--border-color)',
                                          flexWrap: 'wrap',
                                      }}>
                                          <MapPin size={14} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                              <div style={{
                                                  fontSize: '11px',
                                                  fontWeight: '500',
                                                  color: 'var(--text-color)',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  whiteSpace: 'nowrap',
                                              }}>
                                                  {remboursement.lieuName || "Non spécifié"}
                                              </div>
                                          </div>
                                      </div>
                                      <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          padding: '6px 0',
                                          flexWrap: 'wrap',
                                      }}>
                                          <Calendar size={14} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                              <div style={{
                                                  fontSize: '11px',
                                                  fontWeight: '500',
                                                  color: 'var(--text-color)',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  whiteSpace: 'nowrap',
                                              }}>
                                                  Créé le {formatDate(remboursement.createdAt)}
                                              </div>
                                          </div>
                                      </div>
                                      <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          padding: '6px 0',
                                          flexWrap: 'wrap',
                                      }}>
                                          <DollarSign size={14} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                              <div style={{
                                                  fontSize: '11px',
                                                  fontWeight: '500',
                                                  color: 'var(--text-color)',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  whiteSpace: 'nowrap',
                                              }}>
                                                  {formatCurrency(remboursement.totalAmount)}
                                              </div>
                                          </div>
                                      </div>
                                  </CardInfo>
                                  <ActionsContainer
                                      $singleButton={remboursement.status !== 'notreimbursed'}
                                      style={{ marginTop: 'auto' }}
                                  >
                                      {remboursement.status === 'notreimbursed' && (
                                          <>
                                              <ActionButton
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      openConfirmModal(remboursement.assignationId, remboursement.employeeId);
                                                  }}
                                                  className="validate"
                                                  disabled={isReimbursing}
                                              >
                                                  <CheckIcon size={14} />
                                                  Rembourser
                                              </ActionButton>
                                          </>
                                      )}
                                      <ActionButton
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              navigate(`/mission/collaborateur/${remboursement.missionId}`);
                                          }}
                                          className="details"
                                          disabled={isReimbursing}
                                      >
                                          <Eye size={14} />
                                          Voir détails
                                      </ActionButton>
                                  </ActionsContainer>
                              </Card>
                          );
                      })
                  ) : (
                      <NoDataMessage>
                          {filteredRemboursements.length === 0
                            ? hasFilters
                              ? "Aucun remboursement ne correspond aux critères de recherche."
                              : "Aucun remboursement trouvé."
                            : "Aucun remboursement sur cette page."
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
          {/* Toast Alert Component */}
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