import { FormSectionTitle, FormTable, FormRow, FormFieldCell, FormLabel, FormLabelRequired, FormInput, StyledAutoCompleteInput, ErrorMessage } from "@/styles/form-container";
import React from "react";

interface CollaboratorStepProps {
  formData: {
    beneficiary: {
      beneficiary: string;
      matricule: string;
      function: string;
      base: string;
      direction: string;
      department: string;
      service: string;
      costCenter: string;
      transport: string;
      departureDate: string;
      departureTime: string;
      returnDate: string;
      returnTime: string;
      missionDuration: number | string;
    };
  };
  fieldErrors: { [key: string]: string[] };
  isSubmitting: boolean;
  suggestions: {
    beneficiary: { displayName: string }[];
    transport: { type: string }[];
  };
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } },
    section: string
  ) => void;
  handleAddNewSuggestion: (type: string, value: string) => void;
}

const CollaboratorStep: React.FC<CollaboratorStepProps> = ({
  formData,
  fieldErrors,
  isSubmitting,
  suggestions,
  handleInputChange,
  handleAddNewSuggestion,
}) => {
  const isBeneficiarySelected = !!formData.beneficiary.beneficiary;
  const isReadOnly = isSubmitting || isBeneficiarySelected;

  return (
    <>
      <FormSectionTitle>Détails du Collaborateur</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Bénéficiaire</FormLabelRequired>
              <StyledAutoCompleteInput
                value={formData.beneficiary.beneficiary}
                onChange={(value: string) => handleInputChange({ target: { name: "beneficiary", value } }, "beneficiary")}
                suggestions={suggestions.beneficiary.map((b) => b.displayName)}
                placeholder={suggestions.beneficiary.length === 0 ? "Aucun employé disponible" : "Saisir ou sélectionner..."}
                disabled={isSubmitting}
                showAddOption={false}
                fieldType="beneficiary"
                fieldLabel="bénéficiaire"
                addNewRoute="/employee/employee-form"
                className={fieldErrors["beneficiary.beneficiary"] ? "error" : ""}
              />
              {fieldErrors["beneficiary.beneficiary"] && fieldErrors["beneficiary.beneficiary"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.beneficiary"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Matricule</FormLabelRequired>
              <FormInput
                type="text"
                name="matricule"
                value={formData.beneficiary.matricule}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir le matricule..."
                disabled={isSubmitting || isBeneficiarySelected}
                readOnly={isBeneficiarySelected}
              />
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Fonction</FormLabelRequired>
              <FormInput
                type="text"
                name="function"
                value={formData.beneficiary.function}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir la fonction..."
                disabled={isReadOnly}
                readOnly={isBeneficiarySelected}
              />
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Site</FormLabelRequired>
              <FormInput
                type="text"
                name="base"
                value={formData.beneficiary.base}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir la base..."
                disabled={isReadOnly}
                readOnly={isBeneficiarySelected}
              />
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Direction</FormLabelRequired>
              <FormInput
                type="text"
                name="direction"
                value={formData.beneficiary.direction}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir la direction..."
                disabled={isReadOnly}
                readOnly={isBeneficiarySelected}
              />
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Département</FormLabelRequired>
              <FormInput
                type="text"
                name="department"
                value={formData.beneficiary.department}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir le département..."
                disabled={isReadOnly}
                readOnly={isBeneficiarySelected}
              />
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Service</FormLabelRequired>
              <FormInput
                type="text"
                name="service"
                value={formData.beneficiary.service}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir le service..."
                disabled={isReadOnly}
                readOnly={isBeneficiarySelected}
              />
            </FormFieldCell>
            <FormFieldCell>
              <FormLabel>Centre de coût</FormLabel>
              <FormInput
                type="text"
                name="costCenter"
                value={formData.beneficiary.costCenter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir le centre de coût..."
                disabled={isSubmitting}
              />
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabel>Moyen de transport</FormLabel>
              <StyledAutoCompleteInput
                value={formData.beneficiary.transport}
                onChange={(value: string) => handleInputChange({ target: { name: "transport", value } }, "beneficiary")}
                suggestions={suggestions.transport.map((t) => t.type)}
                placeholder={suggestions.transport.length === 0 ? "Aucun moyen de transport disponible" : "Saisir ou sélectionner un moyen de transport..."}
                disabled={isSubmitting}
                onAddNew={() => handleAddNewSuggestion("transport", formData.beneficiary.transport)}
                fieldType="transport"
                fieldLabel="moyen de transport"
                addNewRoute="/transport/create"
                className={fieldErrors["beneficiary.transport"] ? "error" : ""}
              />
              {fieldErrors["beneficiary.transport"] && fieldErrors["beneficiary.transport"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.transport"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Date de départ</FormLabelRequired>
              <FormInput
                type="date"
                name="departureDate"
                value={formData.beneficiary.departureDate || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "beneficiary")}
                className={fieldErrors["beneficiary.departureDate"] ? "input-error" : ""}
                disabled={isSubmitting}
              />
              {fieldErrors["beneficiary.departureDate"] && fieldErrors["beneficiary.departureDate"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.departureDate"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Heure de départ</FormLabelRequired>
              <FormInput
                type="time"
                name="departureTime"
                value={formData.beneficiary.departureTime || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "beneficiary")}
                className={fieldErrors["beneficiary.departureTime"] ? "input-error" : ""}
                disabled={isSubmitting}
              />
              {fieldErrors["beneficiary.departureTime"] && fieldErrors["beneficiary.departureTime"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.departureTime"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Date de retour</FormLabelRequired>
              <FormInput
                type="date"
                name="returnDate"
                value={formData.beneficiary.returnDate || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "beneficiary")}
                className={fieldErrors["beneficiary.returnDate"] ? "input-error" : ""}
                disabled={isSubmitting}
              />
              {fieldErrors["beneficiary.returnDate"] && fieldErrors["beneficiary.returnDate"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.returnDate"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan={2}>
              <FormLabelRequired>Durée prévue de la mission</FormLabelRequired>
              <FormInput
                type="number"
                name="missionDuration"
                value={formData.beneficiary.missionDuration}
                className={fieldErrors["beneficiary.missionDuration"] ? "input-error" : ""}
                disabled={isSubmitting}
                readOnly
              />
              {fieldErrors["beneficiary.missionDuration"] && fieldErrors["beneficiary.missionDuration"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.missionDuration"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan={2}>
              <FormLabelRequired>Heure de retour</FormLabelRequired>
              <FormInput
                type="time"
                name="returnTime"
                value={formData.beneficiary.returnTime || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "beneficiary")}
                className={fieldErrors["beneficiary.returnTime"] ? "input-error" : ""}
                disabled={isSubmitting}
              />
              {fieldErrors["beneficiary.returnTime"] && fieldErrors["beneficiary.returnTime"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.returnTime"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>
    </>
  );
};

export default CollaboratorStep;