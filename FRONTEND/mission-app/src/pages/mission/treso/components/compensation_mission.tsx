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
    ArrowRight,
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
import { useCompensationsByStatus, useUpdateStatus } from "@/api/mission/compensation(indemnité)/services";
import type { Compensation } from "@/api/mission/compensation(indemnité)/services";
import Modal from "@/components/modal";

interface Filter {
  status: string;
  paymentDateMin: string;
  paymentDateMax: string;
}

interface LoadingState {
  compensations: boolean;
  stats: boolean;
}

interface CompensationFiltersProps {
  isHidden: boolean;
  setIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
  filters: Filter;
  setFilters: React.Dispatch<React.SetStateAction<Filter>>;
  isLoading: LoadingState;
  handleFilterSubmit: () => void;
  handleResetFilters: () => void;
}

const CompensationFilters: React.FC<CompensationFiltersProps> = ({
  isHidden,
  setIsHidden,
  filters,
  setFilters,
  isLoading,
  handleFilterSubmit,
  handleResetFilters,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const handleFilterChange = (name: keyof Filter, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  const toggleMinimize = () => setIsMinimized((prev) => !prev);
  const toggleHide = () => setIsHidden((prev) => !prev);

  const isFilterEmpty = (): boolean => {
    return (
      !filters.status &&
      !filters.paymentDateMin &&
      !filters.paymentDateMax
    );
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
                        <FormLabelSearch>Statut</FormLabelSearch>
                        <FormInputSearch
                          as="select"
                          name="status"
                          value={filters.status}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange("status", e.target.value)}
                          disabled={isLoading.compensations}
                        >
                          <option value="">Tous</option>
                          <option value="unpaid">Non payé</option>
                          <option value="paid">Payé</option>
                        </FormInputSearch>
                      </FormFieldCell>
                      {/* <FormFieldCell>
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
                            Date de Paiement
                          </legend>
                          <div>
                            <FormLabelSearch>Du</FormLabelSearch>
                            <FormInputSearch
                              type="date"
                              value={filters.paymentDateMin}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange("paymentDateMin", e.target.value)}
                              disabled={isLoading.compensations}
                            />
                          </div>
                          <div>
                            <FormLabelSearch>Au</FormLabelSearch>
                            <FormInputSearch
                              type="date"
                              value={filters.paymentDateMax}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange("paymentDateMax", e.target.value)}
                              disabled={isLoading.compensations}
                            />
                          </div>
                        </fieldset>
                      </FormFieldCell> */}
                    </FormRow>
                  </tbody>
                </FormTableSearch>
                <FiltersActions>
                  <ButtonReset
                    type="button"
                    onClick={handleResetFilters}
                    disabled={isLoading.compensations || isFilterEmpty()}
                  >
                    Effacer filtres
                  </ButtonReset>
                  <ButtonSearch type="submit" disabled={isLoading.compensations}>
                    {isLoading.compensations ? "Recherche..." : "Rechercher"}
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

interface FormattedCompensation {
  assignationId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  missionId: string;
  missionName: string;
  missionType: string;
  transportType: string;
  lieuName: string;
  departureDate: string;
  returnDate: string;
  duration: number;
  totalAmount: number;
  status: string;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string | null;
  isValidated: boolean | null;
  allocatedFund: number;
}

const CompensationMission: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filter>({
    status: "",
    paymentDateMin: "",
    paymentDateMax: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<Filter>({
    status: "",
    paymentDateMin: "",
    paymentDateMax: "",
  });
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedCompensation, setSelectedCompensation] = useState<{ assignationId: string; employeeId: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [compensations, setCompensations] = useState<FormattedCompensation[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState<LoadingState>({
    compensations: true,
    stats: true,
  });

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.userId || "";

  const statusParam = appliedFilters.status || "";
  const { data: compensationsResponse, isLoading: compensationsLoading } = useCompensationsByStatus(statusParam, currentPage, pageSize);

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateStatus();

  useEffect(() => {
    if (!userId) {
      console.warn("No userId found, skipping compensation fetch");
      setIsLoading({ compensations: false, stats: false });
      setCompensations([]);
      setTotalEntries(0);
      return;
    }
  }, [userId]);

  useEffect(() => {
    setIsLoading((prev) => ({ ...prev, compensations: compensationsLoading }));
    if (compensationsResponse && userId) {
      if (!compensationsResponse.data || !compensationsResponse.data.data || !Array.isArray(compensationsResponse.data.data)) {
        console.warn("La réponse ne contient pas un tableau de résultats:", compensationsResponse);
        setCompensations([]);
        setTotalEntries(0);
        return;
      }

      const apiData = compensationsResponse.data.data;

      // Group by assignationId
      const grouped = apiData.reduce((acc: Record<string, FormattedCompensation>, item) => {
        const { assignation, compensations: comps } = item;
        const key = assignation.assignationId;
        const employee = assignation.employee || {};
        const mission = assignation.mission || {};
        const lieu = mission.lieu || {};

        const compStatus = comps[0]?.status || statusParam;

        if (!acc[key]) {
          acc[key] = {
            assignationId: assignation.assignationId || "N/A",
            employeeId: assignation.employeeId || "N/A",
            employeeName: `${employee.lastName || "Inconnu"} ${employee.firstName || ""}`.trim(),
            employeeCode: employee.employeeCode || "N/A",
            missionId: assignation.missionId || "N/A",
            missionName: mission.name || "Mission sans nom",
            missionType: mission.missionType || "Non spécifié",
            transportType: assignation.transport?.type || "N/A",
            lieuName: lieu.nom || "Non spécifié",
            departureDate: assignation.departureDate || "Non spécifié",
            returnDate: assignation.returnDate || "Non spécifié",
            duration: assignation.duration || 0,
            totalAmount: 0,
            status: compStatus,
            paymentDate: null,
            createdAt: assignation.createdAt || new Date().toISOString(),
            updatedAt: assignation.updatedAt || null,
            isValidated: !!assignation.isValidated,
            allocatedFund: assignation.allocatedFund || 0,
          };
        }

        let minPaymentDate: string | null = acc[key].paymentDate;
        let totalSum = acc[key].totalAmount;

        comps.forEach((compensation: Compensation) => {
          const compTotal = (
            (compensation.transportAmount || 0) +
            (compensation.breakfastAmount || 0) +
            (compensation.lunchAmount || 0) +
            (compensation.dinnerAmount || 0) +
            (compensation.accommodationAmount || 0) +
            (compensation.communicationAmount || 0) +
            (compensation.visaAmount || 0) +
            (compensation.medicalExpensesAmount || 0) +
            (compensation.taxesAmount || 0)
          );

          totalSum += compTotal;

          if (compensation.paymentDate) {
            const compDate = new Date(compensation.paymentDate).getTime();
            const currentMin = minPaymentDate ? new Date(minPaymentDate).getTime() : Infinity;
            if (compDate < currentMin) {
              minPaymentDate = compensation.paymentDate;
            }
          }
        });

        acc[key].totalAmount = totalSum;
        acc[key].paymentDate = minPaymentDate;

        return acc;
      }, {});

      const formattedCompensations: FormattedCompensation[] = Object.values(grouped);

      const total = compensationsResponse.data.totalCount;

      setCompensations(formattedCompensations);
      setTotalEntries(total);
    }
  }, [compensationsResponse, compensationsLoading, statusParam, currentPage, pageSize, userId]);

  const handleFilterSubmit = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({ status: "", paymentDateMin: "", paymentDateMax: "" });
    setAppliedFilters({ status: "", paymentDateMin: "", paymentDateMax: "" });
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
    setSelectedCompensation({ assignationId, employeeId });
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedCompensation(null);
  };

  const confirmAction = () => {
    if (selectedCompensation) {
      updateStatus(
        {
          employeeId: selectedCompensation.employeeId,
          assignationId: selectedCompensation.assignationId,
          status: "paid",
        },
        {
          onSuccess: () => {
            console.log(`Paiement confirmé pour ${selectedCompensation.assignationId}`);
            closeConfirmModal();
          },
          onError: (error) => {
            console.error("Erreur lors de la mise à jour du statut:", error);
            // Optionnel: Afficher une alerte d'erreur ici
          },
        }
      );
    }
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
    today.setHours(0, 0, 0, 0); // Reset to start of day for consistent calculation
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0); // Reset to start of day
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  const filteredCompensations = useMemo(() => {
    return compensations.filter((c) => {
      if (appliedFilters.paymentDateMin || appliedFilters.paymentDateMax) {
        if (c.status === "unpaid") return true; // Show all unpaid regardless of date filters
        if (!c.paymentDate) return false;
        const paymentDate = new Date(c.paymentDate);
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
  }, [compensations, appliedFilters]);

  const paginatedCompensations = useMemo(
    () =>
      filteredCompensations.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ),
    [filteredCompensations, currentPage, pageSize]
  );

  const hasFilters = !!appliedFilters.status || !!appliedFilters.paymentDateMin || !!appliedFilters.paymentDateMax;

  /**
   * Retourne le badge de statut stylisé.
   */
  const getStatusBadge = (status: string) => {
      const statusInfo = {
          "unpaid": { icon: XCircle, text: "Non payé", class: "status-pending" },
          "paid": { icon: CheckIcon, text: "Payé", class: "status-approved" },
      }[status] || { icon: ClockIcon, text: "Inconnu", class: "status-pending" };
      const Icon = statusInfo.icon;
      return (
          <StatusBadge className={statusInfo.class}>
              <Icon size={10} /> {statusInfo.text}
          </StatusBadge>
      );
  };

  /**
   * Rendu du bloc indicateur d'urgence basé sur le nombre de jours avant l'échéance.
   */
  const renderDueIndicator = (daysUntilDue: number, status: string) => {
      const neutralDays = 999; // Valeur neutre pour éviter les styles d'urgence
      if (status === 'paid') {
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
                      PAYÉ
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

  /**
   * Retourne le nom complet de l'employé tel quel
   */
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
                      <h1 className="page-title">Indemnités</h1>
                      <p className="page-subtitle">Gestion des indemnités</p>
                  </div>
              </div>
              <DetailsHeaderActions />
          </DetailsPageHeader>
          <DetailsSeparator />
          <CardsPaginationContainer>
              <CompensationFilters
                  isHidden={isHidden}
                  setIsHidden={setIsHidden}
                  filters={filters}
                  setFilters={setFilters}
                  isLoading={isLoading}
                  handleFilterSubmit={handleFilterSubmit}
                  handleResetFilters={handleResetFilters}
              />
              <CardsContainer
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--spacing-md, 1rem)',
                  alignItems: 'stretch',
                }}
              >
                  {/* Affichage conditionnel du chargement, des données ou de l'absence de données */}
                  {isLoading.compensations ? (
                      <Loading>Chargement des compensations...</Loading>
                  ) : paginatedCompensations.length > 0 ? (
                      paginatedCompensations.map((compensation: FormattedCompensation) => {
                          // Calcul des jours restants avant la date de départ
                          const daysUntilDue = getDaysUntilDue(compensation.departureDate);
                          return (
                              <Card key={compensation.assignationId} style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  height: '100%',
                              }}>
                                 
                                  {/* 1. Bloc Indicateur (Urgence/Statut) */}
                                  {renderDueIndicator(daysUntilDue, compensation.status)}
                                  {/* 2. En-tête (Titre & Badge Statut) */}
                                  <CardHeader style={{ marginBottom: '0.5rem' }}>
                                      <CardTitle title={compensation.missionName} style={{ fontSize: '0.875rem' }}>
                                          {compensation.missionName}
                                      </CardTitle>
                                     
                                      {getStatusBadge(compensation.status)}
                                  </CardHeader>
                                 
                                  {/* 3. Informations de la compensation - DESIGN AMÉLIORÉ ET RÉDUIT */}
                                  <CardInfo style={{ gap: '0.25rem', flex: 1 }}>
                                      {/* Bloc principal - Employé en vedette */}
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
                                                  minWidth: 0, // Permet le shrink
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
                                                      {formatEmployeeName(compensation.employeeName || "Non spécifié")}
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
                                                      {compensation.employeeCode || "N/A"}
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                      {/* Destination */}
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
                                                  {compensation.lieuName || "Non spécifié"}
                                              </div>
                                          </div>
                                      </div>
                                      {/* Période */}
                                      <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          padding: '6px 0',
                                          flexWrap: 'wrap',
                                      }}>
                                          <Calendar size={14} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                                          <div style={{
                                              flex: 1,
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              fontSize: '10px',
                                              fontWeight: '500',
                                              minWidth: 0,
                                          }}>
                                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                  {formatDate(compensation.departureDate)}
                                              </span>
                                              <ArrowRight size={12} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                  {formatDate(compensation.returnDate)}
                                              </span>
                                          </div>
                                      </div>
                                      {/* Date de paiement (si payée) */}
                                      {compensation.status === 'paid' && compensation.paymentDate && (
                                          <div style={{
                                              background: 'var(--success-bg)',
                                              padding: '6px 8px',
                                              borderRadius: '3px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              marginTop: '2px',
                                              flexWrap: 'wrap',
                                          }}>
                                              <CheckIcon size={12} style={{ color: 'var(--success-color)' }} />
                                              <div style={{ flex: 1, minWidth: 0 }}>
                                                  <span style={{
                                                      fontSize: '9px',
                                                      color: 'var(--success-color)',
                                                      fontWeight: '500',
                                                      overflow: 'hidden',
                                                      textOverflow: 'ellipsis',
                                                      whiteSpace: 'nowrap',
                                                  }}>
                                                      Payé le {formatDate(compensation.paymentDate)}
                                                  </span>
                                              </div>
                                          </div>
                                      )}
                                      {/* Total */}
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
                                                  {compensation.totalAmount.toLocaleString()} MGA
                                              </div>
                                          </div>
                                      </div>
                                  </CardInfo>
                                  {/* 4. Barre d'actions améliorée - Toujours présente, avec boutons conditionnels */}
                                  <ActionsContainer
                                      $singleButton={compensation.status !== 'unpaid'}
                                      style={{ marginTop: 'auto' }}
                                  >
                                      {/* Boutons conditionnels pour les compensations non payées */}
                                      {compensation.status === 'unpaid' && (
                                          <>
                                              <ActionButton
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      openConfirmModal(compensation.assignationId, compensation.employeeId);
                                                  }}
                                                  className="validate"
                                                  disabled={isUpdating}
                                              >
                                                  <CheckIcon size={14} />
                                                  Payer
                                              </ActionButton>
                                          </>
                                      )}
                                      {/* Bouton "Voir détails" toujours présent */}
                                      <ActionButton
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              navigate(`/mission/collaborateur/${compensation.missionId}`);
                                          }}
                                          className="details"
                                          disabled={isUpdating}
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
                          {filteredCompensations.length === 0
                            ? hasFilters
                              ? "Aucune compensation ne correspond aux critères de recherche."
                              : "Aucune compensation trouvée."
                            : "Aucune compensation sur cette page."
                          }
                      </NoDataMessage>
                  )}
              </CardsContainer>
              {/* Pagination */}
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
          {/* Modal de confirmation pour le paiement */}
          <Modal
              type="success"
              message="Êtes-vous sûr de vouloir payer cette indemnité ? Cette action est irréversible et passera la indemnité au statut 'Payée'."
              isOpen={isConfirmModalOpen}
              onClose={closeConfirmModal}
              title="Confirmer le paiement"
              confirmAction={confirmAction}
              confirmLabel={isUpdating ? "Mise à jour..." : "Confirmer le Paiement"}
              cancelLabel="Annuler"
              showActions={true}
          />
      </>
  );
};

export default CompensationMission;