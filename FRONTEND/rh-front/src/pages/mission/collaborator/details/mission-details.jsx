"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, CheckCircle, Send, Edit2, Trash2 } from "lucide-react";
import ValidationStepper from "../list/components/validation-stepper";
import Alert from "components/alert";
import OMPayment from "./payment/om-payment";
import OMNoteDeFrais from "./expense/om-note-de-frais";
import MissionReport from "./report/mission-report"; 
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
    ActionButton,
} from "styles/generaliser/details-mission-container";
import {
    fetchAssignMission,
    generateMissionOrder,
} from "services/mission/mission";
import { useGetMissionValidationsByAssignationId } from "services/mission/validation";
import { CreateComment, GetCommentsByMission, UpdateComment, DeleteComment } from "services/mission/comments";
import { GetCompensationsByEmployeeAndMission, exportMissionAssignationExcel } from "services/mission/compensation";
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
const MissionReportButton = styled(ActionButton)`
    width:103px;
    background-color: var(--success-color, #28a745);
    border-color: var(--success-color, #28a745);

    &:hover {
        background-color: #ffffff;
        color: var(--success-color, #28a745);
        border-color: var(--success-color, #28a745);
    }
`;


const ButtonContainer = styled.div`
    display: flex;
    align-items: center;
    gap: var(--spacing-sm, 10px);
    margin-top: var(--spacing-sm, 10px);
`;

