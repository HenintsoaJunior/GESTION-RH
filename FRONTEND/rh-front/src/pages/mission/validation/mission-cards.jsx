import styled from "styled-components";
import {
  Loading,
  NoDataMessage,
  StatusBadge,
} from "styles/generaliser/table-container";
import { Clock, CheckCircle, XCircle, Calendar, MapPin, User } from "lucide-react";

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

const MissionCards = ({
  missions,
  isLoading,
  handleRowClick,
  formatDate,
  getDaysUntilDue,
}) => {
  const getStatusBadge = (status) => {
    const statusClass =
      status === "En attente"
        ? "status-pending"
        : status === "Approuvée"
        ? "status-approved"
        : status === "Rejetée"
        ? "status-cancelled"
        : "status-pending";
    
    const statusInfo = {
      "En attente": { icon: Clock, text: "En attente" },
      "Approuvée": { icon: CheckCircle, text: "Approuvée" },
      "Rejetée": { icon: XCircle, text: "Rejetée" },
    }[status] || { icon: Clock, text: "Inconnu" };
    
    const Icon = statusInfo.icon;
    return (
      <StatusBadge className={statusClass}>
        <Icon size={12} /> {statusInfo.text}
      </StatusBadge>
    );
  };

  return (
    <CardsContainer>
      {isLoading.missions ? (
        <Loading>Chargement des missions...</Loading>
      ) : missions && missions.length > 0 ? (
        missions.map((mission) => {
          const daysUntilDue = getDaysUntilDue(mission.dueDate);
          const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;
          
          return (
            <Card key={mission.id} onClick={() => handleRowClick(mission.id)}>
              <CardHeader>
                <CardTitle>{mission.title}</CardTitle>
                {getStatusBadge(mission.status)}
              </CardHeader>
              
              <CardInfo>
                <InfoLine>
                  <InfoLabel>
                    <User size={14} />
                    Demandeur
                  </InfoLabel>
                  <InfoValue>{mission.requestedBy || "Non spécifié"}</InfoValue>
                </InfoLine>
                
                <InfoLine>
                  <InfoLabel>
                    <MapPin size={14} />
                    Destination
                  </InfoLabel>
                  <InfoValue>{mission.location || "Non spécifié"}</InfoValue>
                </InfoLine>
                
                <InfoLine>
                  <InfoLabel>
                    <Calendar size={14} />
                    Échéance
                  </InfoLabel>
                  <InfoValue>
                    {formatDate(mission.dueDate)}
                    {isUrgent && (
                      <UrgentIndicator> (Urgent - {daysUntilDue}j)</UrgentIndicator>
                    )}
                  </InfoValue>
                </InfoLine>
              </CardInfo>

              <ReferenceText>
                Réf: {mission.reference}
              </ReferenceText>
            </Card>
          );
        })
      ) : (
        <NoDataMessage>
          Aucune mission trouvée.
        </NoDataMessage>
      )}
    </CardsContainer>
  );
};

export default MissionCards;