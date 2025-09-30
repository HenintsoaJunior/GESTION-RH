"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, FileText, Download, ArrowLeft, CheckCircle, Send, Edit2, Trash2, User, Calendar, Clock, MapPin, Building, CreditCard } from "lucide-react";
import ValidationStepper from "../list/components/validation-stepper";
import Pagination from "components/pagination";
import Alert from "components/alert";
import OMPayment from "./payment/om-payment";
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
    ActionButtonPDF,
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
import { formatValidatorData } from "services/mission/validation";
import {
    fetchAssignMission,
    fetchMissionById,
    exportMissionAssignationPDF,
    exportMissionAssignationExcel,
    fetchMissionPayment,
} from "services/mission/mission";
import { useGetMissionValidationsByAssignationId } from "services/mission/validation";
import { CreateComment, GetCommentsByMission, UpdateComment, DeleteComment } from "services/mission/comments";
import { formatDate } from "utils/dateConverter";
import styled from "styled-components";
import "styles/mission/assignment-details-styles.css";
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
} from "styles/generaliser/comments-container";

const OMPaymentButton = styled(ActionButton)`
    background-color: var(--success-color, #28a745);
    border-color: var(--success-color, #28a745);

    &:hover {
        background-color: #ffffff;
        color: var(--success-color, #28a745);
        border-color: var(--success-color, #28a745);
    }
`;

const ButtonOMPDF = styled(ActionButton)`
    background-color: var(--pdf-color);
    border-color: var(--pdf-color);
    margin-left: var(--spacing-sm, 10px);

    &:hover {
        background-color: var(--pdf-hover);
        color: #ffffff;
        border-color: var(--pdf-hover);
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    align-items: center;
    gap: var(--spacing-sm, 10px);
    margin-top: var(--spacing-sm, 10px);
`;

