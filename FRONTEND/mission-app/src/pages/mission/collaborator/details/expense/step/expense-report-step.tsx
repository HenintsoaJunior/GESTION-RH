/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { Trash2, Plus, ChevronDown, FileText, Paperclip, Upload, Loader2, Eye, Download, X } from "lucide-react";
import styled from "styled-components";
import isPropValid from "@emotion/is-prop-valid";

import {
  FormTable,
  FormActions,
  FormFieldCell,
  FormLabel,
  FormLabelRequired,
  FormInput,
  Button,
  RemoveItem,
} from "@/styles/form-container";

import { useCreateExpenseReport, useExpenseReportsByAssignationId } from "@/api/mission/expense/services";
import Alert from "@/components/alert";

// Helper function to format expense report data for API submission
const formatExpenseReportForInsertion = (formData: any) => {
  const { userId, assignationId, expenseLinesByType, attachments } = formData;
  
  return {
    userId,
    assignationId,
    expenseLinesByType,
    attachments: attachments || [],
  };
};

// === DESIGN MODERNE ===
const COLORS = {
  primary: "#4F46E5",
  primaryHover: "#4338CA",
  secondary: "#10B981",
  accent: "#F59E0B",
  danger: "#EF4444",
  background: "#F9FAFB",
  cardBg: "#FFFFFF",
  border: "#E5E7EB",
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    light: "#9CA3AF",
  },
  folder: {
    bg: "#FEF3C7",
    border: "#F59E0B",
    hover: "#FDE68A",
  },
};

// === STYLED COMPONENTS ===
const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${COLORS.primary};
  border-bottom: 2px solid ${COLORS.primary};
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ExpenseTypeContainer = styled.div`
  background: ${COLORS.cardBg};
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const AccordionHeaderStyled = styled.button.withConfig({
  shouldForwardProp: (prop: string) => isPropValid(prop) && !prop.startsWith('$'),
})<{ $isOpen: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${(props) => (props.$isOpen ? COLORS.folder.bg : COLORS.background)};
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.text.primary};

  &:hover {
    background: ${COLORS.folder.hover};
  }

  .chevron {
    margin-left: auto;
    transition: transform 0.3s ease;
    transform: ${(props) => (props.$isOpen ? "rotate(0deg)" : "rotate(-90deg)")};
  }
`;

const AccordionContentStyled = styled.div<{ $isOpen: boolean }>`
  display: ${(props) => (props.$isOpen ? "block" : "none")};
  padding: 1rem;
  background: white;
  border-top: 1px solid ${COLORS.border};
`;

const AttachmentSection = styled.div`
  padding: 1.5rem;
  border: 2px dashed ${COLORS.primary};
  border-radius: 8px;
  background: ${COLORS.background};
  margin-top: 1rem;
`;

const AttachmentsList = styled.div`
  margin-top: 1rem;
  border-top: 1px solid ${COLORS.border};
  padding-top: 1rem;
`;

const AttachmentCategory = styled.div`
  margin-bottom: 1.5rem;
`;

const CategoryTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${COLORS.text.primary};
  margin-bottom: 0.5rem;
  font-style: italic;
`;

const AttachmentItem = styled.div<{ $isExisting?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${(props) => (props.$isExisting ? "#f0f9ff" : COLORS.cardBg)};
  margin-bottom: 8px;
  border-radius: 6px;
  border: 1px solid ${COLORS.border};
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .file-info {
    flex: 1;
    min-width: 0;

    .file-name {
      font-weight: 500;
      color: ${COLORS.text.primary};
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .file-size {
      font-size: 0.75rem;
      color: ${COLORS.text.secondary};
    }
  }

  .actions {
    display: flex;
    gap: 8px;
  }
`;