const DetailsMission = ({ missionId, onClose, isOpen = true }) => {
    const getCompensationsByEmployeeAndMission = GetCompensationsByEmployeeAndMission();
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
        missionReport: false,
    });
    const [error, setError] = useState({ isOpen: false, type: "", message: "" });
    const [assignedPersons, setAssignedPersons] = useState([]);
    const [currentPage] = useState(1);
    const [pageSize] = useState(10);
    const [, setTotalEntries] = useState(0);
    const [currentStep] = useState(0);
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
    const [showIndemnityDetails, setShowIndemnityDetails] = useState(false);
    const [showExpenseDetails, setShowExpenseDetails] = useState(false);
    const [showMissionReport, setShowMissionReport] = useState(false); // New state for MissionReport
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [detailsType, setDetailsType] = useState(null);
    const userId = JSON.parse(localStorage.getItem("user"))?.userId || null;

    const isMissionFullyValidated = validationSteps.every(step => {
        return step.status === "approved";
    });

    const handleError = useCallback((error) => {
        setError({
            isOpen: true,
            type: "error",
            message: error.message || "Erreur inconnue lors du chargement des données",
        });
    }, []);

    const mapValidationsToSteps = useCallback((validations) => {
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
    }, []);

    const fetchComments = useCallback(async (id) => {
        try {
            setIsLoading((prev) => ({ ...prev, comments: true }));
            const commentsData = await getCommentsByMission(id);
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
    }, [getCommentsByMission]);

    const handleCreateComment = useCallback(async (id, commentText) => {
        try {
            const commentData = {
                missionId: id,
                userId,
                commentText,
                createdAt: new Date().toISOString(),
            };
            const response = await createComment(commentData);
            await fetchComments(id);
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
    }, [createComment, fetchComments, userId]);

    const handleUpdateComment = useCallback(async (commentId, id, commentText) => {
        try {
            const commentData = {
                missionId: id,
                userId,
                commentText,
                createdAt: new Date().toISOString(),
            };
            const response = await updateComment(commentId, commentData);
            await fetchComments(id);
            return response;
        } catch (error) {
            setError({
                isOpen: true,
                type: "error",
                message: `Erreur lors de la mise à jour du commentaire: ${error.message}`,
            });
            throw error;
        }
    }, [updateComment, fetchComments, userId]);

    const handleDeleteComment = useCallback(async (commentId, id) => {
        try {
            const response = await deleteComment(commentId, id, userId);
            await fetchComments(id);
            return response;
        } catch (error) {
            setError({
                isOpen: true,
                type: "error",
                message: `Erreur lors de la suppression du commentaire: ${error.message}`,
            });
            throw error;
        }
    }, [deleteComment, fetchComments, userId]);

    const handleOMPaymentClick = useCallback(async (employeeId, assignmentType) => {
        if (!missionId || !employeeId) {
            setError({
                isOpen: true,
                type: "error",
                message: "Mission ID et Employee ID sont requis.",
            });
            return;
        }
        setIsLoading(prev => ({ ...prev, missionPayment: true }));
        try {
            const response = await getCompensationsByEmployeeAndMission(employeeId, missionId);
            const { assignation, compensations, totalAmount } = response;
            setSelectedAssignmentId(assignation.assignationId);
            const dailyPaiements = compensations.map(comp => ({
                date: comp.paymentDate,
                totalAmount: comp.totalAmount,
                compensationScales: [
                    ...(comp.transportAmount > 0 ? [{ amount: comp.transportAmount, transportId: assignation.transportId }] : []),
                    ...(comp.breakfastAmount > 0 ? [{ amount: comp.breakfastAmount, expenseType: { type: "Petit Déjeuner" } }] : []),
                    ...(comp.lunchAmount > 0 ? [{ amount: comp.lunchAmount, expenseType: { type: "Déjeuner" } }] : []),
                    ...(comp.dinnerAmount > 0 ? [{ amount: comp.dinnerAmount, expenseType: { type: "Dîner" } }] : []),
                    ...(comp.accommodationAmount > 0 ? [{ amount: comp.accommodationAmount, expenseType: { type: "Hébergement" } }] : []),
                ],
            }));

            const assignmentDetails = {
                beneficiary: `${assignation.employee.firstName} ${assignation.employee.lastName}`,
                matricule: assignation.employee.employeeCode,
                missionTitle: assignation.mission.name,
                function: assignation.employee.jobTitle,
                base: assignation.employee.siteName,
                meansOfTransport: assignation.transport?.name || "Non spécifié",
                direction: assignation.employee.directionName,
                departmentService: `${assignation.employee.departmentName} / ${assignation.employee.serviceName}`,
                costCenter: assignation.allocatedFund,
                departureDate: assignation.departureDate,
                departureTime: assignation.departureTime,
                missionDuration: assignation.duration,
                returnDate: assignation.returnDate,
                returnTime: assignation.returnTime,
                startDate: assignation.mission.startDate,
            };

            setMissionPayment({
                dailyPaiements,
                assignmentDetails,
                totalAmount,
            });
            setDetailsType(assignmentType);
            if (assignmentType === 'Indemnité') {
                setShowIndemnityDetails(true);
                setShowExpenseDetails(false);
                setShowMissionReport(false);
            } else if (assignmentType === 'Note de frais') {
                setShowExpenseDetails(true);
                setShowIndemnityDetails(false);
                setShowMissionReport(false);
            }
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(prev => ({ ...prev, missionPayment: false }));
        }
    }, [missionId, getCompensationsByEmployeeAndMission, handleError]);

    const handleMissionReportClick = useCallback((employeeId, assignationId) => {
        if (!employeeId || !assignationId) {
            setError({
                isOpen: true,
                type: "error",
                message: "Employee ID et Assignation ID sont requis.",
            });
            return;
        }
        setSelectedAssignmentId(assignationId);
        setShowMissionReport(true);
        setShowIndemnityDetails(false);
        setShowExpenseDetails(false);
    }, []);

    const handleBackToAssignments = useCallback(() => {
        setShowIndemnityDetails(false);
        setShowExpenseDetails(false);
        setShowMissionReport(false);
        setMissionPayment({ dailyPaiements: [], assignmentDetails: null, totalAmount: 0 });
        setSelectedAssignmentId(null);
        setDetailsType(null);
    }, []);

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
    }, [missionId, currentPage, pageSize, handleError, fetchComments]);

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
    }, [assignedPersons, getMissionValidations, mapValidationsToSteps, handleError]);

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    const handleExportPDF = useCallback(
        async (employeeId) => {
            if (!missionId || !employeeId) {
                setError({
                    isOpen: true,
                    type: "error",
                    message: "Mission ID et Employee ID sont requis pour générer l'ordre de mission.",
                });
                return;
            }

            try {
                const data = {
                    missionId,
                    employeeId,
                };

                await generateMissionOrder(
                    data,
                    setIsLoading,
                    (success) => {
                        setError({
                            isOpen: true,
                            type: "success",
                            message: success.message || "Ordre de mission généré et téléchargé avec succès.",
                        });
                    },
                    (error) => {
                        setError({
                            isOpen: true,
                            type: "error",
                            message: error.message || "Erreur lors de la génération de l'ordre de mission.",
                            details: error.details || { missionId, employeeId, timestamp: new Date().toISOString() },
                        });
                    }
                );
            } catch (error) {
                setError({
                    isOpen: true,
                    type: "error",
                    message: `Erreur inattendue lors de la génération de l'ordre de mission : ${error.message}`,
                    details: { missionId, employeeId, timestamp: new Date().toISOString() },
                });
            }
        },
        [missionId, setError, setIsLoading]
    );

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
                        disabled={isLoading.mission || isLoading.assignMissions || isLoading.validations || isLoading.comments || isLoading.missionPayment || isLoading.missionReport}
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

                    {!(showIndemnityDetails || showExpenseDetails || showMissionReport) && <ValidationStepper steps={validationSteps} currentStep={currentStep} />}

                    {(isLoading.assignMissions || isLoading.validations || isLoading.comments || isLoading.missionPayment || isLoading.missionReport) ? (
                        <LoadingContainer>Chargement des informations de la mission...</LoadingContainer>
                    ) : (
                        <ContentArea>
                            {showIndemnityDetails ? (
                                <OMPayment
                                    missionPayment={missionPayment}
                                    selectedAssignmentId={selectedAssignmentId}
                                    onBack={handleBackToAssignments}
                                    onExportPDF={handleExportPDF}
                                    onExportExcel={handleExportExcel}
                                    isLoading={isLoading}
                                    formatDate={formatDate}
                                />
                            ) : showExpenseDetails ? (
                                <OMNoteDeFrais
                                    missionPayment={missionPayment}
                                    selectedAssignmentId={selectedAssignmentId}
                                    detailsType={detailsType}
                                    onBack={handleBackToAssignments}
                                    onExportPDF={handleExportPDF}
                                    onExportExcel={handleExportExcel}
                                    isLoading={isLoading}
                                    formatDate={formatDate}
                                />
                            ) : showMissionReport ? (
                                <MissionReport
                                    userId={userId}
                                    assignationId={selectedAssignmentId}
                                    onBack={handleBackToAssignments}
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
                                                            {assignedPersons.map((assignment, index) => {
                                                                const buttonText = assignment.type === 'Indemnité' ? 'Indemnité' : 'Note de frais';
                                                                const shouldShowButton = isMissionFullyValidated && (assignment.type === 'Indemnité' || assignment.type === 'Note de frais');
                                                                return (
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
                                                                            {shouldShowButton && (
                                                                                <ButtonContainer>
                                                                                    <OMPaymentButton
                                                                                        onClick={() => handleOMPaymentClick(assignment.employeeId, assignment.type)}
                                                                                        disabled={isLoading.missionPayment}
                                                                                    >
                                                                                        {buttonText}
                                                                                    </OMPaymentButton>
                                                                                
                                                                                </ButtonContainer>
                                                                            )}
                                                                        </InfoItem>
                                                                        <InfoItem>
                                                                            {isMissionFullyValidated && (
                                                                                <ButtonContainer>
                                                                                    <ButtonOMPDF
                                                                                        onClick={() => handleExportPDF(assignment.employeeId)}
                                                                                        disabled={isLoading.exportPDF}
                                                                                    >
                                                                                        <Download size={16} /> OM PDF
                                                                                    </ButtonOMPDF>
                                                                                </ButtonContainer>
                                                                            )}
                                                                        </InfoItem>
                                                                        <InfoItem>
                                                                            {shouldShowButton && (
                                                                                <ButtonContainer>
                                                                                   
                                                                                    <MissionReportButton
                                                                                        onClick={() => handleMissionReportClick(assignment.employeeId, assignment.assignationId)}
                                                                                        disabled={isLoading.missionReport}
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
                                                                        onChange={(e) => setEditCommentText(e.target.value)}
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
                                                                        Par {commentItem.creator.name} le{" "}
                                                                        {formatDate(commentItem.createdAt)}:
                                                                    </CommentMeta>
                                                                </>
                                                            )}
                                                        </CommentContent>
                                                        {commentItem.creator.userId === userId && (
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