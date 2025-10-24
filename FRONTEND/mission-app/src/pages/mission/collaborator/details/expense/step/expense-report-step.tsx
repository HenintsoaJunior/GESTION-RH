/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { Trash2, Plus, ChevronDown, FileText, Paperclip, Upload, Loader2, Eye, Download, X } from "lucide-react";

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
import { useCurrencies } from "@/api/currency/services";
import Alert from "@/components/alert";

import {
  ExpenseTypeContainer,
  AccordionHeaderStyled,
  AccordionContentStyled,
  AttachmentSection,
  AttachmentsList,
  AttachmentCategory,
  CategoryTitle,
  AttachmentItem,
  IconButton,
  DraftBadge,
  UploadButton,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  FilePreview,
  ImagePreview,
  ErrorMessage,
  Separator
} from "@/styles/detailsmission-styles";

interface Attachment {
  fileName: string;
  fileContent: string;
  fileSize: number;
  fileType: string;
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
          <IconButton type="button" onClick={onClose}>
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
interface ExpenseReportStepProps {
  formData: any;
  fieldErrors: any;
  isSubmitting: boolean;
  handleInputChange: (e: any) => void;
  expenseReportTypes: any[];
  onSubmitSuccess?: () => void;
}

const ExpenseReportStep = ({ 
  formData, 
  fieldErrors, 
  isSubmitting, 
  handleInputChange, 
  expenseReportTypes = [], 
  onSubmitSuccess 
}: ExpenseReportStepProps) => {
  const userId = JSON.parse(localStorage.getItem("user") || "{}")?.userId || null;

  useEffect(() => {
    if (userId && !formData.userId) {
      handleInputChange({ target: { name: "userId", value: userId } });
    }
  }, [userId, formData.userId, handleInputChange]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [attachments, setAttachments] = useState<Attachment[]>(formData.attachments || []);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [hasLoadedReports, setHasLoadedReports] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<any>({});

  const { mutateAsync: createExpenseReport } = useCreateExpenseReport();
  const { data: expenseReportsData, refetch: refetchExpenseReports } = useExpenseReportsByAssignationId(formData.assignationId);
  const { data: currenciesData } = useCurrencies();

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "error" | "warning" | "info"; message: string }>({ 
    isOpen: false, 
    type: "info", 
    message: "" 
  });

  const bases = currenciesData?.base ? [currenciesData.base] : [];
  const currencyCodes = currenciesData ? [...new Set([...bases, ...Object.keys(currenciesData.rates)])].sort() : [];

  const fetchExistingReports = useCallback(async () => {
    if (formData.assignationId && !hasLoadedReports && expenseReportsData) {
      try {
        setHasLoadedReports(true);
        
        const responseData = expenseReportsData.data;

        if (!responseData) {
          throw new Error("Réponse API invalide.");
        }

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
          setExistingAttachments(existingAttachmentsData as Attachment[]);
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
    console.log('Opening typeId:', typeId);
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
    
    let processedValue = value;
    if (name === 'amount' || name === 'rate') {
      processedValue = value;
    }
    
    newLines[lineIndex] = { ...newLines[lineIndex], [name]: processedValue };

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

    if (field.name === "currencyUnit") {
      return (
        <FormInput as="select" {...commonProps}>
          <option value="">Sélectionnez une devise...</option>
          {currencyCodes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </FormInput>
      );
    }

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

    if (!formData.userId) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Utilisateur non identifié. Veuillez vous reconnecter.",
      });
      return;
    }

    if (!formData.assignationId) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "ID d'assignation manquant.",
      });
      return;
    }

    if (Object.keys(expenseLinesByType).length === 0) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Veuillez ajouter au moins une ligne de frais.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const normalizedExpenseLinesByType: Record<string, any[]> = {};
      Object.entries(formData.expenseLinesByType).forEach(([typeId, lines]) => {
        normalizedExpenseLinesByType[typeId] = (lines as any[]).map(line => ({
          ...line,
          amount: typeof line.amount === 'string' ? parseFloat(line.amount) : line.amount,
          rate: typeof line.rate === 'string' ? parseFloat(line.rate) : line.rate,
        }));
      });
      
      const dataToSubmit = {
        userId: String(formData.userId),
        assignationId: String(formData.assignationId),
        expenseLinesByType: normalizedExpenseLinesByType,
        attachments: [...attachments, ...existingAttachments],
      };

