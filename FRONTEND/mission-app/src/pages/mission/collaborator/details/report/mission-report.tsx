/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Save, List, FileText, Edit2, Trash2, X, Upload, Eye, Download, ChevronDown, Folder } from "lucide-react";
import { 
  PageHeader, 
  HeaderLeft, 
  HeaderActions, 
  SaveButton, 
  ToggleButton, 
  EditButton, 
  DeleteButton, 
  CancelButton, 
  ReportTextContainer, 
  ReportHeader, 
  ReportActions,
  BtnBack,
} from "@/styles/detailsmission-styles";
import { FolderContainer, FolderHeader, AttachmentsList, AttachmentItem, IconButton } from "@/styles/detailsmission-styles";
import { ModalOverlay, ModalContentStyled, ModalHeader, ModalTitle, ModalCloseButton, ModalBody, FilePreview, ImagePreview, ErrorMessage } from "@/styles/detailsmission-styles";
import { Separator } from "@/styles/detailsmission-styles";
import Alert from "@/components/alert";
import {
    DetailSection,
    SectionTitle,
} from "@/styles/detailsmission-styles";
import {
    FormTable,
    FormRow,
    FormFieldCell,
    FormLabelRequired,
} from "@/styles/form-container";
import { NoDataMessage } from "@/styles/table-styles";
import RichTextEditor from "@/components/rich-text-editor";
import { 
    useMissionReports,
    useCreateMissionReport, 
    useUpdateMissionReport,
    useDeleteMissionReport,
    useMissionReportAttachments,
    type MissionReport as MissionReportType,
    type Attachment,
    type MissionReportDTOForm,
    type MissionReportAttachmentDTO
} from "@/api/mission/report/services";
import { useQueryClient } from '@tanstack/react-query';
import { handleFileView, handleFileDownload } from "@/utils/file-utils";

type AlertType = "error" | "success" | "info" | "warning";

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  message: string;
}

interface MissionReportProps {
  userId?: string | null;
  assignationId: string;
  onBack?: () => void;
}

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

interface ModalContent {
  fileName?: string;
  fileUrl?: string;
  isBlobUrl?: boolean;
  extension?: string;
  error?: string;
}

