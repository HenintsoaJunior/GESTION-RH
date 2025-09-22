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
import { formatValidatorData } from "services/mission/validator-utils";
import {
  fetchAssignMission,
  fetchMissionById,
  exportMissionAssignationPDF,
  exportMissionAssignationExcel,
} from "services/mission/mission";
import { useGetMissionValidationsByAssignationId } from "services/mission/validator-utils";
import { formatDate } from "utils/dateConverter";

const DetailsMission = ({ missionId = "001", onClose, isOpen = true }) => {
  const navigate = useNavigate();
  const getMissionValidations = useGetMissionValidationsByAssignationId();

  const [isLoading, setIsLoading] = useState({
    assignMissions: false,
    mission: false,
    exportPDF: false,
    exportExcel: false,
    validations: false,
  });
  const [error, setError] = useState({ isOpen: false, type: "", message: "" });
  const [assignedPersons, setAssignedPersons] = useState([]);
  const [missionDetails, setMissionDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationSteps, setValidationSteps] = useState([]);

  const handleError = (error) => {
    setError(error);
  };

  // Fonction pour mapper les validations vers les steps
  const mapValidationsToSteps = (validations) => {
    const stepMapping = {
      "Directeur de tutelle": {
        title: "Validation Supérieur",
        subtitle: "Hiérarchique",
        order: 1,
      },
      "DRH": {
        title: "Validation RH",
        subtitle: "Ressources Humaines",
        order: 2,
      },
    };

    const mappedSteps = validations.map((validation) => {
      const stepInfo = stepMapping[validation.toWhom] || {
        title: validation.toWhom,
        subtitle: "",
        order: validation.toWhom === "DRH" ? 2 : 1,
      };

      // Déterminer le statut
      let status;
      if (validation.status === "En attente") {
        status = "in-progress";
      } else if (validation.status === "Approuvé" || validation.status === "Validé") {
        status = "approved";
      } else if (validation.status === "Rejeté") {
        status = "rejected";
      } else {
        status = "pending";
      }

      const mappedStep = {
        id: validation.missionValidationId,
        title: stepInfo.title,
        subtitle: stepInfo.subtitle,
        status: status,
        hasIndicator: true,
        validator: validation.validator,
        validatedAt: validation.createdAt,
        comment: "Mission approuvée. Les objectifs sont clairs et réalisables.", // Commentaire à la dur comme demandé
        order: stepInfo.order,
      };

      return mappedStep;
    }).sort((a, b) => a.order - b.order);

    return mappedSteps;
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

    // Fetch Assigned Persons
    fetchAssignMission(
      setAssignedPersons,
      setIsLoading,
      setTotalEntries,
      { missionId },
      currentPage,
      pageSize,
      handleError
    );
  }, [missionId, currentPage, pageSize]);

  // Effet pour récupérer les validations une fois qu'on a les personnes assignées
  useEffect(() => {
    if (assignedPersons.length > 0) {
      const fetchValidations = async () => {
        try {
          setIsLoading((prev) => ({ ...prev, validations: true }));

          // Prendre la première assignation pour récupérer les validations
          const firstAssignation = assignedPersons[0];
          const assignationId = firstAssignation.assignationId;

          if (assignationId) {
            const validations = await getMissionValidations(assignationId);
            const mappedSteps = mapValidationsToSteps(validations);
            setValidationSteps(mappedSteps);
            // Debug: Log validation steps to verify status
            console.log("Validation Steps:", mappedSteps);
          }
        } catch (error) {
          handleError({
            isOpen: true,
            type: "error",
            message: "Erreur lors de la récupération des validations de mission.",
          });
        } finally {
          setIsLoading((prev) => ({ ...prev, validations: false }));
        }
      };

      fetchValidations();
    }
  }, [assignedPersons, getMissionValidations]);

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
  // Select the assigned person corresponding to the current step, or the first one
  const currentAssignedPerson = assignedPersons[currentStep] || assignedPersons[0];
  const formattedAssignedPerson = currentAssignedPerson
    ? formatValidatorData(currentAssignedPerson, "Collaborateur")
    : null;

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
            disabled={isLoading.mission || isLoading.assignMissions || isLoading.validations}
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

          {(isLoading.assignMissions || isLoading.validations) ? (
            <LoadingContainer>Chargement des informations de la mission...</LoadingContainer>
          ) : (
            <ContentArea>
              {/* Validator Details */}
              {validationSteps.length > 0 ? (
                <ValidatorCard>
                  <ValidatorGrid>
                    <ValidatorSection>
                      <SectionTitle>Validateurs</SectionTitle>
                      {validationSteps.map((step, index) => (
                        <ValidatorItem key={step.id}>
                          <Avatar size="40px">{step.validator?.initials || "NA"}</Avatar>
                          <ValidatorInfo>
                            <ValidatorName>{step.validator?.name || "Non spécifié"}</ValidatorName>
                            <ValidatorRole>
                              {step.title} {step.subtitle}
                            </ValidatorRole>
                          </ValidatorInfo>
                        </ValidatorItem>
                      ))}
                    </ValidatorSection>
                    <ValidatorSection>
                      <SectionTitle>Personnes Assignées à la Mission</SectionTitle>
                      {isLoading.assignMissions ? (
                        <ValidatorItem>
                          <div
                            style={{
                              textAlign: "center",
                              padding: "var(--spacing-md)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Chargement des assignations...
                          </div>
                        </ValidatorItem>
                      ) : assignedPersons.length > 0 ? (
                        assignedPersons.map((assignment, index) => (
                          <ValidatorItem
                            key={`${assignment.employeeId}-${missionId}-${index}`}
                            onClick={() => handleCardClick(assignment.employeeId)}
                            style={{ cursor: "pointer", marginBottom: "var(--spacing-md)" }}
                          >
                            <Avatar size="40px">
                              {assignment.beneficiary
                                ? assignment.beneficiary
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .substring(0, 2)
                                    .toUpperCase()
                                : "NA"}
                            </Avatar>
                            <ValidatorInfo>
                              <ValidatorName>
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
                        <InfoGrid
                          style={{
                            marginTop: "var(--spacing-lg)",
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "var(--spacing-md)",
                          }}
                        >
                          {assignedPersons.map((assignment, index) => (
                            <div
                              key={`info-${assignment.employeeId}-${index}`}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: "var(--spacing-sm)",
                                padding: "var(--spacing-md)",
                                border: "1px solid var(--border-light)",
                                borderRadius: "var(--border-radius)",
                                backgroundColor: "var(--background-light)",
                              }}
                            >
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
                  {isLoading.validations
                    ? "Chargement des validations..."
                    : "Aucune information de validateur disponible"}
                </div>
              )}

              {/* Comments and Date */}
              {currentStepData && (currentStepData.comment || currentStepData.validatedAt) && (
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

              {currentStepData && currentStepData.status === "in-progress" && (
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