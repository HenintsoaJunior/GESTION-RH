"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, FileText, Download, ArrowLeft } from "lucide-react";
import ValidationStepper from "../validation/validation-stepper";
import Pagination from "components/pagination";
import Alert from "components/alert";
import {
  PopupOverlay,
  PopupContainer,
  PopupHeader,
  PopupTitle,
  CloseButton,
  PopupContent,
  LoadingContainer,
  ContentArea,
  StepHeader,
  StepTitle,
  StatusBadge,
  ValidatorCard,
  ValidatorTitle,
  ValidatorGrid,
  ValidatorSection,
  SectionTitle,
  ValidatorItem,
  Avatar,
  ValidatorInfo,
  ValidatorName,
  ValidatorRole,
  InfoGrid,
  InfoItem,
  InfoLabel,
  InfoValue,
  CommentCard,
  CommentTitle,
  CommentText,
  CommentDate,
  InfoAlert,
  AlertText,
  PopupFooter,
  FooterActions,
  ActionButton,
  StepCounter,
} from "styles/generaliser/details-mission-container";
import {
  CardsContainer,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardField,
  CardLabel,
  EmptyCardsState,
} from "styles/generaliser/card-container";
import { NoDataMessage } from "styles/generaliser/table-container";
import { fetchSuperior, fetchDrh } from "services/users/users";
import { formatValidatorData } from "services/mission/validator-utils";
import {
  fetchAssignMission,
  fetchMissionById,
  exportMissionAssignationPDF,
  exportMissionAssignationExcel,
} from "services/mission/mission";
import { formatDate } from "utils/dateConverter";

