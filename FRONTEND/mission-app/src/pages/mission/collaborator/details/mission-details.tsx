"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Download, CheckCircle, Send, Edit2, Trash2, X, ArrowLeft } from "lucide-react";
import { useParams, useNavigate, Routes, Route } from "react-router-dom";
import ValidationStepper from "@/pages/stepper/index";
import Alert from "@/components/alert";
import MissionReport from "./report/mission-report";
import OMPayment from "./payment/om-payment";
import OMNoteDeFrais from "../details/expense/om-note-de-frais";
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
  OMPaymentButton,
  MissionReportButton,
  ButtonOMPDF,
  PageHeader,
  HeaderLeft,
  BtnBack,
  HeaderActions,
  Separator,
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
import {
  useCompensationsByEmployeeAndMission,
  useExportMissionAssignationExcel,
  type Compensation,
} from "@/api/compensation/services";
import { formatDate } from "@/utils/date-converter";
import { StatusBadge } from "@/styles/table-styles";
import { getStatusBadgeClass, englishToFrench } from "@/utils/status";
import {
  CommentSection,
  CommentInputGroup,
  CommentButton,
  CommentTextarea,
  CommentsList,
  CommentItem,
  CommentContent,
  CommentMeta,
  CommentActions,
  CommentActionButton,
} from "@/styles/comment-styles";

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

interface CompensationResponse {
  assignation: MissionAssignation;
  compensations: Compensation[];
  totalAmount: number;
}

interface AssignmentDetails {
  beneficiary: string;
  matricule: string;
  missionTitle: string;
  function: string;
  base: string;
  meansOfTransport: string;
  direction: string;
  departmentService: string;
  costCenter: number;
  departureDate: string;
  departureTime: string;
  missionDuration: number;
  returnDate: string;
  returnTime: string;
  startDate: string;
}

interface MissionPayment {
  dailyPaiements: Array<{
    date: string;
    totalAmount: number;
    compensationScales: Array<{
      amount: number;
      expenseType?: { type: string };
      transportId?: string;
    }>;
  }>;
  assignmentDetails: AssignmentDetails;
  totalAmount: number;
}

interface MissionPaymentState {
  dailyPaiements: Array<{
    date: string;
    totalAmount: number;
    compensationScales: Array<{
      amount: number;
      expenseType?: { type: string };
      transportId?: string;
    }>;
  }>;
  assignmentDetails: AssignmentDetails | null;
  totalAmount: number;
}

interface MissionValidation {
  missionValidationId: string;
  type: string;
  status: string;
  createdAt: string;
  validationDate?: string | null;
  comment?: string;
  validator: {
    name: string;
    title?: string;
    subtitle?: string;
    email: string;
    department: string;
    position: string;
  };
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

