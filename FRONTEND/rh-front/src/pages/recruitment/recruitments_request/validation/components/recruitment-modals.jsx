import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, X, MoreVertical } from "lucide-react";
import Modal from "components/modal";
import {
  PopupOverlay,
  PopupContainer,
  PopupHeader,
  PopupTitle,
  CloseButton,
  PopupContent,
  LoadingContainer,
  ContentArea,
  ValidatorCard,
  ValidatorSection,
  SectionTitle,
  InfoAlert,
  AlertText,
  InfoGrid,
  InfoItem,
  InfoLabel,
  InfoValue,
  Avatar,
} from "styles/generaliser/details-mission-container";
import { ButtonConfirm, ButtonCancel } from "styles/generaliser/table-container";
import { useGetRecruitmentValidationsByValidator, useValidateRecruitmentRequest, useRefuseRecruitmentRequest } from "services/recruitment/recruitment-request/validation";
import { fetchRecruitmentRequestById } from "services/recruitment/recruitment-request/services";
import { formatDate } from "utils/dateConverter";
import styled from "styled-components";
import { useCreateComment, useGetCommentsByRecruitmentRequest, useUpdateComment, useDeleteComment } from "services/recruitment/recruitment-request/comments";
import { getInitials } from "utils/initials";

const ActionSection = styled.div`
  padding: 20px;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
`;

const ActionHeader = styled.h3`
  color: #495057;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &.validate {
    background-color: #28a745;
    color: white;
    &:hover {
      background-color: #218838;
    }
  }
  &.reject {
    background-color: #dc3545;
    color: white;
    &:hover {
      background-color: #c82333;
    }
  }
  &[disabled] {
    background-color: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const CommentSection = styled.div`
  margin-bottom: 20px;
`;

const CommentLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const CommentButtonSection = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;

const CommentButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  background-color: var(--primary-color);
  color: white;
  &:hover {
    background-color: var(--primary-color);
  }
`;

const SignatureUploadSection = styled.div`
  margin-bottom: 20px;
`;

const FileInputWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const FileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 2px dashed #ced4da;
  border-radius: 6px;
  background-color: #f8f9fa;
  cursor: pointer;
  text-align: center;
  color: #6c757d;
  &:hover {
    border-color: #80bdff;
    background-color: #e3f2fd;
  }
  &.has-file {
    border-color: #28a745;
    background-color: #d4edda;
    color: #155724;
  }
`;

const SignaturePreview = styled.div`
  margin-top: 10px;
  text-align: center;
  img {
    max-width: 150px;
    max-height: 80px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  }
`;

const CommentsDisplaySection = styled.div`
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: #f8f9fa;
`;

const CommentsDisplayTitle = styled.h4`
  color: #495057;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
`;

const CommentEntry = styled.div`
  margin-bottom: 15px;
  position: relative;
`;

const CommentEntryContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
`;

const CommentEntryText = styled.p`
  color: #6c757d;
  font-size: 14px;
  margin: 0;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  flex: 1;
`;

const CommentEntryDate = styled.div`
  color: #6c757d;
  font-size: 12px;
  margin-top: 5px;
`;

const MoreOptionsButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #6c757d;
  &:hover {
    color: #495057;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
`;

const DropdownItem = styled.button`
  background: none;
  border: none;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
  &:hover {
    background-color: #f8f9fa;
  }
`;

const EditCommentModal = styled.div`
  padding: 20px;
`;

const EditCommentTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 10px;
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const handleValidationError = (error) => {
  let errorMessage = "Une erreur est survenue.";
  if (error.response) {
    if (error.response.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.Message) {
        errorMessage = error.response.data.Message;
      }
    } else {
      errorMessage = `Erreur serveur: ${error.response.statusText || 'Réponse inattendue'}`;
    }
  } else if (error.message) {
    errorMessage = error.message;
  }
  return new Error(errorMessage);
};

const RecruitmentModals = ({
  alert,
  setAlert,
  showDetailsRecruitment,
  setShowDetailsRecruitment,
  selectedRecruitmentId,
  handleUpdateComments,
  handleUpdateSignature,
  fetchRecruitments, // Added prop to refresh data
}) => {
  const getRecruitmentValidations = useGetRecruitmentValidationsByValidator();
  const validateRecruitmentRequest = useValidateRecruitmentRequest();
  const refuseRecruitmentRequest = useRefuseRecruitmentRequest();
  const createComment = useCreateComment();
  const getCommentsByRecruitmentRequest = useGetCommentsByRecruitmentRequest();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const [isLoading, setIsLoading] = useState({ validations: false, details: false, comments: false });
  const [errorModal, setErrorModal] = useState({ isOpen: false, type: "", message: "" });
  const [validationSteps, setValidationSteps] = useState([]);
  const [recruitmentDetails, setRecruitmentDetails] = useState(null);
  const [currentStep] = useState(0);
  const [comment, setComment] = useState('');
  const [signature, setSignature] = useState(null);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [recruitmentRequestId, setRecruitmentRequestId] = useState(null);
  const [comments, setComments] = useState([]);
  const [showCommentMenu, setShowCommentMenu] = useState(null);
  const [editComment, setEditComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(null);
  const currentUserId = JSON.parse(localStorage.getItem("user"))?.userId || "N/A";

  const handleError = (error) => {
    const processedError = handleValidationError(error);
    setErrorModal({
      isOpen: true,
      type: "error",
      message: processedError.message,
    });
  };

  const closeErrorModal = () => {
    setErrorModal({ ...errorModal, isOpen: false });
  };

  const toggleCommentMenu = useCallback((commentId) => {
    setShowCommentMenu(showCommentMenu === commentId ? null : commentId);
  }, [showCommentMenu]);

  const handleEditComment = useCallback((comment) => {
    setEditComment(comment);
    setEditCommentText(comment.content);
    setShowCommentMenu(null);
  }, []);

  const fetchComments = useCallback(async () => {
    if (!recruitmentRequestId) return;
    try {
      setIsLoading((prev) => ({ ...prev, comments: true }));
      const commentsData = await getCommentsByRecruitmentRequest(recruitmentRequestId);
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments:", error);
      handleError(error);
    } finally {
      setIsLoading((prev) => ({ ...prev, comments: false }));
    }
  }, [recruitmentRequestId, getCommentsByRecruitmentRequest]);

  const handleDeleteComment = useCallback(async (commentId, recruitmentRequestId) => {
    if (!commentId || !recruitmentRequestId) {
      handleError({ message: "L'ID du commentaire et l'ID de la demande de recrutement sont requis." });
      return;
    }
    try {
      const response = await deleteComment(commentId, recruitmentRequestId, currentUserId);
      setEditComment(null);
      setEditCommentText('');
      await fetchComments();
      setShowCommentMenu(null);
      setShowDeleteConfirmModal(null);
      setAlert({
        isOpen: true,
        type: "success",
        message: response.message || "Commentaire supprimé avec succès.",
      });
    } catch (error) {
      handleError(error);
    }
  }, [deleteComment, currentUserId, setAlert, fetchComments]);

  const confirmDeleteComment = useCallback((commentId, recruitmentRequestId) => {
    setShowDeleteConfirmModal({ commentId, recruitmentRequestId });
  }, []);

  const handleUpdateCommentSubmit = useCallback(async () => {
    if (!editCommentText.trim()) {
      handleError({ message: "Le commentaire ne peut pas être vide." });
      return;
    }
    try {
      const commentData = {
        recruitmentRequestId: editComment.recruitmentRequestId,
        userId: currentUserId,
        commentText: editCommentText,
        createdAt: new Date().toISOString(),
      };
      const response = await updateComment(editComment.commentId, commentData);
      setEditComment(null);
      setEditCommentText('');
      await fetchComments();
      setAlert({
        isOpen: true,
        type: "success",
        message: response.message || "Commentaire mis à jour avec succès.",
      });
    } catch (error) {
      handleError(error);
    }
  }, [editComment, editCommentText, updateComment, currentUserId, setAlert, fetchComments]);

  const mapValidationsToSteps = useCallback((validations) => {
    return validations.map((validation, index) => {
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
      return {
        id: validation.recruitmentValidationId,
        title: validation.validator?.title || `Validation ${validation.type || "Non spécifié"}`,
        subtitle: validation.validator?.subtitle || validation.type || "Non spécifié",
        status,
        hasIndicator: true,
        validator: {
          name: validation.validator?.name || "Non spécifié",
          initials: getInitials(validation.validator?.name || "John Doe"),
          email: validation.validator?.email || "Non spécifié",
          department: validation.validator?.department || "Non spécifié",
          position: validation.validator?.position || `Validation ${validation.type || "Non spécifié"}`,
        },
        validatedAt: validation.createdAt,
        comment: validation.comment || ".",
        order: index + 1,
        recruitmentRequestId: validation.recruitmentRequest?.recruitmentRequestId || null,
      };
    });
  }, []);

  const fetchRecruitmentValidations = useCallback(async () => {
    try {
      setIsLoading((prev) => ({ ...prev, validations: true }));
      const validatorId = JSON.parse(localStorage.getItem("user"))?.userId || "N/A";
      const response = await getRecruitmentValidations(validatorId);
      if (!response.results || !Array.isArray(response.results)) {
        setValidationSteps([]);
        return;
      }
      const validations = response.results.filter(
        (validation) => validation.recruitmentValidationId === selectedRecruitmentId
      );
      const mappedSteps = mapValidationsToSteps(validations);
      setValidationSteps(mappedSteps);
      if (mappedSteps.length > 0 && mappedSteps[0].recruitmentRequestId) {
        setRecruitmentRequestId(mappedSteps[0].recruitmentRequestId);
      }
    } catch (error) {
      console.error("Error fetching validations:", error);
      handleError(error);
    } finally {
      setIsLoading((prev) => ({ ...prev, validations: false }));
    }
  }, [getRecruitmentValidations, selectedRecruitmentId, mapValidationsToSteps]);

  const fetchRecruitmentDetails = useCallback(async () => {
    if (!recruitmentRequestId) return;
    try {
      setIsLoading((prev) => ({ ...prev, details: true }));
      await fetchRecruitmentRequestById(
        recruitmentRequestId,
        (data) => {
          setRecruitmentDetails(data);
        },
        (loading) => setIsLoading((prev) => ({ ...prev, details: loading })),
        handleError
      );
    } catch (error) {
      console.error("Error fetching recruitment details:", error);
      handleError(error);
    }
  }, [recruitmentRequestId]);

  useEffect(() => {
    if (!showDetailsRecruitment || !selectedRecruitmentId) return;
    fetchRecruitmentValidations();
  }, [showDetailsRecruitment, selectedRecruitmentId, fetchRecruitmentValidations]);

  useEffect(() => {
    if (recruitmentRequestId) {
      fetchRecruitmentDetails();
      fetchComments();
    }
  }, [recruitmentRequestId, fetchRecruitmentDetails, fetchComments]);

  const handleFileUpload = useCallback((file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSignature({ file, preview: e.target.result });
        handleUpdateSignature(selectedRecruitmentId, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, [handleUpdateSignature, selectedRecruitmentId]);

  const handleAction = useCallback((action) => {
    if (action === 'validate') {
      setShowValidateModal(true);
    } else if (action === 'reject') {
      setShowRejectModal(true);
    }
  }, []);

  const confirmValidate = useCallback(async () => {
    try {
      const response = await validateRecruitmentRequest(
        recruitmentRequestId,
        currentUserId,
        new Date().toISOString()
      );
      setShowValidateModal(false);
      setComment('');
      setSignature(null);
      setAlert({
        isOpen: true,
        type: "success",
        message: response.message || "Validation effectuée avec succès.",
      });
      await fetchRecruitments(); // Refresh data
      setShowDetailsRecruitment(false); // Close modal
    } catch (error) {
      handleError(error);
    }
  }, [validateRecruitmentRequest, recruitmentRequestId, currentUserId, setAlert, fetchRecruitments, setShowDetailsRecruitment]);

  const confirmReject = useCallback(async () => {
    try {
      const response = await refuseRecruitmentRequest(
        selectedRecruitmentId,
        currentUserId,
        new Date().toISOString()
      );
      setShowRejectModal(false);
      setComment('');
      setSignature(null);
      setAlert({
        isOpen: true,
        type: "success",
        message: response.message || "Validation rejetée avec succès.",
      });
      await fetchRecruitments(); // Refresh data
      setShowDetailsRecruitment(false); // Close modal
    } catch (error) {
      handleError(error);
    }
  }, [refuseRecruitmentRequest, selectedRecruitmentId, currentUserId, setAlert, fetchRecruitments, setShowDetailsRecruitment]);

  const handleCommentChange = useCallback((e) => {
    setComment(e.target.value);
    handleUpdateComments(selectedRecruitmentId, e.target.value);
  }, [handleUpdateComments, selectedRecruitmentId]);

  const handleCommentSubmit = useCallback(async () => {
    if (!comment.trim()) {
      handleError({ message: "Le commentaire ne peut pas être vide." });
      return;
    }
    if (!recruitmentRequestId) {
      handleError({ message: "ID de la demande de recrutement requis." });
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user")) || { userId: "N/A" };
      const commentData = {
        recruitmentRequestId,
        userId: user.userId,
        commentText: comment,
      };
      const response = await createComment(commentData);
      setComment('');
      handleUpdateComments(selectedRecruitmentId, comment);
      await fetchComments();
      setAlert({
        isOpen: true,
        type: "success",
        message: response.message || "Commentaire ajouté avec succès.",
      });
    } catch (error) {
      handleError(error);
    }
  }, [comment, recruitmentRequestId, createComment, handleUpdateComments, selectedRecruitmentId, fetchComments, setAlert]);

  if (!showDetailsRecruitment || !selectedRecruitmentId) return null;

  const isLoadingData = isLoading.validations || isLoading.details || isLoading.comments;
  const currentStepData = validationSteps[currentStep] || validationSteps[0];
  const isReplacement = recruitmentDetails?.recruitmentRequest?.recruitmentReason?.name === "Remplacement d'un employé" &&
    recruitmentDetails?.recruitmentRequest?.formerEmployeeName &&
    recruitmentDetails?.recruitmentRequest?.replacementDate;
  const isNewPosition = recruitmentDetails?.recruitmentRequest?.newPositionExplanation && !isReplacement;
  const isBudgetedDotation = isNewPosition && !recruitmentDetails?.recruitmentRequest?.formerEmployeeName;
  const isValidated = currentStepData?.status === "approved";
  const isRejected = currentStepData?.status === "rejected";

  return (
    <PopupOverlay role="dialog" aria-labelledby="recruitment-details-title" aria-modal="true">
      <PopupContainer>
        <PopupHeader>
          <PopupTitle id="recruitment-details-title">
            Détails de la Validation de Recrutement {selectedRecruitmentId}
            {validationSteps.length > 0 && (
              <span className="validations-count">
                ({validationSteps.length} validation{validationSteps.length > 1 ? "s" : ""})
              </span>
            )}
          </PopupTitle>
          <CloseButton
            onClick={() => setShowDetailsRecruitment(false)}
            disabled={isLoadingData}
            aria-label="Fermer la fenêtre"
          >
            <X size={24} />
          </CloseButton>
        </PopupHeader>
        <PopupContent>
          <Modal
            type={errorModal.type}
            message={errorModal.message}
            isOpen={errorModal.isOpen}
            onClose={closeErrorModal}
            title={errorModal.type === "error" ? "Erreur" : "Succès"}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <ButtonConfirm onClick={closeErrorModal}>OK</ButtonConfirm>
            </div>
          </Modal>
          <Modal
            type="warning"
            message="Êtes-vous sûr de vouloir valider cette demande de recrutement ? Cette action est irréversible."
            isOpen={showValidateModal}
            onClose={() => setShowValidateModal(false)}
            title="Confirmer la validation"
          >
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <ButtonCancel onClick={() => setShowValidateModal(false)}>Annuler</ButtonCancel>
              <ButtonConfirm onClick={confirmValidate}>Confirmer</ButtonConfirm>
            </div>
          </Modal>
          <Modal
            type="warning"
            message="Êtes-vous sûr de vouloir rejeter cette demande de recrutement ? Cette action est irréversible."
            isOpen={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            title="Confirmer le rejet"
          >
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <ButtonCancel onClick={() => setShowRejectModal(false)}>Annuler</ButtonCancel>
              <ButtonConfirm onClick={confirmReject}>Confirmer</ButtonConfirm>
            </div>
          </Modal>
          {editComment && (
            <Modal
              type="info"
              message=""
              isOpen={!!editComment}
              onClose={() => setEditComment(null)}
              title="Modifier le commentaire"
            >
              <EditCommentModal>
                <EditCommentTextarea
                  value={editCommentText}
                  onChange={(e) => setEditCommentText(e.target.value)}
                  placeholder="Modifier votre commentaire..."
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <ButtonCancel onClick={() => setEditComment(null)}>Annuler</ButtonCancel>
                  <ButtonConfirm onClick={handleUpdateCommentSubmit}>Enregistrer</ButtonConfirm>
                </div>
              </EditCommentModal>
            </Modal>
          )}
          {showDeleteConfirmModal && (
            <Modal
              type="warning"
              message="Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible."
              isOpen={!!showDeleteConfirmModal}
              onClose={() => setShowDeleteConfirmModal(null)}
              title="Confirmer la suppression"
            >
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <ButtonCancel onClick={() => setShowDeleteConfirmModal(null)}>Annuler</ButtonCancel>
                <ButtonConfirm
                  onClick={() =>
                    handleDeleteComment(
                      showDeleteConfirmModal.commentId,
                      showDeleteConfirmModal.recruitmentRequestId
                    )
                  }
                >
                  Confirmer
                </ButtonConfirm>
              </div>
            </Modal>
          )}
          {isLoadingData ? (
            <LoadingContainer>Chargement des informations...</LoadingContainer>
          ) : (
            <ContentArea>
              {recruitmentDetails && (
                <ValidatorCard>
                  <ValidatorSection>
                    <SectionTitle>Détails de la Demande de Recrutement</SectionTitle>
                    <InfoGrid
                      style={{
                        marginTop: "var(--spacing-lg)",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "var(--spacing-md)",
                        padding: "var(--spacing-md)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "var(--border-radius)",
                        backgroundColor: "var(--background-light)",
                      }}
                    >
                      <InfoItem>
                        <InfoLabel>ID de la Demande</InfoLabel>
                        <InfoValue>{recruitmentDetails.recruitmentRequest?.recruitmentRequestId || "Non spécifié"}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Titre du Poste</InfoLabel>
                        <InfoValue>{recruitmentDetails.recruitmentRequest?.positionTitle || "Non spécifié"}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Nombre de Postes</InfoLabel>
                        <InfoValue>{recruitmentDetails.recruitmentRequest?.positionCount || "Non spécifié"}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Durée du Contrat</InfoLabel>
                        <InfoValue>{recruitmentDetails.recruitmentRequest?.contractDuration || "Non spécifié"}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Date de Remplacement</InfoLabel>
                        <InfoValue>{formatDate(recruitmentDetails.recruitmentRequest?.replacementDate) || "Non spécifié"}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Date de Début Souhaitée</InfoLabel>
                        <InfoValue>{formatDate(recruitmentDetails.recruitmentRequest?.desiredStartDate) || "Non spécifié"}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Date de Création</InfoLabel>
                        <InfoValue>{formatDate(recruitmentDetails.recruitmentRequest?.createdAt) || "Non spécifié"}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Dernière Mise à Jour</InfoLabel>
                        <InfoValue>{formatDate(recruitmentDetails.recruitmentRequest?.updatedAt) || "Non spécifié"}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Type de Contrat</InfoLabel>
                        <InfoValue>{recruitmentDetails.recruitmentRequest?.contractType?.label || "Non spécifié"}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Site</InfoLabel>
                        <InfoValue>{recruitmentDetails.recruitmentRequest?.site?.siteName || "Non spécifié"}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Direction</InfoLabel>
                        <InfoValue>{recruitmentDetails.direction?.directionName || "Non spécifié"}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Département</InfoLabel>
                        <InfoValue>{recruitmentDetails.department?.departmentName || "Non spécifié"}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Service</InfoLabel>
                        <InfoValue>{recruitmentDetails.service?.serviceName || "Non spécifié"}</InfoValue>
                      </InfoItem>
                      {isReplacement && (
                        <div style={{ gridColumn: "1 / -1", marginTop: "var(--spacing-md)" }}>
                          <InfoLabel>Remplacement d’un employé</InfoLabel>
                          <InfoGrid
                            style={{
                              padding: "var(--spacing-sm)",
                              backgroundColor: "var(--background-white)",
                              borderRadius: "var(--border-radius-sm)",
                              border: "1px solid var(--border-light)",
                              marginTop: "var(--spacing-xs)",
                            }}
                          >
                            <InfoItem>
                              <InfoLabel>Nom de l'Ancien Employé</InfoLabel>
                              <InfoValue>{recruitmentDetails.recruitmentRequest?.formerEmployeeName || "Non spécifié"}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                              <InfoLabel>Motif du Remplacement</InfoLabel>
                              <InfoValue>
                                {recruitmentDetails.recruitmentRequest?.recruitmentRequestReplacementReasons
                                  ?.map((reason) => `${reason.replacementReason?.name || reason.description || "Non spécifié"}`)
                                  .join(", ") || "Non spécifié"}
                              </InfoValue>
                            </InfoItem>
                            <InfoItem>
                              <InfoLabel>Date de Survenance</InfoLabel>
                              <InfoValue>{formatDate(recruitmentDetails.recruitmentRequest?.replacementDate) || "Non spécifié"}</InfoValue>
                            </InfoItem>
                          </InfoGrid>
                        </div>
                      )}
                      {isBudgetedDotation && (
                        <div style={{ gridColumn: "1 / -1", marginTop: "var(--spacing-md)" }}>
                          <InfoLabel>Dotation prévue au budget (à réaliser)</InfoLabel>
                          <InfoValue>À réaliser</InfoValue>
                        </div>
                      )}
                      {isNewPosition && !isBudgetedDotation && (
                        <div style={{ gridColumn: "1 / -1", marginTop: "var(--spacing-md)" }}>
                          <InfoLabel>Création de poste (non-prévue au budget)</InfoLabel>
                          <InfoValue>
                            {recruitmentDetails.recruitmentRequest?.newPositionExplanation || "Aucune explication fournie"}
                          </InfoValue>
                        </div>
                      )}
                      {recruitmentDetails.recruitmentRequest?.newPositionExplanation && (
                        <div style={{ gridColumn: "1 / -1", marginTop: "var(--spacing-md)" }}>
                          <InfoLabel>Explication du Nouveau Poste</InfoLabel>
                          <div
                            style={{
                              padding: "var(--spacing-sm)",
                              backgroundColor: "var(--background-white)",
                              borderRadius: "var(--border-radius-sm)",
                              border: "1px solid var(--border-light)",
                              marginTop: "var(--spacing-xs)",
                            }}
                            dangerouslySetInnerHTML={{ __html: recruitmentDetails.recruitmentRequest?.newPositionExplanation }}
                          />
                        </div>
                      )}
                    </InfoGrid>
                  </ValidatorSection>
                </ValidatorCard>
              )}
              <CommentsDisplaySection>
                <CommentsDisplayTitle>Commentaires</CommentsDisplayTitle>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <CommentEntry key={comment.commentId}>
                      <CommentEntryContent>
                        <Avatar size="36px">{getInitials(comment.creator?.name || "John Doe")}</Avatar>
                        <CommentEntryText>{comment.content}</CommentEntryText>
                        {comment.creator.userId === currentUserId && (
                          <MoreOptionsButton onClick={() => toggleCommentMenu(comment.commentId)} aria-label="Plus d'options">
                            <MoreVertical size={20} />
                          </MoreOptionsButton>
                        )}
                      </CommentEntryContent>
                      {showCommentMenu === comment.commentId && comment.creator.userId === currentUserId && (
                        <DropdownMenu>
                          <DropdownItem onClick={() => handleEditComment(comment)}>Modifier</DropdownItem>
                          <DropdownItem onClick={() => confirmDeleteComment(comment.commentId, comment.recruitmentRequestId)}>
                            Supprimer
                          </DropdownItem>
                        </DropdownMenu>
                      )}
                      <CommentEntryDate>
                        Commenté par {comment.creator?.name || "Non spécifié"} le{" "}
                        {new Date(comment.createdAt).toLocaleString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CommentEntryDate>
                    </CommentEntry>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "var(--spacing-md)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Aucun commentaire disponible
                  </div>
                )}
              </CommentsDisplaySection>
              {!validationSteps.length && !isLoadingData && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "var(--spacing-md)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Aucune validation de recrutement disponible
                </div>
              )}
              {!recruitmentDetails && !isLoadingData && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "var(--spacing-md)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Aucun détail de demande de recrutement disponible
                </div>
              )}
              {currentStepData && currentStepData.status === "in-progress" && (
                <InfoAlert>
                  <span style={{ fontSize: "1.2rem" }}>🔄</span>
                  <AlertText>Validation en cours d'examen...</AlertText>
                </InfoAlert>
              )}
              <CommentSection>
                <CommentLabel>Commentaire</CommentLabel>
                <CommentTextarea
                  value={comment}
                  onChange={handleCommentChange}
                  placeholder="Ajoutez un commentaire sur cette demande de recrutement..."
                />
                <CommentButtonSection>
                  <CommentButton onClick={handleCommentSubmit}>
                    Commenté
                  </CommentButton>
                </CommentButtonSection>
              </CommentSection>
              <SignatureUploadSection>
                <CommentLabel>Signature</CommentLabel>
                <FileInputWrapper>
                  <FileInput
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
                  <FileInputLabel className={signature ? 'has-file' : ''}>
                    {signature ? 'Signature ajoutée' : 'Cliquer pour ajouter la signature'}
                  </FileInputLabel>
                </FileInputWrapper>
                {signature && (
                  <SignaturePreview>
                    <img src={signature.preview} alt="Signature" />
                  </SignaturePreview>
                )}
              </SignatureUploadSection>
              <ActionSection>
                <ActionHeader>Actions et Validation</ActionHeader>
                <ActionButtons>
                  <ActionButton
                    className="validate"
                    onClick={() => handleAction('validate')}
                    disabled={isValidated || isRejected}
                  >
                    <CheckCircle size="16" />
                    Valider
                  </ActionButton>
                  <ActionButton
                    className="reject"
                    onClick={() => handleAction('reject')}
                    disabled={isValidated || isRejected}
                  >
                    <XCircle size="16" />
                    Rejeter
                  </ActionButton>
                </ActionButtons>
              </ActionSection>
            </ContentArea>
          )}
        </PopupContent>
      </PopupContainer>
    </PopupOverlay>
  );
};

export default RecruitmentModals;