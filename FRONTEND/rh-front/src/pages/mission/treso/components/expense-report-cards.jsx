"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  FileText,
  Clock as ClockIcon,
  AlertTriangle,
  CheckCircle as ValidIcon,
  DollarSign,
} from "lucide-react";
import styled, { css } from "styled-components";
import {
  Loading,
  NoDataMessage,
  StatusBadge,
} from "styles/generaliser/table-container";
import Pagination from "components/pagination";
import { GetTotalAmountByAssignationId, GetStatusByAssignationId } from "services/mission/expense";

const COLORS = {
  primary: "#2684ff",
  primaryHover: "#0057d9",
  urgent: "#dc3545",
  urgentLight: "#f8d7da",
  dueSoon: "#ffc107",
  dueSoonLight: "#fff3cd",
  normal: "#28a745",
  normalLight: "#d4edda",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  background: "white",
  border: "#e1e5e9",
  referenceBg: "#f1f3f5",
};

const CardsPaginationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-md);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${COLORS.background};
  border: 1px solid ${COLORS.border};
  border-radius: 10px;
  display: grid;
  grid-template-columns: 80px 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    "indicator header"
    "indicator info"
    "reference reference";
  gap: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: #f8f9fa;
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
`;

const IndicatorBlock = styled.div`
  grid-area: indicator;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  min-height: 100%;
  border-right: 1px solid ${COLORS.border};
  
  ${({ $isUrgent, $daysUntilDue }) => {
    let bgColor, color;
    
    if ($daysUntilDue < 0) {
      bgColor = COLORS.urgentLight;
      color = COLORS.urgent;
    } else if ($isUrgent) {
      bgColor = COLORS.urgentLight;
      color = COLORS.urgent;
    } else if ($daysUntilDue >= 0 && $daysUntilDue <= 7) {
      bgColor = COLORS.dueSoonLight;
      color = COLORS.dueSoon;
    } else {
      bgColor = COLORS.normalLight;
      color = COLORS.normal;
    }

    return css`
      background-color: ${bgColor};
      color: ${color};
    `;
  }}
`;

const IndicatorValue = styled.div`
  font-size: 24px;
  margin-top: 4px;
  line-height: 1;
`;

const IndicatorText = styled.div`
  font-size: 10px;
  font-weight: normal;
  margin-top: 2px;
  text-transform: uppercase;
`;

const CardHeader = styled.div`
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xs);
`;

const CardTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: ${COLORS.textPrimary};
  margin: 0;
  line-height: 1.2;
  flex: 1;
  margin-right: var(--spacing-sm);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const CardInfo = styled.div`
  grid-area: info;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-left: var(--spacing-sm);
  padding-top: var(--spacing-xs);
`;

const InfoLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  padding-right: var(--spacing-sm);
`;

const InfoLabel = styled.span`
  color: ${COLORS.textSecondary};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoValue = styled.span`
  color: ${COLORS.textPrimary};
  text-align: right;
  font-weight: 600;
  max-width: 60%;
  word-wrap: break-word;
`;

const ReferenceText = styled.div`
  grid-area: reference;
  font-size: var(--font-size-xs);
  color: ${COLORS.textSecondary};
  background-color: ${COLORS.referenceBg};
  padding: 8px 12px;
  border-radius: 0 0 10px 10px;
  margin: 12px -16px -16px -16px;
  text-align: center;
  font-weight: 600;
  border-top: 1px solid ${COLORS.border};
