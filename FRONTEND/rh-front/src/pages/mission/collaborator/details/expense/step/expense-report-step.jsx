import { useState, useEffect, useCallback } from "react";
import { Trash2, Plus, ChevronDown, FileText, Paperclip, Upload, Loader2 } from "lucide-react";
import styled from "styled-components";

import {
  FormTable,
  FormActions,
  FormFieldCell,
  FormLabel,
  FormLabelRequired,
  FormInput,
  Button,
  RemoveItem,
} from "styles/generaliser/form-container";

import { CreateExpenseReport, formatExpenseReportForInsertion, GetExpenseReportsByAssignationId } from "services/mission/expense";
import Alert from "components/alert";

const StyledSectionTitle = ({ children, style }) => (
  <h3
    style={{
      fontSize: "var(--font-size-md, 1.1rem)",
      fontWeight: "600",
      color: "var(--color-primary, #1e3a8a)",
      borderBottom: "2px solid var(--color-primary, #1e3a8a)",
      paddingBottom: "var(--spacing-xs, 0.5rem)",
      marginBottom: "var(--spacing-md, 1rem)",
      marginTop: "var(--spacing-lg, 1.5rem)",
      ...style,
    }}
  >
    {children}
  </h3>
);

const StyledExpenseTypeContainer = styled.div`
  margin-bottom: var(--spacing-lg, 1.5rem);
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const AccordionHeader = ({ children, onClick, isOpen }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "var(--spacing-sm, 0.75rem) var(--spacing-md, 1rem)",
      backgroundColor: isOpen ? "var(--color-primary-light, #eff6ff)" : "var(--color-background-subtle, #f9fafb)",
      borderBottom: isOpen ? "1px solid var(--color-primary-dark, #1e3a8a)" : "none",
      cursor: "pointer",
      fontWeight: "600",
      color: isOpen ? "var(--color-primary-dark, #1e3a8a)" : "var(--text-color, #1f2937)",
      userSelect: "none",
      transition: "background-color 0.2s",
    }}
  >
    {children}
    <ChevronDown size={20} style={{ transform: `rotate(${isOpen ? 180 : 0}deg)`, transition: "transform 0.3s" }} />
  </div>
);

const AccordionContent = ({ children, isOpen }) => (
  <div
    style={{
      display: isOpen ? "block" : "none",
      padding: "var(--spacing-md, 1rem)",
      backgroundColor: "white",
    }}
  >
    {children}
  </div>
);

const readFileAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const ExpenseReportStep = ({ formData, fieldErrors, isSubmitting, handleInputChange, expenseReportTypes = [] }) => {
  const userId = JSON.parse(localStorage.getItem("user"))?.userId || null;

  useEffect(() => {
    if (userId && !formData.userId) {
      handleInputChange({ target: { name: "userId", value: userId } });
    }
  }, [userId, formData.userId, handleInputChange]);

  const [openSections, setOpenSections] = useState({});
  const [attachments, setAttachments] = useState(formData.attachments || []);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [hasLoadedReports, setHasLoadedReports] = useState(false);

  const createExpenseReport = CreateExpenseReport();
  const getExpenseReports = GetExpenseReportsByAssignationId();

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "", message: "" });

  const fetchExistingReports = useCallback(async () => {
    if (formData.assignationId && !hasLoadedReports) {
      try {
        setHasLoadedReports(true);
        const response = await getExpenseReports(formData.assignationId);

        if (!response) {
          throw new Error("Réponse API invalide.");
        }

        const { reports, attachments: existingAttachmentsData } = response;

        // Handle reports
        if (reports && Array.isArray(reports) && reports.length > 0) {
          const newExpenseLinesByType = {};
          reports.forEach((report) => {
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

        // Handle existing attachments
        if (existingAttachmentsData && Array.isArray(existingAttachmentsData) && existingAttachmentsData.length > 0) {
          setExistingAttachments(existingAttachmentsData);
        }
      } catch (error) {
        setAlert({
          isOpen: true,
          type: "error",
          message: `Erreur lors de la récupération des rapports : ${error.message}`,
        });
        setHasLoadedReports(false);
      }
    }
  }, [formData.assignationId, hasLoadedReports, getExpenseReports, handleInputChange]);

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

  const toggleSection = (typeId) => {
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

  const handleAddLine = (typeId, fieldsForType) => {
    const fieldsToUse = fieldsForType.length > 0 ? fieldsForType : defaultFields;
    const newLine = fieldsToUse.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {});
    const currentLines = expenseLinesByType[typeId] || [];
    const newLines = [...currentLines, newLine];

    handleInputChange({ target: { name: "expenseLinesByType", value: { ...expenseLinesByType, [typeId]: newLines } } });
    setOpenSections((prev) => ({ ...prev, [typeId]: true }));
  };

  const handleRemoveLine = (typeId, index) => {
    const currentLines = expenseLinesByType[typeId] || [];
    const newLines = currentLines.filter((_, i) => i !== index);

    handleInputChange({ target: { name: "expenseLinesByType", value: { ...expenseLinesByType, [typeId]: newLines } } });
  };

  const handleLineInputChange = (typeId, lineIndex, e) => {
    const { name, value } = e.target;
    const currentLines = expenseLinesByType[typeId] || [];
    const newLines = [...currentLines];
    newLines[lineIndex] = { ...newLines[lineIndex], [name]: value };

    handleInputChange({ target: { name: "expenseLinesByType", value: { ...expenseLinesByType, [typeId]: newLines } } });
  };

  const getLineError = (typeId, lineIndex, fieldName) =>
    fieldErrors[`expenseLinesByType.${typeId}[${lineIndex}].${fieldName}`] || [];

  const renderFieldInput = (line, index, field, typeId) => {
    const commonProps = {
      name: field.name,
      value: line[field.name] || "",
      onChange: (e) => handleLineInputChange(typeId, index, e),
      disabled: isSubmitting,
      className: getLineError(typeId, index, field.name).length > 0 ? "input-error" : "",
      style: { width: "100%", minWidth: field.width ? field.width : "120px" },
    };

    if (field.type === "number") {
      return <FormInput type="number" {...commonProps} min="0" step="0.01" />;
    }

    if (field.type === "select") {
      const options = field.options || [];
      const selectOptions = [
        <option key="default" value="">Sélectionnez un type...</option>,
        ...options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === "CB" ? "Carte Bancaire" : "Espèces"}
          </option>
        )),
      ];
      return (
        <FormInput as="select" {...commonProps}>
          {selectOptions}
        </FormInput>
      );
    }

    return <FormInput type="text" {...commonProps} placeholder={field.placeholder || `Saisir ${field.label.toLowerCase()}...`} />;
  };

  const handleAttachmentChange = async (e) => {
    const files = Array.from(e.target.files);

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

  const handleRemoveAttachment = (index) => {
    const updatedAttachments = attachments.filter((_, i) => i !== index);
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

      const createdIds = await createExpenseReport(formattedData);
      console.log("Rapport de frais créé avec les IDs :", createdIds);
      setAlert({
        isOpen: true,
        type: "success",
        message: "Rapport de frais créé avec succès.",
      });

      // Clear new attachments after successful submission
      setAttachments([]);
      handleInputChange({ target: { name: "attachments", value: [] } });

      // Refresh data to get updated existing attachments
      setHasLoadedReports(false);
    } catch (error) {
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

      <StyledSectionTitle>Récapitulatif des Frais</StyledSectionTitle>

      <FormInput type="hidden" name="assignationId" value={formData.assignationId || ""} onChange={(e) => handleInputChange(e)} />
      <FormInput type="hidden" name="userId" value={formData.userId || ""} onChange={(e) => handleInputChange(e)} />

      {expenseReportTypes.map((type) => {
        const typeId = type.expenseReportTypeId;
        const isOpen = openSections[typeId];
        const fieldsForType = type.fields && type.fields.length > 0 ? type.fields : defaultFields;
        const currentLines = expenseLinesByType[typeId] || [];

        return (
          <StyledExpenseTypeContainer key={typeId}>
            <AccordionHeader onClick={() => toggleSection(typeId)} isOpen={isOpen}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}>
                <FileText size={20} />
                <span>
                  <strong>{type.type}</strong> ({currentLines.length} ligne{currentLines.length > 1 ? "s" : ""})
                </span>
              </div>
            </AccordionHeader>

            <AccordionContent isOpen={isOpen}>
              {fieldsForType.length > 0 ? (
                <div style={{ overflowX: "auto", marginBottom: "var(--spacing-md)" }}>
                  <FormTable style={{ minWidth: "800px", width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {fieldsForType.map((field) => (
                          <th
                            key={field.name}
                            style={{
                              backgroundColor: "var(--color-primary-light, #e0e7ff)",
                              padding: "var(--spacing-xs)",
                              border: "1px solid var(--border-light)",
                              fontSize: "var(--font-size-xs)",
                              color: "var(--text-color-dark, #1f2937)",
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
                            backgroundColor: "var(--color-primary-light, #e0e7ff)",
                            padding: "var(--spacing-xs)",
                            border: "1px solid var(--border-light)",
                            fontSize: "var(--font-size-xs)",
                            color: "var(--text-color-dark, #1f2937)",
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
                        currentLines.map((line, lineIndex) => (
                          <tr key={lineIndex}>
                            {fieldsForType.map((field) => (
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
                            style={{ textAlign: "center", padding: "15px", fontStyle: "italic", color: "var(--text-color-light)" }}
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
                  <Plus size={16} style={{ marginRight: "var(--spacing-xs)" }} /> Ajouter une ligne
                </Button>
              </FormActions>
            </AccordionContent>
          </StyledExpenseTypeContainer>
        );
      })}

      <StyledSectionTitle>
        Pièces Jointes <Paperclip size={18} style={{ marginLeft: "10px", verticalAlign: "middle" }} />
      </StyledSectionTitle>

      <div
        style={{
          padding: "var(--spacing-md)",
          border: "2px dashed var(--color-primary-light)",
          borderRadius: "8px",
          textAlign: "center",
          backgroundColor: "var(--color-background-subtle, #f9fafb)",
        }}
      >
        <input type="file" id="file-upload" multiple onChange={handleAttachmentChange} disabled={isSubmitting} style={{ display: "none" }} />
        <label htmlFor="file-upload">
          <Button
            as="span"
            disabled={isSubmitting}
            style={{ backgroundColor: "var(--color-success, #10b981)", borderColor: "var(--color-success-dark, #059669)", color: "white", cursor: "pointer" }}
          >
            <Upload size={16} style={{ marginRight: "var(--spacing-xs)" }} />
            Joindre des justificatifs
          </Button>
        </label>

        {totalAttachments > 0 && (
          <div style={{ marginTop: "var(--spacing-md)", textAlign: "left", borderTop: "1px solid var(--border-light)", paddingTop: "var(--spacing-md)" }}>
            <p style={{ fontWeight: "bold", color: "var(--text-color-dark)" }}>Fichiers joints ({totalAttachments}):</p>

            {existingAttachments.length > 0 && (
              <>
                <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-color)", marginTop: "var(--spacing-sm)", fontStyle: "italic" }}>
                  Fichiers existants:
                </p>
                <ul style={{ listStyleType: "none", padding: 0, marginBottom: "var(--spacing-md)" }}>
                  {existingAttachments.map((file, index) => (
                    <li
                      key={`existing-${index}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: "1px dotted #ccc",
                        fontSize: "var(--font-size-sm)",
                        backgroundColor: "#f0f9ff",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <Paperclip size={14} color="var(--color-primary)" />
                        <strong>{file.fileName}</strong> ({file.fileSize} Ko)
                        <span style={{ fontSize: "10px", color: "var(--color-primary)", fontStyle: "italic", marginLeft: "8px" }}>(draft)</span>
                      </span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <RemoveItem
                          type="button"
                          onClick={() => {
                            const updatedExisting = existingAttachments.filter((_, i) => i !== index);
                            setExistingAttachments(updatedExisting);
                          }}
                          disabled={isSubmitting}
                        >
                          <Trash2 size={14} />
                        </RemoveItem>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {attachments.length > 0 && (
              <>
                <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-color)", marginTop: "var(--spacing-sm)", fontStyle: "italic" }}>
                  Nouveaux fichiers à joindre:
                </p>
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  {attachments.map((file, index) => (
                    <li
                      key={`new-${index}`}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px dotted #ccc", fontSize: "var(--font-size-sm)" }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <Paperclip size={14} color="var(--color-success)" />
                        <strong>{file.fileName}</strong> ({file.fileSize} Ko)
                      </span>
                      <RemoveItem type="button" onClick={() => handleRemoveAttachment(index)} disabled={isSubmitting} style={{ marginLeft: "10px" }}>
                        <Trash2 size={16} />
                      </RemoveItem>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        {fieldErrors.attachments && fieldErrors.attachments.length > 0 && (
          <div style={{ color: "red", fontSize: "12px", marginTop: "var(--spacing-md)" }}>{fieldErrors.attachments.join(", ")}</div>
        )}
      </div>

      <FormActions style={{ justifyContent: "center", marginTop: "var(--spacing-lg)" }}>
        <Button
          type="button"
          onClick={handleSubmitExpenseReport}
          disabled={isSubmitting || isLoading || Object.keys(expenseLinesByType).length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Soumission en cours...
            </>
          ) : (
            "Soumettre le Rapport de Frais"
          )}
        </Button>
      </FormActions>
    </>
  );
};

export default ExpenseReportStep;