const DetailsMission = ({ missionId, onClose, isOpen = true }) => {

    const navigate = useNavigate();
    const getMissionValidations = useGetMissionValidationsByAssignationId();
    const createComment = CreateComment();
    const getCommentsByMission = GetCommentsByMission();
    const updateComment = UpdateComment();
    const deleteComment = DeleteComment();

    const [isLoading, setIsLoading] = useState({
        assignMissions: false,
        mission: false,
        exportPDF: false,
        exportExcel: false,
        validations: false,
        comments: false,
        missionPayment: false,
    });
    const [error, setError] = useState({ isOpen: false, type: "", message: "" });
    const [assignedPersons, setAssignedPersons] = useState([]);
    const [missionDetails, setMissionDetails] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalEntries, setTotalEntries] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [validationSteps, setValidationSteps] = useState([]);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState("");
    const [missionPayment, setMissionPayment] = useState({
        dailyPaiements: [],
        assignmentDetails: null,
        totalAmount: 0,
    });
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const userId = JSON.parse(localStorage.getItem("user"))?.userId || null;

    // Check if mission is fully validated
    const isMissionFullyValidated = validationSteps.every(step => {
        return step.status === "approved";
    });

    const handleError = (error) => {
        setError({
            isOpen: true,
            type: "error",
            message: error.message || "Erreur inconnue lors du chargement des données",
        });
    };

    const getDetailIcon = (label) => {
        switch (label) {
            case "Bénéficiaire":
            case "Matricule":
            case "Fonction":
                return <User className="detail-icon" />;
            case "Date de départ":
            case "Date de retour":
            case "Date debut mission":
                return <Calendar className="detail-icon" />;
            case "Heure de départ":
            case "Heure de retour":
            case "Durée de la mission":
                return <Clock className="detail-icon" />;
            case "Site":
                return <MapPin className="detail-icon" />;
            case "Direction":
            case "Département/Service":
                return <Building className="detail-icon" />;
            case "Centre de coût":
                return <CreditCard className="detail-icon" />;
            default:
                return null;
        }
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
                : status === "Validé"
                ? "status-approved"
                : "status-pending";
        return <span className={`status-badge ${statusClass}`}>{status || "Inconnu"}</span>;
    };

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
            const validationType = validation.type || "Directeur de tutelle";
            console.log("VALIDATION TEST VALUE", validation.validationDate);
            const stepInfo = stepMapping[validationType] || {
                title: validationType === "DRH" ? "Validation RH" : "Validation Supérieur",
                subtitle: validationType === "DRH" ? "Ressources Humaines" : "Hiérarchique",
                order: validationType === "DRH" ? 2 : 1,
            };

            let status = validation.status;

            const mappedStep = {
                id: validation.missionValidationId,
                title: validation.validator.title || stepInfo.title,
                subtitle: validation.validator.subtitle || stepInfo.subtitle,
                status: status,
                hasIndicator: true,
                validator: {
                    name: validation.validator?.name || "Non spécifié",
                    initials: validation.validator?.initials || "NA",
                    email: validation.validator?.email || "Non spécifié",
                    department: validation.validator?.department || "Non spécifié",
                    position: validation.validator?.position || stepInfo.title,
                },
                validatedAt: validation.createdAt,
                validationDate: validation.validationDate,
                comment: validation.comment || ".",
                order: stepInfo.order,
            };

            return mappedStep;
        }).sort((a, b) => a.order - b.order);

        return mappedSteps;
    };

    const fetchComments = async (missionId) => {
        try {
            setIsLoading((prev) => ({ ...prev, comments: true }));
            const commentsData = await getCommentsByMission(missionId);
            setComments(commentsData);
        } catch (error) {
            setError({
                isOpen: true,
                type: "error",
                message: `Erreur lors du chargement des commentaires: ${error.message}`,
            });
            setComments([]);
        } finally {
            setIsLoading((prev) => ({ ...prev, comments: false }));
        }
    };

    const handleCreateComment = async (missionId, commentText) => {
        try {
            const commentData = {
                missionId,
                userId,
                commentText,
                createdAt: new Date().toISOString(),
            };
            const response = await createComment(commentData);
            await fetchComments(missionId);
            setComment("");
            return response;
        } catch (error) {
            setError({
                isOpen: true,
                type: "error",
                message: `Erreur lors de l'ajout du commentaire: ${error.message}`,
            });
            throw error;
        }
    };

    const handleUpdateComment = async (commentId, missionId, commentText) => {
        try {
            const commentData = {
                missionId,
                userId,
                commentText,
                createdAt: new Date().toISOString(),
            };
            const response = await updateComment(commentId, commentData);
            await fetchComments(missionId);
            return response;
        } catch (error) {
            setError({
                isOpen: true,
                type: "error",
                message: `Erreur lors de la mise à jour du commentaire: ${error.message}`,
            });
            throw error;
        }
    };

    const handleDeleteComment = async (commentId, missionId) => {
        try {
            const response = await deleteComment(commentId, missionId, userId);
            await fetchComments(missionId);
            return response;
        } catch (error) {
            setError({
                isOpen: true,
                type: "error",
                message: `Erreur lors de la suppression du commentaire: ${error.message}`,
            });
            throw error;
        }
    };

    const handleOMPaymentClick = async (employeeId) => {
        if (!missionId || !employeeId) {
            setError({
                isOpen: true,
                type: "error",
                message: "Mission ID et Employee ID sont requis.",
            });
            return;
        }
        setSelectedAssignmentId(`${employeeId}-${missionId}`);
        await fetchMissionPayment(missionId, employeeId, setMissionPayment, setIsLoading, handleError);
        setShowPaymentDetails(true);
    };

    const handleBackToAssignments = () => {
        setShowPaymentDetails(false);
        setMissionPayment({ dailyPaiements: [], assignmentDetails: null, totalAmount: 0 });
        setSelectedAssignmentId(null);
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

        fetchAssignMission(
            setAssignedPersons,
            setIsLoading,
            setTotalEntries,
            { missionId },
            currentPage,
            pageSize,
            handleError
        );

        fetchComments(missionId);
    }, [missionId, currentPage, pageSize]);

    useEffect(() => {
        if (assignedPersons.length > 0) {
            const fetchValidations = async () => {
                try {
                    setIsLoading((prev) => ({ ...prev, validations: true }));

                    const firstAssignation = assignedPersons[0];
                    const assignationId = firstAssignation.assignationId;

                    if (assignationId) {
                        const validations = await getMissionValidations(assignationId);
                        const mappedSteps = mapValidationsToSteps(validations);
                        setValidationSteps(mappedSteps);
                    }
                } catch (error) {
                    console.error("Error fetching validations:", error);
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

    const handleSaveComment = async () => {
        if (!comment.trim()) {
            setError({
                isOpen: true,
                type: "error",
                message: "Le commentaire ne peut pas être vide.",
            });
            return;
        }
        try {
            await handleCreateComment(missionId, comment);
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
            setError({
                isOpen: true,
                type: "error",
                message: "Le commentaire ne peut pas être vide.",
            });
            return;
        }
        try {
            await handleUpdateComment(commentId, missionId, editCommentText);
            setEditingCommentId(null);
            setEditCommentText("");
        } catch (error) {
            // Error handling is already done in handleUpdateComment
        }
    };

    const handleDeleteCommentAction = async (commentId) => {
        try {
            await handleDeleteComment(commentId, missionId);
        } catch (error) {
            // Error handling is already done in handleDeleteComment
        }
    };

    if (!isOpen) return null;

    const currentStepData = validationSteps[currentStep] || validationSteps[0];
    const currentAssignedPerson = assignedPersons[currentStep] || assignedPersons[0];
    const formattedAssignedPerson = currentAssignedPerson
        ? formatValidatorData(currentAssignedPerson, "Collaborateur")
        : null;

    return (
        <PopupOverlay role="dialog" aria-labelledby="mission-details-title" aria-modal="true">
            <PopupContainer>
                <PopupHeader>
                    <PopupTitle id="mission-details-title">
                        Détails de la Mission {missionId || "Inconnue"}
                        {assignedPersons.length > 0 && (
                            <span className="assignments-count">
                                ({assignedPersons.length} assignation{assignedPersons.length > 1 ? "s" : ""})
                            </span>
                        )}
                    </PopupTitle>
                    <CloseButton
                        onClick={handleClose}
                        disabled={isLoading.mission || isLoading.assignMissions || isLoading.validations || isLoading.comments || isLoading.missionPayment}
                        aria-label="Fermer la fenêtre"
                    >
                        <X size={24} />
                    </CloseButton>
                </PopupHeader>
                
                <PopupContent>
                    <Alert
                        type={error.type}
                        message={error.message}
                        isOpen={error.isOpen}
                        onClose={() => setError({ ...error, isOpen: false })}
                    />

                    {!showPaymentDetails && <ValidationStepper steps={validationSteps} currentStep={currentStep} />}

                    {(isLoading.assignMissions || isLoading.validations || isLoading.comments || isLoading.missionPayment) ? (
                        <LoadingContainer>Chargement des informations de la mission...</LoadingContainer>
                    ) : (
                        <ContentArea>
                            {showPaymentDetails ? (
                                <OMPayment
                                    missionPayment={missionPayment}
                                    selectedAssignmentId={selectedAssignmentId}
                                    onBack={handleBackToAssignments}
                                    onExportPDF={handleExportPDF}
                                    onExportExcel={handleExportExcel}
                                    isLoading={isLoading}
                                    formatDate={formatDate}
                                />
                            ) : (
                                <>
                                    {validationSteps.length > 0 && (
                                        <ValidatorCard>
                                            <ValidatorGrid>
                                                <ValidatorSection>
                                                    <SectionTitle>Valideurs</SectionTitle>
                                                    {validationSteps.map((step, index) => (
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
                                                                        {isMissionFullyValidated && (
                                                                            <ButtonContainer>
                                                                                <OMPaymentButton
                                                                                    onClick={() => handleOMPaymentClick(assignment.employeeId)}
                                                                                    disabled={isLoading.missionPayment}
                                                                                >
                                                                                    <FileText size={16} /> Paiement
                                                                                </OMPaymentButton>
                                                            
                                                                            </ButtonContainer>
                                                                        )}
                                                                    </InfoItem>
                                                                    <InfoItem>
                                                                        {isMissionFullyValidated && (
                                                                            <ButtonContainer>
                                                                                <ButtonOMPDF onClick={handleExportPDF} disabled={isLoading.exportPDF}>
                                                                                    <Download size={16} /> OM PDF
                                                                                </ButtonOMPDF>
                                                                            </ButtonContainer>
                                                                        )}
                                                                    </InfoItem>
                                                                </div>
                                                            ))}
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
                                                disabled={!comment.trim()}
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
                                            comments.map((comment) => (
                                                <CommentItem key={comment.commentId}>
                                                    <CommentContent>
                                                        {editingCommentId === comment.commentId ? (
                                                            <>
                                                                <CommentTextarea
                                                                    value={editCommentText}
                                                                    onChange={(e) => setEditCommentText(e.target.value)}
                                                                    placeholder="Modifiez votre commentaire..."
                                                                />
                                                                <CommentActions>
                                                                    <CommentButton
                                                                        onClick={() => handleSaveEditComment(comment.commentId)}
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
                                                                <CommentText>{comment.content}</CommentText>
                                                                <CommentMeta>
                                                                    Par {comment.creator.name} ({comment.creator.email}) le{" "}
                                                                    {formatDate(comment.createdAt)}
                                                                </CommentMeta>
                                                            </>
                                                        )}
                                                    </CommentContent>
                                                    {comment.creator.userId === userId && (
                                                        <CommentActions>
                                                            <CommentActionButton
                                                                onClick={() => handleEditComment(comment.commentId, comment.content)}
                                                                title="Modifier le commentaire"
                                                            >
                                                                <Edit2 size={16} />
                                                            </CommentActionButton>
                                                            <CommentActionButton
                                                                className="delete"
                                                                onClick={() => handleDeleteCommentAction(comment.commentId)}
                                                                title="Supprimer le commentaire"
                                                            >
                                                                <Trash2 size={16} />
                                                            </CommentActionButton>
                                                        </CommentActions>
                                                    )}
                                                </CommentItem>
                                            ))
                                        )}
                                    </CommentsList>
                                </>
                            )}
                        </ContentArea>
                    )}
                </PopupContent>

            </PopupContainer>
        </PopupOverlay>
    );
};

export default DetailsMission;