`;

const StatusContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ExpenseReportCards = ({
  expenseReports,
  isLoading,
  handleRowClick,
  formatDate,
  getDaysUntilDue,
  currentPage,
  pageSize,
  totalEntries,
  handlePageChange,
  handlePageSizeChange,
  appliedFilters,
}) => {
  const [totalAmounts, setTotalAmounts] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isLoadingTotals, setIsLoadingTotals] = useState(false);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);

  const getTotalAmountByAssignationId = GetTotalAmountByAssignationId();
  const getStatusByAssignationId = GetStatusByAssignationId();

  const fetchTotalAmountsAndStatuses = useCallback(async () => {
    if (!expenseReports || !Array.isArray(expenseReports) || expenseReports.length === 0) return;

    setIsLoadingTotals(true);
    setIsLoadingStatuses(true);
    try {
      const amountPromises = expenseReports.map(async (item) => {
        if (item.assignationId) {
          const totalAmount = await getTotalAmountByAssignationId(item.assignationId);
          return { assignationId: item.assignationId, totalAmount };
        }
        return { assignationId: item.assignationId, totalAmount: 0 };
      });

      const statusPromises = expenseReports.map(async (item) => {
        if (item.assignationId) {
          const statusList = await getStatusByAssignationId(item.assignationId);
          return { assignationId: item.assignationId, statuses: statusList };
        }
        return { assignationId: item.assignationId, statuses: [] };
      });

      const [amountResults, statusResults] = await Promise.all([
        Promise.all(amountPromises),
        Promise.all(statusPromises),
      ]);

      const newTotalAmounts = amountResults.reduce(
        (acc, { assignationId, totalAmount }) => ({
          ...acc,
          [assignationId]: totalAmount,
        }),
        {}
      );

      const newStatuses = statusResults.reduce(
        (acc, { assignationId, statuses }) => ({
          ...acc,
          [assignationId]: statuses,
        }),
        {}
      );

      setTotalAmounts(newTotalAmounts);
      setStatuses(newStatuses);
    } catch (error) {
      console.error("Error fetching total amounts or statuses:", error);
      // Optionally set an alert here if setAlert is passed as a prop
    } finally {
      setIsLoadingTotals(false);
      setIsLoadingStatuses(false);
    }
  }, [expenseReports, getTotalAmountByAssignationId, getStatusByAssignationId]);

  useEffect(() => {
    fetchTotalAmountsAndStatuses();
  }, [fetchTotalAmountsAndStatuses]);

  const getStatusBadge = (assignationId) => {
    const statusList = statuses[assignationId] || [];
    if (!statusList.length) {
      return (
        <StatusBadge className="status-pending">
          <Clock size={12} /> Inconnu
        </StatusBadge>
      );
    }

    return (
      <StatusContainer>
        {statusList.map((status, index) => {
          const statusInfo = {
            pending: { icon: Clock, text: "En attente", class: "status-pending" },
            reimbursed: { icon: CheckCircle, text: "Remboursé", class: "status-approved" },
          }[status] || { icon: Clock, text: "Inconnu", class: "status-pending" };

          const Icon = statusInfo.icon;
          return (
            <StatusBadge key={`${assignationId}-${status}-${index}`} className={statusInfo.class}>
              <Icon size={12} /> {statusInfo.text}
            </StatusBadge>
          );
        })}
      </StatusContainer>
    );
  };

  const renderDueIndicator = (daysUntilDue) => {
    const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;
    const isDueSoon = daysUntilDue <= 7 && daysUntilDue > 3;

    let Icon, text, displayValue;

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
      Icon = ValidIcon;
      text = "Délai normal";
      displayValue = daysUntilDue;
    } else {
      Icon = ClockIcon;
      text = "Non défini";
      displayValue = 'N/A';
    }

    return (
      <IndicatorBlock $isUrgent={isUrgent} $daysUntilDue={daysUntilDue}>
        <Icon size={20} />
        <IndicatorValue>{displayValue}</IndicatorValue>
        <IndicatorText>{text}</IndicatorText>
      </IndicatorBlock>
    );
  };

  return (
    <CardsPaginationContainer>
      <CardsContainer>
        {isLoading.expenseReports || isLoadingTotals || isLoadingStatuses ? (
          <Loading>Chargement des rapports de frais...</Loading>
        ) : expenseReports.length > 0 ? (
          expenseReports.map((item) => {
            const daysUntilDue = item.returnDate ? getDaysUntilDue(item.returnDate) : 0;
            const totalAmount = totalAmounts[item.assignationId] ?? item.allocatedFund ?? 0;

            return (
              <Card
                key={item.assignationId}
                onClick={() => {
                  console.log("Card clicked, assignationId:", item.assignationId);
                  handleRowClick(item.assignationId);
                }}
              >
                {renderDueIndicator(daysUntilDue)}
                <CardHeader>
                  <CardTitle title={`${item.employee.lastName} ${item.employee.firstName}`}>
                    {`${item.employee.lastName} ${item.employee.firstName}`}
                  </CardTitle>
                  {getStatusBadge(item.assignationId)}
                </CardHeader>
                <CardInfo>
                  <InfoLine>
                    <InfoLabel>
                      <User size={14} />
                      Mission
                    </InfoLabel>
                    <InfoValue>{item.missionId || "Non spécifié"}</InfoValue>
                  </InfoLine>
                  <InfoLine>
                    <InfoLabel>
                      <FileText size={14} />
                      Matricule
                    </InfoLabel>
                    <InfoValue>{item.employee.employeeCode || "Non spécifié"}</InfoValue>
                  </InfoLine>
                  <InfoLine>
                    <InfoLabel>
                      <Calendar size={14} />
                      Départ/Retour
                    </InfoLabel>
                    <InfoValue>
                      {formatDate(item.departureDate)} - {formatDate(item.returnDate)}
                    </InfoValue>
                  </InfoLine>
                  <InfoLine>
                    <InfoLabel>
                      <DollarSign size={14} />
                      Fonds Alloué
                    </InfoLabel>
                    <InfoValue>{totalAmount.toLocaleString()} MGA</InfoValue>
                  </InfoLine>
                </CardInfo>
                <ReferenceText>RÉFÉRENCE: {item.assignationId}</ReferenceText>
              </Card>
            );
          })
        ) : (
          <NoDataMessage>
            {appliedFilters.status
              ? "Aucun rapport de frais ne correspond aux critères de recherche."
              : "Aucun rapport de frais trouvé."}
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
          disabled={isLoading.expenseReports || isLoadingTotals || isLoadingStatuses}
        />
      )}
    </CardsPaginationContainer>
  );
};

export default ExpenseReportCards;