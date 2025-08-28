import React, { useState, useEffect } from "react";
import {
  ValidationContainer,
  ValidationTimeline,
  ValidationStep,
  ValidationStatusIcon,
  ValidationStepContent,
  ValidationStepHeader,
  ValidationStepTitle,
  ValidationStatusBadge,
  ValidationStepBody,
  ValidatorDetails,
  ValidationDetailField,
  ValidationDetailLabel,
  ValidationDetailValue,
  ValidationCommentSection,
  ValidationComment,
  ValidationDateTime,
  LoadingValidationState,
  EmptyValidationState,
  ValidationProgress,
  ValidationProgressHeader,
  ValidationProgressBar,
  ValidationProgressStats,
} from "styles/generaliser/validation-container";
import { fetchSuperior, fetchDrh } from "services/users/users";

const MissionValidationPage = () => {
  const [superior, setSuperior] = useState(null);
  const [drh, setDrh] = useState(null);
  const [isLoading, setIsLoading] = useState({ superior: false, drh: false });
  const [error, setError] = useState({ isOpen: false, type: "", message: "" });

  // Données de simulation pour les validations
  const [validationSteps] = useState([
    {
      id: 1,
      title: "Validation Supérieur Hiérarchique",
      status: "approved", // pending, in-progress, approved, rejected
      validator: null, // sera rempli avec les données du supérieur
      validatedAt: "2024-01-15T10:30:00",
      comment: "Mission approuvée. Les objectifs sont clairs et réalisables.",
      order: 1
    },
    {
      id: 2,
      title: "Validation Direction des Ressources Humaines",
      status: "in-progress", // pending, in-progress, approved, rejected
      validator: null, // sera rempli avec les données du DRH
      validatedAt: null,
      comment: null,
      order: 2
    }
  ]);

  const handleError = (error) => {
    setError(error);
  };

  useEffect(() => {
    fetchSuperior(setSuperior, setIsLoading, handleError);
    fetchDrh(setDrh, setIsLoading, handleError);
  }, []);

  // Calcul du pourcentage de progression
  const calculateProgress = () => {
    const approvedSteps = validationSteps.filter(step => step.status === "approved").length;
    return Math.round((approvedSteps / validationSteps.length) * 100);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "in-progress":
        return "🔄";
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      default:
        return "⏳";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "En Attente";
      case "in-progress":
        return "En Cours";
      case "approved":
        return "Approuvée";
      case "rejected":
        return "Rejetée";
      default:
        return "En Attente";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getValidatorData = (step) => {
    if (step.order === 1) return superior;
    if (step.order === 2) return drh;
    return null;
  };

  const isStepLoading = (step) => {
    if (step.order === 1) return isLoading.superior;
    if (step.order === 2) return isLoading.drh;
    return false;
  };

  const progress = calculateProgress();
  const approvedCount = validationSteps.filter(step => step.status === "approved").length;
  const totalCount = validationSteps.length;

  if (isLoading.superior && isLoading.drh) {
    return (
      <ValidationContainer>
        <LoadingValidationState>
          Chargement des informations de validation...
        </LoadingValidationState>
      </ValidationContainer>
    );
  }

  return (
    <ValidationContainer>
      {error.isOpen && (
        <div
          style={{
            color: error.type === "error" ? "red" : "green",
            marginBottom: "20px",
            textAlign: "center",
            padding: "var(--spacing-md)",
            backgroundColor: error.type === "error" ? "#f8d7da" : "#d4edda",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${error.type === "error" ? "#dc3545" : "#28a745"}`,
          }}
        >
          {error.message}
        </div>
      )}

      <ValidationProgress>
        <ValidationProgressHeader>
          <h2>Avancement des Validations</h2>
          <span className="percentage">{progress}%</span>
        </ValidationProgressHeader>
        <ValidationProgressBar>
          <div className="fill" style={{ width: `${progress}%` }} />
        </ValidationProgressBar>
        <ValidationProgressStats>
          <span>{approvedCount} sur {totalCount} validations approuvées</span>
          <span>Mission: Déplacement Professionnel - Paris</span>
        </ValidationProgressStats>
      </ValidationProgress>

      <ValidationTimeline>
        {validationSteps.map((step, index) => {
          const validator = getValidatorData(step);
          const loading = isStepLoading(step);

          return (
            <ValidationStep key={step.id}>
              <ValidationStatusIcon className={step.status}>
                {getStatusIcon(step.status)}
              </ValidationStatusIcon>

              <ValidationStepContent>
                <ValidationStepHeader>
                  <ValidationStepTitle>{step.title}</ValidationStepTitle>
                  <ValidationStatusBadge className={step.status}>
                    {getStatusText(step.status)}
                  </ValidationStatusBadge>
                </ValidationStepHeader>

                <ValidationStepBody>
                  {loading ? (
                    <div style={{ textAlign: "center", padding: "var(--spacing-md)", color: "var(--text-secondary)" }}>
                      Chargement des informations du validateur...
                    </div>
                  ) : validator ? (
                    <ValidatorDetails>
                      <ValidationDetailField>
                        <ValidationDetailLabel>Validateur :</ValidationDetailLabel>
                        <ValidationDetailValue>{validator.name || "Non spécifié"}</ValidationDetailValue>
                      </ValidationDetailField>
                      <ValidationDetailField>
                        <ValidationDetailLabel>Email :</ValidationDetailLabel>
                        <ValidationDetailValue>{validator.email || "Non spécifié"}</ValidationDetailValue>
                      </ValidationDetailField>
                      <ValidationDetailField>
                        <ValidationDetailLabel>Département :</ValidationDetailLabel>
                        <ValidationDetailValue>{validator.department || "Non spécifié"}</ValidationDetailValue>
                      </ValidationDetailField>
                      <ValidationDetailField>
                        <ValidationDetailLabel>Poste :</ValidationDetailLabel>
                        <ValidationDetailValue>{validator.position || "Non spécifié"}</ValidationDetailValue>
                      </ValidationDetailField>
                    </ValidatorDetails>
                  ) : (
                    <div style={{ textAlign: "center", padding: "var(--spacing-md)", color: "var(--text-secondary)" }}>
                      Aucune information de validateur disponible
                    </div>
                  )}

                  {step.comment && (
                    <ValidationCommentSection>
                      <ValidationDetailLabel>Commentaire :</ValidationDetailLabel>
                      <ValidationComment>
                        {step.comment}
                        {step.validatedAt && (
                          <ValidationDateTime>
                            {formatDate(step.validatedAt)}
                          </ValidationDateTime>
                        )}
                      </ValidationComment>
                    </ValidationCommentSection>
                  )}

                  {step.status === "in-progress" && (
                    <ValidationCommentSection>
                      <div style={{ 
                        textAlign: "center", 
                        padding: "var(--spacing-sm)",
                        color: "#856404",
                        fontStyle: "italic",
                        fontSize: "var(--font-size-sm)"
                      }}>
                        🔄 Validation en cours d'examen...
                      </div>
                    </ValidationCommentSection>
                  )}
                </ValidationStepBody>
              </ValidationStepContent>
            </ValidationStep>
          );
        })}
      </ValidationTimeline>

      {validationSteps.length === 0 && (
        <EmptyValidationState>
          <div className="icon">📋</div>
          <div className="message">Aucune étape de validation configurée pour cette mission.</div>
        </EmptyValidationState>
      )}
    </ValidationContainer>
  );
};

export default MissionValidationPage;