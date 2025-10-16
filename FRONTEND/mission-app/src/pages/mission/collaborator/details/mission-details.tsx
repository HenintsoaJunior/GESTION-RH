import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { X, Download, CheckCircle, Send, Edit2, Trash2 } from "lucide-react";
import ValidationStepper from "@/pages/stepper/index";
import Alert from "@/components/alert";
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupContent,
} from "@/styles/popup-styles";
import {
  LoadingContainer,
  ContentArea,
  ValidatorCard,
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
  CommentText,
  ButtonContainer,
  OMPaymentButton,
  MissionReportButton,
  ButtonOMPDF
} from "@/styles/detailsmission-styles";
import {
  useSearchMissionAssignations,
  useGenerateMissionOrder,
  type MissionAssignation,
} from "@/api/mission/services";
import { useGetMissionValidationsByAssignationId } from "@/api/mission/validation/services";
import {
  useCommentsByMission,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from "@/api/comment/services";
import { formatDate } from "@/utils/date-converter";
import {
  CommentSection,
  CommentInputGroup,
  CommentButton,
  CommentLabel,
  CommentTextarea,
  CommentsList,
  CommentItem,
  CommentContent,
  CommentMeta,
  CommentActions,
  CommentActionButton,
} from "@/styles/comment-styles";

interface AssignedPerson {
  assignationId: string;
  employeeId: string;
  beneficiary: string;
  directionAcronym?: string;
  matricule: string;
  function: string;
  base: string;
  type?: string;
}

interface Comment {
  commentId: string;
  content: string;
  createdAt: string;
  creator: {
    name: string;
    userId: string;
  };
}

interface ValidationStep {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  hasIndicator: boolean;
  validator: {
    name: string;
    initials: string;
    email: string;
    department: string;
    position: string;
  };
  validatedAt?: string;
  validationDate?: string;
  comment?: string;
  order: number;
}

type AlertType = "error" | "success" | "info" | "warning";

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  message: string;
}

interface DetailsMissionProps {
  missionId: string;
  userId: string | null;
  onClose: () => void;
  isOpen?: boolean;
}

const useAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    type: "info",
    message: "",
  });

  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }
  }, []);

  const showAlert = useCallback((type: AlertType, message: string) => {
    clearTimers();
    setAlert({ isOpen: true, type, message });
  }, [clearTimers]);

  const handleClose = useCallback(() => {
    setAlert({ isOpen: false, type: "info", message: "" });
  }, []);

  const resetAlert = useCallback(() => {
    clearTimers();
    setAlert({ isOpen: false, type: "info", message: "" });
  }, [clearTimers]);

  useEffect(() => {
    if (alert.isOpen && alert.type === "success") {
      alertTimerRef.current = setTimeout(() => {
        handleClose();
      }, 3000);
    }

    return () => {
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
    };
  }, [alert.isOpen, alert.type, handleClose]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return { alert, showAlert, handleClose, resetAlert };
};

