/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Trash2, Plus, ChevronDown, FileText, Paperclip, Upload, Loader2, Eye, Download, X, AlertCircle } from "lucide-react";
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
import { useCreateExpenseReport, useExpenseReportsByMissionId } from "@/api/mission/expense_report/services";
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

interface ExpenseReportStepProps {
  formData: any;
  fieldErrors: any;
  isSubmitting: boolean;
  handleInputChange: (e: any) => void;
  expenseReportTypes: any[];
  onSubmitSuccess?: () => void;
  isMissionClosed?: boolean;
}

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleFileView = (fileContent: string, fileName: string, setModalContent: any, setModalOpen: any, fileType?: string) => {
  try {
    const byteCharacters = atob(fileContent);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteArray[i] = byteCharacters.charCodeAt(i);
    const blob = new Blob([byteArray], { type: fileType || "application/octet-stream" });
    const fileUrl = URL.createObjectURL(blob);
    const extension = fileName.split(".").pop()?.toLowerCase();
    setModalContent({ fileName, fileUrl, isBlobUrl: true, extension });
    setModalOpen(true);
  } catch {
    setModalContent({ error: "Impossible de prévisualiser ce fichier" });
    setModalOpen(true);
  }
};

const handleFileDownload = (fileContent: string, fileName: string) => {
  try {
    const byteCharacters = atob(fileContent);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteArray[i] = byteCharacters.charCodeAt(i);
    const blob = new Blob([byteArray]);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
  }
};

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
  useEffect(() => () => {
    if (content.isBlobUrl && content.fileUrl) URL.revokeObjectURL(content.fileUrl);
  }, [content]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{content.fileName || "Prévisualisation"}</ModalTitle>
          <IconButton type="button" onClick={onClose}><X size={20} /></IconButton>
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

const ExpenseReportStep = ({
  formData,
  fieldErrors,
  isSubmitting,
  handleInputChange,
  expenseReportTypes = [],
  onSubmitSuccess,
  isMissionClosed = false
}: ExpenseReportStepProps) => {
  const userId = JSON.parse(localStorage.getItem("user") || "{}")?.userId || null;

  useEffect(() => {
    if (userId && !formData.userId) handleInputChange({ target: { name: "userId", value: userId } });
  }, [userId, formData.userId, handleInputChange]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [attachments, setAttachments] = useState<Attachment[]>(formData.attachments || []);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [hasLoadedReports, setHasLoadedReports] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "error" | "warning" | "info"; message: string }>({
    isOpen: false, type: "info", message: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const { mutateAsync: createExpenseReport } = useCreateExpenseReport();
  const { data: expenseReportsData, refetch: refetchExpenseReports } = useExpenseReportsByMissionId(formData.missionId);
  const { data: currenciesData } = useCurrencies();

  const bases = useMemo(() => currenciesData?.base ? [currenciesData.base] : [], [currenciesData?.base]);
  const currencyCodes = useMemo(() => currenciesData ? [...new Set([...bases, ...Object.keys(currenciesData.rates)])].sort() : [], [currenciesData, bases]);

  const expenseLinesByType = useMemo(() => formData.expenseLinesByType || {}, [formData.expenseLinesByType]);

  const fetchExistingReports = useCallback(async () => {
    if (formData.missionId && !hasLoadedReports && expenseReportsData) {
      try {
        setHasLoadedReports(true);
        const { data } = expenseReportsData;
        if (!data) throw new Error("Réponse API invalide.");
        const { reports = [], attachments: existingAttachmentsData = [] } = data as any;
        if (reports.length > 0) {
          const newExpenseLinesByType: any = {};
          reports.forEach((report: any) => {
            const { expenseReportTypeId: typeId } = report;
            if (!newExpenseLinesByType[typeId]) newExpenseLinesByType[typeId] = [];
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
        if (existingAttachmentsData.length > 0) setExistingAttachments(existingAttachmentsData);
      } catch (error: any) {
        setAlert({ isOpen: true, type: "error", message: `Erreur lors de la récupération des rapports : ${error.message}` });
        setHasLoadedReports(false);
      }
    }
  }, [formData.missionId, hasLoadedReports, expenseReportsData, handleInputChange]);

  useEffect(() => { setHasLoadedReports(false); }, [formData.missionId]);
  useEffect(() => { fetchExistingReports(); }, [fetchExistingReports]);
  useEffect(() => {
    Object.keys(expenseLinesByType).forEach((typeId) => {
      if (expenseLinesByType[typeId]?.length > 0 && !openSections[typeId]) setOpenSections(prev => ({ ...prev, [typeId]: true }));
    });
  }, [expenseLinesByType, openSections]);

  const toggleSection = useCallback((typeId: string) => {
    setOpenSections(prev => ({ ...prev, [typeId]: !prev[typeId] }));
  }, []);

  const defaultFields = useMemo(() => [
    { name: "titled", label: "Titre/Libellé", type: "text", required: true },
    { name: "description", label: "Description (Optionnel)", type: "text", required: false },
    { name: "type", label: "Type", type: "select", required: true, options: ["CB", "ESP"] },
    { name: "currencyUnit", label: "Devise", type: "text", required: true, placeholder: "Ex: EUR", width: "80px" },
    { name: "amount", label: "Montant", type: "number", required: true, width: "100px" },
    { name: "rate", label: "Taux Appliqué", type: "number", required: true, width: "100px" },
  ], []);

  const handleAddLine = useCallback((typeId: string, fieldsForType: any[]) => {
    if (isMissionClosed) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Impossible d'ajouter des lignes : la mission est clôturée."
      });
      return;
    }
    
    const fieldsToUse = fieldsForType.length > 0 ? fieldsForType : defaultFields;
    const newLine = fieldsToUse.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {});
    const currentLines = expenseLinesByType[typeId] || [];
    handleInputChange({ target: { name: "expenseLinesByType", value: { ...expenseLinesByType, [typeId]: [...currentLines, newLine] } } });
    setOpenSections(prev => ({ ...prev, [typeId]: true }));
  }, [expenseLinesByType, handleInputChange, defaultFields, isMissionClosed]);

  const handleRemoveLine = useCallback((typeId: string, index: number) => {
    if (isMissionClosed) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Impossible de modifier les lignes : la mission est clôturée."
      });
      return;
    }
    
    const currentLines = expenseLinesByType[typeId] || [];
    handleInputChange({ target: { name: "expenseLinesByType", value: { ...expenseLinesByType, [typeId]: currentLines.filter((_: any, i: number) => i !== index) } } });
  }, [expenseLinesByType, handleInputChange, isMissionClosed]);

  const handleLineInputChange = useCallback((typeId: string, lineIndex: number, e: any) => {
    if (isMissionClosed) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Impossible de modifier les données : la mission est clôturée."
      });
      return;
    }
    
    const { name, value } = e.target;
    const currentLines = expenseLinesByType[typeId] || [];
    const newLines = [...currentLines];
    newLines[lineIndex] = { ...newLines[lineIndex], [name]: value };
    handleInputChange({ target: { name: "expenseLinesByType", value: { ...expenseLinesByType, [typeId]: newLines } } });
  }, [expenseLinesByType, handleInputChange, isMissionClosed]);

  const getLineError = useCallback((typeId: string, lineIndex: number, fieldName: string) =>
    fieldErrors[`expenseLinesByType.${typeId}[${lineIndex}].${fieldName}`] || [], [fieldErrors]);

  const renderFieldInput = useCallback((line: any, index: number, field: any, typeId: string) => {
    const commonProps = {
      name: field.name,
      value: line[field.name] || "",
      onChange: (e: any) => handleLineInputChange(typeId, index, e),
      disabled: isSubmitting || isMissionClosed,
      className: getLineError(typeId, index, field.name).length > 0 ? "input-error" : "",
      style: { width: "100%", minWidth: field.width || "120px" },
    };
    if (field.name === "currencyUnit") {
      return (
        <FormInput as="select" {...commonProps}>
          <option value="">Sélectionnez une devise...</option>
          {currencyCodes.map((code) => <option key={code} value={code}>{code}</option>)}
        </FormInput>
      );
    }
    if (field.type === "number") return <FormInput type="number" {...commonProps} min="0" step="0.01" />;
    if (field.type === "select") {
      return (
        <FormInput as="select" {...commonProps}>
          <option value="">Sélectionnez un type...</option>
          {field.options?.map((opt: string) => (
            <option key={opt} value={opt}>{opt === "CB" ? "Carte Bancaire" : "Espèces"}</option>
          ))}
        </FormInput>
      );
    }
    return <FormInput type="text" {...commonProps} placeholder={field.placeholder || `Saisir ${field.label.toLowerCase()}...`} />;
  }, [currencyCodes, handleLineInputChange, getLineError, isSubmitting, isMissionClosed]);

  const handleAttachmentChange = useCallback(async (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    if (isMissionClosed) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Impossible d'ajouter des pièces jointes : la mission est clôturée."
      });
      return;
    }
    
    const files = Array.from(('dataTransfer' in e ? e.dataTransfer.files : e.target.files || []) as FileList) as File[];
    if (files.length === 0) return;
    const formattedNewFiles = await Promise.all(files.map(async (file) => ({
      fileName: file.name,
      fileContent: await readFileAsBase64(file),
      fileSize: Math.round(file.size / 1024),
      fileType: file.type || "application/octet-stream",
    })));
    const updatedAttachments = [...attachments, ...formattedNewFiles];
    setAttachments(updatedAttachments);
    handleInputChange({ target: { name: "attachments", value: updatedAttachments } });
    if ('target' in e && e.target instanceof HTMLInputElement) e.target.value = '';
  }, [attachments, handleInputChange, isMissionClosed]);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleAttachmentChange(e);
  }, [handleAttachmentChange]);

  const handleRemoveAttachment = useCallback((index: number) => {
    if (isMissionClosed) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Impossible de supprimer des pièces jointes : la mission est clôturée."
      });
      return;
    }
    
    const updatedAttachments = attachments.filter((_: any, i: number) => i !== index);
    setAttachments(updatedAttachments);
    handleInputChange({ target: { name: "attachments", value: updatedAttachments } });
  }, [attachments, handleInputChange, isMissionClosed]);

  const handleSubmitExpenseReport = useCallback(async () => {
    if (isMissionClosed) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Impossible de soumettre un rapport de frais : la mission est clôturée."
      });
      return;
    }
    
    if (isSubmitting || isLoading) return;
    if (!formData.userId) return setAlert({ isOpen: true, type: "error", message: "Utilisateur non identifié. Veuillez vous reconnecter." });
    if (!formData.missionId) return setAlert({ isOpen: true, type: "error", message: "ID de mission manquant." });
    if (Object.keys(expenseLinesByType).length === 0) return setAlert({ isOpen: true, type: "error", message: "Veuillez ajouter au moins une ligne de frais." });
    
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
        missionId: String(formData.missionId),
        expenseLinesByType: normalizedExpenseLinesByType,
        attachments: [...attachments, ...existingAttachments],
      };
      console.log("dataToSubmit FINAL:", JSON.stringify(dataToSubmit, null, 2));
      const response = await createExpenseReport(dataToSubmit);
      console.log("Rapport de frais créé:", response);
      setAlert({ isOpen: true, type: "success", message: "Rapport de frais créé avec succès." });
      setAttachments([]);
      handleInputChange({ target: { name: "attachments", value: [] } });
      handleInputChange({ target: { name: "expenseLinesByType", value: {} } });
      setHasLoadedReports(false);
      await refetchExpenseReports();
      onSubmitSuccess?.();
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      setAlert({ isOpen: true, type: "error", message: error.message || "Erreur lors de la création du rapport de frais." });
    } finally {
      setIsLoading(false);
    }
  }, [isMissionClosed, isSubmitting, isLoading, formData, expenseLinesByType, attachments, existingAttachments, createExpenseReport, handleInputChange, refetchExpenseReports, onSubmitSuccess]);

  const totalAttachments = existingAttachments.length + attachments.length;

  const uploadAreaStyle = {
    border: dragActive && !isMissionClosed ? "2px dashed var(--primary-color)" : "2px dashed var(--border-color)",
    borderRadius: "8px",
    padding: "1rem",
    textAlign: "center" as const,
    backgroundColor: dragActive && !isMissionClosed ? "var(--primary-light)" : "var(--bg-secondary)",
    transition: "all 0.2s ease",
    marginBottom: "0.5rem",
    cursor: isMissionClosed ? "not-allowed" : "pointer",
    opacity: isMissionClosed ? 0.6 : 1
  };

  const attachmentItemStyle = (isExisting: boolean) => ({
    background: isExisting ? 'var(--info-bg)' : 'var(--success-light)',
    borderLeft: `4px solid ${isExisting ? 'var(--primary-color)' : 'var(--success-color)'}`
  });

  const actionStyle = { display: "flex", gap: "0.5rem" };
  const fileInfoStyle = { flex: 1 };
  const fileSizeStyle = { color: "var(--text-secondary)" };

  if (isMissionClosed) {
    return (
      <div style={{
        padding: "2rem",
        textAlign: "center",
        backgroundColor: "var(--warning-bg)",
        borderRadius: "8px",
        border: "1px solid var(--warning-color)",
        marginBottom: "2rem"
      }}>
        <AlertCircle size={48} color="var(--warning-color)" style={{ marginBottom: "1rem" }} />
        <h3 style={{ color: "var(--warning-color)", marginBottom: "0.5rem" }}>
          Mission Clôturée
        </h3>
        <p style={{ color: "var(--text-color)", marginBottom: "0.5rem" }}>
          Cette mission est clôturée. La soumission de nouveaux rapports de frais n'est plus possible.
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Vous pouvez consulter les rapports existants en basculant sur la vue "Liste des Notes".
        </p>
      </div>
    );
  }

  return (
    <>
      <Alert type={alert.type} message={alert.message} isOpen={alert.isOpen} onClose={() => setAlert({ ...alert, isOpen: false })} />
      <FormInput type="hidden" name="missionId" value={formData.missionId || ""} onChange={handleInputChange} />
      <FormInput type="hidden" name="userId" value={formData.userId || ""} onChange={handleInputChange} />
      {expenseReportTypes.map((type: any) => {
        const typeId = type.expenseReportTypeId;
        const isOpen = openSections[typeId];
        const fieldsForType = type.fields?.length > 0 ? type.fields : defaultFields;
        const currentLines = expenseLinesByType[typeId] || [];
        return (
          <ExpenseTypeContainer key={typeId}>
            <AccordionHeaderStyled type="button" onClick={() => toggleSection(typeId)} $isOpen={isOpen}>
              <FileText size={20} />
              <span><strong>{type.type}</strong> ({currentLines.length} ligne{currentLines.length > 1 ? "s" : ""})</span>
              <ChevronDown className="chevron" size={20} />
            </AccordionHeaderStyled>
            <AccordionContentStyled $isOpen={isOpen}>
              {fieldsForType.length > 0 ? (
                <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
                  <FormTable style={{ minWidth: "800px", width: "100%", borderCollapse: "collapse", border: "1px solid var(--border-color)" }}>
                    <thead>
                      <tr>
                        {fieldsForType.map((field: any) => (
                          <th key={field.name} style={{ backgroundColor: "var(--primary-light)", padding: "0.75rem", border: "1px solid var(--border-color)", fontSize: "0.875rem", color: "var(--text-color)", textAlign: "left" as const }}>
                            {field.required ? <FormLabelRequired style={{ marginBottom: 0, textTransform: "none" }}>{field.label}</FormLabelRequired> : <FormLabel style={{ marginBottom: 0, textTransform: "none" }}>{field.label}</FormLabel>}
                          </th>
                        ))}
                        <th style={{ backgroundColor: "var(--primary-light)", padding: "0.75rem", border: "1px solid var(--border-color)", fontSize: "0.875rem", textAlign: "center" as const, width: "80px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLines.length > 0 ? (
                        currentLines.map((line: any, lineIndex: number) => (
                          <tr key={lineIndex} style={{ backgroundColor: lineIndex % 2 === 0 ? "var(--bg-secondary)" : "var(--bg-primary)" }}>
                            {fieldsForType.map((field: any) => (
                              <FormFieldCell key={field.name} style={{ padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                                {renderFieldInput(line, lineIndex, field, typeId)}
                                {getLineError(typeId, lineIndex, field.name).length > 0 && (
                                  <div style={{ color: "var(--danger-color)", fontSize: "12px", marginTop: "4px" }}>{getLineError(typeId, lineIndex, field.name).join(", ")}</div>
                                )}
                              </FormFieldCell>
                            ))}
                            <FormFieldCell style={{ textAlign: "center" as const, padding: "0.75rem", border: "1px solid var(--border-color)" }}>
                              <RemoveItem 
                                type="button" 
                                onClick={() => handleRemoveLine(typeId, lineIndex)} 
                                disabled={isSubmitting}
                                title={isMissionClosed ? "Mission clôturée - Action désactivée" : "Supprimer cette ligne"}
                              >
                                <Trash2 size={16} />
                              </RemoveItem>
                            </FormFieldCell>
                          </tr>
                        ))
                      ) : (
                        <tr style={{ backgroundColor: "var(--info-bg)" }}>
                          <td colSpan={fieldsForType.length + 1} style={{ textAlign: "center" as const, padding: "1.5rem", fontStyle: "italic" as const, color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}>
                            <Button 
                              type="button" 
                              onClick={() => handleAddLine(typeId, fieldsForType)} 
                              disabled={isSubmitting}
                              style={{ 
                                background: isMissionClosed ? 'var(--text-light)' : "var(--primary-color)", 
                                color: "var(--text-white)", 
                                padding: "8px 16px", 
                                borderRadius: "4px", 
                                fontSize: "0.875rem",
                                cursor: isMissionClosed ? 'not-allowed' : 'pointer'
                              }}
                              title={isMissionClosed ? "Mission clôturée - Action désactivée" : "Ajouter la première ligne de frais"}
                            >
                              <Plus size={14} style={{ marginRight: "4px" }} /> Ajouter la première ligne de frais
                            </Button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </FormTable>
                </div>
              ) : (
                <div style={{ padding: "1rem", textAlign: "center" as const, color: "var(--text-secondary)" }}>
                  <p>Aucun champ de formulaire n'est défini pour ce type de rapport.</p>
                  <Button 
                    type="button" 
                    onClick={() => handleAddLine(typeId, defaultFields)} 
                    disabled={isSubmitting || isMissionClosed}
                    title={isMissionClosed ? "Mission clôturée - Action désactivée" : "Ajouter une ligne avec champs par défaut"}
                  >
                    Ajouter une ligne avec champs par défaut
                  </Button>
                </div>
              )}
              <FormActions style={{ justifyContent: "flex-start" as const }}>
                <Button 
                  type="button" 
                  onClick={() => handleAddLine(typeId, fieldsForType)} 
                  disabled={isSubmitting || isMissionClosed}
                  style={isMissionClosed ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  title={isMissionClosed ? "Mission clôturée - Action désactivée" : "Ajouter une ligne"}
                >
                  <Plus size={16} style={{ marginRight: "8px" }} /> Ajouter une ligne
                </Button>
              </FormActions>
            </AccordionContentStyled>
          </ExpenseTypeContainer>
        );
      })}
      <Separator />
      <AttachmentSection>
        <div
          style={uploadAreaStyle}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isMissionClosed && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => !isMissionClosed && (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
          title={isMissionClosed ? "Mission clôturée - Téléversement désactivé" : "Glissez-déposez ou cliquez pour ajouter des fichiers"}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleAttachmentChange}
            disabled={isSubmitting || isMissionClosed}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
            style={{ display: "none" }}
          />
          <Upload size={32} style={{ color: isMissionClosed ? "var(--text-secondary)" : "var(--primary-color)", marginBottom: "0.5rem" }} />
          <p style={{ fontSize: "0.875rem", color: isMissionClosed ? "var(--text-secondary)" : "var(--text-color)", marginBottom: "0.25rem" }}>
            Glissez-déposez vos justificatifs ici
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
            ou cliquez pour parcourir vos fichiers (PDF, images, documents)
          </p>
          {isMissionClosed && (
            <p style={{ color: "var(--warning-color)", fontSize: "0.75rem", fontWeight: "bold" }}>
              Mission clôturée - Téléversement désactivé
            </p>
          )}
          {isSubmitting && !isMissionClosed && <p style={{ color: "var(--danger-color)", fontSize: "0.625rem" }}>Téléversement désactivé pendant la soumission</p>}
        </div>
        {totalAttachments > 0 && (
          <AttachmentsList>
            <p style={{ fontWeight: "bold", color: "var(--text-color)", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Pièces jointes ({totalAttachments})</p>
            {existingAttachments.length > 0 && (
              <AttachmentCategory>
                <CategoryTitle style={{ fontSize: "0.875rem" }}>📎 Pièces jointes existantes</CategoryTitle>
                {existingAttachments.map((file: Attachment, index: number) => (
                  <AttachmentItem key={`existing-${index}`} style={attachmentItemStyle(true)}>
                    <FileText size={20} color="var(--primary-color)" />
                    <div style={fileInfoStyle}>
                      <div className="file-name">
                        <strong style={{ fontSize: "0.875rem" }}>{file.fileName}</strong>
                        <DraftBadge style={{ fontSize: "0.625rem", padding: "1px 4px" }}>Brouillon</DraftBadge>
                      </div>
                      <div className="file-size" style={{ ...fileSizeStyle, fontSize: "0.75rem" }}>{file.fileSize} Ko • {file.fileType.split('/')[1]?.toUpperCase() || 'Fichier'}</div>
                    </div>
                    <div style={actionStyle}>
                      <IconButton type="button" onClick={() => handleFileView(file.fileContent, file.fileName, setModalContent, setModalOpen, file.fileType)} title="Prévisualiser" style={{ background: "var(--bg-secondary)" }}><Eye size={14} /></IconButton>
                      <IconButton type="button" onClick={() => handleFileDownload(file.fileContent, file.fileName)} title="Télécharger" $variant="primary"><Download size={14} /></IconButton>
                      <IconButton 
                        type="button" 
                        onClick={() => setExistingAttachments(prev => prev.filter((_: Attachment, i: number) => i !== index))} 
                        disabled={isSubmitting || isMissionClosed}
                        title={isMissionClosed ? "Mission clôturée - Action désactivée" : "Supprimer"}
                        style={{ background: isMissionClosed ? 'var(--text-light)' : 'var(--danger-color)', color: 'var(--text-white)' }}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </AttachmentItem>
                ))}
              </AttachmentCategory>
            )}
            {attachments.length > 0 && (
              <AttachmentCategory>
                <CategoryTitle style={{ fontSize: "0.875rem" }}>📎 Nouveaux justificatifs à joindre</CategoryTitle>
                {attachments.map((file: Attachment, index: number) => (
                  <AttachmentItem key={`new-${index}`} style={attachmentItemStyle(false)}>
                    <Paperclip size={20} color="var(--success-color)" />
                    <div style={fileInfoStyle}>
                      <div className="file-name"><strong style={{ fontSize: "0.875rem" }}>{file.fileName}</strong></div>
                      <div className="file-size" style={{ ...fileSizeStyle, fontSize: "0.75rem" }}>{file.fileSize} Ko • {file.fileType.split('/')[1]?.toUpperCase() || 'Fichier'}</div>
                    </div>
                    <div style={actionStyle}>
                      <IconButton type="button" onClick={() => handleFileView(file.fileContent, file.fileName, setModalContent, setModalOpen, file.fileType)} title="Prévisualiser" style={{ background: "var(--bg-secondary)" }}><Eye size={14} /></IconButton>
                      <IconButton type="button" onClick={() => handleFileDownload(file.fileContent, file.fileName)} title="Télécharger" $variant="primary"><Download size={14} /></IconButton>
                      <IconButton 
                        type="button" 
                        onClick={() => handleRemoveAttachment(index)} 
                        disabled={isSubmitting || isMissionClosed}
                        title={isMissionClosed ? "Mission clôturée - Action désactivée" : "Supprimer"}
                        style={{ background: isMissionClosed ? 'var(--text-light)' : 'var(--danger-color)', color: 'var(--text-white)' }}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </AttachmentItem>
                ))}
              </AttachmentCategory>
            )}
          </AttachmentsList>
        )}
        {fieldErrors.attachments?.length > 0 && (
          <div style={{ color: "var(--danger-color)", fontSize: "10px", marginTop: "0.5rem", textAlign: "center" as const }}>
            {fieldErrors.attachments.join(", ")}
          </div>
        )}
      </AttachmentSection>
      <FormActions style={{ justifyContent: "center" as const, marginTop: "2rem" }}>
        <Button
          type="button"
          onClick={handleSubmitExpenseReport}
          disabled={isSubmitting || isLoading || Object.keys(expenseLinesByType).length === 0 || isMissionClosed}
          style={{
            background: isSubmitting || isLoading || isMissionClosed ? 'var(--text-light)' : 'var(--primary-color)',
            padding: "12px 32px",
            fontSize: "1rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: isMissionClosed ? 'not-allowed' : 'pointer'
          }}
          title={isMissionClosed ? "Mission clôturée - Soumission désactivée" : "Soumettre le rapport de frais"}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> 
              Soumission en cours...
            </>
          ) : isMissionClosed ? (
            <>
              <AlertCircle size={18} /> 
              Mission Clôturée
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
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .file-info { display: flex; flex-direction: column; justify-content: center; }
        .actions { align-items: center; }
      `}</style>
    </>
  );
};

export default ExpenseReportStep;