  return { alert, showAlert, handleClose };
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
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        showAlert("error", `Erreur lors de l'ajout du commentaire: ${errorMessage}`);
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
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        showAlert("error", `Erreur lors de la mise à jour du commentaire: ${errorMessage}`);
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
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        showAlert("error", `Erreur lors de la suppression du commentaire: ${errorMessage}`);
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
  const [assignations, setAssignations] = useState<MissionAssignation[]>([]);
  const [validationSteps, setValidationSteps] = useState<ValidationStep[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const currentPage = 1;
  const pageSize = 100;

  const { data: searchResponse, isLoading: searchLoading, refetch: refetchSearch } = useSearchMissionAssignations(
    { missionId },
    currentPage,
    pageSize
  );

  const assignationId = assignations[0]?.assignationId;
  const { data: validationsResponse, isLoading: validationsLoading } = useGetMissionValidationsByAssignationId(assignationId);

  useEffect(() => {
    if (searchResponse?.data?.data) {
      setAssignations(searchResponse.data.data);
      setTotalEntries(searchResponse.data.totalCount || 0);
    } else {
      setAssignations([]);
      setTotalEntries(0);
    }
  }, [searchResponse]);

  const mapValidationsToSteps = useCallback((validations: MissionValidation[]) => {
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

    const mappedSteps = validations.map((validation) => {
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
        validationDate: validation.validationDate || undefined,
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

  const mission = useMemo(() => assignations[0]?.mission, [assignations]);

  return {
    assignations,
    validationSteps,
    mission,
    isLoading: searchLoading || validationsLoading,
    totalEntries,
    currentStep: 0,
    isMissionFullyValidated,
    refetch: refetchSearch,
  };
};

const DetailsMission: React.FC = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.userId || null;
  const { alert, showAlert, handleClose: handleAlertClose } = useAlert();
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
  } = useComments(missionId || "", userId, showAlert);
  const {
    assignations,
    validationSteps,
    mission,
    isLoading: missionLoading,
    isMissionFullyValidated,
    refetch: refetchMissionData,
  } = useMissionData(missionId || "");

  const [exportLoading, setExportLoading] = useState({
    pdf: false,
    excel: false,
  });

  const [selectedAssignationId, setSelectedAssignationId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [missionPayment, setMissionPayment] = useState<MissionPaymentState>({
    dailyPaiements: [],
    assignmentDetails: null,
    totalAmount: 0,
  });

  const generateOrderMutation = useGenerateMissionOrder();
  const exportExcelMutation = useExportMissionAssignationExcel();
  const { data: compensationsResponse, isLoading: compensationsLoading } = useCompensationsByEmployeeAndMission(
    selectedEmployeeId ?? undefined,
    missionId
  );

  useEffect(() => {
    if (missionId) {
      refetchMissionData();
    }
  }, [missionId, refetchMissionData]);

  useEffect(() => {
    if (compensationsResponse?.data) {
      const responseData = compensationsResponse.data as unknown as CompensationResponse;
      const { assignation, compensations, totalAmount } = responseData;
      const dailyPaiements = compensations.map((comp: Compensation) => ({
        date: comp.paymentDate,
        totalAmount: comp.totalAmount,
        compensationScales: [
          ...(comp.transportAmount > 0 ? [{ amount: comp.transportAmount, transportId: assignation.transportId ?? undefined }] : []),
          ...(comp.breakfastAmount > 0 ? [{ amount: comp.breakfastAmount, expenseType: { type: "Petit Déjeuner" } }] : []),
          ...(comp.lunchAmount > 0 ? [{ amount: comp.lunchAmount, expenseType: { type: "Déjeuner" } }] : []),
          ...(comp.dinnerAmount > 0 ? [{ amount: comp.dinnerAmount, expenseType: { type: "Dîner" } }] : []),
          ...(comp.accommodationAmount > 0 ? [{ amount: comp.accommodationAmount, expenseType: { type: "Hébergement" } }] : []),
        ],
      }));

      const assignmentDetails: AssignmentDetails = {
        beneficiary: `${assignation.employee.firstName} ${assignation.employee.lastName}`,
        matricule: assignation.employee.employeeCode ?? '',
        missionTitle: assignation.mission.name ?? '',
        function: assignation.employee.jobTitle ?? '',
        base: assignation.employee.site.siteName ?? '',
        meansOfTransport: assignation.transport?.type ?? "Non spécifié",
        direction: assignation.employee.direction.directionName ?? '',
        departmentService: `${assignation.employee.department.departmentName ?? ''} / ${assignation.employee.service.serviceName ?? ''}`,
        costCenter: assignation.allocatedFund,
        departureDate: assignation.departureDate ?? '',
        departureTime: assignation.departureTime ?? '',
        missionDuration: assignation.duration,
        returnDate: assignation.returnDate ?? '',
        returnTime: assignation.returnTime ?? '',
        startDate: assignation.mission.startDate ?? '',
      };

      setMissionPayment({
        dailyPaiements,
        assignmentDetails,
        totalAmount,
      });
    }
  }, [compensationsResponse]);

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
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        showAlert("error", errorMessage || "Erreur lors de la génération de l'ordre de mission.");
      } finally {
        setExportLoading((prev) => ({ ...prev, pdf: false }));
      }
    },
    [missionId, showAlert, generateOrderMutation]
  );

  const handleExportExcel = useCallback(() => {
    exportExcelMutation.mutate({ missionId });
  }, [exportExcelMutation, missionId]);

  const handleSaveComment = useCallback(async () => {
    if (!comment.trim()) {
      showAlert("error", "Le commentaire ne peut pas être vide.");
      return;
    }
    try {
      await handleCreateComment(comment);
    } catch {
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
      } catch {
        // Error handled in hook
      }
    },
    [editCommentText, handleUpdateComment, showAlert]
  );

  const handleDeleteCommentAction = useCallback(
    async (commentId: string) => {
      try {
        await handleDeleteComment(commentId);
      } catch {
        // Error handled in hook
      }
    },
    [handleDeleteComment]
  );

  const isGlobalLoading = useMemo(() => {
    return missionLoading || commentsLoading || exportLoading.pdf || exportLoading.excel || compensationsLoading;
  }, [missionLoading, commentsLoading, exportLoading, compensationsLoading]);

  const handleBackToMissionDetails = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleNavigateToPayment = useCallback((employeeId: string, assignationId: string) => {
    setSelectedEmployeeId(employeeId);
    setSelectedAssignationId(assignationId);
    navigate(`payment/${assignationId}`);
  }, [navigate]);

  const handleNavigateToNote = useCallback((assignationId: string) => {
    setSelectedAssignationId(assignationId);
    navigate(`note/${assignationId}`);
  }, [navigate]);

  const handleNavigateToReport = useCallback((assignationId: string, employeeId: string) => {
    setSelectedAssignationId(assignationId);
    setSelectedEmployeeId(employeeId);
    navigate(`report/${assignationId}`);
  }, [navigate]);

  if (!missionId) {
    return <LoadingContainer>Mission ID manquante</LoadingContainer>;
  }

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={handleAlertClose}
      />
      {isGlobalLoading ? (
        <LoadingContainer>Chargement des informations de la mission...</LoadingContainer>
      ) : (
        <ContentArea>
          <Routes>
            <Route
              index
              element={
                <>
                  <PageHeader>
                    <HeaderLeft>
                      <BtnBack onClick={handleBackToMissionDetails} title="Retour aux missions">
                        <ArrowLeft className="w-5 h-5" />
                      </BtnBack>
                    </HeaderLeft>
                    <div className="header-center">
                      <div className="header-title-section">
                        <h1 className="page-title">Détails de la Mission</h1>
                        <p className="page-subtitle">Mission #{missionId}</p>
                      </div>
                    </div>
                    <HeaderActions>
                      {mission && (
                        <StatusBadge className={getStatusBadgeClass(mission.status)}>
                          {englishToFrench[mission.status?.trim().toLowerCase()] || mission.status}
                        </StatusBadge>
                      )}
                    </HeaderActions>
                  </PageHeader>
                  <Separator />
                  {validationSteps.length > 0 && (
                    <ValidationStepper steps={validationSteps} currentStep={0} />
                  )}

                  <Separator />
                  {mission && (
                    <>
                      <SectionTitle>Informations Générales de la Mission</SectionTitle>
                      <InfoGrid style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                        <InfoItem>
                          <InfoLabel>Nom de la Mission</InfoLabel>
                          <InfoValue>{mission.name}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Description</InfoLabel>
                          <InfoValue>{mission.description || "Aucune description"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Type de Mission</InfoLabel>
                          <InfoValue>{mission.missionType}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Date de Début</InfoLabel>
                          <InfoValue>{formatDate(mission.startDate)}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Date de Fin</InfoLabel>
                          <InfoValue>{formatDate(mission.endDate)}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Lieu/Pays</InfoLabel>
                          <InfoValue>{`${mission.lieu.nom} / ${mission.lieu.pays}`}</InfoValue>
                        </InfoItem>
                        
                      </InfoGrid>
                    </>
                  )}
                  {validationSteps.length > 0 && (
                    <ValidatorCard>
                      <ValidatorGrid style={{ gridTemplateColumns: "1fr 2fr" }}>
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
                          {assignations.length > 0 ? (
                            assignations.map((assignation, index) => {
                              const employee = assignation.employee;
                              const initials = `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase();
                              const assignmentType = assignation.type;
                              const shouldShowRendu = assignmentType === "Indemnité" || assignmentType === "Note de frais";
                              return (
                                <div
                                  key={`${assignation.assignationId}-${index}`}
                                  style={{
                                    marginBottom: "var(--spacing-md)",
                                    padding: "var(--spacing-md)",
                                    border: "1px solid var(--border-light)",
                                    borderRadius: "var(--radius-sm)",
                                    backgroundColor: "var(--bg-secondary)",
                                  }}
                                >
                                  <ValidatorItem style={{ marginBottom: "var(--spacing-md)" }}>
                                    <Avatar size="40px">{initials}</Avatar>
                                    <ValidatorInfo>
                                      <ValidatorName>
                                        {employee.firstName} {employee.lastName} ({employee.direction?.acronym})
                                      </ValidatorName>
                                    </ValidatorInfo>
                                  </ValidatorItem>
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "repeat(3, 1fr)",
                                      gap: "var(--spacing-sm)",
                                    }}
                                  >
                                    <InfoItem>
                                      <InfoLabel>N° Assignation</InfoLabel>
                                      <InfoValue>{assignation.assignationId}</InfoValue>
                                    </InfoItem>
                                    <InfoItem>
                                      <InfoLabel>Matricule</InfoLabel>
                                      <InfoValue>{employee.employeeCode || "Non spécifié"}</InfoValue>
                                    </InfoItem>
                                    <InfoItem>
                                      <InfoLabel>Fonction</InfoLabel>
                                      <InfoValue>{employee.jobTitle || "Non spécifié"}</InfoValue>
                                    </InfoItem>
                                    <InfoItem>
                                      <InfoLabel>Site</InfoLabel>
                                      <InfoValue>{employee.site?.siteName || "Non spécifié"}</InfoValue>
                                    </InfoItem>
                                    <InfoItem>
                                      <InfoLabel>Type d'Assignation</InfoLabel>
                                      <InfoValue>{assignation.type || "Non spécifié"}</InfoValue>
                                    </InfoItem>
                                    <InfoItem>
                                      <InfoLabel>Moyen de Transport</InfoLabel>
                                      <InfoValue>{assignation.transport?.type || "Non spécifié"}</InfoValue>
                                    </InfoItem>
                                    <InfoItem>
                                      <InfoLabel>Date et Heure de Départ</InfoLabel>
                                      <InfoValue>{`${formatDate(assignation.departureDate)} ${assignation.departureTime || ''}`}</InfoValue>
                                    </InfoItem>
                                    <InfoItem>
                                      <InfoLabel>Date et Heure de Retour</InfoLabel>
                                      <InfoValue>{`${formatDate(assignation.returnDate)} ${assignation.returnTime || ''}`}</InfoValue>
                                    </InfoItem>
                                    <InfoItem>
                                      <InfoLabel>Durée</InfoLabel>
                                      <InfoValue>{assignation.duration} jours</InfoValue>
                                    </InfoItem>
                                  </div>
                                  {isMissionFullyValidated && (
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "var(--spacing-sm)",
                                        justifyContent: "flex-start",
                                        marginTop: "calc(var(--spacing-md) + 20px)",
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      {assignmentType === "Indemnité" ? (
                                        <OMPaymentButton
                                          onClick={() => handleNavigateToPayment(assignation.employee.employeeId, assignation.assignationId)}
                                          disabled={isGlobalLoading}
                                        >
                                          Indemnité
                                        </OMPaymentButton>
                                      ) : assignmentType === "Note de frais" ? (
                                        <OMPaymentButton
                                          onClick={() => handleNavigateToNote(assignation.assignationId)}
                                          disabled={isGlobalLoading}
                                        >
                                          Note de Frais
                                        </OMPaymentButton>
                                      ) : null}
                                      <ButtonOMPDF
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleExportPDF(assignation.employee.employeeId);
                                        }}
                                        disabled={exportLoading.pdf}
                                      >
                                        <Download size={16} /> OM PDF
                                      </ButtonOMPDF>
                                      {shouldShowRendu && (
                                        <MissionReportButton
                                          onClick={() => handleNavigateToReport(assignation.assignationId, assignation.employee.employeeId)}
                                          disabled={isGlobalLoading}
                                        >
                                          Rendu
                                        </MissionReportButton>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
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
                        </ValidatorSection>
                      </ValidatorGrid>
                    </ValidatorCard>
                  )}
                  
                  <Separator />

                  <SectionTitle>Commentaires</SectionTitle>
                  <CommentSection>
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
                </>
              }
            />
            <Route
              path="payment/:assignationId"
              element={
                missionPayment.assignmentDetails ? (
                  <OMPayment
                    missionPayment={missionPayment as MissionPayment}
                    selectedAssignmentId={selectedAssignationId || ""}
                    onBack={handleBackToMissionDetails}
                    onExportPDF={handleExportPDF}
                    onExportExcel={handleExportExcel}
                    isLoading={{ exportExcel: exportExcelMutation.isPending }}
                    formatDate={formatDate}
                  />
                ) : (
                  <LoadingContainer>Chargement du paiement...</LoadingContainer>
                )
              }
            />
            <Route
              path="note/:assignationId"
              element={
                selectedAssignationId ? (
                  <OMNoteDeFrais
                    selectedAssignmentId={selectedAssignationId}
                    onBack={handleBackToMissionDetails}
                  />
                ) : (
                  <LoadingContainer>Chargement de la note de frais...</LoadingContainer>
                )
              }
            />
            <Route
              path="report/:assignationId"
              element={
                selectedAssignationId ? (
                  <MissionReport
                    userId={userId}
                    assignationId={selectedAssignationId}
                    onBack={handleBackToMissionDetails}
                  />
                ) : (
                  <LoadingContainer>Chargement du rapport...</LoadingContainer>
                )
              }
            />
          </Routes>
        </ContentArea>
      )}
    </>
  );
};

export default DetailsMission;