const IconButton = styled.button.withConfig({
  shouldForwardProp: (prop: string) => isPropValid(prop) && !prop.startsWith('$'),
})<{ $variant?: "primary" | "success" | "danger" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: ${(props) =>
    props.$variant === "primary"
      ? COLORS.primary
      : props.$variant === "success"
      ? COLORS.secondary
      : props.$variant === "danger"
      ? COLORS.danger
      : COLORS.background};
  color: ${(props) => (props.$variant ? "white" : COLORS.text.primary)};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DraftBadge = styled.span`
  font-size: 10px;
  color: ${COLORS.primary};
  font-style: italic;
  background: ${COLORS.folder.bg};
  padding: 2px 6px;
  border-radius: 4px;
`;

const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${COLORS.secondary};
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${COLORS.cardBg};
  padding: 24px;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  width: 800px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${COLORS.text.primary};
`;

const ModalBody = styled.div`
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FilePreview = styled.iframe`
  width: 100%;
  height: 500px;
  border: none;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
`;

const ErrorMessage = styled.p`
  color: ${COLORS.danger};
  text-align: center;
  font-size: 1rem;
`;

// === HELPER FUNCTIONS ===
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

const handleFileView = (fileContent: string, fileName: string, setModalContent: any, setModalOpen: any, fileType?: string) => {
  try {
    const byteCharacters = atob(fileContent);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType || "application/octet-stream" });
    const fileUrl = window.URL.createObjectURL(blob);
    const extension = fileName.split(".").pop()?.toLowerCase();

    setModalContent({
      fileName,
      fileUrl,
      isBlobUrl: true,
      extension,
    });
    setModalOpen(true);
  } catch (error) {
    setModalContent({ error: "Impossible de prévisualiser ce fichier" });
    setModalOpen(true);
  }
};

const handleFileDownload = (fileContent: string, fileName: string) => {
  try {
    const byteCharacters = atob(fileContent);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray]);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
  }
};

// === MODAL COMPONENT ===
interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    fileName?: string;
    fileUrl?: string;
    isBlobUrl?: boolean;
    extension?: string;
    error?: string;
  };
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
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{content.fileName || "Prévisualisation"}</ModalTitle>
          <IconButton onClick={onClose}>
            <X size={20} />
          </IconButton>
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
      </ModalContent>
    </ModalOverlay>
  );
};

