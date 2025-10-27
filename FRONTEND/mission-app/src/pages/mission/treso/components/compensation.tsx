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
    FileText,
    AlertTriangle,
    DollarSign,
    X,
    List,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
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
    InfoLine,
    InfoLabel,
    InfoValue,
    ReferenceText,
} from "@/styles/card-styles";
import Pagination from "@/components/pagination";
import useTresoData from "../hooks/use-treso-data";

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
                          <option value="">Tous les statuts</option>
                          <option value="unpaid">Non payé</option>
                          <option value="paid">Payé</option>
                        </FormInputSearch>
                      </FormFieldCell>
                      <FormFieldCell />
                    </FormRow>
                    <FormRow>
                      <FormFieldCell>
                        <FormLabelSearch>Du </FormLabelSearch>
                        <FormInputSearch
                          type="date"
                          value={filters.paymentDateMin}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange("paymentDateMin", e.target.value)}
                          disabled={isLoading.compensations}
                        />
                      </FormFieldCell>
                      <FormFieldCell>
                        <FormLabelSearch>Au </FormLabelSearch>
                        <FormInputSearch
                          type="date"
                          value={filters.paymentDateMax}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange("paymentDateMax", e.target.value)}
                          disabled={isLoading.compensations}
                        />
                      </FormFieldCell>
                    </FormRow>
                  </tbody>
                </FormTableSearch>
                <FiltersActions>
                  <ButtonReset
                    type="button"
                    onClick={handleResetFilters}
                    disabled={isLoading.compensations}
                  >
                    Réinitialiser
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

const Compensation: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filter>({
    status: "",
    paymentDateMin: "",
    paymentDateMax: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<Filter>({
    status: 'unpaid',
    paymentDateMin: "",
    paymentDateMax: "",
  });
  const [isHidden, setIsHidden] = useState<boolean>(false);

  const {
    compensations,
    isLoading,
    handleCardClick,
    formatDate,
    getDaysUntilDue,
    currentPage,
    handlePageChange,
    pageSize,
    handlePageSizeChange,
  } = useTresoData(appliedFilters.status || 'unpaid');

  const handleFilterSubmit = () => {
    setAppliedFilters({ ...filters });
    handlePageChange(1);
  };

  const handleResetFilters = () => {
    setFilters({ status: "", paymentDateMin: "", paymentDateMax: "" });
    setAppliedFilters({ status: 'unpaid', paymentDateMin: "", paymentDateMax: "" });
    handlePageChange(1);
  };

  const handleBack = () => {
    navigate("/treasury");
  };

  const filteredCompensations = useMemo(() => {
    return compensations.filter((c) => {
      const passStatus = !appliedFilters.status || c.status === appliedFilters.status;
      if (!passStatus) return false;

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

  const totalEntries = filteredCompensations.length;

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
          "unpaid": { icon: XCircle, text: "Non payé", class: "status-unpaid" },
          "paid": { icon: CheckIcon, text: "Payé", class: "status-approved" },
      }[status] || { icon: ClockIcon, text: "Inconnu", class: "status-pending" };

      const Icon = statusInfo.icon;
      return (
          <StatusBadge className={statusInfo.class}>
              <Icon size={12} /> {statusInfo.text}
          </StatusBadge>
      );
  };

  /**
   * Rendu du bloc indicateur d'urgence basé sur le nombre de jours avant l'échéance.
   */
  const renderDueIndicator = (daysUntilDue: number) => {
      const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;
      const isDueSoon = daysUntilDue <= 7 && daysUntilDue > 3;

      let Icon: React.ComponentType<{ size?: number }>, text: string, displayValue: string | number;

      if (daysUntilDue < 0) {
          Icon = XCircle;
          text = `En retard (${Math.abs(daysUntilDue)}J)`;
          displayValue = `+${Math.abs(daysUntilDue)}`;
      } else if (isUrgent) {
          Icon = AlertTriangle;
          text = daysUntilDue === 0 ? "Aujourd'hui" : `URGENT (${daysUntilDue}J)`;
          displayValue = daysUntilDue;
      } else if (isDueSoon) {
          Icon = ClockIcon;
          text = `Proche (${daysUntilDue}J)`;
          displayValue = daysUntilDue;
      } else if (daysUntilDue >= 0) {
          Icon = CheckIcon;
          text = "Délai normal";
          displayValue = daysUntilDue;
      } else {
          Icon = ClockIcon;
          text = "Non défini";
          displayValue = 'N/A';
      }

      return (
          <IndicatorBlock $daysUntilDue={daysUntilDue}>
              <Icon size={20} />
              <IndicatorValue>
                  {displayValue}
              </IndicatorValue>
              <IndicatorText>{text}</IndicatorText>
          </IndicatorBlock>
      );
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
                      <h1 className="page-title">Compensations</h1>
                      <p className="page-subtitle">Gestion des compensations</p>
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
                  alignItems: 'start',
                }}
              >
                  {/* Affichage conditionnel du chargement, des données ou de l'absence de données */}
                  {isLoading.compensations ? (
                      <Loading>Chargement des compensations...</Loading>
                  ) : paginatedCompensations.length > 0 ? (
                      paginatedCompensations.map((compensation: FormattedCompensation) => {
                          // Calcul des jours restants avant la date de paiement
                          const daysUntilDue = getDaysUntilDue(compensation.paymentDate);

                          return (
                              <Card key={compensation.assignationId} onClick={() => handleCardClick(compensation.assignationId)}>
                                  
                                  {/* 1. Bloc Indicateur (Urgence) */}
                                  {renderDueIndicator(daysUntilDue)}

                                  {/* 2. En-tête (Titre & Badge Statut) */}
                                  <CardHeader>
                                      <CardTitle title={compensation.employeeName}>
                                          {compensation.employeeName}
                                      </CardTitle>
                                      
                                      {getStatusBadge(compensation.status)}
                                  </CardHeader>
                                  
                                  {/* 3. Informations de la compensation */}
                                  <CardInfo>
                                      <InfoLine>
                                          <InfoLabel>
                                              <User size={14} />
                                              Mission
                                          </InfoLabel>
                                          <InfoValue>{compensation.missionName}</InfoValue>
                                      </InfoLine>
                                      <InfoLine>
                                          <InfoLabel>
                                              <FileText size={14} />
                                              Matricule
                                          </InfoLabel>
                                          <InfoValue>{compensation.employeeCode}</InfoValue>
                                      </InfoLine>
                                      <InfoLine>
                                          <InfoLabel>
                                              <MapPin size={14} />
                                              Lieu
                                          </InfoLabel>
                                          <InfoValue>{compensation.lieuName}</InfoValue>
                                      </InfoLine>
                                      <InfoLine>
                                          <InfoLabel>
                                              <Calendar size={14} />
                                              Départ/Retour
                                          </InfoLabel>
                                          <InfoValue>
                                              {formatDate(compensation.departureDate)} - {formatDate(compensation.returnDate)}
                                          </InfoValue>
                                      </InfoLine>
                                      <InfoLine>
                                          <InfoLabel>
                                              <DollarSign size={14} />
                                              Total
                                          </InfoLabel>
                                          <InfoValue>{compensation.totalAmount.toLocaleString()} MGA</InfoValue>
                                      </InfoLine>
                                  </CardInfo>

                                  {/* 4. Référence */}
                                  <ReferenceText>RÉFÉRENCE: {compensation.assignationId}</ReferenceText>
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
      </>
  );
};

export default Compensation;