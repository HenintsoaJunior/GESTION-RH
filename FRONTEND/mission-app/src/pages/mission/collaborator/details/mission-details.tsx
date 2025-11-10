"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import styled from "styled-components";
import { CheckCircle, Send, Edit2, Trash2, X, ArrowLeft, ChevronDown, Eye, Download, Folder, FileText } from "lucide-react";
import { useParams, useNavigate, Routes, Route, useLocation } from "react-router-dom";
import {
  TabContainer,
  TabButton,
} from "@/styles/onglet-style";
import ValidationStepper from "@/pages/stepper/index";
import Alert from "@/components/alert";
import MissionReport from "./report/mission-report";
import OMPayment from "./payment/om-payment";
import OMNoteDeFrais from "../details/expense/om-note-de-frais";
import {
  LoadingContainer,
  LoadingSpinner,
  ContentArea,
  SectionTitle,
  ValidatorItem,
  Avatar,
  ValidatorInfo,
  ValidatorName,
  InfoGrid,
  InfoItem,
  InfoLabel,
  InfoValue,
  CommentText,
  PageHeader,
  HeaderLeft,
  BtnBack,
  HeaderActions,
  Separator,
  HeaderCenter,
  HeaderTitleSection,
  PageTitle,
  PageSubtitle,
  DetailSection,
} from "@/styles/detailsmission-styles";
import { 
  FolderContainer, 
  FolderHeader, 
  AttachmentsList, 
  AttachmentItem, 
  IconButton 
} from "@/styles/detailsmission-styles";
import { 
  ModalOverlay, 
  ModalContentStyled, 
  ModalHeader, 
  ModalTitle, 
  ModalCloseButton, 
  ModalBody, 
  FilePreview, 
  ImagePreview, 
  ErrorMessage 
} from "@/styles/detailsmission-styles";
import { handleFileView } from "@/utils/file-utils";
import {
  useSearchMissionAssignations,
  useGenerateMissionOrder,
  useGenerateATD,
  usePreviewMissionOrder,
  usePreviewATD,
  type MissionAssignation,
  type GenerateMissionOrderData,
  type GenerateATDData,
  type PreviewPdfResult,
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
} from "@/api/compensation/national/services";
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
import { getInitials } from "@/utils/initials";

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

// Types for attachments
interface DocumentAttachment {
  id: string;
  name: string;
  fileContent?: string; // Optional base64
  fileName: string;
  fileSize?: number;
  fileType: string;
  extension?: string;
}

interface ModalContent {
  fileName?: string;
  fileUrl?: string;
  isBlobUrl?: boolean;
  extension?: string;
  error?: string;
}

const PREDEFINED_DOCUMENTS: Omit<DocumentAttachment, 'fileContent'>[] = [
  {
    id: "ordre-mission",
    name: "Ordre de Mission",
    fileName: "Ordre_de_Mission.pdf",
    fileType: "application/pdf",
    extension: "pdf",
    fileSize: 1024,
  },
  {
    id: "attestation-employe",
    name: "Attestation Employé",
    fileName: "Attestation_Employe.pdf",
    fileType: "application/pdf",
    extension: "pdf",
    fileSize: 512,
  },
  {
    id: "attestation-hebergement",
    name: "Attestation Hébergement",
    fileName: "Attestation_Hebergement.pdf",
    fileType: "application/pdf",
    extension: "pdf",
    fileSize: 768,
  },
];

// FilePreviewModal Component
interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ModalContent;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, content }) => {
  useEffect(() => {
    return () => {
      if (content.isBlobUrl && content.fileUrl) {
        window.URL.revokeObjectURL(content.fileUrl);
      }
    };
  }, [content.fileUrl, content.isBlobUrl]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContentStyled onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{content.fileName || "Prévisualisation"}</ModalTitle>
          <ModalCloseButton onClick={onClose} $variant="primary" style={{ color: 'black' }}>
            <X size={20} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          {content.error ? (
            <ErrorMessage>{content.error}</ErrorMessage>
          ) : content.extension === "pdf" ? (
            <FilePreview src={content.fileUrl} title={content.fileName} style={{ borderRadius: 0 }} />
          ) : (
            <ImagePreview src={content.fileUrl} alt={content.fileName || ""} />
          )}
        </ModalBody>
      </ModalContentStyled>
    </ModalOverlay>
  );
};

