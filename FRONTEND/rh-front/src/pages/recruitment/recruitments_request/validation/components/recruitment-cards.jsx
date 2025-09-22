import { useState, useMemo } from "react";
import styled from "styled-components";
import {
  Loading,
  NoDataMessage,
  StatusBadge,
} from "styles/generaliser/table-container";
import { Clock, CheckCircle, XCircle, Calendar, User, FileText, Filter } from "lucide-react";
import Pagination from "components/pagination";

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-md);
  padding: var(--spacing-md);
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  &:hover {
    background-color: #f8f9fa;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
`;

const CardTitle = styled.h3`
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  flex: 1;
  margin-right: var(--spacing-sm);
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const InfoLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
`;

const InfoLabel = styled.span`
  color: var(--text-secondary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InfoValue = styled.span`
  color: var(--text-primary);
  text-align: right;
  font-weight: 400;
  max-width: 60%;
  word-wrap: break-word;
`;

const UrgentIndicator = styled.span`
  color: #dc3545;
  font-weight: 600;
  font-size: var(--font-size-xs);
`;

const ReferenceText = styled.div`
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-top: var(--spacing-xs);
  text-align: center;
  font-style: italic;
`;

const CardsPaginationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  margin-bottom: var(--spacing-md);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
`;

const FilterSelect = styled.select`
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  font-size: var(--font-size-sm);
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
`;

const FilterResultsCount = styled.span`
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-left: auto;
`;

const RecruitmentCards = ({
  recruitments,
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
  const [statusFilter, setStatusFilter] = useState("en attente"); // Changement ici

  // Débogage : Afficher les statuts des recrutements
  useMemo(() => {
    console.log("Statuts des recrutements :", recruitments?.map(r => r.status));
  }, [recruitments]);

  // Normalisation stricte des statuts
  const normalizeStatus = (status) => {
    return (status || "inconnu").toLowerCase().trim();
  };

  const filteredRecruitments = useMemo(() => {
    if (!recruitments || !Array.isArray(recruitments)) return [];
    if (statusFilter === "all") {
      return recruitments;
    }
    const normalizedFilter = normalizeStatus(statusFilter);
    console.log("Filtre appliqué :", normalizedFilter); // Débogage
    return recruitments.filter(recruitment => normalizeStatus(recruitment.status) === normalizedFilter);
  }, [recruitments, statusFilter]);

  const getStatusBadge = (status) => {
    const normalizedStatus = normalizeStatus(status);
    const statusInfo = {
      "non défini": { icon: Clock, text: "En attente", class: "status-pending" },
      "en attente": { icon: Clock, text: "En attente", class: "status-pending" },
      "brouillon": { icon: Clock, text: "Brouillon", class: "status-pending" },
      "approuvé": { icon: CheckCircle, text: "Approuvé", class: "status-approved" },
      "rejeté": { icon: XCircle, text: "Rejeté", class: "status-cancelled" },
      "inconnu": { icon: Clock, text: "Inconnu", class: "status-pending" },
    }[normalizedStatus] || { icon: Clock, text: "Inconnu", class: "status-pending" };
    const Icon = statusInfo.icon;
    return (
      <StatusBadge className={statusInfo.class}>
        <Icon size={12} /> {statusInfo.text}
      </StatusBadge>
    );
  };

  const statusCounts = useMemo(() => {
    if (!recruitments || !Array.isArray(recruitments)) return { all: 0, "en attente": 0, "approuvé": 0, "rejeté": 0 };
    const counts = {
      all: recruitments.length,
      "en attente": 0,
      "approuvé": 0,
      "rejeté": 0,
    };
    recruitments.forEach(recruitment => {
      const normalizedStatus = normalizeStatus(recruitment.status);
      if (counts[normalizedStatus] !== undefined) {
        counts[normalizedStatus]++;
      }
    });
    console.log("Compteurs de statuts :", counts); // Débogage
    return counts;
  }, [recruitments]);

  const hasFilters =
    appliedFilters?.search ||
    appliedFilters?.status ||
    appliedFilters?.department ||
    appliedFilters?.dateRange?.start ||
    appliedFilters?.dateRange?.end ||
    statusFilter !== "all";

  return (
    <CardsPaginationContainer>
      <FilterContainer>
        <FilterLabel>
          <Filter size={16} />
          Filtrer par statut :
        </FilterLabel>
        <FilterSelect
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            console.log("Nouveau filtre sélectionné :", e.target.value); // Débogage
          }}
          disabled={isLoading.recruitments}
        >
          <option value="all">Tous les statuts ({statusCounts.all || 0})</option>
          <option value="en attente">En attente ({statusCounts["en attente"] || 0})</option>
          <option value="approuvé">Approuvées ({statusCounts["approuvé"] || 0})</option>
          <option value="rejeté">Rejetées ({statusCounts["rejeté"] || 0})</option>
        </FilterSelect>
        <FilterResultsCount>
          {filteredRecruitments.length} résultat(s) affiché(s)
        </FilterResultsCount>
      </FilterContainer>
      <CardsContainer>
        {isLoading.recruitments ? (
          <Loading>Chargement des demandes de recrutement...</Loading>
        ) : filteredRecruitments && filteredRecruitments.length > 0 ? (
          filteredRecruitments.map((recruitment) => {
            const daysUntilDue = getDaysUntilDue(recruitment.desiredStartDate);
            const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;
            return (
              <Card key={recruitment.id} onClick={() => handleRowClick(recruitment.id)}>
                <CardHeader>
                  <CardTitle>{recruitment.title || "Sans titre"}</CardTitle>
                  {getStatusBadge(recruitment.status)}
                </CardHeader>
                <CardInfo>
                  <InfoLine>
                    <InfoLabel>
                      <User size={14} />
                      Demandeur
                    </InfoLabel>
                    <InfoValue>{recruitment.creatorName || "Non spécifié"}</InfoValue>
                  </InfoLine>
                  <InfoLine>
                    <InfoLabel>
                      <FileText size={14} />
                      Département
                    </InfoLabel>
                    <InfoValue>{recruitment.department || "Non spécifié"}</InfoValue>
                  </InfoLine>
                  <InfoLine>
                    <InfoLabel>
                      <Calendar size={14} />
                      Date de début souhaitée
                    </InfoLabel>
                    <InfoValue>{formatDate(recruitment.desiredStartDate) || "Non spécifié"}</InfoValue>
                  </InfoLine>
                  <InfoLine>
                    <InfoLabel>
                      <FileText size={14} />
                      Nombre de postes
                    </InfoLabel>
                    <InfoValue>{recruitment.positionCount || "Non spécifié"}</InfoValue>
                  </InfoLine>
                  <InfoLine>
                    <InfoLabel>
                      <Calendar size={14} />
                      Échéance
                    </InfoLabel>
                    <InfoValue>
                      {formatDate(recruitment.desiredStartDate) || "Non spécifié"}
                      {isUrgent && (
                        <UrgentIndicator> (Urgent - {daysUntilDue}j)</UrgentIndicator>
                      )}
                    </InfoValue>
                  </InfoLine>
                </CardInfo>
                <ReferenceText>Réf: {recruitment.id}</ReferenceText>
              </Card>
            );
          })
        ) : (
          <NoDataMessage>
            {hasFilters
              ? "Aucune demande ne correspond aux critères de recherche."
              : "Aucune demande de recrutement trouvée."}
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
          disabled={isLoading.recruitments}
        />
      )}
    </CardsPaginationContainer>
  );
};

export default RecruitmentCards;