// === MAIN COMPONENT ===
const ExpenseReportStep = ({ formData, fieldErrors, isSubmitting, handleInputChange, expenseReportTypes = [] }: any) => {
  const userId = JSON.parse(localStorage.getItem("user") || "{}")?.userId || null;

  useEffect(() => {
    if (userId && !formData.userId) {
      handleInputChange({ target: { name: "userId", value: userId } });
    }
  }, [userId, formData.userId, handleInputChange]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [attachments, setAttachments] = useState(formData.attachments || []);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [hasLoadedReports, setHasLoadedReports] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<any>({});

  const { mutateAsync: createExpenseReport } = useCreateExpenseReport();
  const { data: expenseReportsData, refetch: refetchExpenseReports } = useExpenseReportsByAssignationId(formData.assignationId);

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "error" | "warning" | "info"; message: string }>({ 
    isOpen: false, 
    type: "info", 
    message: "" 
  });

  const fetchExistingReports = useCallback(async () => {
    if (formData.assignationId && !hasLoadedReports && expenseReportsData) {
      try {
        setHasLoadedReports(true);
        
        // expenseReportsData.data contient déjà ExpenseReportsResponseData
        const responseData = expenseReportsData.data;

        if (!responseData) {
          throw new Error("Réponse API invalide.");
        }

        // responseData.data contient le tableau ExpenseReport[]
        // Nous devons vérifier la structure exacte de la réponse API
        // Si la réponse contient { data: { reports: [], attachments: [] } }
        const reports = (responseData as any).reports || [];
        const existingAttachmentsData = (responseData as any).attachments || [];

        if (reports && Array.isArray(reports) && reports.length > 0) {
          const newExpenseLinesByType: any = {};
          reports.forEach((report: any) => {
            const typeId = report.expenseReportTypeId;
            if (!newExpenseLinesByType[typeId]) {
              newExpenseLinesByType[typeId] = [];
            }
            newExpenseLinesByType[typeId].push({
              expenseReportId: report.expenseReportId,
              titled: report.titled,
              description: report.description,
              type: report.type,
              currencyUnit: report.currencyUnit,
              amount: report.amount,
              rate: report.rate,
            });
          });
          handleInputChange({ target: { name: "expenseLinesByType", value: newExpenseLinesByType } });
        }

        if (existingAttachmentsData && Array.isArray(existingAttachmentsData) && existingAttachmentsData.length > 0) {
          setExistingAttachments(existingAttachmentsData);
        }
      } catch (error: any) {
        setAlert({
          isOpen: true,
          type: "error",
          message: `Erreur lors de la récupération des rapports : ${error.message}`,
        });
        setHasLoadedReports(false);
      }
    }
  }, [formData.assignationId, hasLoadedReports, expenseReportsData, handleInputChange]);

  useEffect(() => {
    setHasLoadedReports(false);
  }, [formData.assignationId]);

  useEffect(() => {
    fetchExistingReports();
  }, [fetchExistingReports]);

  useEffect(() => {
    const expenseLinesByType = formData.expenseLinesByType || {};
    Object.keys(expenseLinesByType).forEach((typeId) => {
      if (expenseLinesByType[typeId]?.length > 0 && !openSections[typeId]) {
        setOpenSections((prev) => ({ ...prev, [typeId]: true }));
      }
    });
  }, [formData.expenseLinesByType, openSections]);

  const toggleSection = (typeId: string) => {
    setOpenSections((prev) => ({ ...prev, [typeId]: !prev[typeId] }));
  };

  const expenseLinesByType = formData.expenseLinesByType || {};

  const defaultFields = [
    { name: "titled", label: "Titre/Libellé", type: "text", required: true },
    { name: "description", label: "Description (Optionnel)", type: "text", required: false },
    { name: "type", label: "Type", type: "select", required: true, options: ["CB", "ESP"] },
    { name: "currencyUnit", label: "Devise", type: "text", required: true, placeholder: "Ex: EUR", width: "80px" },
    { name: "amount", label: "Montant", type: "number", required: true, width: "100px" },
    { name: "rate", label: "Taux Appliqué", type: "number", required: true, width: "100px" },
  ];

  const handleAddLine = (typeId: string, fieldsForType: any[]) => {
    const fieldsToUse = fieldsForType.length > 0 ? fieldsForType : defaultFields;
    const newLine = fieldsToUse.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {});
    const currentLines = expenseLinesByType[typeId] || [];
    const newLines = [...currentLines, newLine];

    handleInputChange({ target: { name: "expenseLinesByType", value: { ...expenseLinesByType, [typeId]: newLines } } });
    setOpenSections((prev) => ({ ...prev, [typeId]: true }));
  };

  const handleRemoveLine = (typeId: string, index: number) => {
    const currentLines = expenseLinesByType[typeId] || [];
    const newLines = currentLines.filter((_: any, i: number) => i !== index);

    handleInputChange({ target: { name: "expenseLinesByType", value: { ...expenseLinesByType, [typeId]: newLines } } });
  };

  const handleLineInputChange = (typeId: string, lineIndex: number, e: any) => {
    const { name, value } = e.target;
    const currentLines = expenseLinesByType[typeId] || [];
    const newLines = [...currentLines];
    newLines[lineIndex] = { ...newLines[lineIndex], [name]: value };

    handleInputChange({ target: { name: "expenseLinesByType", value: { ...expenseLinesByType, [typeId]: newLines } } });
  };

  const getLineError = (typeId: string, lineIndex: number, fieldName: string) =>
    fieldErrors[`expenseLinesByType.${typeId}[${lineIndex}].${fieldName}`] || [];

  const renderFieldInput = (line: any, index: number, field: any, typeId: string) => {
    const commonProps = {
      name: field.name,
      value: line[field.name] || "",
      onChange: (e: any) => handleLineInputChange(typeId, index, e),
      disabled: isSubmitting,
      className: getLineError(typeId, index, field.name).length > 0 ? "input-error" : "",
      style: { width: "100%", minWidth: field.width ? field.width : "120px" },
    };

    if (field.type === "number") {
      return <FormInput type="number" {...commonProps} min="0" step="0.01" />;
    }

    if (field.type === "select") {
      const options = field.options || [];
      return (
        <FormInput as="select" {...commonProps}>
          <option value="">Sélectionnez un type...</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt === "CB" ? "Carte Bancaire" : "Espèces"}
            </option>
          ))}
        </FormInput>
      );
    }

    return <FormInput type="text" {...commonProps} placeholder={field.placeholder || `Saisir ${field.label.toLowerCase()}...`} />;
  };

  const handleAttachmentChange = async (e: any) => {
    const files = Array.from(e.target.files) as File[];

    const formattedNewFiles = await Promise.all(
      files.map(async (file) => {
        const fileContent = await readFileAsBase64(file);
        return {
          fileName: file.name,
          fileContent,
          fileSize: Math.round(file.size / 1024),
          fileType: file.type || "application/octet-stream",
        };
      })
    );

    const updatedAttachments = [...attachments, ...formattedNewFiles];
    setAttachments(updatedAttachments);
    handleInputChange({ target: { name: "attachments", value: updatedAttachments } });
    e.target.value = null;
  };

  const handleRemoveAttachment = (index: number) => {
    const updatedAttachments = attachments.filter((_: any, i: number) => i !== index);
    setAttachments(updatedAttachments);
    handleInputChange({ target: { name: "attachments", value: updatedAttachments } });
  };

  const handleSubmitExpenseReport = async () => {
    if (isSubmitting || isLoading) return;

    setIsLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        attachments: attachments,
      };

      const formattedData = formatExpenseReportForInsertion(dataToSubmit);
      const response = await createExpenseReport(formattedData);
      
      console.log("Rapport de frais créé:", response);
      
      setAlert({
        isOpen: true,
        type: "success",
        message: "Rapport de frais créé avec succès.",
      });

      setAttachments([]);
      handleInputChange({ target: { name: "attachments", value: [] } });
      setHasLoadedReports(false);
      
      // Refetch to get updated data
      await refetchExpenseReports();
    } catch (error: any) {
      setAlert({
        isOpen: true,
        type: "error",
        message: error.message || "Erreur lors de la création du rapport de frais.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalAttachments = existingAttachments.length + attachments.length;

  return (
    <>
      <Alert type={alert.type} message={alert.message} isOpen={alert.isOpen} onClose={() => setAlert({ ...alert, isOpen: false })} />

      <SectionTitle>
        <FileText size={22} />
        Récapitulatif des Frais
      </SectionTitle>

      <FormInput type="hidden" name="assignationId" value={formData.assignationId || ""} onChange={handleInputChange} />
      <FormInput type="hidden" name="userId" value={formData.userId || ""} onChange={handleInputChange} />

      {expenseReportTypes.map((type: any) => {
        const typeId = type.expenseReportTypeId;
        const isOpen = openSections[typeId];
        const fieldsForType = type.fields && type.fields.length > 0 ? type.fields : defaultFields;
        const currentLines = expenseLinesByType[typeId] || [];

        return (
          <ExpenseTypeContainer key={typeId}>
            <AccordionHeaderStyled onClick={() => toggleSection(typeId)} $isOpen={isOpen}>
              <FileText size={20} />
              <span>
                <strong>{type.type}</strong> ({currentLines.length} ligne{currentLines.length > 1 ? "s" : ""})
              </span>
              <ChevronDown className="chevron" size={20} />
            </AccordionHeaderStyled>

            <AccordionContentStyled $isOpen={isOpen}>
              {fieldsForType.length > 0 ? (
                <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
                  <FormTable style={{ minWidth: "800px", width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {fieldsForType.map((field: any) => (
                          <th
                            key={field.name}
                            style={{
                              backgroundColor: "#e0e7ff",
                              padding: "0.5rem",
                              border: `1px solid ${COLORS.border}`,
                              fontSize: "0.875rem",
                              color: COLORS.text.primary,
                              textAlign: "left",
                            }}
                          >
                            {field.required ? (
                              <FormLabelRequired style={{ marginBottom: 0, textTransform: "none" }}>{field.label}</FormLabelRequired>
                            ) : (
                              <FormLabel style={{ marginBottom: 0, textTransform: "none" }}>{field.label}</FormLabel>
                            )}
                          </th>
                        ))}
                        <th
                          style={{
                            backgroundColor: "#e0e7ff",
                            padding: "0.5rem",
                            border: `1px solid ${COLORS.border}`,
                            fontSize: "0.875rem",
                            textAlign: "center",
                            width: "60px",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLines.length > 0 ? (
                        currentLines.map((line: any, lineIndex: number) => (
                          <tr key={lineIndex}>
                            {fieldsForType.map((field: any) => (
                              <FormFieldCell key={field.name}>
                                {renderFieldInput(line, lineIndex, field, typeId)}
                                {getLineError(typeId, lineIndex, field.name).length > 0 && (
                                  <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                                    {getLineError(typeId, lineIndex, field.name).join(", ")}
                                  </div>
                                )}
                              </FormFieldCell>
                            ))}
                            <FormFieldCell style={{ textAlign: "center" }}>
                              <RemoveItem type="button" onClick={() => handleRemoveLine(typeId, lineIndex)} disabled={isSubmitting}>
                                <Trash2 size={16} />
                              </RemoveItem>
                            </FormFieldCell>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={fieldsForType.length + 1}
                            style={{ textAlign: "center", padding: "15px", fontStyle: "italic", color: COLORS.text.secondary }}
                          >
                            Aucune ligne de frais ajoutée. Cliquez sur "Ajouter une ligne" pour commencer.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </FormTable>
                </div>
              ) : (
                <p style={{ padding: "0 10px" }}>Aucun champ de formulaire n'est défini pour ce type de rapport.</p>
              )}

              <FormActions style={{ justifyContent: "flex-start" }}>
                <Button type="button" onClick={() => handleAddLine(typeId, fieldsForType)} disabled={isSubmitting}>
                  <Plus size={16} style={{ marginRight: "8px" }} /> Ajouter une ligne
                </Button>
              </FormActions>
            </AccordionContentStyled>
          </ExpenseTypeContainer>
        );
      })}

      <SectionTitle>
        <Paperclip size={22} />
        Pièces Jointes
      </SectionTitle>

      <AttachmentSection>
        <input type="file" id="file-upload" multiple onChange={handleAttachmentChange} disabled={isSubmitting} style={{ display: "none" }} />
        <UploadButton htmlFor="file-upload">
          <Upload size={18} />
          Joindre des justificatifs
        </UploadButton>

        {totalAttachments > 0 && (
          <AttachmentsList>
            <p style={{ fontWeight: "bold", color: COLORS.text.primary, marginBottom: "1rem" }}>Fichiers joints ({totalAttachments}):</p>

            {existingAttachments.length > 0 && (
              <AttachmentCategory>
                <CategoryTitle>📁 Fichiers existants:</CategoryTitle>
                {existingAttachments.map((file: any, index: number) => (
                  <AttachmentItem key={`existing-${index}`} $isExisting>
                    <FileText size={24} color={COLORS.primary} />
                    <div className="file-info">
                      <div className="file-name">
                        <strong>{file.fileName}</strong>
                        <DraftBadge>draft</DraftBadge>
                      </div>
                      <div className="file-size">{file.fileSize} Ko</div>
                    </div>
                    <div className="actions">
                      <IconButton
                        onClick={() => handleFileView(file.fileContent, file.fileName, setModalContent, setModalOpen, file.fileType)}
                        title="Prévisualiser"
                      >
                        <Eye size={16} />
                      </IconButton>
                      <IconButton onClick={() => handleFileDownload(file.fileContent, file.fileName)} title="Télécharger" $variant="primary">
                        <Download size={16} />
                      </IconButton>
                      <IconButton
                        $variant="danger"
                        onClick={() => {
                          const updatedExisting = existingAttachments.filter((_: any, i: number) => i !== index);
                          setExistingAttachments(updatedExisting);
                        }}
                        disabled={isSubmitting}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </AttachmentItem>
                ))}
              </AttachmentCategory>
            )}

            {attachments.length > 0 && (
              <AttachmentCategory>
                <CategoryTitle>📎 Nouveaux fichiers à joindre:</CategoryTitle>
                {attachments.map((file: any, index: number) => (
                  <AttachmentItem key={`new-${index}`}>
                    <Paperclip size={24} color={COLORS.secondary} />
                    <div className="file-info">
                      <div className="file-name">
                        <strong>{file.fileName}</strong>
                      </div>
                      <div className="file-size">{file.fileSize} Ko</div>
                    </div>
                    <div className="actions">
                      <IconButton
                        onClick={() => handleFileView(file.fileContent, file.fileName, setModalContent, setModalOpen, file.fileType)}
                        title="Prévisualiser"
                      >
                        <Eye size={16} />
                      </IconButton>
                      <IconButton onClick={() => handleFileDownload(file.fileContent, file.fileName)} title="Télécharger" $variant="primary">
                        <Download size={16} />
                      </IconButton>
                      <IconButton $variant="danger" onClick={() => handleRemoveAttachment(index)} disabled={isSubmitting} title="Supprimer">
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </AttachmentItem>
                ))}
              </AttachmentCategory>
            )}
          </AttachmentsList>
        )}

        {fieldErrors.attachments && fieldErrors.attachments.length > 0 && (
          <div style={{ color: COLORS.danger, fontSize: "12px", marginTop: "1rem", textAlign: "center" }}>
            {fieldErrors.attachments.join(", ")}
          </div>
        )}
      </AttachmentSection>

      <FormActions style={{ justifyContent: "center", marginTop: "2rem" }}>
        <Button
          type="button"
          onClick={handleSubmitExpenseReport}
          disabled={isSubmitting || isLoading || Object.keys(expenseLinesByType).length === 0}
          style={{
            background: isSubmitting || isLoading ? COLORS.text.light : COLORS.primary,
            padding: "12px 32px",
            fontSize: "1rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              Soumission en cours...
            </>
          ) : (
            <>
              <Upload size={18} />
              Soumettre le Rapport de Frais
            </>
          )}
        </Button>
      </FormActions>

      <FilePreviewModal isOpen={modalOpen} onClose={() => setModalOpen(false)} content={modalContent} />

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default ExpenseReportStep;