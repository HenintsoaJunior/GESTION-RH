/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, X, Send, Edit2, Trash2 } from "lucide-react";
import Alert from "@/components/alert";
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
    SectionTitle,
    InfoGrid,
    InfoItem,
    InfoLabel,
    InfoValue,
    StatusBadge,
    InfoAlert,
    ActionSection,
    Avatar,
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

import { type FormattedMission } from "@/api/mission/validation/services";
import { getInitials } from "@/utils/initials";
// Types from previous context
interface AlertState {
  isOpen: boolean;
  type: "success" | "error" | "warning" | "info" | undefined;
  message: string;
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
  handleUpdateComments: (missionId: string, comments: string) => void;
  comments: Comment[];
  handleCreateComment: (missionId: string, commentText: string) => Promise<void>;
  handleUpdateComment: (commentId: string, missionId: string, commentText: string) => Promise<void>;
  handleDeleteComment: (commentId: string, missionId: string) => Promise<void>;
}

const MissionModals: React.FC<MissionModalsProps> = ({
  alert,
  setAlert,
  showDetailsMission,
  setShowDetailsMission,
  selectedMissionId,
  missions,
  formatDate,
  handleUpdateComments,
  comments,
  handleCreateComment,
  handleUpdateComment,
  handleDeleteComment,
}) => {
  const [comment, setComment] = useState<string>("");
  const [originalComment, setOriginalComment] = useState<string>("");
  const [commentSaved, setCommentSaved] = useState<boolean>(false);
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
      setEditingCommentId(null);
      setEditCommentText("");
    }
  }, [selectedMission]);

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

  if (!showDetailsMission || !selectedMission) return null;

  return (
    <PopupOverlay role="dialog" aria-labelledby="mission-details-title" aria-modal="true">
      <PagePopup onClick={(e: React.MouseEvent) => e.stopPropagation()} style={{ maxWidth: "800px", padding: "0" }}>
        <PopupHeader style={{ padding: "20px 30px", borderBottom: "1px solid var(--border-light)" }}>
          <PopupTitle id="mission-details-title" style={{ fontSize: "1.4rem" }}>
            Détails de l'Ordre de Mission N° {selectedMission.missionAssignationId || "N/A"}
          </PopupTitle>
          <PopupClose onClick={handleCloseModal} aria-label="Fermer la fenêtre" title="Fermer la fenêtre">
            <X size={24} />
          </PopupClose>
        </PopupHeader>

        <PopupContent style={{ padding: "30px", background: "var(--bg-primary)" }}>
          <Alert
            type={alert.type}
            message={alert.message}
            isOpen={alert.isOpen}
            onClose={() => setAlert({ ...alert, isOpen: false })}
          />

          <SectionTitle>Référence de la Mission</SectionTitle>
          
          <InfoGrid>
            <InfoItem><InfoLabel>N°</InfoLabel><InfoValue>{selectedMission.missionAssignationId || "N/A"}</InfoValue></InfoItem>
            <InfoItem>
              <InfoLabel>Statut Validation</InfoLabel>
              <StatusBadge className={statusClass}>
                {translateStatus(selectedMission.status).toUpperCase()}
              </StatusBadge>
            </InfoItem>
            <InfoItem><InfoLabel>Demandé le</InfoLabel><InfoValue>{formatDate(selectedMission.requestDate)}</InfoValue></InfoItem>
          </InfoGrid>

          <SectionTitle>Détails du Missionnaire</SectionTitle>
          <InfoGrid>
            <InfoItem><InfoLabel>Missionnaire</InfoLabel><InfoValue>{selectedMission.employeeName}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Fonction</InfoLabel><InfoValue>{selectedMission.employeeFunction || "Non spécifiée"}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Matricule</InfoLabel><InfoValue>{selectedMission.matricule || "N/A"}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Direction</InfoLabel><InfoValue>{selectedMission.direction || "Non spécifié"}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Département</InfoLabel><InfoValue>{selectedMission.department || "Non spécifié"}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Service</InfoLabel><InfoValue>{selectedMission.service || "Non spécifié"}</InfoValue></InfoItem>
          </InfoGrid>

          <SectionTitle>Détails de la Mission</SectionTitle>
         
          <InfoGrid>
            <InfoItem><InfoLabel>Mission</InfoLabel><InfoValue>{selectedMission.missionName || "Non spécifié"}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Zone</InfoLabel><InfoValue>{selectedMission.missionType || "Non spécifié"}</InfoValue></InfoItem>

            <InfoItem><InfoLabel>Lieu</InfoLabel><InfoValue>{selectedMission.location}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Transport</InfoLabel><InfoValue>{selectedMission.transport || "Non spécifié"}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Date de début</InfoLabel><InfoValue>{formatDate(selectedMission.requestDate)}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Date et Heure de départ</InfoLabel><InfoValue>{formatDate(selectedMission.departureDate)} {selectedMission.departureTime ? `à ${selectedMission.departureTime}` : ''}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Date de fin</InfoLabel><InfoValue>{formatDate(selectedMission.dueDate)}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Date et Heure de retour</InfoLabel><InfoValue>{formatDate(selectedMission.returnDate)} {selectedMission.returnTime ? `à ${selectedMission.returnTime}` : ''}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Durée</InfoLabel><InfoValue>{selectedMission.estimatedDuration || "Non spécifiée"} J</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Type d'assignation</InfoLabel><InfoValue>{selectedMission.assignationType || "Non spécifié"}</InfoValue></InfoItem>
            <InfoItem style={{ gridColumn: "span 3" }}><InfoLabel>Description</InfoLabel><InfoValue>{selectedMission.description || "Aucune description"}</InfoValue></InfoItem>
            
          </InfoGrid>

          <SectionTitle>Commentaires</SectionTitle>
          <CommentsList>
            {comments.length === 0 ? (
              <CommentText>Aucun commentaire pour cette mission.</CommentText>
            ) : (
              comments.map((commentItem) => {
                const creatorName = commentItem.creator?.name || 'Inconnu';
                const initials = getInitials(creatorName);
                const formattedDate = formatDate(commentItem.createdAt) || 'Inconnu';
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
                            Par {creatorName} le {formattedDate}:
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

          {!isPending && (
            <InfoAlert>
              <CheckCircle size={20} />
              Cette mission a déjà été <strong>{translateStatus(selectedMission.status).toLowerCase()}</strong> le{" "}
              {formatDate(selectedMission.validationDate) || "date non spécifiée"}. Aucune action supplémentaire n'est requise.
            </InfoAlert>
          )}
        </PopupContent>

        {isPending && (
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
          </ActionSection>
        )}

        <PopupActions style={{ padding: "20px 30px" }}>
          <ButtonPrimary onClick={handleCloseModal}>Fermer</ButtonPrimary>
        </PopupActions>
      </PagePopup>
    </PopupOverlay>
  );
};

export default MissionModals;