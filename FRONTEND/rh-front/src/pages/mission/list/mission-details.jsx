import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, FileText, Download, ArrowLeft, ArrowRight } from "lucide-react";
import { formatDate } from "utils/dateConverter";
import Alert from "components/alert";
import Pagination from "components/pagination";
import {
  ValidationContainer,
  ValidationTimeline,
  ValidationStep,
  StepIndicator,
  StepNumber,
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
  NoValidatorMessage,
  InProgressMessage,
  LoadingValidationState,
  EmptyValidationState,
  ValidationProgress,
  ValidationProgressHeader,
  ValidationProgressBar,
  ValidationProgressStats,
} from "styles/generaliser/process-container";
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupContent,
  PopupActions,
  ButtonPrimary,
  ButtonSecondary,
} from "styles/generaliser/popup-container";
import "styles/generic-table-styles.css";
import {
  fetchAssignMission,
  fetchMissionById,
  exportMissionAssignationPDF,
  exportMissionAssignationExcel,
} from "services/mission/mission";

const DetailsMission = ({ missionId, onClose, isOpen }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState({
    assignMissions: false,
    mission: false,
    exportPDF: false,
    exportExcel: false,
  });
  const [error, setError] = useState({ isOpen: false, type: "", message: "" });
  const [assignedPersons, setAssignedPersons] = useState([]);
  const [missionDetails, setMissionDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Mock validator data
  const [validationSteps] = useState([
    {
      id: 1,
      title: "Validation Supérieur Hiérarchique",
      status: "approved",
      validator: {
        name: "Jean Dupont",
        email: "jean.dupont@entreprise.com",
        department: "Gestion de Projet",
        position: "Manager",
      },
      validatedAt: "2024-01-15T10:30:00",
      comment: "Mission approuvée. Les objectifs sont clairs et réalisables.",
      order: 1,
    },
    {
      id: 2,
      title: "Validation Direction des Ressources Humaines",
      status: "approved",
      validator: {
        name: "Marie Dubois",
        email: "marie.dubois@entreprise.com",
        department: "Ressources Humaines",
        position: "Directrice",
      },
      validatedAt: "2024-01-16T14:20:00",
      comment: "Budget approuvé et ressources allouées.",
      order: 2,
    },
    {
      id: 3,
      title: "Validation Direction Générale",
      status: "in-progress",
      validator: {
        name: "Pierre Martin",
        email: "pierre.martin@entreprise.com",
        department: "Direction Générale",
        position: "Directeur Général",
      },
      validatedAt: null,
      comment: null,
      order: 3,
    },
    {
      id: 4,
      title: "Validation Finale",
      status: "pending",
      validator: {
        name: "Sophie Bernard",
        email: "sophie.bernard@entreprise.com",
        department: "Administration",
        position: "Administratrice",
      },
      validatedAt: null,
      comment: null,
      order: 4,
    },
  ]);

  // Handle Escape key to close popup
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape" && isOpen && !isLoading.mission && !isLoading.assignMissions) {
        onClose();
      }
    },
    [isOpen, onClose, isLoading.mission, isLoading.assignMissions]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (!isOpen || !missionId) {
      if (!missionId) {
        setError({
          isOpen: true,
          type: "error",
          message: "Aucun ID de mission fourni.",
        });
      }
      return;
    }

    fetchMissionById(missionId, setMissionDetails, setIsLoading, (error) =>
      setError(error)
    );
    fetchAssignMission(
      setAssignedPersons,
      setIsLoading,
      setTotalEntries,
      { missionId },
      currentPage,
      pageSize,
      (error) => setError(error)
    );
  }, [missionId, currentPage, pageSize, isOpen]);

  const calculateProgress = () => {
    const approvedSteps = validationSteps.filter(
      (step) => step.status === "approved"
    ).length;
    return Math.round((approvedSteps / validationSteps.length) * 100);
  };

  const getStepColor = (status, index) => {
    if (status === "approved") return "#22c55e"; // Vert
    if (status === "in-progress") return "#3b82f6"; // Bleu
    if (status === "rejected") return "#ef4444"; // Rouge
    return "#94a3b8"; // Gris pour pending
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "○";
      case "in-progress":
        return "○";
      case "approved":
        return "✓";
      case "rejected":
        return "✗";
      default:
        return "○";
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

  const formatDateString = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      (error) => setError(error)
    );
  };

  const handleExportExcel = () => {
    const exportFilters = { missionId };
    exportMissionAssignationExcel(
      exportFilters,
      setIsLoading,
      (success) => setError(success),
      (error) => setError(error)
    );
  };

  const handleNextStep = () => {
    if (currentStep < validationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = validationSteps[currentStep];

  return (
    <PopupOverlay role="dialog" aria-labelledby="mission-details-title" aria-modal="true">
      <PagePopup style={{ maxWidth: "900px", height: "80vh" }}>
        <PopupHeader>
          <PopupTitle id="mission-details-title">
            Processus de Validation - Mission {missionId}
          </PopupTitle>
          <PopupClose
            onClick={onClose}
            disabled={isLoading.mission || isLoading.assignMissions}
            aria-label="Fermer la fenêtre"
          >
            <X size={24} />
          </PopupClose>
        </PopupHeader>

        <PopupContent style={{ padding: "2rem", display: "flex", flexDirection: "column", height: "100%" }}>
          <Alert
            type={error.type}
            message={error.message}
            isOpen={error.isOpen}
            onClose={() => setError({ ...error, isOpen: false })}
          />

          {isLoading.mission ? (
            <LoadingValidationState>
              Chargement des informations de la mission...
            </LoadingValidationState>
          ) : (
            <div style={{ display: "flex", height: "100%", gap: "2rem" }}>
              {/* Timeline verticale à gauche */}
              <div style={{ 
                width: "200px", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                paddingTop: "2rem"
              }}>
                {validationSteps.map((step, index) => (
                  <div key={step.id} style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center",
                    position: "relative",
                    marginBottom: index === validationSteps.length - 1 ? "0" : "3rem"
                  }}>
                    {/* Numéro de l'étape avec cercle coloré */}
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: getStepColor(step.status, index),
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      zIndex: 2,
                      position: "relative"
                    }}>
                      {step.status === "approved" ? "✓" : index + 1}
                    </div>
                    
                    {/* Ligne de connexion */}
                    {index < validationSteps.length - 1 && (
                      <div style={{
                        width: "4px",
                        height: "60px",
                        backgroundColor: getStepColor(step.status, index),
                        marginTop: "8px"
                      }} />
                    )}
                    
                    {/* Barre de progression horizontale */}
                    <div style={{
                      position: "absolute",
                      left: "50px",
                      top: "15px",
                      width: "120px",
                      height: "10px",
                      backgroundColor: "#e5e7eb",
                      borderRadius: "5px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: step.status === "approved" ? "100%" : 
                               step.status === "in-progress" ? "60%" : "0%",
                        height: "100%",
                        backgroundColor: getStepColor(step.status, index),
                        borderRadius: "5px",
                        transition: "width 0.3s ease"
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Contenu détaillé à droite */}
              <div style={{ 
                flex: 1, 
                display: "flex", 
                flexDirection: "column",
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                padding: "2rem",
                position: "relative"
              }}>
                {currentStepData && (
                  <>
                    {/* En-tête de l'étape */}
                    <div style={{ marginBottom: "2rem" }}>
                      <h2 style={{ 
                        fontSize: "1.5rem", 
                        fontWeight: "600",
                        color: "#1f2937",
                        marginBottom: "0.5rem"
                      }}>
                        {currentStepData.title}
                      </h2>
                      <div style={{
                        display: "inline-block",
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        backgroundColor: getStepColor(currentStepData.status),
                        color: "white",
                        fontSize: "0.9rem",
                        fontWeight: "500"
                      }}>
                        {getStatusText(currentStepData.status)}
                      </div>
                    </div>

                    {/* Détails du validateur */}
                    <div style={{ 
                      backgroundColor: "white",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      marginBottom: "1.5rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}>
                      <h3 style={{ 
                        fontSize: "1.1rem", 
                        fontWeight: "600", 
                        marginBottom: "1rem",
                        color: "#374151"
                      }}>
                        Informations du Validateur
                      </h3>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                          <label style={{ 
                            fontSize: "0.9rem", 
                            fontWeight: "500", 
                            color: "#6b7280",
                            display: "block",
                            marginBottom: "0.25rem"
                          }}>
                            Nom
                          </label>
                          <div style={{ color: "#111827", fontWeight: "500" }}>
                            {currentStepData.validator?.name || "Non spécifié"}
                          </div>
                        </div>
                        
                        <div>
                          <label style={{ 
                            fontSize: "0.9rem", 
                            fontWeight: "500", 
                            color: "#6b7280",
                            display: "block",
                            marginBottom: "0.25rem"
                          }}>
                            Email
                          </label>
                          <div style={{ color: "#111827" }}>
                            {currentStepData.validator?.email || "Non spécifié"}
                          </div>
                        </div>
                        
                        <div>
                          <label style={{ 
                            fontSize: "0.9rem", 
                            fontWeight: "500", 
                            color: "#6b7280",
                            display: "block",
                            marginBottom: "0.25rem"
                          }}>
                            Département
                          </label>
                          <div style={{ color: "#111827" }}>
                            {currentStepData.validator?.department || "Non spécifié"}
                          </div>
                        </div>
                        
                        <div>
                          <label style={{ 
                            fontSize: "0.9rem", 
                            fontWeight: "500", 
                            color: "#6b7280",
                            display: "block",
                            marginBottom: "0.25rem"
                          }}>
                            Poste
                          </label>
                          <div style={{ color: "#111827" }}>
                            {currentStepData.validator?.position || "Non spécifié"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Commentaires et date */}
                    {(currentStepData.comment || currentStepData.validatedAt) && (
                      <div style={{ 
                        backgroundColor: "white",
                        borderRadius: "8px",
                        padding: "1.5rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                      }}>
                        {currentStepData.comment && (
                          <>
                            <h3 style={{ 
                              fontSize: "1.1rem", 
                              fontWeight: "600", 
                              marginBottom: "1rem",
                              color: "#374151"
                            }}>
                              Commentaire
                            </h3>
                            <div style={{ 
                              color: "#111827",
                              lineHeight: "1.6",
                              marginBottom: "1rem"
                            }}>
                              {currentStepData.comment}
                            </div>
                          </>
                        )}
                        
                        {currentStepData.validatedAt && (
                          <div style={{ 
                            fontSize: "0.9rem", 
                            color: "#6b7280",
                            borderTop: "1px solid #e5e7eb",
                            paddingTop: "1rem"
                          }}>
                            Validé le : {formatDateString(currentStepData.validatedAt)}
                          </div>
                        )}
                      </div>
                    )}

                    {currentStepData.status === "in-progress" && (
                      <div style={{ 
                        backgroundColor: "#dbeafe",
                        border: "1px solid #93c5fd",
                        borderRadius: "8px",
                        padding: "1rem",
                        marginTop: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}>
                        <span style={{ fontSize: "1.2rem" }}>🔄</span>
                        <span style={{ color: "#1e40af", fontWeight: "500" }}>
                          Validation en cours d'examen...
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </PopupContent>

        {/* Actions en bas */}
        <PopupActions style={{ 
          padding: "1.5rem 2rem", 
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <ButtonSecondary 
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <ArrowLeft size={16} />
              Précédent
            </ButtonSecondary>
            
            <ButtonSecondary onClick={handleCancel}>
              Annuler
            </ButtonSecondary>
          </div>
          
          <div style={{ 
            fontSize: "0.9rem", 
            color: "#6b7280",
            fontWeight: "500"
          }}>
            Étape {currentStep + 1} sur {validationSteps.length}
          </div>
          
          <ButtonPrimary 
            onClick={handleNextStep}
            disabled={currentStep === validationSteps.length - 1}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            Suivant
            <ArrowRight size={16} />
          </ButtonPrimary>
        </PopupActions>
      </PagePopup>
    </PopupOverlay>
  );
};

export default DetailsMission;