// MissionAttachments Component (per employee)
interface MissionAttachmentsProps {
  documents: DocumentAttachment[];
  onGenerateOrder: () => Promise<void>;
  onGenerateEmploye: () => Promise<void>;
  onGenerateHebergement?: () => Promise<void>; // Optional for international
  onPreviewOrder: (data: GenerateMissionOrderData) => Promise<PreviewPdfResult>;
  onPreviewEmploye: (data: GenerateATDData) => Promise<PreviewPdfResult>;
  onPreviewHebergement?: (data: GenerateATDData) => Promise<PreviewPdfResult>; // Optional for international
  employeeId: string;
  missionId: string;
}

const MissionAttachments: React.FC<MissionAttachmentsProps> = ({ 
  documents, 
  onGenerateOrder, 
  onGenerateEmploye, 
  onGenerateHebergement,
  onPreviewOrder,
  onPreviewEmploye,
  onPreviewHebergement,
  employeeId,
  missionId 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>({});
  const showHebergement = onGenerateHebergement !== undefined && onPreviewHebergement !== undefined;

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handlePreview = useCallback(async (doc: DocumentAttachment) => {
    const content = doc.fileContent;
    if (content) {
      handleFileView(
        content,
        doc.fileName,
        (modalContent: ModalContent | null) => setModalContent(modalContent || {}),
        setModalOpen,
        doc.fileType
      );
    } else {
      let previewResult: PreviewPdfResult | undefined;
      try {
        switch (doc.id) {
          case "ordre-mission":
            previewResult = await onPreviewOrder({ missionId, employeeId });
            break;
          case "attestation-employe":
            previewResult = await onPreviewEmploye({ employeeId });
            break;
          case "attestation-hebergement":
            if (onPreviewHebergement) previewResult = await onPreviewHebergement({ employeeId });
            break;
        }
        if (previewResult) {
          setModalContent({ 
            fileUrl: previewResult.blobUrl, 
            fileName: previewResult.fileName, 
            isBlobUrl: true, 
            extension: doc.extension || "pdf" 
          });
          setModalOpen(true);
        }
      } catch (error) {
        setModalContent({ 
          error: error instanceof Error ? error.message : "Erreur lors de la génération du fichier.", 
          fileName: doc.fileName 
        });
        setModalOpen(true);
      }
    }
  }, [onPreviewOrder, onPreviewEmploye, onPreviewHebergement, employeeId, missionId]);

  const handleDownload = useCallback(async (doc: DocumentAttachment) => {
    try {
      switch (doc.id) {
        case "ordre-mission":
          await onGenerateOrder();
          break;
        case "attestation-employe":
          await onGenerateEmploye();
          break;
        case "attestation-hebergement":
          if (onGenerateHebergement) await onGenerateHebergement();
          break;
      }
    } catch {
      // Error handled by alert in generate functions
    }
  }, [onGenerateOrder, onGenerateEmploye, onGenerateHebergement]);

  const filteredDocuments = useMemo(() => 
    documents.filter(doc => doc.id !== "attestation-hebergement" || showHebergement), 
    [documents, showHebergement]
  );

  return (
    <>
      <FolderContainer style={{ marginTop: "var(--spacing-md)", width: "300px" }}>
        <FolderHeader onClick={toggleOpen} $isOpen={isOpen}>
          <Folder className="folder-icon" size={20} />
          <span style={{ fontSize: "12px" }}>
            Pièces Jointes · {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""}
          </span>
          <ChevronDown className="chevron" size={20} />
        </FolderHeader>
        {isOpen && (
          <AttachmentsList style={{ width: "100%" }}>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <AttachmentItem key={doc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: "var(--spacing-sm)" }}>
                  <FileText size={24} style={{ color: "var(--primary-color)", minWidth: "24px" }} />
                  <div className="file-info" style={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}>
                    <div className="file-name" style={{ fontWeight: "bold", fontSize: "12px" }}>{doc.name}</div>
                    <div className="file-size" style={{ fontSize: "12px" }}>{(doc.fileSize || 0).toLocaleString()} Ko</div>
                  </div>
                  <div className="actions" style={{ display: "flex", gap: "var(--spacing-xs)" }}>
                    <IconButton
                      onClick={() => handlePreview(doc)}
                      title={`Prévisualiser ${doc.name}`}
                      $variant="primary"
                    >
                      <Eye size={16} />
                    </IconButton>
                    <IconButton
                      $download
                      onClick={() => handleDownload(doc)}
                      title={`Télécharger ${doc.name}`}
                    >
                      <Download size={16} />
                    </IconButton>
                  </div>
                </AttachmentItem>
              ))
            ) : (
              <p style={{ padding: "var(--spacing-xl)", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                Aucune pièce jointe disponible
              </p>
            )}
          </AttachmentsList>
        )}
      </FolderContainer>
      <FilePreviewModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        content={modalContent} 
      />
    </>
  );
};

