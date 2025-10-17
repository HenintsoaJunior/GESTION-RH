"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, FileText, X, Send, Edit2, Trash2 } from "lucide-react";
import Alert from "@/components/alert";
import Modal from "@/components/modal";
import {
    PopupOverlay,
    PagePopup,
    PopupHeader,
    PopupTitle,
    PopupContent,
    ButtonPrimary,
    PopupClose,
    PopupActions
} from "@/styles/popup-styles";
import {
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
    Avatar,
    RejectButton,
} from "@/styles/detailsmission-styles";
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
} from "@/styles/comment-styles";

// Types from previous context
interface AlertState {
  isOpen: boolean;
  type: "success" | "error" | "warning" | "info" | undefined;
  message: string;
}

interface FormattedMission {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  department: string;
  status: string;
  requestDate: string;
  dueDate: string;
  estimatedDuration: string;
  location: string;
  comments: string;
  signature: string;
  matricule: string;
  function: string;
  transport: string;
  departureTime: string;
  departureDate: string;
  returnDate: string;
  returnTime: string;
  reference: string;
  toWhom: string;
  validationDate: string | null;
  missionCreator: string;
  superiorName: string;
  email: string;
  createdAt: string;
  updatedAt: string | null;
  missionAssignationId: string;
  missionType: string;
  missionStatus: string;
  allocatedFund: number;
  type: string;
  assignationType: string;
  employeeId: string;
  missionId: string;
}

interface Comment {
  commentId: string;
  content?: string;
  creator?: {
    name?: string;
    userId?: string;
  };
  createdAt?: string;
}

interface MissionModalsProps {
  alert: AlertState;
  setAlert: (alert: AlertState) => void;
  showDetailsMission: boolean;
  setShowDetailsMission: (show: boolean) => void;
  selectedMissionId: string | null;
  missions: FormattedMission[];
  formatDate: (dateString?: string | null) => string;
  handleValidate: (missionId: string, action: string, comment: string, signature: string) => Promise<void>;
  handleUpdateComments: (missionId: string, comments: string) => void;
  handleUpdateSignature: (missionId: string, signature: string) => void;
  comments: Comment[];
  handleCreateComment: (missionId: string, commentText: string) => Promise<void>;
  handleUpdateComment: (commentId: string, missionId: string, commentText: string) => Promise<void>;
  handleDeleteComment: (commentId: string, missionId: string) => Promise<void>;
}

interface SignatureFile {
  file: File | null;
  preview: string | null;
}

const MissionModals: React.FC<MissionModalsProps> = ({
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
  const [comment, setComment] = useState<string>("");
  const [originalComment, setOriginalComment] = useState<string>("");
  const [signature, setSignature] = useState<SignatureFile | null>(null);
  const [showValidateModal, setShowValidateModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [commentSaved, setCommentSaved] = useState<boolean>(false);
  const [actionCompleted, setActionCompleted] = useState<boolean>(false);
  const [actionType, setActionType] = useState<string>("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState<string>("");

  const selectedMission = missions.find((mission) => mission.id === selectedMissionId);
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.userId || "";

  const translateStatus = (status: string | undefined): string => {
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

  const handleFileUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const signatureBase64 = e.target?.result as string;
        setSignature({ file, preview: signatureBase64 });
        handleUpdateSignature(selectedMissionId!, signatureBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = (action: string) => {
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
      await handleCreateComment(selectedMission!.missionId, comment);
      handleUpdateComments(selectedMissionId!, comment);
      setOriginalComment(comment);
      setCommentSaved(true);
      setTimeout(() => setCommentSaved(false), 3000);
      setComment("");
    } catch (error) {
      // Error handling is already done in handleCreateComment
    }
  };

  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditCommentText(currentText);
  };

  const handleSaveEditComment = async (commentId: string) => {
    if (!editCommentText.trim()) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Le commentaire ne peut pas être vide.",
      });
      return;
    }
    try {
      await handleUpdateComment(commentId, selectedMission!.missionId, editCommentText);
      setEditingCommentId(null);
      setEditCommentText("");
    } catch (error) {
      // Error handling is already done in handleUpdateComment
    }
  };

  const handleDeleteCommentAction = async (commentId: string) => {
    try {
      await handleDeleteComment(commentId, selectedMission!.missionId);
    } catch (error) {
      // Error handling is already done in handleDeleteComment
    }
  };

  const confirmValidate = () => {
    handleValidate(selectedMissionId!, "validate", comment, signature ? signature.preview || "" : "");
    setActionType("validate");
    setActionCompleted(true);
  };

  const confirmReject = () => {
    handleValidate(selectedMissionId!, "reject", comment, "");
    setSignature(null);
    handleUpdateSignature(selectedMissionId!, "");
    setActionType("reject");
    setActionCompleted(true);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComment = e.target.value;
    setComment(newComment);
    setCommentSaved(false);
  };

  const handleEditCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      <PagePopup onClick={(e: React.MouseEvent) => e.stopPropagation()} style={{ maxWidth: "800px", padding: "0" }}>
        <PopupHeader style={{ padding: "20px 30px", borderBottom: "1px solid var(--border-light)" }}>
          <PopupTitle id="mission-details-title" style={{ fontSize: "1.6rem" }}>
            <FileText size={24} style={{ marginRight: "10px", verticalAlign: "middle" }} />
            {actionCompleted
              ? `Résultat : ${getSuccessMessage().title}`
              : `Validation d'Ordre de Mission N° ${selectedMission.reference || "N/A"}`}
          </PopupTitle>
          <PopupClose onClick={handleCloseModal} aria-label="Fermer la fenêtre" title="Fermer la fenêtre">
            <X size={24} />
          </PopupClose>
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
                      const initials = commentItem.creator?.name 
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
                                <CommentText>{commentItem.content || ''}</CommentText>
                                <CommentMeta>
                                  Par {commentItem.creator?.name || 'Inconnu'}  le{" "}
                                  {formatDate(commentItem.createdAt) || 'Inconnu'}:
                                </CommentMeta>
                              </>
                            )}
                          </CommentContent>
                          {editingCommentId !== commentItem.commentId && commentItem.creator?.userId === userId && (
                            <CommentActions>
                              <CommentActionButton
                                onClick={() => handleEditComment(commentItem.commentId, commentItem.content || '')}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e.target.files?.[0] || null)}
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
              <RejectButton
                className="reject"
                onClick={() => handleAction("reject")}
                disabled={!isPending}
              >
                <XCircle size={16} />
                Rejeter la Mission
              </RejectButton>
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
          confirmAction={confirmValidate}
          confirmLabel="Confirmer la Validation"
          cancelLabel="Annuler"
          showActions={true}
        />

        <Modal
          type="error"
          message="Êtes-vous sûr de vouloir rejeter cette mission ? Cette action est irréversible et passera la mission au statut 'Rejetée'."
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Confirmer le rejet"
          confirmAction={confirmReject}
          confirmLabel="Confirmer le Rejet"
          cancelLabel="Annuler"
          showActions={true}
        />
      </PagePopup>
    </PopupOverlay>
  );
};

export default MissionModals;