const useComments = (missionId: string, userId: string | null, showAlert: (type: AlertType, message: string) => void) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  const { data: commentsResponse, isLoading: commentsLoading } = useCommentsByMission(missionId);
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  useEffect(() => {
    if (commentsResponse?.data) {
      setComments(
        commentsResponse.data.map(({ comment }) => ({
          commentId: comment.commentId,
          content: comment.commentText,
          createdAt: comment.createdAt,
          creator: {
            name: comment.user.name,
            userId: comment.user.userId,
          },
        }))
      );
    }
  }, [commentsResponse]);

  const handleCreateComment = useCallback(
    async (commentText: string) => {
      if (!missionId || !userId || !commentText.trim()) return;
      try {
        const commentData = {
          missionId,
          userId,
          commentText,
          createdAt: new Date().toISOString(),
        };
        await createCommentMutation.mutateAsync(commentData);
        setComment("");
      } catch (error: any) {
        showAlert("error", `Erreur lors de l'ajout du commentaire: ${error.message}`);
        throw error;
      }
    },
    [missionId, userId, createCommentMutation, showAlert]
  );

  const handleUpdateComment = useCallback(
    async (commentId: string, commentText: string) => {
      if (!missionId || !userId || !commentText.trim()) return;
      try {
        const commentData = {
          missionId,
          userId,
          commentText,
          createdAt: new Date().toISOString(),
        };
        await updateCommentMutation.mutateAsync({ commentId, comment: commentData });
        setEditingCommentId(null);
        setEditCommentText("");
      } catch (error: any) {
        showAlert("error", `Erreur lors de la mise à jour du commentaire: ${error.message}`);
        throw error;
      }
    },
    [missionId, userId, updateCommentMutation, showAlert]
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!missionId || !userId) return;
      try {
        await deleteCommentMutation.mutateAsync({ commentId, missionId, userId });
      } catch (error: any) {
        showAlert("error", `Erreur lors de la suppression du commentaire: ${error.message}`);
        throw error;
      }
    },
    [missionId, userId, deleteCommentMutation, showAlert]
  );

  const handleEditComment = useCallback((commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditCommentText(currentText);
  }, []);

  const reset = useCallback(() => {
    setComment("");
    setEditingCommentId(null);
    setEditCommentText("");
  }, []);

  return {
    comments,
    isLoading: commentsLoading,
    comment,
    setComment,
    editingCommentId,
    setEditingCommentId,
    editCommentText,
    setEditCommentText,
    handleCreateComment,
    handleUpdateComment,
    handleDeleteComment,
    handleEditComment,
    reset,
  };
};