// === MODAL COMPONENT ===
interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ModalContent;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, content }) => {
  useEffect(() => {
    // Cleanup Blob URL when modal closes
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
          <ModalCloseButton onClick={onClose} $variant="primary">
            <X size={20} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          {content.error ? (
            <ErrorMessage>{content.error}</ErrorMessage>
          ) : content.extension === "pdf" ? (
            <FilePreview src={content.fileUrl} title={content.fileName} />
          ) : (
            <ImagePreview src={content.fileUrl} alt={content.fileName || ""} />
          )}
        </ModalBody>
      </ModalContentStyled>
    </ModalOverlay>
  );
};

interface ReportAttachmentsProps {
  attachments: Attachment[];
  isOpen: boolean;
  onToggle: () => void;
  onPreview: (att: Attachment) => void;
}

const ReportAttachments: React.FC<ReportAttachmentsProps> = ({ attachments, isOpen, onToggle, onPreview }) => {
  const uniqueAttachments = useMemo((): Attachment[] => {
    const fileNames = new Set<string>();
    const unique: Attachment[] = [];
    (attachments || []).forEach((att) => {
      if (att && att.fileName && !fileNames.has(att.fileName)) {
        fileNames.add(att.fileName);
        unique.push(att);
      }
    });
    return unique;
  }, [attachments]);

  return (
    <>
      <FolderContainer>
        <FolderHeader onClick={onToggle} $isOpen={isOpen}>
          <Folder className="folder-icon" size={20} />
          <span style={{ fontSize: "12px" }}>
            Pièces Jointes · {uniqueAttachments.length} fichier{uniqueAttachments.length !== 1 ? "s" : ""}
          </span>
          <ChevronDown className="chevron" size={20} />
        </FolderHeader>
        {isOpen && (
          <AttachmentsList>
            {uniqueAttachments.length > 0 ? (
              uniqueAttachments.map((att, index) => (
                <AttachmentItem key={att.fileName || index}>
                  <FileText size={24} color="var(--primary-color)" />
                  <div className="file-info">
                    <div className="file-name" style={{ fontSize: "12px" }}>{att.fileName || "Fichier sans nom"}</div>
                    <div className="file-size" style={{ fontSize: "12px" }}>{(att.fileSize || 0).toLocaleString()} Ko</div>
                  </div>
                  <div className="actions">
                    <IconButton
                      onClick={() => onPreview(att)}
                      title="Prévisualiser"
                      $variant="primary"
                    >
                      <Eye size={16} />
                    </IconButton>
                    <IconButton
                      $download
                      onClick={() => handleFileDownload(att.fileContent || "", att.fileName || "")}
                      title="Télécharger"
                    >
                      <Download size={16} />
                    </IconButton>
                  </div>
                </AttachmentItem>
              ))
            ) : (
              <p style={{ padding: "var(--spacing-xl)", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                Aucune pièce jointe
              </p>
            )}
          </AttachmentsList>
        )}
      </FolderContainer>
    </>
  );
};

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

const useMissionReport = (
  assignationId: string,
  userId: string | null,
  showAlert: (type: AlertType, message: string) => void
) => {
  const [formData, setFormData] = useState({ reportContent: "" });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: allReportsResponse, isLoading: allReportsLoading } = useMissionReports();
  // Access the data directly as array
  const allMissionReports = useMemo(() => allReportsResponse?.data || [], [allReportsResponse]);
  // Debug log (remove after testing)
  console.log('allMissionReports:', allMissionReports);
  console.log('assignationId prop:', assignationId);
  
  // Since only one report per person, get the first (or only) matching report
  const rawFilteredReports = useMemo(() => {
    const matching = allMissionReports.filter((report: MissionReportType) => 
      report.assignationId.trim() === assignationId.trim()
    );
    // Return the first one if exists, or empty
    return matching.length > 0 ? [matching[0]] : [];
  }, [allMissionReports, assignationId]) as MissionReportType[];
  const hasExistingReport = rawFilteredReports.length > 0;
  const existingReport = hasExistingReport ? rawFilteredReports[0] : null;

  const existingReportId = existingReport?.missionReportId;
  const attachmentsQuery = useMissionReportAttachments(existingReportId || "");

  const filteredReports = useMemo(() => {
    if (!hasExistingReport) return [];
    return [{
      ...existingReport,
      attachments: attachmentsQuery.data?.data || []
    } as MissionReportType & { attachments: Attachment[] }];
  }, [hasExistingReport, existingReport, attachmentsQuery.data]);

  const createMutation = useCreateMissionReport();
  const updateMutation = useUpdateMissionReport();
  const deleteMutation = useDeleteMissionReport();

  const isLoading = allReportsLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || attachmentsQuery.isLoading;

  const updateReportContent = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, reportContent: value }));
  }, []);

  const handleAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];

    const formattedNewFiles = await Promise.all(
      files.map(async (file) => {
        const fileContent = await readFileAsBase64(file);
        return {
          attachmentId: "",
          missionReportId: editingReportId || "",
          fileName: file.name,
          fileContent,
          fileSize: Math.round(file.size / 1024),
          fileType: file.type || "application/octet-stream",
          uploadedAt: new Date().toISOString(),
        } as Attachment;
      })
    );

    const updatedAttachments = [...attachments, ...formattedNewFiles];
    setAttachments(updatedAttachments);
    e.target.value = "";
  };

  const handleRemoveAttachment = (index: number, isExisting = false) => {
    if (isExisting) {
      const updatedExisting = existingAttachments.filter((_: any, i: number) => i !== index);
      setExistingAttachments(updatedExisting);
    } else {
      const updatedAttachments = attachments.filter((_: any, i: number) => i !== index);
      setAttachments(updatedAttachments);
    }
  };

  const handleSaveReport = useCallback(async (): Promise<boolean> => {
    if (!isEditMode && hasExistingReport) {
      showAlert("error", "Un rapport existe déjà pour cette assignation.");
      return false;
    }

    if (!formData.reportContent.trim()) {
      showAlert("error", "Veuillez fournir un rapport détaillé.");
      return false;
    }

    if (!userId || !assignationId) {
      showAlert("error", "Données manquantes : ID utilisateur ou ID d'assignation requis.");
      return false;
    }

    try {
      const payload: MissionReportDTOForm = {
        Text: formData.reportContent,
        UserId: userId,
        AssignationId: assignationId,
        Attachments: [
          ...attachments.map(att => ({
            FileName: att.fileName,
            FileContent: att.fileContent,
            FileSize: att.fileSize,
            FileType: att.fileType,
          } as MissionReportAttachmentDTO)),
          ...existingAttachments.map(att => ({
            FileName: att.fileName,
            FileContent: att.fileContent,
            FileSize: att.fileSize,
            FileType: att.fileType,
          } as MissionReportAttachmentDTO)),
        ],
      };

      if (isEditMode && editingReportId) {
        await updateMutation.mutateAsync({ id: editingReportId, data: payload });
        showAlert("success", "Rapport mis à jour avec succès.");
      } else {
        await createMutation.mutateAsync(payload);
        showAlert("success", "Rapport enregistré avec succès.");
      }
      
      setFormData({ reportContent: "" });
      setAttachments([]);
      setExistingAttachments([]);
      setIsEditMode(false);
      setEditingReportId(null);
      return true;
    } catch (error) {
      showAlert("error", "Erreur lors de la sauvegarde du rapport.");
      console.error("Error saving report:", error);
      return false;
    }
  }, [assignationId, userId, formData.reportContent, attachments, existingAttachments, createMutation, updateMutation, hasExistingReport, isEditMode, editingReportId, showAlert]);

  const handleEditReport = useCallback((report: MissionReportType & { attachments?: Attachment[] }) => {
    setFormData({ reportContent: report.text });
    setEditingReportId(report.missionReportId);
    setIsEditMode(true);
    setAttachments([]);
    setExistingAttachments(report.attachments || []);
  }, []);

  const handleDeleteReport = useCallback(async (reportId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce rapport ?")) {
      return;
    }

    if (!userId) {
      showAlert("error", "Erreur: ID utilisateur manquant.");
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: reportId, userId });
      showAlert("success", "Rapport supprimé avec succès.");
    } catch (error) {
      showAlert("error", "Erreur lors de la suppression du rapport.");
      console.error("Error deleting report:", error);
    }
  }, [deleteMutation, userId, showAlert]);

  const handleCancelEdit = useCallback(() => {
    setFormData({ reportContent: "" });
    setAttachments([]);
    setExistingAttachments([]);
    setIsEditMode(false);
    setEditingReportId(null);
  }, []);

  return {
    formData,
    attachments,
    existingAttachments,
    filteredReports,
    hasExistingReport,
    existingReport,
    isLoading,
    isEditMode,
    editingReportId,
    updateReportContent,
    handleAttachmentChange,
    handleRemoveAttachment,
    handleSaveReport,
    handleEditReport,
    handleDeleteReport,
    handleCancelEdit,
    allReportsLoading,
  };
};