      console.log("dataToSubmit FINAL:", JSON.stringify(dataToSubmit, null, 2));

      const response = await createExpenseReport(dataToSubmit);
      
      console.log("Rapport de frais créé:", response);
      
      setAlert({
        isOpen: true,
        type: "success",
        message: "Rapport de frais créé avec succès.",
      });

      setAttachments([]);
      handleInputChange({ target: { name: "attachments", value: [] } });
      handleInputChange({ target: { name: "expenseLinesByType", value: {} } });
      
      setHasLoadedReports(false);
      await refetchExpenseReports();

      // Appel du callback parent pour basculer vers la vue liste
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
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

      <FormInput type="hidden" name="assignationId" value={formData.assignationId || ""} onChange={handleInputChange} />
      <FormInput type="hidden" name="userId" value={formData.userId || ""} onChange={handleInputChange} />

      {expenseReportTypes.map((type: any) => {
        const typeId = type.expenseReportTypeId;
        const isOpen = openSections[typeId];
        const fieldsForType = type.fields && type.fields.length > 0 ? type.fields : defaultFields;
        const currentLines = expenseLinesByType[typeId] || [];

        return (
          <ExpenseTypeContainer key={typeId}>
            <AccordionHeaderStyled type="button" onClick={() => toggleSection(typeId)} $isOpen={isOpen}>
              <FileText size={20} />
              <span>
                <strong>{type.type}</strong> ({currentLines.length} ligne{currentLines.length > 1 ? "s" : ""})
              </span>
              <ChevronDown className="chevron" size={20} />
            </AccordionHeaderStyled>

            <AccordionContentStyled $isOpen={isOpen}>
              {fieldsForType.length > 0 ? (
                <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
                  <FormTable 
                    style={{ 
                      minWidth: "800px", 
                      width: "100%", 
                      borderCollapse: "collapse",
                      border: "1px solid var(--border-color)"
                    }}
                  >
                    <thead>
                      <tr>
                        {fieldsForType.map((field: any) => (
                          <th
                            key={field.name}
                            style={{
                              backgroundColor: "var(--primary-light)",
                              padding: "0.75rem",
                              border: "1px solid var(--border-color)",
                              fontSize: "0.875rem",
                              color: "var(--text-color)",
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
                            backgroundColor: "var(--primary-light)",
                            padding: "0.75rem",
                            border: "1px solid var(--border-color)",
                            fontSize: "0.875rem",
                            textAlign: "center",
                            width: "80px",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLines.length > 0 ? (
                        currentLines.map((line: any, lineIndex: number) => (
                          <tr 
                            key={lineIndex} 
                            style={{ 
                              backgroundColor: lineIndex % 2 === 0 ? "var(--bg-secondary)" : "var(--bg-primary)"
                            }}
                          >
                            {fieldsForType.map((field: any) => (
                              <FormFieldCell key={field.name} style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                                {renderFieldInput(line, lineIndex, field, typeId)}
                                {getLineError(typeId, lineIndex, field.name).length > 0 && (
                                  <div style={{ color: "var(--danger-color)", fontSize: "12px", marginTop: "4px" }}>
                                    {getLineError(typeId, lineIndex, field.name).join(", ")}
                                  </div>
                                )}
                              </FormFieldCell>
                            ))}
                            <FormFieldCell style={{ textAlign: "center", padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                              <RemoveItem type="button" onClick={() => handleRemoveLine(typeId, lineIndex)} disabled={isSubmitting}>
                                <Trash2 size={16} />
                              </RemoveItem>
                            </FormFieldCell>
                          </tr>
                        ))
                      ) : (
                        <tr style={{ backgroundColor: "var(--info-bg)" }}>
                          <td 
                            colSpan={fieldsForType.length + 1} 
                            style={{ 
                              textAlign: "center", 
                              padding: "1.5rem", 
                              fontStyle: "italic", 
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border-color)"
                            }}
                          >
                            <Button 
                              type="button" 
                              onClick={() => handleAddLine(typeId, fieldsForType)} 
                              disabled={isSubmitting}
                              style={{ 
                                background: "var(--primary-color)", 
                                color: "var(--text-white)", 
                                padding: "8px 16px", 
                                borderRadius: "4px",
                                fontSize: "0.875rem"
                              }}
                            >
                              <Plus size={14} style={{ marginRight: "4px" }} /> 
                              Ajouter la première ligne de frais
                            </Button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </FormTable>
                </div>
              ) : (
                <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-secondary)" }}>
                  <p>Aucun champ de formulaire n'est défini pour ce type de rapport.</p>
                  <Button type="button" onClick={() => handleAddLine(typeId, defaultFields)} disabled={isSubmitting}>
                    Ajouter une ligne avec champs par défaut
                  </Button>
                </div>
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

      <Separator />

      <AttachmentSection>
        <input type="file" id="file-upload" multiple onChange={handleAttachmentChange} disabled={isSubmitting} style={{ display: "none" }} />
        <UploadButton htmlFor="file-upload">
          <Upload size={18} />
          Joindre des justificatifs
        </UploadButton>

        {totalAttachments > 0 && (
          <AttachmentsList>
            <p style={{ fontWeight: "bold", color: "var(--text-color)", marginBottom: "1rem" }}>Fichiers joints ({totalAttachments}):</p>

            {existingAttachments.length > 0 && (
              <AttachmentCategory>
                <CategoryTitle>📁 Fichiers existants:</CategoryTitle>
                {existingAttachments.map((file: Attachment, index: number) => (
                  <AttachmentItem key={`existing-${index}`} style={{ background: 'var(--info-bg)' }}>
                    <FileText size={24} color="var(--primary-color)" />
                    <div className="file-info">
                      <div className="file-name">
                        <strong>{file.fileName}</strong>
                        <DraftBadge>draft</DraftBadge>
                      </div>
                      <div className="file-size">{file.fileSize} Ko</div>
                    </div>
                    <div className="actions">
                      <IconButton
                        type="button"
                        onClick={() => handleFileView(file.fileContent, file.fileName, setModalContent, setModalOpen, file.fileType)}
                        title="Prévisualiser"
                      >
                        <Eye size={16} />
                      </IconButton>
                      <IconButton 
                        type="button"
                        onClick={() => handleFileDownload(file.fileContent, file.fileName)} 
                        title="Télécharger" 
                        $variant="primary"
                      >
                        <Download size={16} />
                      </IconButton>
                      <IconButton
                        type="button"
                        onClick={() => {
                          const updatedExisting = existingAttachments.filter((_: Attachment, i: number) => i !== index);
                          setExistingAttachments(updatedExisting);
                          const updatedAttachments = attachments.filter((att: Attachment) => 
                            !existingAttachments.some((ex: Attachment, exIdx: number) => exIdx === index && att.fileName === ex.fileName && att.fileContent === ex.fileContent)
                          );
                          setAttachments(updatedAttachments);
                          handleInputChange({ target: { name: "attachments", value: updatedAttachments } });
                        }}
                        disabled={isSubmitting}
                        title="Supprimer"
                        style={{ background: 'var(--danger-color)', color: 'var(--text-white)' }}
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
                {attachments.map((file: Attachment, index: number) => (
                  <AttachmentItem key={`new-${index}`}>
                    <Paperclip size={24} color="var(--success-color)" />
                    <div className="file-info">
                      <div className="file-name">
                        <strong>{file.fileName}</strong>
                      </div>
                      <div className="file-size">{file.fileSize} Ko</div>
                    </div>
                    <div className="actions">
                      <IconButton
                        type="button"
                        onClick={() => handleFileView(file.fileContent, file.fileName, setModalContent, setModalOpen, file.fileType)}
                        title="Prévisualiser"
                      >
                        <Eye size={16} />
                      </IconButton>
                      <IconButton 
                        type="button"
                        onClick={() => handleFileDownload(file.fileContent, file.fileName)} 
                        title="Télécharger" 
                        $variant="primary"
                      >
                        <Download size={16} />
                      </IconButton>
                      <IconButton 
                        type="button"
                        onClick={() => handleRemoveAttachment(index)} 
                        disabled={isSubmitting} 
                        title="Supprimer"
                        style={{ background: 'var(--danger-color)', color: 'var(--text-white)' }}
                      >
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
          <div style={{ color: "var(--danger-color)", fontSize: "12px", marginTop: "1rem", textAlign: "center" }}>
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
            background: isSubmitting || isLoading ? 'var(--text-light)' : 'var(--primary-color)',
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