"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import ValidationStepper from "../validation/validation-stepper";
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
  StepCounter,
} from "styles/generaliser/details-mission-container";
import { fetchSuperior, fetchDrh } from "services/users/users";
import { formatValidatorData } from "services/mission/validator-utils";
import { fetchAssignMission } from "services/mission/mission";

const DetailsMission = ({ missionId = "001", onClose, isOpen = true }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState({
    assignMissions: false,
    superior: false,
    drh: false,
  });
  const [error, setError] = useState({ isOpen: false, type: "", message: "" });
  const [assignedPersons, setAssignedPersons] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [superior, setSuperior] = useState(null);
  const [drh, setDrh] = useState(null);

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
      () => {}, // No need for setTotalEntries
      { missionId },
      1, // Default page
      100, // Fetch all persons (adjust as needed)
      handleError
    );

    // Fetch Superior
    setIsLoading((prev) => ({ ...prev, superior: true }));
    fetchSuperior(
      (data) => {
        const formattedSuperior = formatValidatorData(data, "Manager");
        setSuperior(formattedSuperior);
        setValidationSteps((prevSteps) =>
          prevSteps.map((step) =>
            step.order === 1 ? { ...step, validator: formattedSuperior } : step
          )
        );
        setIsLoading((prev) => ({ ...prev, superior: false }));
      },
      setIsLoading,
      handleError
    );

    // Fetch DRH
    setIsLoading((prev) => ({ ...prev, drh: true }));
    fetchDrh(
      (data) => {
        const formattedDrh = formatValidatorData(data, "Directrice RH");
        setDrh(formattedDrh);
        setValidationSteps((prevSteps) =>
          prevSteps.map((step) =>
            step.order === 2 ? { ...step, validator: formattedDrh } : step
          )
        );
        setIsLoading((prev) => ({ ...prev, drh: false }));
      },
      setIsLoading,
      handleError
    );
  }, [missionId]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
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

  if (!isOpen) return null;

  const currentStepData = validationSteps[currentStep] || validationSteps[0];
  const formattedAssignedPersons = assignedPersons.map((person) =>
    formatValidatorData(person, "Collaborateur")
  );

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
            disabled={isLoading.assignMissions || isLoading.superior || isLoading.drh}
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

          {(isLoading.assignMissions || isLoading.superior || isLoading.drh) ? (
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
                            Chargement du validateur N+1...
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
                            Chargement du validateur DRH...
                          </div>
                        </ValidatorItem>
                      )}
                    </ValidatorSection>
                    <ValidatorSection>
                      <SectionTitle>Personnes pour cette mission</SectionTitle>
                      {formattedAssignedPersons.length > 0 ? (
                        formattedAssignedPersons.map((person, index) => (
                          <ValidatorItem
                            key={`${person.name}-${index}`}
                            onClick={() => handleCardClick(assignedPersons[index].employeeId)}
                            style={{ cursor: "pointer" }}
                          >
                            <Avatar size="40px">{person.initials}</Avatar>
                            <ValidatorInfo>
                              <ValidatorName bold large>
                                {person.name}
                              </ValidatorName>
                              <ValidatorRole>{person.position}</ValidatorRole>
                            </ValidatorInfo>
                            <InfoGrid>
                              <InfoItem>
                                <InfoLabel>Email</InfoLabel>
                                <InfoValue>{person.email}</InfoValue>
                              </InfoItem>
                              <InfoItem>
                                <InfoLabel>Département</InfoLabel>
                                <InfoValue>{person.department}</InfoValue>
                              </InfoItem>
                              <InfoItem>
                                <InfoLabel>Poste</InfoLabel>
                                <InfoValue>{person.position}</InfoValue>
                              </InfoItem>
                            </InfoGrid>
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
                            Aucune personne assignée disponible
                          </div>
                        </ValidatorItem>
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