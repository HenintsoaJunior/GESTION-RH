import { useEffect } from "react";
import {
  FormSectionTitle,
  FormTable,
  FormRow,
  FormFieldCell,
  FormLabel,
  FormLabelRequired,
  FormInput,
  StyledAutoCompleteInput,
} from "styles/generaliser/form-container";

const ExpenseReportStep = ({
  formData,
  fieldErrors,
  isSubmitting,
  handleInputChange,
  expenseReportTypes = [], // Fictif: liste des types de rapports de frais
}) => {
  // Debug fieldErrors changes to confirm propagation
  useEffect(() => {
  }, [fieldErrors]);

  // Préparer les suggestions pour le dropdown (affichage du type, valeur = ID)
  const typeSuggestions = expenseReportTypes.map((type) => ({
    value: type.expenseReportTypeId,
    label: type.type,
  }));

  const handleTypeChange = (selectedLabel) => {
    const selectedType = expenseReportTypes.find((t) => t.type === selectedLabel);
    if (selectedType) {
      // Set the expense report type ID
      handleInputChange({
        target: { name: "expenseReportTypeId", value: selectedType.expenseReportTypeId },
      });

      // Auto-fill fields based on the selected type if available
      // Titre (default if provided)
      if (selectedType.defaultTitle !== undefined) {
        handleInputChange({
          target: { name: "titled", value: selectedType.defaultTitle },
        });
      }

      // Description (default if provided)
      if (selectedType.defaultDescription !== undefined) {
        handleInputChange({
          target: { name: "description", value: selectedType.defaultDescription },
        });
      }

      // Type
      if (selectedType.type !== undefined) {
        handleInputChange({
          target: { name: "type", value: selectedType.type },
        });
      }

      // Unité monétaire
      if (selectedType.currencyUnit !== undefined) {
        handleInputChange({
          target: { name: "currencyUnit", value: selectedType.currencyUnit },
        });
      }

      // Montant (default if provided)
      if (selectedType.defaultAmount !== undefined) {
        handleInputChange({
          target: { name: "amount", value: selectedType.defaultAmount },
        });
      }

      // Taux (default if provided)
      if (selectedType.defaultRate !== undefined) {
        handleInputChange({
          target: { name: "rate", value: selectedType.defaultRate },
        });
      }
    }
  };

  return (
    <>
      <FormSectionTitle>Informations du Rapport de Frais</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Titre</FormLabelRequired>
              <FormInput
                type="text"
                name="titled"
                value={formData.titled || ""}
                onChange={(e) => handleInputChange(e)}
                placeholder="Saisir le titre du rapport de frais..."
                disabled={isSubmitting}
                className={fieldErrors.titled ? "input-error" : ""}
              />
              {fieldErrors.titled && fieldErrors.titled.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.titled.join(", ")}
                </div>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabel>Description</FormLabel>
              <FormInput
                type="text"
                name="description"
                value={formData.description || ""}
                onChange={(e) => handleInputChange(e)}
                placeholder="Saisir une description..."
                disabled={isSubmitting}
              />
              {fieldErrors.description && fieldErrors.description.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.description.join(", ")}
                </div>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Type</FormLabelRequired>
              <FormInput
                type="text"
                name="type"
                value={formData.type || ""}
                onChange={(e) => handleInputChange(e)}
                placeholder="Saisir le type..."
                disabled={isSubmitting}
                className={fieldErrors.type ? "input-error" : ""}
              />
              {fieldErrors.type && fieldErrors.type.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.type.join(", ")}
                </div>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Unité monétaire</FormLabelRequired>
              <FormInput
                type="text"
                name="currencyUnit"
                value={formData.currencyUnit || ""}
                onChange={(e) => handleInputChange(e)}
                placeholder="Ex: EUR, USD..."
                disabled={isSubmitting}
                className={fieldErrors.currencyUnit ? "input-error" : ""}
              />
              {fieldErrors.currencyUnit && fieldErrors.currencyUnit.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.currencyUnit.join(", ")}
                </div>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Montant</FormLabelRequired>
              <FormInput
                type="number"
                name="amount"
                value={formData.amount || ""}
                onChange={(e) => handleInputChange(e)}
                placeholder="0.00"
                disabled={isSubmitting}
                className={fieldErrors.amount ? "input-error" : ""}
                min="0"
                step="0.01"
              />
              {fieldErrors.amount && fieldErrors.amount.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.amount.join(", ")}
                </div>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Taux</FormLabelRequired>
              <FormInput
                type="number"
                name="rate"
                value={formData.rate || ""}
                onChange={(e) => handleInputChange(e)}
                placeholder="0.00"
                disabled={isSubmitting}
                className={fieldErrors.rate ? "input-error" : ""}
                min="0"
                step="0.01"
              />
              {fieldErrors.rate && fieldErrors.rate.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.rate.join(", ")}
                </div>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>ID d'Assignation</FormLabelRequired>
              <FormInput
                type="text"
                name="assignationId"
                value={formData.assignationId || ""}
                onChange={(e) => handleInputChange(e)}
                placeholder="Saisir l'ID d'assignation..."
                disabled={isSubmitting}
                className={fieldErrors.assignationId ? "input-error" : ""}
              />
              {fieldErrors.assignationId && fieldErrors.assignationId.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.assignationId.join(", ")}
                </div>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Type de Rapport de Frais</FormLabelRequired>
              <StyledAutoCompleteInput
                value={
                  expenseReportTypes.find((t) => t.expenseReportTypeId === formData.expenseReportTypeId)?.type || ""
                }
                onChange={handleTypeChange}
                suggestions={typeSuggestions.map((s) => s.label)}
                placeholder={isSubmitting ? "En cours de soumission..." : "Sélectionner un type de rapport de frais..."}
                disabled={isSubmitting}
                className={fieldErrors.expenseReportTypeId ? "input-error" : ""}
              />
              {fieldErrors.expenseReportTypeId && fieldErrors.expenseReportTypeId.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.expenseReportTypeId.join(", ")}
                </div>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>ID Utilisateur</FormLabelRequired>
              <FormInput
                type="text"
                name="userId"
                value={formData.userId || ""}
                onChange={(e) => handleInputChange(e)}
                placeholder="Saisir l'ID utilisateur..."
                disabled={isSubmitting}
                className={fieldErrors.userId ? "input-error" : ""}
              />
              {fieldErrors.userId && fieldErrors.userId.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.userId.join(", ")}
                </div>
              )}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>
    </>
  );
};

export default ExpenseReportStep;