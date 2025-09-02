import React, { useState, useEffect } from "react";
import {
  DashboardContainer,
  StatsContainer,
  StatsGrid,
  StatCard,
  StatLabel,
  StatNumber,
  Loading,
  NoDataMessage,
  StatusBadge,
  FiltersContainer,
  FiltersHeader,
  FiltersTitle,
  FiltersSection,
  FormTableSearch,
  FormRow,
  FormFieldCell,
  FormLabelSearch,
  FormInputSearch,
  FiltersActions,
  ButtonSearch,
  ButtonReset,
  ButtonConfirm,
  ButtonCancel,
  ButtonUpdate,
  TableHeader,
  TableTitle,
} from "styles/generaliser/table-container"; // Correct import path
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupContent,
  PopupActions,
  ButtonSecondary,
} from "styles/generaliser/popup-container"; // Adjust import path
import {
  FormTable,
  FormRow as FormRowPopup,
  FormFieldCell as FormFieldCellPopup,
  FormLabelRequired,
  FormInput,
} from "styles/generaliser/form-container"; // Adjust import path
import { Clock, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import styled from "styled-components";

// Styled components for the accordion layout
const AccordionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
`;

const AccordionItem = styled.div`
  border-bottom: 1px solid var(--border-light);
  &:last-child {
    border-bottom: none;
  }
`;

const AccordionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  cursor: pointer;
  background: var(--bg-secondary);
  transition: background 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
  }
`;

const AccordionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
`;

const AccordionIcon = styled.span`
  font-size: 24px;
`;

const AccordionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const AccordionContent = styled.div`
  padding: var(--spacing-md);
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  background: var(--bg-primary);
`;

const AccordionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const AccordionDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
`;

const AccordionActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  justify-content: flex-end;
  margin-top: var(--spacing-sm);
`;

const mockMissions = [
  {
    id: 1,
    title: "Maintenance serveur principal",
    description: "Mise à jour critique du système de base de données principal avec redémarrage programmé",
    requestedBy: "Jean Dupont",
    department: "IT Infrastructure",
    priority: "high",
    status: "pending",
    requestDate: "2025-01-15",
    dueDate: "2025-01-20",
    estimatedDuration: "4h",
    location: "Data Center A",
    type: "maintenance",
  },
  {
    id: 2,
    title: "Formation équipe marketing",
    description: "Session de formation sur les nouveaux outils de marketing digital pour l'équipe",
    requestedBy: "Marie Laurent",
    department: "Marketing",
    priority: "medium",
    status: "pending",
    requestDate: "2025-01-14",
    dueDate: "2025-01-25",
    estimatedDuration: "8h",
    location: "Salle de conférence B",
    type: "formation",
  },
  {
    id: 3,
    title: "Audit sécurité réseau",
    description: "Évaluation complète de la sécurité du réseau d'entreprise et des protocoles de protection",
    requestedBy: "Pierre Martin",
    department: "Sécurité IT",
    priority: "high",
    status: "approved",
    requestDate: "2025-01-10",
    dueDate: "2025-01-18",
    estimatedDuration: "12h",
    location: "Remote",
    type: "audit",
  },
  {
    id: 4,
    title: "Déploiement nouvelle application",
    description: "Mise en production de l'application CRM avec migration des données existantes",
    requestedBy: "Sophie Bernard",
    department: "Développement",
    priority: "medium",
    status: "rejected",
    requestDate: "2025-01-12",
    dueDate: "2025-01-30",
    estimatedDuration: "16h",
    location: "Bureau développement",
    type: "deployment",
  },
  {
    id: 5,
    title: "Réunion stratégique Q1",
    description: "Planification des objectifs et allocation des ressources pour le premier trimestre 2025",
    requestedBy: "Directeur Général",
    department: "Direction",
    priority: "high",
    status: "pending",
    requestDate: "2025-01-16",
    dueDate: "2025-01-22",
    estimatedDuration: "3h",
    location: "Salle du conseil",
    type: "meeting",
  },
];

const MissionValidationPage = () => {
  const [missions, setMissions] = useState([]);
  const [filteredMissions, setFilteredMissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedMission, setSelectedMission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openAccordionId, setOpenAccordionId] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setMissions(mockMissions);
      setFilteredMissions(mockMissions);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = missions.filter((mission) => {
      const matchesSearch =
        mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || mission.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || mission.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
    setFilteredMissions(filtered);
  }, [missions, searchTerm, statusFilter, priorityFilter]);

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { icon: Clock, text: "En attente" };
      case "approved":
        return { icon: CheckCircle, text: "Approuvée" };
      case "rejected":
        return { icon: XCircle, text: "Rejetée" };
      default:
        return { icon: Clock, text: "Inconnu" };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "maintenance":
        return "🔧";
      case "formation":
        return "📚";
      case "audit":
        return "🔍";
      case "deployment":
        return "🚀";
      case "meeting":
        return "👥";
      default:
        return "📋";
    }
  };

  const handleValidate = (missionId, action) => {
    setMissions((prev) =>
      prev.map((mission) =>
        mission.id === missionId ? { ...mission, status: action === "approve" ? "approved" : "rejected" } : mission
      )
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleAccordion = (missionId) => {
    setOpenAccordionId(openAccordionId === missionId ? null : missionId);
  };

  const pendingCount = missions.filter((m) => m.status === "pending").length;
  const approvedCount = missions.filter((m) => m.status === "approved").length;
  const rejectedCount = missions.filter((m) => m.status === "rejected").length;

  if (isLoading) {
    return (
      <DashboardContainer>
        <Loading>Chargement des missions...</Loading>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <TableHeader>
        <TableTitle>Validation des Missions</TableTitle>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}>
          Tableau de bord moderne pour la gestion des missions
        </p>
      </TableHeader>

      <StatsContainer>
        <StatsGrid>
          <StatCard className="stat-card-total">
            <StatLabel>Total</StatLabel>
            <StatNumber>{missions.length}</StatNumber>
          </StatCard>
          <StatCard className="stat-card-pending">
            <StatLabel>En attente</StatLabel>
            <StatNumber>{pendingCount}</StatNumber>
          </StatCard>
          <StatCard className="stat-card-approved">
            <StatLabel>Approuvées</StatLabel>
            <StatNumber>{approvedCount}</StatNumber>
          </StatCard>
          <StatCard className="stat-card-cancelled">
            <StatLabel>Rejetées</StatLabel>
            <StatNumber>{rejectedCount}</StatNumber>
          </StatCard>
        </StatsGrid>
      </StatsContainer>

      <FiltersContainer>
        <FiltersHeader>
          <FiltersTitle>Filtres</FiltersTitle>
        </FiltersHeader>
        <FiltersSection>
          <FormTableSearch>
            <FormRow>
              <FormFieldCell>
                <FormLabelSearch>Rechercher</FormLabelSearch>
                <FormInputSearch
                  type="text"
                  placeholder="Rechercher une mission..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </FormFieldCell>
              <FormFieldCell>
                <FormLabelSearch>Statut</FormLabelSearch>
                <FormInputSearch
                  as="select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvées</option>
                  <option value="rejected">Rejetées</option>
                </FormInputSearch>
              </FormFieldCell>
              <FormFieldCell>
                <FormLabelSearch>Priorité</FormLabelSearch>
                <FormInputSearch
                  as="select"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">Toutes priorités</option>
                  <option value="high">Haute</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Basse</option>
                </FormInputSearch>
              </FormFieldCell>
            </FormRow>
          </FormTableSearch>
          <FiltersActions>
            <ButtonReset
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPriorityFilter("all");
              }}
            >
              Réinitialiser
            </ButtonReset>
            <ButtonSearch>Rechercher</ButtonSearch>
          </FiltersActions>
        </FiltersSection>
      </FiltersContainer>

      <AccordionContainer>
        {filteredMissions.length > 0 ? (
          filteredMissions.map((mission) => {
            const statusInfo = getStatusInfo(mission.status);
            const StatusIcon = statusInfo.icon;
            const daysUntilDue = getDaysUntilDue(mission.dueDate);
            const isUrgent = daysUntilDue <= 3 && mission.status === "pending";
            const isOpen = openAccordionId === mission.id;

            return (
              <AccordionItem key={mission.id}>
                <AccordionHeader onClick={() => toggleAccordion(mission.id)}>
                  <AccordionTitle>
                    <AccordionIcon>{getTypeIcon(mission.type)}</AccordionIcon>
                    {mission.title}
                  </AccordionTitle>
                  <AccordionStatus>
                    <StatusBadge className={`status-${mission.status}`}>
                      <StatusIcon size={12} /> {statusInfo.text}
                    </StatusBadge>
                    {isUrgent && (
                      <StatusBadge className="status-pending">
                        <AlertTriangle size={12} /> Urgent
                      </StatusBadge>
                    )}
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </AccordionStatus>
                </AccordionHeader>
                <AccordionContent $isOpen={isOpen}>
                  <AccordionDetails>
                    <AccordionDetailItem>
                      <strong>Description:</strong> {mission.description}
                    </AccordionDetailItem>
                    <AccordionDetailItem>
                      <strong>Demandeur:</strong> {mission.requestedBy}
                    </AccordionDetailItem>
                    <AccordionDetailItem>
                      <strong>Priorité:</strong>
                      <StatusBadge className={`status-${mission.priority}`}>
                        {mission.priority === "high" ? "Haute" : mission.priority === "medium" ? "Moyenne" : "Basse"}
                      </StatusBadge>
                    </AccordionDetailItem>
                    <AccordionDetailItem>
                      <strong>Échéance:</strong> {formatDate(mission.dueDate)}
                      {daysUntilDue <= 7 && daysUntilDue > 0 && (
                        <span style={{ color: "var(--text-muted)" }}>
                          ({daysUntilDue}j restant{daysUntilDue > 1 ? "s" : ""})
                        </span>
                      )}
                    </AccordionDetailItem>
                  </AccordionDetails>
                  <AccordionActions>
                    {mission.status === "pending" ? (
                      <>
                        <ButtonConfirm onClick={() => handleValidate(mission.id, "approve")}>
                          Approuver
                        </ButtonConfirm>
                        <ButtonCancel onClick={() => handleValidate(mission.id, "reject")}>
                          Rejeter
                        </ButtonCancel>
                        <ButtonUpdate onClick={() => setSelectedMission(mission)}>
                          Détails
                        </ButtonUpdate>
                      </>
                    ) : (
                      <ButtonUpdate onClick={() => setSelectedMission(mission)}>
                        Voir détails
                      </ButtonUpdate>
                    )}
                  </AccordionActions>
                </AccordionContent>
              </AccordionItem>
            );
          })
        ) : (
          <NoDataMessage>Aucune mission trouvée</NoDataMessage>
        )}
      </AccordionContainer>

      {selectedMission && (
        <PopupOverlay>
          <PagePopup>
            <PopupHeader>
              <PopupTitle>Détails de la mission</PopupTitle>
              <PopupClose onClick={() => setSelectedMission(null)}>×</PopupClose>
            </PopupHeader>
            <PopupContent>
              <FormTable>
                <tbody>
                  <FormRowPopup className="dual-field-row">
                    <FormFieldCellPopup>
                      <FormLabelRequired>Titre</FormLabelRequired>
                      <FormInput type="text" value={selectedMission.title} readOnly />
                    </FormFieldCellPopup>
                    <FormFieldCellPopup>
                      <FormLabelRequired>Demandeur</FormLabelRequired>
                      <FormInput type="text" value={selectedMission.requestedBy} readOnly />
                    </FormFieldCellPopup>
                  </FormRowPopup>
                  <FormRowPopup>
                    <FormFieldCellPopup colSpan="2">
                      <FormLabelRequired>Description</FormLabelRequired>
                      <FormInput type="text" value={selectedMission.description} readOnly />
                    </FormFieldCellPopup>
                  </FormRowPopup>
                  <FormRowPopup className="dual-field-row">
                    <FormFieldCellPopup>
                      <FormLabelRequired>Département</FormLabelRequired>
                      <FormInput type="text" value={selectedMission.department} readOnly />
                    </FormFieldCellPopup>
                    <FormFieldCellPopup>
                      <FormLabelRequired>Lieu</FormLabelRequired>
                      <FormInput type="text" value={selectedMission.location} readOnly />
                    </FormFieldCellPopup>
                  </FormRowPopup>
                  <FormRowPopup className="dual-field-row">
                    <FormFieldCellPopup>
                      <FormLabelRequired>Date de demande</FormLabelRequired>
                      <FormInput type="text" value={formatDate(selectedMission.requestDate)} readOnly />
                    </FormFieldCellPopup>
                    <FormFieldCellPopup>
                      <FormLabelRequired>Échéance</FormLabelRequired>
                      <FormInput type="text" value={formatDate(selectedMission.dueDate)} readOnly />
                    </FormFieldCellPopup>
                  </FormRowPopup>
                  <FormRowPopup>
                    <FormFieldCellPopup colSpan="2">
                      <FormLabelRequired>Durée estimée</FormLabelRequired>
                      <FormInput type="text" value={selectedMission.estimatedDuration} readOnly />
                    </FormFieldCellPopup>
                  </FormRowPopup>
                </tbody>
              </FormTable>
            </PopupContent>
            <PopupActions>
              <ButtonSecondary onClick={() => setSelectedMission(null)}>Fermer</ButtonSecondary>
            </PopupActions>
          </PagePopup>
        </PopupOverlay>
      )}
    </DashboardContainer>
  );
};

export default MissionValidationPage;