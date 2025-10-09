"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, FileText, X, Send, Edit2, Trash2 } from "lucide-react";
import Alert from "components/alert";
import Modal from "components/modal";
import {
    PopupOverlay,
    PagePopup,
    PopupHeader,
    PopupTitle,
    CloseButton,
    PopupContent,
    DetailSection,
    SectionTitle,
    InfoGrid,
    InfoItem,
    InfoLabel,
    InfoValue,
    StatusBadge,
    InfoAlert,
    ActionSection,
    ActionButtons,
    ActionButton,
    SignatureUploadSection,
    FileInputWrapper,
    FileInput,
    FileInputLabel,
    SignaturePreview,
    Separator,
    SuccessMessage,
    PopupActions,
    ButtonPrimary,
    ButtonSecondary,
    Avatar,
} from "styles/generaliser/details-mission-container";
import {
    CommentSection,
    CommentInputGroup,
    CommentButton,
    CommentLabel,
    CommentTextarea,
    CommentText,
    CommentsList,
    CommentItem,
    CommentContent,
    CommentMeta,
    CommentActions,
    CommentActionButton,
} from "styles/generaliser/comments-container";

const MissionModals = ({
  alert,
  setAlert,
  showDetailsMission,
  setShowDetailsMission,
  selectedMissionId,
  missions,
  formatDate,
  handleValidate,
  handleUpdateComments,
  handleUpdateSignature,
  comments,
  handleCreateComment,
  handleUpdateComment,
  handleDeleteComment,
}) => {
  const [comment, setComment] = useState("");
  const [originalComment, setOriginalComment] = useState("");
  const [signature, setSignature] = useState(null);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [commentSaved, setCommentSaved] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  const [actionType, setActionType] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const selectedMission = missions.find((mission) => mission.id === selectedMissionId);
  const userId = JSON.parse(localStorage.getItem("user"))?.userId || null;

  const translateStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "En attente";
      case "approved":
        return "Validée";
      case "rejected":
        return "Rejetée";
      default:
        return status || "Inconnu";
    }
  };

  useEffect(() => {
    if (selectedMission) {
      setComment(selectedMission.comments || "");
      setOriginalComment(selectedMission.comments || "");
      setCommentSaved(false);
      setActionCompleted(false);
      setActionType("");
      setEditingCommentId(null);
      setEditCommentText("");

      if (selectedMission.signature) {
        setSignature({ file: null, preview: selectedMission.signature });
      } else {
        setSignature(null);
      }
    }
  }, [selectedMission]);

  const handleFileUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const signatureBase64 = e.target.result;
        setSignature({ file, preview: signatureBase64 });
        handleUpdateSignature(selectedMissionId, signatureBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = (action) => {
    if (comment.trim() && comment !== originalComment && !commentSaved) {
      handleSaveComment();
    }
    if (action === "validate") {
      setShowValidateModal(true);
    } else if (action === "reject") {
      setShowRejectModal(true);
    }
  };

  const handleSaveComment = async () => {
    if (!comment.trim()) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Le commentaire ne peut pas être vide.",
      });
      return;
    }
    try {
      await handleCreateComment(selectedMission.missionId, comment);
      handleUpdateComments(selectedMissionId, comment);
      setOriginalComment(comment);
      setCommentSaved(true);
      setTimeout(() => setCommentSaved(false), 3000);
      setComment("");
    } catch (error) {
      // Error handling is already done in handleCreateComment
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditCommentText(currentText);
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editCommentText.trim()) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Le commentaire ne peut pas être vide.",
      });
      return;
    }
    try {
      await handleUpdateComment(commentId, selectedMission.missionId, editCommentText);
      setEditingCommentId(null);
      setEditCommentText("");
    } catch (error) {
      // Error handling is already done in handleUpdateComment
    }
  };

  const handleDeleteCommentAction = async (commentId) => {
    try {
      await handleDeleteComment(commentId, selectedMission.missionId);
    } catch (error) {
      // Error handling is already done in handleDeleteComment
    }
  };

  const confirmValidate = () => {
    handleValidate(selectedMissionId, "validate", comment, signature ? signature.preview : "");
    setShowValidateModal(false);
    setActionType("validate");
    setActionCompleted(true);
  };

  const confirmReject = () => {
    handleValidate(selectedMissionId, "reject", comment, "");
    setSignature(null);
    handleUpdateSignature(selectedMissionId, "");
    setShowRejectModal(false);
    setActionType("reject");
    setActionCompleted(true);
  };

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);
    setCommentSaved(false);
  };

  const handleEditCommentChange = (e) => {
    setEditCommentText(e.target.value);
  };

  const handleCloseModal = () => {
    setShowDetailsMission(false);
  };

  const statusClass = selectedMission?.status.toLowerCase() || "pending";
  const isPending = selectedMission?.status === "pending";
  const isCommentChanged = comment !== originalComment;

  const getSuccessMessage = () => {
    if (actionType === "validate") {
      return {
        title: "Mission validée avec succès !",
        message: "La mission a été validée et le demandeur sera notifié. Veuillez fermer cette fenêtre.",
      };
    } else if (actionType === "reject") {
      return {
        title: "Mission rejetée",
        message: "La mission a été rejetée et le demandeur sera notifié. Veuillez fermer cette fenêtre.",
      };
    }
    return {
      title: "Action effectuée avec succès !",
      message: "L'opération a été réalisée avec succès. Veuillez fermer cette fenêtre.",
    };
  };

  if (!showDetailsMission || !selectedMission) return null;

  return (
    <PopupOverlay role="dialog" aria-labelledby="mission-details-title" aria-modal="true">
      <PagePopup onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", padding: "0" }}>
        <PopupHeader style={{ padding: "20px 30px", borderBottom: "1px solid var(--border-light)" }}>
          <PopupTitle id="mission-details-title" style={{ fontSize: "1.6rem" }}>
            <FileText size={24} style={{ marginRight: "10px", verticalAlign: "middle" }} />
            {actionCompleted
              ? `Résultat : ${getSuccessMessage().title}`
              : `Validation d'Ordre de Mission N° ${selectedMission.reference || "N/A"}`}
          </PopupTitle>
          <CloseButton onClick={handleCloseModal} aria-label="Fermer la fenêtre" title="Fermer la fenêtre">
            <X size={24} />
          </CloseButton>
        </PopupHeader>

        <PopupContent style={{ padding: "30px", background: "var(--bg-secondary)", borderBottom: isPending && !actionCompleted ? "none" : "1px solid var(--border-light)" }}>
          <Alert
            type={alert.type}
            message={alert.message}
            isOpen={alert.isOpen}
            onClose={() => setAlert({ ...alert, isOpen: false })}
          />

          {actionCompleted ? (
            <SuccessMessage>
              <CheckCircle size={48} color="var(--success-color, #28a745)" style={{ marginBottom: "var(--spacing-md)" }} />
              <h3>{getSuccessMessage().title}</h3>
              <p>{getSuccessMessage().message}</p>
            </SuccessMessage>
          ) : (
            <>
              <DetailSection>
                <SectionTitle>Référence de la Mission</SectionTitle>
                <InfoGrid>
                  <InfoItem><InfoLabel>N° de Mission</InfoLabel><InfoValue>{selectedMission.reference || "N/A"}</InfoValue></InfoItem>
                  <InfoItem>
                    <InfoLabel>Statut Actuel</InfoLabel>
                    <StatusBadge className={statusClass}>
                      {translateStatus(selectedMission.status).toUpperCase()}
                    </StatusBadge>
                  </InfoItem>
                  <InfoItem><InfoLabel>Demandé le</InfoLabel><InfoValue>{formatDate(selectedMission.requestDate)}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Valideur</InfoLabel><InfoValue>{selectedMission.toWhom}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Date de validation</InfoLabel><InfoValue>{formatDate(selectedMission.validationDate) || "Non spécifiée"}</InfoValue></InfoItem>
                </InfoGrid>

                <SectionTitle>Détails du Collaborateur</SectionTitle>
                <InfoGrid>
                  <InfoItem><InfoLabel>Collaborateur</InfoLabel><InfoValue>{selectedMission.requestedBy}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Fonction</InfoLabel><InfoValue>{selectedMission.function || "Non spécifiée"}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Matricule</InfoLabel><InfoValue>{selectedMission.matricule || "N/A"}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Direction</InfoLabel><InfoValue>{selectedMission.department}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Email</InfoLabel><InfoValue>{selectedMission.email || "Non spécifié"}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Supérieur</InfoLabel><InfoValue>{selectedMission.superiorName || "Non spécifié"}</InfoValue></InfoItem>
                </InfoGrid>

                <SectionTitle>Détails de la Mission</SectionTitle>
                
                <InfoGrid>
                  <InfoItem><InfoLabel>Motif</InfoLabel><InfoValue>{selectedMission.description}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Type de mission</InfoLabel><InfoValue>{selectedMission.missionType || "Non spécifié"}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Statut de la mission</InfoLabel><InfoValue>{selectedMission.missionStatus || "Non spécifié"}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Lieu</InfoLabel><InfoValue>{selectedMission.location}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Transport</InfoLabel><InfoValue>{selectedMission.transport || "Non spécifié"}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Date de début</InfoLabel><InfoValue>{formatDate(selectedMission.requestDate)}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Date de fin</InfoLabel><InfoValue>{formatDate(selectedMission.dueDate)}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Date de départ</InfoLabel><InfoValue>{formatDate(selectedMission.departureDate)}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Heure de départ</InfoLabel><InfoValue>{selectedMission.departureTime || "Non spécifié"}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Date de retour</InfoLabel><InfoValue>{formatDate(selectedMission.returnDate)}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Heure de retour</InfoLabel><InfoValue>{selectedMission.returnTime || "Non spécifié"}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Durée</InfoLabel><InfoValue>{selectedMission.estimatedDuration || "Non spécifiée"}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Fonds alloués</InfoLabel><InfoValue>{selectedMission.allocatedFund || 0} MGA</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Type d'assignation</InfoLabel><InfoValue>{selectedMission.assignationType || "Non spécifié"}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>ID de l'employé</InfoLabel><InfoValue>{selectedMission.employeeId || "Non spécifié"}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>ID de la mission</InfoLabel><InfoValue>{selectedMission.missionId || "Non spécifié"}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>ID de l'assignation</InfoLabel><InfoValue>{selectedMission.missionAssignationId || "Non spécifié"}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Créée le</InfoLabel><InfoValue>{formatDate(selectedMission.createdAt)}</InfoValue></InfoItem>
                  <InfoItem><InfoLabel>Modifiée le</InfoLabel><InfoValue>{formatDate(selectedMission.updatedAt) || "Non spécifiée"}</InfoValue></InfoItem>
                </InfoGrid>

                <SectionTitle>Commentaires</SectionTitle>
                <CommentsList>
                  {comments.length === 0 ? (
                    <CommentText>Aucun commentaire pour cette mission.</CommentText>
                  ) : (
                    comments.map((commentItem) => {
                      const initials = commentItem.creator.name 
                          ? commentItem.creator.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() 
                          : 'NA';
                      return (
                        <CommentItem key={commentItem.commentId}>
                          <Avatar size="32px">{initials}</Avatar>
                          <CommentContent>
                            {editingCommentId === commentItem.commentId ? (
                              <>
                                <CommentTextarea
                                  value={editCommentText}
                                  onChange={handleEditCommentChange}
                                  placeholder="Modifiez votre commentaire..."
                                />
                                <CommentActions>
                                  <CommentButton
                                    onClick={() => handleSaveEditComment(commentItem.commentId)}
                                    disabled={!editCommentText.trim()}
                                  >
                                    <CheckCircle size={14} /> Enregistrer
                                  </CommentButton>
                                  <CommentButton
                                    onClick={() => setEditingCommentId(null)}
                                  >
                                    <X size={14} /> Annuler
                                  </CommentButton>
                                </CommentActions>
                              </>
                            ) : (
                              <>
                                <CommentText>{commentItem.content}</CommentText>
                                <CommentMeta>
                                  Par {commentItem.creator.name}  le{" "}
                                  {formatDate(commentItem.createdAt)}:
                                </CommentMeta>
                              </>
                            )}
                          </CommentContent>
                          {editingCommentId !== commentItem.commentId && commentItem.creator.userId === userId && (
                            <CommentActions>
                              <CommentActionButton
                                onClick={() => handleEditComment(commentItem.commentId, commentItem.content)}
                                title="Modifier le commentaire"
                              >
                                <Edit2 size={16} />
                              </CommentActionButton>
                              <CommentActionButton
                                className="delete"
                                onClick={() => handleDeleteCommentAction(commentItem.commentId)}
                                title="Supprimer le commentaire"
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
              </DetailSection>

              {!isPending && (
                <InfoAlert>
                  <CheckCircle size={20} />
                  Cette mission a déjà été <strong>{translateStatus(selectedMission.status).toLowerCase()}</strong> le{" "}
                  {formatDate(selectedMission.validationDate) || "date non spécifiée"}. Aucune action supplémentaire n'est requise.
                </InfoAlert>
              )}
            </>
          )}
        </PopupContent>

        {isPending && !actionCompleted && (
          <ActionSection>
            <CommentSection>
              <CommentLabel htmlFor="validation-comment">Nouveau Commentaire</CommentLabel>
              <CommentInputGroup>
                <CommentTextarea
                  id="validation-comment"
                  value={comment}
                  onChange={handleCommentChange}
                  placeholder="Ajoutez un commentaire pour le demandeur ou les prochains validateurs..."
                />
              </CommentInputGroup>
              <CommentActions>
                <CommentButton
                  onClick={handleSaveComment}
                  disabled={!isCommentChanged || !comment.trim()}
                  title={isCommentChanged && comment.trim() ? "Enregistrer ce commentaire" : "Aucune modification à enregistrer"}
                >
                  {commentSaved ? (
                    <>
                      <CheckCircle size={14} /> Enregistré !
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Enregistrer Commentaire
                    </>
                  )}
                </CommentButton>
              </CommentActions>
            </CommentSection>

            <SignatureUploadSection>
              <CommentLabel>Signature Électronique de {selectedMission.toWhom} (Si Requis)</CommentLabel>
              <FileInputWrapper>
                <FileInput
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  aria-label="Télécharger le fichier de signature"
                />
                <FileInputLabel className={signature ? "has-file" : ""}>
                  {signature
                    ? `Signature de ${selectedMission.toWhom} chargée : ${signature.file?.name || "Aperçu disponible"}`
                    : `Cliquer pour télécharger votre signature (format image) ou laisser vide`}
                </FileInputLabel>
              </FileInputWrapper>
              {signature && signature.preview && (
                <SignaturePreview>
                  <InfoLabel>Aperçu de la signature :</InfoLabel>
                  <img src={signature.preview} alt={`Signature ${selectedMission.toWhom}`} />
                </SignaturePreview>
              )}
            </SignatureUploadSection>

            <Separator />

            <ActionButtons>
              <ActionButton
                className="validate"
                onClick={() => handleAction("validate")}
                disabled={!isPending}
              >
                <CheckCircle size={16} />
                Valider la Mission
              </ActionButton>
              <ActionButton
                className="reject"
                onClick={() => handleAction("reject")}
                disabled={!isPending}
              >
                <XCircle size={16} />
                Rejeter la Mission
              </ActionButton>
            </ActionButtons>
          </ActionSection>
        )}

        {(!isPending || actionCompleted) && (
          <PopupActions style={{ padding: "20px 30px" }}>
            <ButtonPrimary onClick={handleCloseModal}>Fermer</ButtonPrimary>
          </PopupActions>
        )}

        <Modal
          type="success"
          message="Êtes-vous sûr de vouloir valider cette mission ? Cette action est irréversible et passera la mission au statut 'Validée'."
          isOpen={showValidateModal}
          onClose={() => setShowValidateModal(false)}
          title="Confirmer la validation"
        >
          <PopupActions>
            <ButtonSecondary onClick={() => setShowValidateModal(false)}>Annuler</ButtonSecondary>
            <ButtonPrimary onClick={confirmValidate}>Confirmer la Validation</ButtonPrimary>
          </PopupActions>
        </Modal>

        <Modal
          type="error"
          message="Êtes-vous sûr de vouloir rejeter cette mission ? Cette action est irréversible et passera la mission au statut 'Rejetée'."
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Confirmer le rejet"
        >
          <PopupActions>
            <ButtonSecondary onClick={() => setShowRejectModal(false)}>Annuler</ButtonSecondary>
            <ButtonPrimary className="reject" onClick={confirmReject}>Confirmer le Rejet</ButtonPrimary>
          </PopupActions>
        </Modal>
      </PagePopup>
    </PopupOverlay>
  );
};

export default MissionModals;