const StyledTabContainer = styled.div`${TabContainer}`;

type TabButtonProps = {
  $isActive: boolean;
  $hasBorderRight: boolean;
};

const StyledTabButton = styled.button<TabButtonProps>`
  ${TabButton}
`;

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
      } catch (errorMessage: unknown) {
        showAlert("error", `Erreur lors de l'ajout du commentaire: ${errorMessage}`);
        throw errorMessage;
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
      } catch (errorMessage: unknown) {
        showAlert("error", `Erreur lors de la mise à jour du commentaire: ${errorMessage}`);
        throw errorMessage;
      }
    },
    [missionId, userId, updateCommentMutation, showAlert]
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!missionId || !userId) return;
      try {
        await deleteCommentMutation.mutateAsync({ commentId, missionId, userId });
      } catch (errorMessage: unknown) {
        showAlert("error", `Erreur lors de la suppression du commentaire: ${errorMessage}`);
        throw errorMessage;
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

interface Tab {
  label: string;
  onClick: () => void;
  path: string;
}

const DetailsMission: React.FC = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
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

  const [selectedAssignationId, setSelectedAssignationId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [missionPayment, setMissionPayment] = useState<MissionPaymentState>({
    dailyPaiements: [],
    assignmentDetails: null,
    totalAmount: 0,
  });

  const [isDelayedLoading, setIsDelayedLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayedLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const generateOrderMutation = useGenerateMissionOrder();
  const generateATDMutation = useGenerateATD();
  const previewOrderMutation = usePreviewMissionOrder();
  const previewATDMutation = usePreviewATD();
  const exportExcelMutation = useExportMissionAssignationExcel();
  const { data: compensationsResponse, isLoading: compensationsLoading } = useCompensationsByEmployeeAndMission(
    selectedEmployeeId ?? undefined,
    missionId
  );

  const fullBasePath = `/mission/collaborateur/${missionId}`;

  useEffect(() => {
    if (missionId) {
      refetchMissionData();
    }
  }, [missionId, refetchMissionData]);

  useEffect(() => {
    if (compensationsResponse?.data) {
      const responseData = compensationsResponse.data;
      const { assignation, compensations } = responseData;
      const totalAmount = compensations.reduce((sum, comp) => {
        const communicationAmount = comp.communicationAmount ?? 0;
        const visaAmount = comp.visaAmount ?? 0;
        const medicalExpensesAmount = comp.medicalExpensesAmount ?? 0;
        const taxesAmount = comp.taxesAmount ?? 0;
        return sum + (comp.totalAmount || (
          (comp.transportAmount ?? 0) +
          (comp.breakfastAmount ?? 0) +
          (comp.lunchAmount ?? 0) +
          (comp.dinnerAmount ?? 0) +
          (comp.accommodationAmount ?? 0) +
          communicationAmount +
          visaAmount +
          medicalExpensesAmount +
          taxesAmount
        ));
      }, 0);
      const dailyPaiements = compensations
        .map((comp: Compensation) => {
          const communicationAmount = comp.communicationAmount ?? 0;
          const visaAmount = comp.visaAmount ?? 0;
          const medicalExpensesAmount = comp.medicalExpensesAmount ?? 0;
          const taxesAmount = comp.taxesAmount ?? 0;
          const totalForDay = comp.totalAmount || (
            (comp.transportAmount ?? 0) +
            (comp.breakfastAmount ?? 0) +
            (comp.lunchAmount ?? 0) +
            (comp.dinnerAmount ?? 0) +
            (comp.accommodationAmount ?? 0) +
            communicationAmount +
            visaAmount +
            medicalExpensesAmount +
            taxesAmount
          );
          const compensationScales: Array<{
            amount: number;
            expenseType?: { type: string };
            transportId?: string;
          }> = [];
          if ((comp.transportAmount ?? 0) > 0) {
            compensationScales.push({ 
              amount: comp.transportAmount!, 
              transportId: assignation.transportId ?? undefined 
            });
          }
          if ((comp.breakfastAmount ?? 0) > 0) {
            compensationScales.push({ 
              amount: comp.breakfastAmount!, 
              expenseType: { type: "Petit Déjeuner" } 
            });
          }
          if ((comp.lunchAmount ?? 0) > 0) {
            compensationScales.push({ 
              amount: comp.lunchAmount!, 
              expenseType: { type: "Déjeuner" } 
            });
          }
          if ((comp.dinnerAmount ?? 0) > 0) {
            compensationScales.push({ 
              amount: comp.dinnerAmount!, 
              expenseType: { type: "Dinner" } 
            });
          }
          if ((comp.accommodationAmount ?? 0) > 0) {
            compensationScales.push({ 
              amount: comp.accommodationAmount!, 
              expenseType: { type: "Hébergement" } 
            });
          }
          if (communicationAmount > 0) {
            compensationScales.push({ 
              amount: communicationAmount, 
              expenseType: { type: "Communication" } 
            });
          }
          if (visaAmount > 0) {
            compensationScales.push({ 
              amount: visaAmount, 
              expenseType: { type: "Visa sur place" } 
            });
          }
          if (medicalExpensesAmount > 0) {
            compensationScales.push({ 
              amount: medicalExpensesAmount, 
              expenseType: { type: "Frais médicaux" } 
            });
          }
          if (taxesAmount > 0) {
            compensationScales.push({ 
              amount: taxesAmount, 
              expenseType: { type: "Taxes" } 
            });
          }
          return {
            date: comp.paymentDate,
            totalAmount: totalForDay,
            compensationScales,
          };
        })
        .filter((payment) => payment.compensationScales.length > 0); // Optional: filter out days with no compensations

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
    async (employeeId: string): Promise<void> => {
      if (!missionId || !employeeId) {
        showAlert("error", "Mission ID et Employee ID sont requis pour générer l'ordre de mission.");
        return;
      }

      try {
        const data = { missionId, employeeId };
        await generateOrderMutation.mutateAsync(data);
      } catch (errorMessage: unknown) {
        showAlert("error", `Erreur lors de la génération de l'ordre de mission: ${errorMessage}`);
      }
    },
    [missionId, showAlert, generateOrderMutation]
  );

  const handlePreviewOrder = useCallback(
    async (data: GenerateMissionOrderData): Promise<PreviewPdfResult> => {
      if (!data.missionId || !data.employeeId) {
        showAlert("error", "Mission ID et Employee ID sont requis pour prévisualiser l'ordre de mission.");
        throw new Error("Mission ID et Employee ID sont requis pour prévisualiser l'ordre de mission.");
      }

      const result = await previewOrderMutation.mutateAsync(data);
      return result;
    },
    [showAlert, previewOrderMutation]
  );

  const handlePreviewATD = useCallback(
    async (data: GenerateATDData): Promise<PreviewPdfResult> => {
      if (!data.employeeId) {
        showAlert("error", "Employee ID est requis pour prévisualiser l'attestation employé.");
        throw new Error("Employee ID est requis pour prévisualiser l'attestation employé.");
      }

      const result = await previewATDMutation.mutateAsync(data);
      return result;
    },
    [showAlert, previewATDMutation]
  );

  const handleExportAttestationEmploye = useCallback(
    async (employeeId: string): Promise<void> => {
      if (!missionId || !employeeId) {
        showAlert("error", "Mission ID et Employee ID sont requis pour générer l'attestation employé.");
        return;
      }

      try {
        const data = { employeeId };
        await generateATDMutation.mutateAsync(data);
      } catch (errorMessage: unknown) {
        showAlert("error", `Erreur lors de la génération de l'attestation employé: ${errorMessage}`);
      }
    },
    [missionId, showAlert, generateATDMutation]
  );

  const handleExportAttestationHebergement = useCallback(
    async (employeeId: string): Promise<void> => {
      if (!missionId || !employeeId) {
        showAlert("error", "Mission ID et Employee ID sont requis pour générer l'attestation hébergement.");
        return;
      }

      try {
        // TODO: Remplacer par la vraie mutation API pour générer l'attestation hébergement
        // Ex: await generateAttestationHebergementMutation.mutateAsync({ missionId, employeeId });
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation de chargement
      } catch (errorMessage: unknown) {
        showAlert("error", `Erreur lors de la génération de l'attestation hébergement: ${errorMessage}`);
      }
    },
    [missionId, showAlert]
  );

  const handlePreviewAttestationHebergement = useCallback(
    async (data: GenerateATDData): Promise<PreviewPdfResult> => {
      if (!data.employeeId) {
        showAlert("error", "Employee ID est requis pour prévisualiser l'attestation hébergement.");
        throw new Error("Employee ID est requis pour prévisualiser l'attestation hébergement.");
      }

      try {
        // TODO: Similar for preview hebergement
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation
        // Mock result for now
        return {
          blobUrl: URL.createObjectURL(new Blob(['Mock PDF content'], { type: 'application/pdf' })),
          fileName: `Attestation_Hebergement-${data.employeeId}-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`,
          status: "success"
        };
      } catch (errorMessage: unknown) {
        throw new Error(`Erreur lors de la prévisualisation de l'attestation hébergement: ${errorMessage}`);
      }
    },
    [showAlert]
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
    return missionLoading || commentsLoading || exportExcelMutation.isPending || compensationsLoading;
  }, [missionLoading, commentsLoading, exportExcelMutation.isPending, compensationsLoading]);

  const effectiveLoading = isGlobalLoading || isDelayedLoading;

  const handleBackToMissionDetails = useCallback(() => {
    navigate("/mission/list");
  }, [navigate]);

  const handleNavigateToPayment = useCallback((employeeId: string, assignationId: string) => {
    setSelectedEmployeeId(employeeId);
    setSelectedAssignationId(assignationId);
    navigate(`${fullBasePath}/payment/${assignationId}`);
  }, [navigate, fullBasePath]);

  const handleNavigateToNote = useCallback((assignationId: string) => {
    setSelectedAssignationId(assignationId);
    navigate(`${fullBasePath}/note/${assignationId}`);
  }, [navigate, fullBasePath]);

  const handleNavigateToReport = useCallback((assignationId: string, employeeId: string) => {
    setSelectedAssignationId(assignationId);
    setSelectedEmployeeId(employeeId);
    navigate(`${fullBasePath}/report/${assignationId}`);
  }, [navigate, fullBasePath]);

  const firstAssignation = assignations[0];

  const tabs = useMemo((): Tab[] => {
    if (!firstAssignation) return [];
    const assignmentType = firstAssignation.type;
    const employeeId = firstAssignation.employee.employeeId;
    const shouldShowRendu = assignmentType === "Indemnité" || assignmentType === "Note de frais";
    const tabList: Tab[] = [{
      label: "Détails",
      onClick: () => navigate(fullBasePath),
      path: "",
    }];
    if (isMissionFullyValidated) {
      if (assignmentType === "Indemnité") {
        tabList.push({
          label: "Indemnités",
          onClick: () => handleNavigateToPayment(employeeId, firstAssignation.assignationId),
          path: `payment/${firstAssignation.assignationId}`,
        });
      }
      if (assignmentType === "Note de frais") {
        tabList.push({
          label: "Note de Frais",
          onClick: () => handleNavigateToNote(firstAssignation.assignationId),
          path: `note/${firstAssignation.assignationId}`,
        });
      }
      if (shouldShowRendu) {
        tabList.push({
          label: "Rendu",
          onClick: () => handleNavigateToReport(firstAssignation.assignationId, employeeId),
          path: `report/${firstAssignation.assignationId}`,
        });
      }
    }
    return tabList;
  }, [firstAssignation, handleNavigateToPayment, handleNavigateToNote, handleNavigateToReport, navigate, fullBasePath, isMissionFullyValidated]);

  // Fonction pour rendre les onglets sans les boutons PDF
  const renderTabsOnly = () => (
    <StyledTabContainer>
      {tabs.map((tab, tabIndex) => {
        const fullPath = tab.path === "" ? fullBasePath : `${fullBasePath}/${tab.path}`;
        return (
          <StyledTabButton
            key={tab.label}
            $isActive={location.pathname === fullPath}
            $hasBorderRight={tabIndex < tabs.length - 1}
            onClick={tab.onClick}
            disabled={isGlobalLoading}
          >
            {tab.label}
          </StyledTabButton>
        );
      })}
    </StyledTabContainer>
  );

  if (!missionId) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        Mission ID manquante
      </LoadingContainer>
    );
  }

  const assignedPersonsNames = assignations.length > 0 
    ? assignations.map(a => `${a.employee.firstName} ${a.employee.lastName}`).join(', ') 
    : 'Aucune personne assignée';

  const renderRestrictedAccess = () => (
    <div
      style={{
        textAlign: "center",
        padding: "var(--spacing-lg)",
        color: "var(--text-secondary)",
      }}
    >
      Accès restreint : La mission n'est pas encore validée.
    </div>
  );

  const documents = PREDEFINED_DOCUMENTS.map(doc => ({ ...doc, fileContent: undefined } as DocumentAttachment));

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={handleAlertClose}
      />
      {effectiveLoading ? (
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      ) : (
        <ContentArea>
          <PageHeader>
            <HeaderLeft>
              <BtnBack onClick={handleBackToMissionDetails} title="Retour aux missions">
                <ArrowLeft className="w-5 h-5" />
              </BtnBack>
            </HeaderLeft>
            <HeaderCenter>
              <HeaderTitleSection>
                <PageTitle>{assignedPersonsNames}</PageTitle>
                <PageSubtitle>
                  {firstAssignation && ` N° Assignation: ${firstAssignation.assignationId}`}
                </PageSubtitle>
              </HeaderTitleSection>
            </HeaderCenter>
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
          <Routes>
            <Route
              index
              element={
                <>
                  {renderTabsOnly()}
                  <div style={{ marginTop: '50px' }} />
                  {/* <Separator /> */}
                  
                  <SectionTitle>Personnes Assignées à la Mission</SectionTitle>
                  {assignations.length > 0 ? (
                    assignations.map((assignation, index) => {
                      const employee = assignation.employee;
                      const initials = `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase();
                      const showHebergement = mission?.missionType === "international";

                      return (
                        <DetailSection
                          key={`${assignation.assignationId}-${index}`}
                          style={{
                            marginBottom: "var(--spacing-md)",
                            padding: "var(--spacing-md)",
                            border: "1px solid var(--border-light)",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "var(--bg-primary)",
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
                              <InfoLabel>Moyen de Transport</InfoLabel>
                              <InfoValue>{assignation.transport?.type || "Non spécifié"}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                              <InfoLabel>Direction</InfoLabel>
                              <InfoValue>{employee.direction?.directionName || "Non spécifié"}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                              <InfoLabel>Département</InfoLabel>
                              <InfoValue>{employee.department?.departmentName || "Non spécifié"}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                              <InfoLabel>Service</InfoLabel>
                              <InfoValue>{employee.service?.serviceName || "Non spécifié"}</InfoValue>
                            </InfoItem>
                          </div>
                          {isMissionFullyValidated && (
                            <MissionAttachments
                              documents={documents}
                              onGenerateOrder={() => handleExportPDF(assignation.employee.employeeId)}
                              onGenerateEmploye={() => handleExportAttestationEmploye(assignation.employee.employeeId)}
                              onGenerateHebergement={showHebergement ? () => handleExportAttestationHebergement(assignation.employee.employeeId) : undefined}
                              onPreviewOrder={handlePreviewOrder}
                              onPreviewEmploye={handlePreviewATD}
                              onPreviewHebergement={showHebergement ? handlePreviewAttestationHebergement : undefined}
                              employeeId={assignation.employee.employeeId}
                              missionId={missionId || ""}
                            />
                          )}
                        </DetailSection>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "var(--spacing-md)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Aucune personne assignée à la mission {missionId || "inconnue"}.
                    </div>
                  )}
                  <Separator />
                  {mission && (
                    <>
                      <SectionTitle>Informations Générales de la Mission</SectionTitle>
                      <InfoGrid style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                        <InfoItem>
                          <InfoLabel>N° Assignation</InfoLabel>
                          <InfoValue>{firstAssignation?.assignationId || "Non spécifié"}</InfoValue>
                        </InfoItem>

                        <InfoItem>
                          <InfoLabel>Mission</InfoLabel>
                          <InfoValue>
                            {mission.name}
                          </InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Type d'Assignation</InfoLabel>
                          <InfoValue>{firstAssignation.type || "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Zone</InfoLabel>
                          <InfoValue>{mission.missionType}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Lieu/Pays</InfoLabel>
                          <InfoValue>{`${mission.lieu.nom} / ${mission.lieu.pays}`}</InfoValue>
                        </InfoItem>

                        <InfoItem>
                          <InfoLabel>Date de Début</InfoLabel>
                          <InfoValue>{formatDate(mission.startDate)}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Date et Heure de Départ</InfoLabel>
                          <InfoValue>{firstAssignation ? `${formatDate(firstAssignation.departureDate)} ${firstAssignation.departureTime || ''}` : "Non spécifié"}</InfoValue>
                        </InfoItem>
                        
                        <InfoItem>
                          <InfoLabel>Date de Fin</InfoLabel>
                          <InfoValue>{formatDate(mission.endDate)}</InfoValue>
                        </InfoItem>
                        
                        <InfoItem>
                          <InfoLabel>Date et Heure de Retour</InfoLabel>
                          <InfoValue>{firstAssignation ? `${formatDate(firstAssignation.returnDate)} ${firstAssignation.returnTime || ''}` : "Non spécifié"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>Durée</InfoLabel>
                          <InfoValue>{firstAssignation?.duration || 0} jours</InfoValue>
                        </InfoItem>
                        <InfoItem style={{ gridColumn: "span 3" }}>
                          <InfoLabel>Description</InfoLabel>
                          <InfoValue>{mission.description || "Aucune description"}</InfoValue>
                        </InfoItem>
                      </InfoGrid>
                    </>
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
                        
                        return (
                          <CommentItem key={commentItem.commentId}>
                            <Avatar size="32px">{getInitials(commentItem.creator.name)}</Avatar>
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
                <>
                  {renderTabsOnly()}
                  {isMissionFullyValidated && missionPayment.assignmentDetails ? (
                    <OMPayment
                      missionPayment={missionPayment as MissionPayment}
                      selectedAssignmentId={selectedAssignationId || ""}
                      onBack={handleBackToMissionDetails}
                      onExportExcel={handleExportExcel}
                      formatDate={formatDate}
                      missionId={missionId || ""}
                      employeeId={selectedEmployeeId || ""}
                    />
                  ) : (
                    <LoadingContainer>
                      {isMissionFullyValidated ? (
                        <>
                          <LoadingSpinner />
                          Chargement du paiement...
                        </>
                      ) : (
                        renderRestrictedAccess()
                      )}
                    </LoadingContainer>
                  )}
                </>
              }
            />
            <Route
              path="note/:assignationId"
              element={
                <>
                  {renderTabsOnly()}
                  {isMissionFullyValidated && selectedAssignationId ? (
                    <OMNoteDeFrais
                      selectedAssignmentId={selectedAssignationId}
                      onBack={handleBackToMissionDetails}
                    />
                  ) : (
                    <LoadingContainer>
                      {isMissionFullyValidated ? (
                        <>
                          <LoadingSpinner />
                          Chargement de la note de frais...
                        </>
                      ) : (
                        renderRestrictedAccess()
                      )}
                    </LoadingContainer>
                  )}
                </>
              }
            />
            <Route
              path="report/:assignationId"
              element={
                <>
                  {renderTabsOnly()}
                  {isMissionFullyValidated && selectedAssignationId ? (
                    <MissionReport
                      userId={userId}
                      assignationId={selectedAssignationId}
                      onBack={handleBackToMissionDetails}
                    />
                  ) : (
                    <LoadingContainer>
                      {isMissionFullyValidated ? (
                        <>
                          <LoadingSpinner />
                          Chargement du rapport...
                        </>
                      ) : (
                        renderRestrictedAccess()
                      )}
                    </LoadingContainer>
                  )}
                </>
              }
            />
          </Routes>
        </ContentArea>
      )}
    </>
  );
};

export default DetailsMission;