const DetailsMission = ({ missionId = "001", onClose, isOpen = true }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState({
    assignMissions: false,
    mission: false,
    exportPDF: false,
    exportExcel: false,
    superior: false,
    drh: false,
  });
  const [error, setError] = useState({ isOpen: false, type: "", message: "" });
  const [assignedPersons, setAssignedPersons] = useState([]);
  const [missionDetails, setMissionDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [superior, setSuperior] = useState(null);
  const [drh, setDrh] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [validationSteps, setValidationSteps] = useState([
    {
      id: 1,
      title: "Validation Supérieur",
      subtitle: "Hiérarchique",
      status: "approved",
      hasIndicator: true,
      validator: null,
      validatedAt: "2024-01-15T10:30:00",
      comment: "Mission approuvée. Les objectifs sont clairs et réalisables.",
      order: 1,
    },
    {
      id: 2,
      title: "Validation RH",
      subtitle: "Ressources Humaines",
      status: "in-progress",
      hasIndicator: true,
      validator: null,
      validatedAt: null,
      comment: null,
      order: 2,
    },
  ]);

  const handleError = (error) => {
    setError(error);
  };

  // Fonction pour vérifier si toutes les données sont chargées
  const checkDataLoaded = (assignedPersons, superior, drh) => {
    const hasAssignedPersons = assignedPersons && assignedPersons.length > 0;
    const hasSuperior = superior !== null;
    const hasDrh = drh !== null;
    return hasAssignedPersons && hasSuperior && hasDrh;
  };

  useEffect(() => {
    if (!missionId) {
      setError({
        isOpen: true,
        type: "error",
        message: "Aucun ID de mission fourni.",
      });
      return;
    }

    const loadInitialData = async () => {
      try {
        // Fetch Assigned Persons
        await fetchAssignMission(
          setAssignedPersons,
          setIsLoading,
          setTotalEntries,
          { missionId },
          currentPage,
          pageSize,
          handleError
        );
      } catch (error) {
        handleError({
          isOpen: true,
          type: "error",
          message: "Erreur lors du chargement des assignations.",
        });
      }
    };

    loadInitialData();
  }, [missionId, currentPage, pageSize]);

  // Effet pour récupérer le supérieur et DRH une fois qu'on a les personnes assignées
  useEffect(() => {
    if (assignedPersons.length > 0 && assignedPersons[0]?.matricule) {
      const matricule = assignedPersons[0].matricule;
      
      const loadValidators = async () => {
        try {
          // Fetch Superior
          setIsLoading((prev) => ({ ...prev, superior: true }));
          const superiorData = await fetchSuperior(
            matricule,
            setSuperior,
            setIsLoading,
            handleError
          );
          
          // Fetch DRH
          setIsLoading((prev) => ({ ...prev, drh: true }));
          await fetchDrh(
            (data) => {
              setDrh(data);
              setIsLoading((prev) => ({ ...prev, drh: false }));
            },
            setIsLoading,
            handleError
          );
          
          setIsLoading((prev) => ({ ...prev, superior: false }));
        } catch (error) {
          setIsLoading((prev) => ({ ...prev, superior: false, drh: false }));
          handleError({
            isOpen: true,
            type: "error",
            message: "Erreur lors du chargement des validateurs.",
          });
        }
      };

      loadValidators();
    }
  }, [assignedPersons]);

  // Effet pour mettre à jour les validationSteps et vérifier si toutes les données sont chargées
  useEffect(() => {
    if (superior && drh && assignedPersons.length > 0) {
      const formattedSuperior = formatValidatorData(superior, "Manager");
      const formattedDrh = formatValidatorData(drh, "Directrice RH");
      
      setValidationSteps((prevSteps) =>
        prevSteps.map((step) => {
          if (step.order === 1) {
            return { ...step, validator: formattedSuperior };
          } else if (step.order === 2) {
            return { ...step, validator: formattedDrh };
          }
          return step;
        })
      );

      // Marquer les données comme chargées
      setDataLoaded(true);
    }
  }, [superior, drh, assignedPersons]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleCardClick = (employeeId) => {
    if (missionId && employeeId) {
      navigate(`/assignments/details?missionId=${missionId}&employeeId=${employeeId}`);
    } else {
      setError({
        isOpen: true,
        type: "error",
        message: "Informations manquantes pour accéder aux détails.",
      });
    }
  };

  const handleExportPDF = () => {
    const exportFilters = { missionId };
    exportMissionAssignationPDF(
      exportFilters,
      setIsLoading,
      (success) => setError(success),
      handleError
    );
  };

  const handleExportExcel = () => {
    const exportFilters = { missionId };
    exportMissionAssignationExcel(
      exportFilters,
      setIsLoading,
      (success) => setError(success),
      handleError
    );
  };

  const getStatusBadge = (status) => {
    const statusClass =
      status === "En Cours"
        ? "status-progress"
        : status === "Planifié"
        ? "status-pending"
        : status === "Terminé"
        ? "status-approved"
        : status === "Annulé"
        ? "status-cancelled"
        : "status-pending";
    return <span className={`status-badge ${statusClass}`}>{status || "Inconnu"}</span>;
  };

  if (!isOpen) return null;

  const currentStepData = validationSteps[currentStep] || validationSteps[0];
  const currentAssignedPerson = assignedPersons[currentStep] || assignedPersons[0];
  const formattedAssignedPerson = currentAssignedPerson
    ? formatValidatorData(currentAssignedPerson, "Collaborateur")
    : null;

  const isLoadingData = isLoading.assignMissions || isLoading.superior || isLoading.drh || !dataLoaded;

  return (
    <PopupOverlay role="dialog" aria-labelledby="mission-details-title" aria-modal="true">
      <PopupContainer>
        {/* Header */}
        <PopupHeader>
          <PopupTitle id="mission-details-title">
            Détails de la Mission {missionId}
            {assignedPersons.length > 0 && (
              <span className="assignments-count">
                ({assignedPersons.length} assignation{assignedPersons.length > 1 ? "s" : ""})
              </span>
            )}
          </PopupTitle>
          <CloseButton
            onClick={handleClose}
            disabled={isLoadingData}
            aria-label="Fermer la fenêtre"
          >
            <X size={24} />
          </CloseButton>
        </PopupHeader>

        {/* Content */}
        <PopupContent>
          <Alert
            type={error.type}
            message={error.message}
            isOpen={error.isOpen}
            onClose={() => setError({ ...error, isOpen: false })}
          />

          <ValidationStepper steps={validationSteps} currentStep={currentStep} />

          {isLoadingData ? (
            <LoadingContainer>Chargement des informations de la mission...</LoadingContainer>
          ) : (
            <ContentArea>
              {/* Validator Details */}
              {validationSteps.some((step) => step.validator) ? (
                <ValidatorCard>
                  <ValidatorGrid>
                    <ValidatorSection>
                      <SectionTitle>Validateurs</SectionTitle>
                      {/* N+1 Validator */}
                      {validationSteps[0].validator ? (
                        <ValidatorItem>
                          <Avatar size="40px">{validationSteps[0].validator.initials}</Avatar>
                          <ValidatorInfo>
                            <ValidatorName>{validationSteps[0].validator.name}</ValidatorName>
                            <ValidatorRole>Validation Supérieur Hiérarchique (N+1)</ValidatorRole>
                          </ValidatorInfo>
                        </ValidatorItem>
                      ) : (
                        <ValidatorItem>
                          <div
                            style={{
                              textAlign: "center",
                              padding: "var(--spacing-md)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Validateur N+1 non disponible
                          </div>
                        </ValidatorItem>
                      )}
                      {/* DRH Validator */}
                      {validationSteps[1].validator ? (
                        <ValidatorItem>
                          <Avatar size="40px">{validationSteps[1].validator.initials}</Avatar>
                          <ValidatorInfo>
                            <ValidatorName>{validationSteps[1].validator.name}</ValidatorName>
                            <ValidatorRole>Validation RH Ressources Humaines (DRH)</ValidatorRole>
                          </ValidatorInfo>
                        </ValidatorItem>
                      ) : (
                        <ValidatorItem>
                          <div
                            style={{
                              textAlign: "center",
                              padding: "var(--spacing-md)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Validateur DRH non disponible
                          </div>
                        </ValidatorItem>
                      )}
                    </ValidatorSection>
                    <ValidatorSection>
                      <SectionTitle>Personnes Assignées à la Mission</SectionTitle>
                      {assignedPersons.length > 0 ? (
                        assignedPersons.map((assignment, index) => (
                          <ValidatorItem 
                            key={`${assignment.employeeId}-${missionId}-${index}`}
                            onClick={() => handleCardClick(assignment.employeeId)}
                            style={{ cursor: "pointer", marginBottom: "var(--spacing-md)" }}
                          >
                            <Avatar size="40px">
                              {assignment.beneficiary 
                                ? assignment.beneficiary.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                : 'NA'
                              }
                            </Avatar>
                            <ValidatorInfo>
                              {/* Correction : utiliser des props transient avec $ pour éviter qu'elles soient passées au DOM */}
                              <ValidatorName 
                                style={{ 
                                  fontWeight: 'bold',
                                  fontSize: '1.1em'
                                }}
                              >
                                {assignment.beneficiary && assignment.directionAcronym
                                  ? `${assignment.beneficiary} (${assignment.directionAcronym})`
                                  : assignment.beneficiary || "Non spécifié"}
                              </ValidatorName>
                            </ValidatorInfo>
                          </ValidatorItem>
                        ))
                      ) : (
                        <ValidatorItem>
                          <div
                            style={{
                              textAlign: "center",
                              padding: "var(--spacing-md)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Aucune personne assignée à la mission {missionId || "inconnue"}.
                          </div>
                        </ValidatorItem>
                      )}
                      
                      {assignedPersons.length > 0 && (
                        <InfoGrid style={{ 
                          marginTop: "var(--spacing-lg)",
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "var(--spacing-md)"
                        }}>
                          {assignedPersons.map((assignment, index) => (
                            <div key={`info-${assignment.employeeId}-${index}`} style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, 1fr)",
                              gap: "var(--spacing-sm)",
                              padding: "var(--spacing-md)",
                              border: "1px solid var(--border-light)",
                              borderRadius: "var(--border-radius)",
                              backgroundColor: "var(--background-light)"
                            }}>
                              <InfoItem>
                                <InfoLabel>N° Assignation</InfoLabel>
                                <InfoValue>{assignment.assignationId || "Non spécifié"}</InfoValue>
                              </InfoItem>
                              <InfoItem>
                                <InfoLabel>Matricule</InfoLabel>
                                <InfoValue>{assignment.matricule || "Non spécifié"}</InfoValue>
                              </InfoItem>
                              <InfoItem>
                                <InfoLabel>Fonction</InfoLabel>
                                <InfoValue>{assignment.function || "Non spécifié"}</InfoValue>
                              </InfoItem>
                              <InfoItem>
                                <InfoLabel>Site</InfoLabel>
                                <InfoValue>{assignment.base || "Non spécifié"}</InfoValue>
                              </InfoItem>
                            </div>
                          ))}
                        </InfoGrid>
                      )}
                    </ValidatorSection>
                  </ValidatorGrid>
                </ValidatorCard>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "var(--spacing-md)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Aucune information de validateur disponible
                </div>
              )}

              {/* Comments and Date */}
              {(currentStepData.comment || currentStepData.validatedAt) && (
                <CommentCard>
                  {currentStepData.comment && (
                    <>
                      <CommentTitle>Commentaire</CommentTitle>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-sm)" }}>
                        <Avatar size="24px">{currentStepData.validator?.initials || "JD"}</Avatar>
                        <CommentText>{currentStepData.comment}</CommentText>
                      </div>
                    </>
                  )}
                  {currentStepData.validatedAt && (
                    <CommentDate>
                      Validé le :{" "}
                      {new Date(currentStepData.validatedAt).toLocaleString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CommentDate>
                  )}
                </CommentCard>
              )}

              {currentStepData.status === "in-progress" && (
                <InfoAlert>
                  <span style={{ fontSize: "1.2rem" }}>🔄</span>
                  <AlertText>Validation en cours d'examen...</AlertText>
                </InfoAlert>
              )}
            </ContentArea>
          )}
        </PopupContent>
      </PopupContainer>
    </PopupOverlay>
  );
};

export default DetailsMission;