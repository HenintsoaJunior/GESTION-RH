/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import {
    Clock as ClockIcon,
    CheckCircle as CheckIcon,
    XCircle,
    Calendar,
    MapPin,
    User,
    AlertTriangle,
    DollarSign,
    X,
    List,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    ArrowRight,
    Eye, 
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

interface Filter {
  status: string;
  reimbursementDateMin: string;
  reimbursementDateMax: string;
}

interface LoadingState {
  reimbursements: boolean;
  stats: boolean;
}

interface ReimbursementFiltersProps {
  isHidden: boolean;
  setIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
  filters: Filter;
  setFilters: React.Dispatch<React.SetStateAction<Filter>>;
  isLoading: LoadingState;
  handleFilterSubmit: () => void;
  handleResetFilters: () => void;
}

const ReimbursementFilters: React.FC<ReimbursementFiltersProps> = ({
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
      !filters.reimbursementDateMin &&
      !filters.reimbursementDateMax
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
                          disabled={isLoading.reimbursements}
                        >
                          <option value="">Tous les statuts</option>
                          <option value="unreimbursed">Non remboursé</option>
                          <option value="reimbursed">Remboursé</option>
                        </FormInputSearch>
                      </FormFieldCell>
                      <FormFieldCell />
                    </FormRow>
                    <FormRow>
                      <FormFieldCell>
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
                              value={filters.reimbursementDateMin}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange("reimbursementDateMin", e.target.value)}
                              disabled={isLoading.reimbursements}
                            />
                          </div>
                          <div>
                            <FormLabelSearch>Au</FormLabelSearch>
                            <FormInputSearch
                              type="date"
                              value={filters.reimbursementDateMax}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange("reimbursementDateMax", e.target.value)}
                              disabled={isLoading.reimbursements}
                            />
                          </div>
                        </fieldset>
                      </FormFieldCell>
                      <FormFieldCell />
                    </FormRow>
                  </tbody>
                </FormTableSearch>
                <FiltersActions>
                  <ButtonReset
                    type="button"
                    onClick={handleResetFilters}
                    disabled={isLoading.reimbursements || isFilterEmpty()}
                  >
                    Effacer filtres
                  </ButtonReset>
                  <ButtonSearch type="submit" disabled={isLoading.reimbursements}>
                    {isLoading.reimbursements ? "Recherche..." : "Rechercher"}
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


interface FormattedReimbursement {
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
  reimbursementDate: string | null;
  createdAt: string;
  updatedAt: string | null;
  isValidated: boolean | null;
  allocatedFund: number;
}

const Reimbursement: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filter>({
    status: "",
    reimbursementDateMin: "",
    reimbursementDateMax: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<Filter>({
    status: 'unreimbursed',
    reimbursementDateMin: "",
    reimbursementDateMax: "",
  });
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const isLoading: LoadingState = { reimbursements: false, stats: false };

  // Données hardcodées
  const reimbursements: FormattedReimbursement[] = [
    {
      assignationId: "MA-000051",
      employeeId: "EMP-001",
      employeeName: "Christelle RAKOTOMAVO",
      employeeCode: "00446",
      missionId: "MISS-002",
      missionName: "Mission de renforcement des capacités du personnel aéroportuaire",
      missionType: "Note de frais",
      transportType: "",
      lieuName: "France",
      departureDate: "2025-11-09",
      returnDate: "2025-11-13",
      duration: 4,
      totalAmount: 87000,
      status: "unreimbursed",
      reimbursementDate: null,
      createdAt: "2025-11-01T10:00:00Z",
      updatedAt: null,
      isValidated: true,
      allocatedFund: 860000,
    },
    {
      assignationId: "MA-000001",
      employeeId: "EMP-002",
      employeeName: "Christelle RAKOTOMAVO",
      employeeCode: "MM002",
      missionId: "MISS-001",
      missionName: "Optimisation de la gestion des flux passagers à l’aéroport d’Ivato",
      missionType: "Indemnité",
      transportType: "",
      lieuName: "Analamanga",
      departureDate: "2025-11-09",
      returnDate: "2025-11-12",
      duration: 3,
      totalAmount: 645000,
      status: "reimbursed",
      reimbursementDate: "2025-11-09T14:30:00Z",
      createdAt: "2025-11-09T11:00:00Z",
      updatedAt: "2025-11-09T14:30:00Z",
      isValidated: true,
      allocatedFund: 200000,
    }
  ];

  const handleFilterSubmit = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({ status: "", reimbursementDateMin: "", reimbursementDateMax: "" });
    setAppliedFilters({ status: 'unreimbursed', reimbursementDateMin: "", reimbursementDateMax: "" });
    setCurrentPage(1);
  };

  const handleBack = () => {
    navigate("/treasury");
  };

  const handleCardClick = (id: string) => {
    console.log(`Voir détails du remboursement ${id}`);
    // navigate(`/treasury/remboursement/${id}`); // À décommenter si route détails existe
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate?: string | null, returnDate?: string): number => {
    let targetDate: Date;
    if (dueDate) {
      targetDate = new Date(dueDate);
    } else {
      // Pour les non remboursés, utiliser la date de retour + 7 jours comme échéance
      targetDate = new Date(returnDate || '');
      targetDate.setDate(targetDate.getDate() + 7);
    }
    const now = new Date('2025-11-09'); // Date actuelle fournie
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredReimbursements = useMemo(() => {
    return reimbursements.filter((r) => {
      const passStatus = !appliedFilters.status || r.status === appliedFilters.status;
      if (!passStatus) return false;

      if (appliedFilters.reimbursementDateMin || appliedFilters.reimbursementDateMax) {
        if (r.status === "unreimbursed") return true; // Show all unreimbursed regardless of date filters

        if (!r.reimbursementDate) return false;

        const reimbursementDate = new Date(r.reimbursementDate);
        if (appliedFilters.reimbursementDateMin) {
          const minDate = new Date(appliedFilters.reimbursementDateMin);
          if (reimbursementDate < minDate) return false;
        }
        if (appliedFilters.reimbursementDateMax) {
          const maxDate = new Date(appliedFilters.reimbursementDateMax);
          if (reimbursementDate > maxDate) return false;
        }
      }

      return true;
    });
  }, [reimbursements, appliedFilters]);

  const totalEntries = filteredReimbursements.length;

  const paginatedReimbursements = useMemo(
    () =>
      filteredReimbursements.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ),
    [filteredReimbursements, currentPage, pageSize]
  );

  const hasFilters = !!appliedFilters.status || !!appliedFilters.reimbursementDateMin || !!appliedFilters.reimbursementDateMax;

  /**
   * Retourne le badge de statut stylisé.
   */
  const getStatusBadge = (status: string) => {
      const statusInfo = {
          "unreimbursed": { icon: XCircle, text: "Non remboursé", class: "status-waiting" },
          "reimbursed": { icon: CheckIcon, text: "Remboursé", class: "status-approved" },
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

  return (
      <>
          <DetailsPageHeader>
              <DetailsHeaderLeft>
                  <DetailsBtnBack onClick={handleBack} title="Retour à la trésorerie">
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
              <ReimbursementFilters
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
                  {isLoading.reimbursements ? (
                      <Loading>Chargement des remboursements...</Loading>
                  ) : paginatedReimbursements.length > 0 ? (
                      paginatedReimbursements.map((reimbursement: FormattedReimbursement) => {
                          // Calcul des jours restants avant la date de remboursement
                          const daysUntilDue = getDaysUntilDue(reimbursement.reimbursementDate, reimbursement.returnDate);

                          return (
                              <Card 
                                key={reimbursement.assignationId} 
                                onClick={() => handleCardClick(reimbursement.assignationId)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                }}
                              >
                                  
                                  {/* 1. Bloc Indicateur (Urgence/Statut) */}
                                  {renderDueIndicator(daysUntilDue, reimbursement.status)}

                                  {/* 2. En-tête (Titre & Badge Statut) */}
                                  <CardHeader style={{ marginBottom: '0.5rem' }}>
                                      <CardTitle title={reimbursement.missionName} style={{ fontSize: '0.875rem' }}>
                                          {reimbursement.missionName}
                                      </CardTitle>
                                      
                                      {getStatusBadge(reimbursement.status)}
                                  </CardHeader>
                                  
                                  {/* 3. Informations du remboursement - DESIGN AMÉLIORÉ ET RÉDUIT */}
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
                                                      {reimbursement.employeeName || "Non spécifié"}
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
                                                      {reimbursement.employeeCode || "N/A"}
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
                                                  {reimbursement.lieuName || "Non spécifié"}
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
                                                  {formatDate(reimbursement.departureDate)}
                                              </span>
                                              <ArrowRight size={12} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                  {formatDate(reimbursement.returnDate)}
                                              </span>
                                          </div>
                                      </div>

                                      {/* Montant total */}
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
                                                  fontSize: '12px', 
                                                  fontWeight: '600',
                                                  color: 'var(--text-color)',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  whiteSpace: 'nowrap',
                                              }}>
                                                  {reimbursement.totalAmount.toLocaleString()} MGA
                                              </div>
                                          </div>
                                      </div>

                                      {/* Date de remboursement (si remboursé) */}
                                      {reimbursement.status === 'reimbursed' && reimbursement.reimbursementDate && (
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
                                                      Remboursé le {formatDate(reimbursement.reimbursementDate)}
                                                  </span>
                                              </div>
                                          </div>
                                      )}
                                  </CardInfo>

                                  {/* 4. Barre d'actions améliorée - Toujours présente, avec boutons conditionnels */}
                                  <ActionsContainer 
                                    $singleButton={reimbursement.status !== 'unreimbursed'}
                                    style={{ marginTop: 'auto' }}
                                  >
                                      {/* Boutons conditionnels pour les remboursements non remboursés */}
                                      {reimbursement.status === 'unreimbursed' && (
                                          <>
                                              <ActionButton
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      // Logique de remboursement (à implémenter)
                                                      console.log(`Rembourser remboursement ${reimbursement.assignationId}`);
                                                  }}
                                                  className="validate"
                                              >
                                                  <DollarSign size={14} />
                                                  Remboursement
                                              </ActionButton>
                                          </>
                                      )}
                                      {/* Bouton "Voir détails" toujours présent */}
                                      <ActionButton
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              handleCardClick(reimbursement.assignationId);
                                          }}
                                          className="details"
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
                          {filteredReimbursements.length === 0 
                            ? hasFilters
                              ? "Aucun remboursement ne correspond aux critères de recherche."
                              : "Aucun remboursement trouvé."
                            : "Aucun remboursement sur cette page."
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
      </>
  );
};

export default Reimbursement;