const useMissionData = (
  missionId: string
) => {
  const [assignedPersons, setAssignedPersons] = useState<AssignedPerson[]>([]);
  const [validationSteps, setValidationSteps] = useState<ValidationStep[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const currentPage = 1;
  const pageSize = 10;

  const { data: searchResponse, isLoading: searchLoading, refetch: refetchSearch } = useSearchMissionAssignations(
    { missionId },
    currentPage,
    pageSize
  );

  const assignationId = assignedPersons[0]?.assignationId;
  const { data: validationsResponse, isLoading: validationsLoading } = useGetMissionValidationsByAssignationId(assignationId);

  const mapToAssignedPerson = useCallback((assignation: MissionAssignation): AssignedPerson => ({
    assignationId: assignation.assignationId,
    employeeId: assignation.employee.employeeId,
    beneficiary: `${assignation.employee.firstName} ${assignation.employee.lastName}`,
    directionAcronym: assignation.employee.direction.acronym,
    matricule: assignation.employee.employeeCode,
    function: assignation.employee.jobTitle,
    base: assignation.employee.site.siteName,
    type: assignation.type,
  }), []);

  useEffect(() => {
    if (searchResponse?.data?.data) {
      setAssignedPersons(searchResponse.data.data.map(mapToAssignedPerson));
      setTotalEntries(searchResponse.data.totalCount || 0);
    } else {
      setAssignedPersons([]);
      setTotalEntries(0);
    }
  }, [searchResponse, mapToAssignedPerson]);

  const mapValidationsToSteps = useCallback((validations: any[]) => {
    const stepMapping: Record<string, { title: string; subtitle: string; order: number }> = {
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

    const mappedSteps = validations.map((validation: any) => {
      const validationType = validation.type || "Directeur de tutelle";
      const stepInfo = stepMapping[validationType] || {
        title: validationType === "DRH" ? "Validation RH" : "Validation Supérieur",
        subtitle: validationType === "DRH" ? "Ressources Humaines" : "Hiérarchique",
        order: validationType === "DRH" ? 2 : 1,
      };

      const validatorName = validation.validator.name;
      const initials = validatorName
        ? validatorName.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
        : "NA";

      const mappedStep: ValidationStep = {
        id: validation.missionValidationId,
        title: validation.validator.title || stepInfo.title,
        subtitle: validation.validator.subtitle || stepInfo.subtitle,
        status: validation.status,
        hasIndicator: true,
        validator: {
          name: validation.validator.name || "Non spécifié",
          initials,
          email: validation.validator.email || "Non spécifié",
          department: validation.validator.department || "Non spécifié",
          position: validation.validator.position || stepInfo.title,
        },
        validatedAt: validation.createdAt,
        validationDate: validation.validationDate,
        comment: validation.comment || ".",
        order: stepInfo.order,
      };

      return mappedStep;
    }).sort((a, b) => a.order - b.order);

    return mappedSteps;
  }, []);

  useEffect(() => {
    if (validationsResponse) {
      setValidationSteps(mapValidationsToSteps(validationsResponse));
    } else {
      setValidationSteps([]);
    }
  }, [validationsResponse, mapValidationsToSteps]);

  const isMissionFullyValidated = useMemo(() => {
    return validationSteps.every((step) => step.status === "approved");
  }, [validationSteps]);

  return {
    assignedPersons,
    validationSteps,
    isLoading: searchLoading || validationsLoading,
    totalEntries,
    currentStep: 0,
    isMissionFullyValidated,
    refetch: refetchSearch,
  };
};

const DetailsMission: React.FC<DetailsMissionProps> = ({ missionId, userId, onClose, isOpen = true }) => {
  const { alert, showAlert, handleClose: handleAlertClose, resetAlert } = useAlert();
  const {
    comments,
    isLoading: commentsLoading,
    comment,
    setComment,
    editingCommentId,
    setEditingCommentId,
    editCommentText,
    setEditCommentText,
    handleCreateComment,
    handleUpdateComment,
    handleDeleteComment,
    handleEditComment,
    reset: resetComments,
  } = useComments(missionId, userId, showAlert);
  const {
    assignedPersons,
    validationSteps,
    isLoading: missionLoading,
    isMissionFullyValidated,
    refetch: refetchMissionData,
  } = useMissionData(missionId);

  const [exportLoading, setExportLoading] = useState({
    pdf: false,
    excel: false,
  });

  const generateOrderMutation = useGenerateMissionOrder();

  const handleExportPDF = useCallback(
    async (employeeId: string) => {
      if (!missionId || !employeeId) {
        showAlert("error", "Mission ID et Employee ID sont requis pour générer l'ordre de mission.");
        return;
      }
      setExportLoading((prev) => ({ ...prev, pdf: true }));
      try {
        const data = { missionId, employeeId };
        await generateOrderMutation.mutateAsync(data);
        showAlert("success", "Ordre de mission généré et téléchargé avec succès.");
      } catch (error: any) {
        showAlert("error", error.message || "Erreur lors de la génération de l'ordre de mission.");
      } finally {
        setExportLoading((prev) => ({ ...prev, pdf: false }));
        refetchMissionData();
      }
    },
    [missionId, showAlert, generateOrderMutation, refetchMissionData]
  );

  const handleSaveComment = useCallback(async () => {
    if (!comment.trim()) {
      showAlert("error", "Le commentaire ne peut pas être vide.");
      return;
    }
    try {
      await handleCreateComment(comment);
    } catch (error: any) {
      // Error handled in hook
    }
  }, [comment, handleCreateComment, showAlert]);

  const handleSaveEditComment = useCallback(
    async (commentId: string) => {
      if (!editCommentText.trim()) {
        showAlert("error", "Le commentaire ne peut pas être vide.");
        return;
      }
      try {
        await handleUpdateComment(commentId, editCommentText);
      } catch (error: any) {
        // Error handled in hook
      }
    },
    [editCommentText, handleUpdateComment, showAlert]
  );

  const handleDeleteCommentAction = useCallback(
    async (commentId: string) => {
      try {
        await handleDeleteComment(commentId);
      } catch (error: any) {
        // Error handled in hook
      }
    },
    [handleDeleteComment]
  );

  const handleClosePopup = useCallback(() => {
    resetAlert();
    resetComments();
    onClose();
  }, [resetAlert, resetComments, onClose]);

  const isGlobalLoading = useMemo(() => {
    return missionLoading || commentsLoading || exportLoading.pdf || exportLoading.excel;
  }, [missionLoading, commentsLoading, exportLoading]);

  const handleOMPaymentClick = useCallback((employeeId: string, assignmentType: string) => {
    console.log("OM Payment clicked:", { employeeId, assignmentType });
    // Future integration: Fetch and set data for OMPayment
  }, []);

  const handleMissionReportClick = useCallback((employeeId: string, assignationId: string) => {
    console.log("Mission Report clicked:", { employeeId, assignationId });
    // Future integration: Set data for MissionReport
  }, []);

  if (!isOpen) return null;

  return (
    <PopupOverlay role="dialog" aria-labelledby="mission-details-title" aria-modal="true">
      <PagePopup>
        <PopupHeader>
          <PopupTitle id="mission-details-title">
            Détails de la Mission {missionId || "Inconnue"}
            {assignedPersons.length > 0 && (
              <span className="assignments-count">
                ({assignedPersons.length} assignation{assignedPersons.length > 1 ? "s" : ""})
              </span>
            )}
          </PopupTitle>
          <PopupClose
            onClick={handleClosePopup}
            disabled={isGlobalLoading}
            aria-label="Fermer la fenêtre"
          >
            <X size={24} />
          </PopupClose>
        </PopupHeader>

        <PopupContent>
          {alert.isOpen && (
            <Alert
              type={alert.type}
              message={alert.message}
              isOpen={alert.isOpen}
              onClose={handleAlertClose}
            />
          )}

          {validationSteps.length > 0 && !isGlobalLoading && (
            <ValidationStepper steps={validationSteps} currentStep={0} />
          )}

          {isGlobalLoading ? (
            <LoadingContainer>Chargement des informations de la mission...</LoadingContainer>
          ) : (
            <ContentArea>
              {validationSteps.length > 0 && (
                <ValidatorCard>
                  <ValidatorGrid>
                    <ValidatorSection>
                      <SectionTitle>Valideurs</SectionTitle>
                      {validationSteps.map((step) => (
                        <ValidatorItem key={step.id}>
                          <Avatar size="40px">{step.validator?.initials || "NA"}</Avatar>
                          <ValidatorInfo>
                            <ValidatorName>{step.validator?.name || "Non spécifié"}</ValidatorName>
                            <ValidatorRole>
                              {step.title} - {step.subtitle}
                            </ValidatorRole>
                          </ValidatorInfo>
                        </ValidatorItem>
                      ))}
                    </ValidatorSection>
                    <ValidatorSection>
                      <SectionTitle>Personnes Assignées à la Mission</SectionTitle>
                      {assignedPersons.length > 0 ? (
                        assignedPersons.map((assignment, index) => (
                          <ValidatorItem
                            key={`${assignment.employeeId}-${missionId}-${index}`}
                            style={{ marginBottom: "var(--spacing-md)" }}
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

                      {assignedPersons.length > 0 && isMissionFullyValidated && (
                        <InfoGrid
                          style={{
                            marginTop: "var(--spacing-lg)",
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "var(--spacing-md)",
                          }}
                        >
                          {assignedPersons.map((assignment, index) => {
                            const buttonText = assignment.type === "Indemnité" ? "Indemnité" : "Note de frais";
                            const shouldShowButton = assignment.type === "Indemnité" || assignment.type === "Note de frais";
                            return (
                              <div
                                key={`buttons-${assignment.employeeId}-${index}`}
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
                                  {shouldShowButton && (
                                    <ButtonContainer>
                                      <OMPaymentButton
                                        onClick={() => handleOMPaymentClick(assignment.employeeId, assignment.type || "")}
                                        disabled={exportLoading.pdf}
                                      >
                                        {buttonText}
                                      </OMPaymentButton>
                                    </ButtonContainer>
                                  )}
                                </InfoItem>
                                <InfoItem>
                                  <ButtonContainer>
                                    <ButtonOMPDF
                                      onClick={() => handleExportPDF(assignment.employeeId)}
                                      disabled={exportLoading.pdf}
                                    >
                                      <Download size={16} /> OM PDF
                                    </ButtonOMPDF>
                                  </ButtonContainer>
                                </InfoItem>
                                <InfoItem>
                                  {shouldShowButton && (
                                    <ButtonContainer>
                                      <MissionReportButton
                                        onClick={() => handleMissionReportClick(assignment.employeeId, assignment.assignationId)}
                                        disabled={exportLoading.excel}
                                      >
                                        Rendu
                                      </MissionReportButton>
                                    </ButtonContainer>
                                  )}
                                </InfoItem>
                              </div>
                            );
                          })}
                        </InfoGrid>
                      )}
                    </ValidatorSection>
                  </ValidatorGrid>
                </ValidatorCard>
              )}

              <SectionTitle>Commentaires</SectionTitle>
              <CommentSection>
                <CommentLabel htmlFor="new-comment">Nouveau Commentaire</CommentLabel>
                <CommentInputGroup>
                  <CommentTextarea
                    id="new-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ajoutez un commentaire..."
                  />
                </CommentInputGroup>
                <CommentActions>
                  <CommentButton
                    onClick={handleSaveComment}
                    disabled={!comment.trim() || isGlobalLoading}
                    title={comment.trim() ? "Enregistrer le commentaire" : "Le commentaire est vide"}
                  >
                    <Send size={14} /> Enregistrer Commentaire
                  </CommentButton>
                </CommentActions>
              </CommentSection>

              <CommentsList>
                {comments.length === 0 ? (
                  <CommentText>Aucun commentaire pour cette mission.</CommentText>
                ) : (
                  comments.map((commentItem) => {
                    const initials = commentItem.creator.name
                      ? commentItem.creator.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
                      : "NA";
                    return (
                      <CommentItem key={commentItem.commentId}>
                        <Avatar size="32px">{initials}</Avatar>
                        <CommentContent>
                          {editingCommentId === commentItem.commentId ? (
                            <>
                              <CommentTextarea
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                placeholder="Modifiez votre commentaire..."
                              />
                              <CommentActions>
                                <CommentButton
                                  onClick={() => handleSaveEditComment(commentItem.commentId)}
                                  disabled={!editCommentText.trim() || isGlobalLoading}
                                >
                                  <CheckCircle size={14} /> Enregistrer
                                </CommentButton>
                                <CommentButton onClick={() => setEditingCommentId(null)}>
                                  <X size={14} /> Annuler
                                </CommentButton>
                              </CommentActions>
                            </>
                          ) : (
                            <>
                              <CommentText>{commentItem.content}</CommentText>
                              <CommentMeta>
                                Par {commentItem.creator.name} le {formatDate(commentItem.createdAt)}:
                              </CommentMeta>
                            </>
                          )}
                        </CommentContent>
                        {commentItem.creator.userId === userId && (
                          <CommentActions>
                            <CommentActionButton
                              onClick={() => handleEditComment(commentItem.commentId, commentItem.content)}
                              title="Modifier le commentaire"
                              disabled={isGlobalLoading}
                            >
                              <Edit2 size={16} />
                            </CommentActionButton>
                            <CommentActionButton
                              className="delete"
                              onClick={() => handleDeleteCommentAction(commentItem.commentId)}
                              title="Supprimer le commentaire"
                              disabled={isGlobalLoading}
                            >
                              <Trash2 size={16} />
                            </CommentActionButton>
                          </CommentActions>
                        )}
                      </CommentItem>
                    );
                  })
                )}
              </CommentsList>
            </ContentArea>
          )}
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
};

export default DetailsMission;