const MissionReport: React.FC<MissionReportProps> = ({ userId: propUserId, assignationId, onBack }) => {
    const userId = propUserId || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}")?.userId || null : null);
    const [viewMode, setViewMode] = useState<"form" | "list">("list");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ModalContent>({});
    const [openReportIds, setOpenReportIds] = useState<Set<string>>(new Set());
    const queryClient = useQueryClient();

    const { alert, showAlert, handleClose } = useAlert();
    const {
        formData,
        attachments,
        existingAttachments,
        filteredReports,
        hasExistingReport,
        isLoading,
        isEditMode,
        editingReportId,
        updateReportContent,
        handleAttachmentChange,
        handleRemoveAttachment,
        handleSaveReport,
        handleEditReport,
        handleDeleteReport,
        handleCancelEdit,
    } = useMissionReport(assignationId, userId, showAlert);

    const handlePreview = useCallback((att: Attachment) => {
      handleFileView(
        att.fileContent || "",
        att.fileName || "",
        (content: ModalContent | null) => setModalContent(content || {}),
        setModalOpen,
        att.fileType
      );
    }, []);

    const toggleView = useCallback(() => {
        if (viewMode === "list" && hasExistingReport) {
            return;
        }
        if (viewMode === "form") {
            handleCancelEdit();
        }
        setViewMode((prev) => (prev === "form" ? "list" : "form"));
    }, [viewMode, handleCancelEdit, hasExistingReport]);

    const handleSaveClick = useCallback(async () => {
        const success = await handleSaveReport();
        if (success) {
            // Force refetch après sauvegarde
            await queryClient.refetchQueries({ queryKey: ['missionReports'] });
            setViewMode("list");
        }
    }, [handleSaveReport, queryClient]);

    const handleEditClick = useCallback((report: MissionReportType & { attachments?: Attachment[] }) => {
        handleEditReport(report);
        setViewMode("form");
    }, [handleEditReport]);

    const toggleAttachments = useCallback((reportId: string) => {
      setOpenReportIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(reportId)) {
          newSet.delete(reportId);
        } else {
          newSet.add(reportId);
        }
        return newSet;
      });
    }, []);

    if (!userId || !assignationId) {
        return (
            <NoDataMessage>
                Données manquantes :{' '}
                {!userId && 'ID utilisateur, '}
                {!assignationId && 'ID d\'assignation'}
                requis.
            </NoDataMessage>
        );
    }

    const saveButtonDisabled = isLoading || !formData.reportContent.trim() || (!isEditMode && hasExistingReport);
    const saveButtonTitle = (!isEditMode && hasExistingReport)
        ? "Un rapport existe déjà"
        : !formData.reportContent.trim()
        ? "Le rapport est vide"
        : isEditMode ? "Mettre à jour le rapport" : "Enregistrer le rapport";

    const shouldShowToggleButton = viewMode === "form" || !hasExistingReport;
    const totalAttachments = attachments.length + existingAttachments.length;

    return (
        <>
            <PageHeader>
                <HeaderLeft>
                  <BtnBack onClick={onBack} title="Retour">
                      
                  </BtnBack>
                </HeaderLeft>
                
                <HeaderActions>
                    {shouldShowToggleButton && (
                        <ToggleButton
                            onClick={toggleView}
                            disabled={isLoading}
                            title={viewMode === "form" ? "Voir la liste des rapports" : "Créer un nouveau rapport"}
                        >
                            {viewMode === "form" ? <List size={16} /> : <FileText size={16} />}
                            {viewMode === "form" ? "Liste" : "Nouveau Rapport"}
                        </ToggleButton>
                    )}
                </HeaderActions>
            </PageHeader>
            <Separator />
            {alert.isOpen && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    isOpen={alert.isOpen}
                    onClose={handleClose}
                />
            )}

            {viewMode === "form" ? (
                <DetailSection>
                    <SectionTitle>
                        {isEditMode ? "Modification de Rapport" : "Création de Rapport"}
                    </SectionTitle>
                    {!isEditMode && hasExistingReport ? (
                        <NoDataMessage>
                            Un rapport existe déjà pour cette assignation. Consultez la liste des rapports.
                        </NoDataMessage>
                    ) : (
                        <>
                            <FormTable>
                                <tbody>
                                    <FormRow>
                                        <FormFieldCell colSpan={2}>
                                            <FormLabelRequired>Contenu du rapport</FormLabelRequired>
                                            <RichTextEditor
                                                placeholder="Rédigez votre rapport ici..."
                                                initialValue={formData.reportContent}
                                                onChange={(value) => updateReportContent(value)}
                                                disabled={isLoading}
                                                key={editingReportId || 'new'}
                                            />
                                        </FormFieldCell>
                                    </FormRow>
                                    <FormRow>
                                        <FormFieldCell colSpan={2}>
                                            <input 
                                                type="file" 
                                                id="file-upload" 
                                                multiple 
                                                onChange={handleAttachmentChange} 
                                                disabled={isLoading} 
                                                style={{ display: "none" }} 
                                            />
                                            <label htmlFor="file-upload" style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '8px', 
                                                padding: '8px 16px', 
                                                background: 'var(--primary-color)', 
                                                color: 'white', 
                                                borderRadius: '4px', 
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}>
                                                <Upload size={16} />
                                                Joindre des pièces jointes
                                            </label>
                                        </FormFieldCell>
                                    </FormRow>
                                    {totalAttachments > 0 && (
                                        <FormRow>
                                            <FormFieldCell colSpan={2}>
                                                <div style={{ marginTop: '16px' }}>
                                                    <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>Fichiers joints ({totalAttachments}) :</p>
                                                    <AttachmentsList style={{ padding: 0 }}>
                                                        {existingAttachments.length > 0 && (
                                                            <>
                                                                {existingAttachments.map((file, index) => (
                                                                    <AttachmentItem key={`existing-${index}`}>
                                                                        <FileText size={24} style={{ color: "var(--primary-color)", minWidth: "24px" }} />
                                                                        <div className="file-info" style={{ flex: 1, minWidth: 0 }}>
                                                                            <div className="file-name" style={{ fontWeight: "bold", fontSize: "12px" }}>{file.fileName}</div>
                                                                            <div className="file-size" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{file.fileSize} Ko</div>
                                                                        </div>
                                                                        <div className="actions" style={{ display: "flex", gap: "var(--spacing-xs)" }}>
                                                                            <IconButton
                                                                                onClick={() => handlePreview(file)}
                                                                                title="Prévisualiser"
                                                                                $variant="primary"
                                                                            >
                                                                                <Eye size={16} />
                                                                            </IconButton>
                                                                            <IconButton
                                                                                $download
                                                                                onClick={() => handleFileDownload(file.fileContent || "", file.fileName || "")}
                                                                                title="Télécharger"
                                                                            >
                                                                                <Download size={16} />
                                                                            </IconButton>
                                                                            <IconButton
                                                                                onClick={() => handleRemoveAttachment(index, true)}
                                                                                title="Supprimer"
                                                                                style={{ color: "var(--danger-color)" }}
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </IconButton>
                                                                        </div>
                                                                    </AttachmentItem>
                                                                ))}
                                                            </>
                                                        )}
                                                        {attachments.length > 0 && (
                                                            <>
                                                                <p style={{ margin: '16px 0 8px 0', fontSize: '12px', fontWeight: 'bold' }}>Nouveaux fichiers :</p>
                                                                {attachments.map((file, index) => (
                                                                    <AttachmentItem key={`new-${index}`}>
                                                                        <FileText size={24} style={{ color: "var(--primary-color)", minWidth: "24px" }} />
                                                                        <div className="file-info" style={{ flex: 1, minWidth: 0 }}>
                                                                            <div className="file-name" style={{ fontWeight: "bold", fontSize: "12px" }}>{file.fileName}</div>
                                                                            <div className="file-size" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{file.fileSize} Ko</div>
                                                                        </div>
                                                                        <div className="actions" style={{ display: "flex", gap: "var(--spacing-xs)" }}>
                                                                            <IconButton
                                                                                onClick={() => handlePreview(file)}
                                                                                title="Prévisualiser"
                                                                                $variant="primary"
                                                                            >
                                                                                <Eye size={16} />
                                                                            </IconButton>
                                                                            <IconButton
                                                                                $download
                                                                                onClick={() => handleFileDownload(file.fileContent || "", file.fileName || "")}
                                                                                title="Télécharger"
                                                                            >
                                                                                <Download size={16} />
                                                                            </IconButton>
                                                                            <IconButton
                                                                                onClick={() => handleRemoveAttachment(index, false)}
                                                                                title="Supprimer"
                                                                                style={{ color: "var(--danger-color)" }}
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </IconButton>
                                                                        </div>
                                                                    </AttachmentItem>
                                                                ))}
                                                            </>
                                                        )}
                                                    </AttachmentsList>
                                                </div>
                                            </FormFieldCell>
                                        </FormRow>
                                    )}
                                    <FormRow>
                                        <FormFieldCell colSpan={2} style={{ textAlign: 'right', paddingTop: '20px' }}>
                                            {isEditMode && (
                                                <CancelButton
                                                    onClick={handleCancelEdit}
                                                    disabled={isLoading}
                                                    title="Annuler la modification"
                                                >
                                                    <X size={16} /> Annuler
                                                </CancelButton>
                                            )}
                                            <SaveButton
                                                onClick={handleSaveClick}
                                                disabled={saveButtonDisabled}
                                                title={saveButtonTitle}
                                            >
                                                <Save size={16} /> {isEditMode ? "Mettre à jour" : "Enregistrer"}
                                            </SaveButton>
                                        </FormFieldCell>
                                    </FormRow>
                                </tbody>
                            </FormTable>
                        </>
                    )}
                </DetailSection>
            ) : (
                <DetailSection>
                    <SectionTitle style={{ fontSize: "12px" }}>Liste</SectionTitle>
                    {isLoading ? (
                        <NoDataMessage style={{ fontSize: "12px" }}>Chargement des rapports...</NoDataMessage>
                    ) : filteredReports.length === 0 ? (
                        <NoDataMessage style={{ fontSize: "12px" }}>Aucun rapport disponible.</NoDataMessage>
                    ) : (
                        <div>
                            {filteredReports.map((report: MissionReportType & { attachments?: Attachment[] }) => (
                                <ReportTextContainer key={report.missionReportId} style={{ fontSize: "12px" }}>
                                    <ReportHeader>
                                        <div>
                                            <strong style={{ fontSize: "12px" }}>Rapport #{report.missionReportId}</strong>
                                        </div>
                                        
                                        <ReportActions>
                                            <EditButton
                                                onClick={() => handleEditClick(report)}
                                                disabled={isLoading}
                                                title="Modifier ce rapport"
                                            >
                                                <Edit2 size={16} /> Modifier
                                            </EditButton>
                                            <DeleteButton
                                                onClick={() => handleDeleteReport(report.missionReportId)}
                                                disabled={isLoading}
                                                title="Supprimer ce rapport"
                                            >
                                                <Trash2 size={16} /> Supprimer
                                            </DeleteButton>
                                        </ReportActions>
                                    </ReportHeader>
                                    
                                    <div style={{ fontSize: "12px" }} dangerouslySetInnerHTML={{ __html: report.text }} />
                                    {report.attachments && report.attachments.length > 0 && (
                                      <ReportAttachments
                                        attachments={report.attachments}
                                        isOpen={openReportIds.has(report.missionReportId)}
                                        onToggle={() => toggleAttachments(report.missionReportId)}
                                        onPreview={handlePreview}
                                      />
                                    )}
                                </ReportTextContainer>
                            ))}
                        </div>
                    )}
                </DetailSection>
            )}
            <FilePreviewModal isOpen={modalOpen} onClose={() => setModalOpen(false)} content={modalContent} />
        </>
    );
};

export default MissionReport;