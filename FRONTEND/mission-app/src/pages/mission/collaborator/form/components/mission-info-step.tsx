import { useEffect } from "react";
import {
  FormSectionTitle,
  FormTable,
  FormRow,
  FormFieldCell,
  FormLabel,
  FormLabelRequired,
  FormInput,
  FormTextarea,
  StyledAutoCompleteInput,
  ErrorMessage,
} from "@/styles/form-container";

interface MissionCollaboratorStepProps {
  formData: {
    missionType?: string;
    missionTitle?: string;
    description?: string;
    location?: string;
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
    };
  };
  fieldErrors: { [key: string]: string[] };
  isSubmitting: boolean;
  isLoading: { regions: boolean };
  regionDisplayNames: string[];
  suggestions: {
    beneficiary: { displayName: string }[];
    transport: { type: string }[];
  };
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | { target: { name: string; value: string } },
    section?: string
  ) => void;
  handleAddNewSuggestion: (type: string, value: string) => void;
}

const MissionCollaboratorStep: React.FC<MissionCollaboratorStepProps> = ({
  formData,
  fieldErrors,
  isSubmitting,
  isLoading,
  regionDisplayNames,
  suggestions,
  handleInputChange,
  handleAddNewSuggestion,
}) => {
  // Debug fieldErrors changes to confirm propagation
  useEffect(() => {
    console.log("MissionCollaboratorStep - fieldErrors:", fieldErrors);
  }, [fieldErrors]);

  const isInternational = formData.missionType === "international";

  return (
    <>
      {/* Section Informations de la Mission */}
      <FormSectionTitle>Informations de la Mission</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow>
            <FormFieldCell colSpan={2}>
              <FormLabelRequired>Type de mission</FormLabelRequired>
              <div className="radio-group" style={{ display: "flex", gap: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <FormInput
                    type="radio"
                    name="missionType"
                    value="national"
                    checked={formData.missionType === "national"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
                    disabled={isSubmitting}
                  />
                  National
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <FormInput
                    type="radio"
                    name="missionType"
                    value="international"
                    checked={formData.missionType === "international"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
                    disabled={isSubmitting}
                  />
                  International
                </label>
              </div>
              {fieldErrors.missionType && fieldErrors.missionType.length > 0 && (
                <ErrorMessage>{fieldErrors.missionType.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan={2}>
              <FormLabelRequired>Titre de la mission</FormLabelRequired>
              <FormInput
                type="text"
                name="missionTitle"
                value={formData.missionTitle || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
                placeholder="Saisir le titre de la mission..."
                disabled={isSubmitting}
                className={fieldErrors.missionTitle ? "input-error" : ""}
              />
              {fieldErrors.missionTitle && fieldErrors.missionTitle.length > 0 && (
                <ErrorMessage>{fieldErrors.missionTitle.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan={2}>
              <FormLabel>Description</FormLabel>
              <FormTextarea
                name="description"
                value={formData.description || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(e)}
                placeholder="Saisir une description..."
                disabled={isSubmitting}
                rows={3}
                className={fieldErrors.description ? "input-error" : ""}
              />
              {fieldErrors.description && fieldErrors.description.length > 0 && (
                <ErrorMessage>{fieldErrors.description.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan={2}>
              <FormLabelRequired>Lieu</FormLabelRequired>
              <StyledAutoCompleteInput
                value={formData.location || ""}
                onChange={(value: string) => handleInputChange({ target: { name: "location", value } })}
                suggestions={regionDisplayNames}
                placeholder={isLoading.regions ? "Chargement des lieux..." : "Saisir ou sélectionner un lieu..."}
                disabled={isSubmitting || isLoading.regions}
                onAddNew={() => handleAddNewSuggestion("location", formData.location || "")}
                fieldType="location"
                fieldLabel="lieu"
                addNewRoute="/lieu/create"
                className={fieldErrors.lieuId ? "input-error" : ""}
              />
              {fieldErrors.lieuId && fieldErrors.lieuId.length > 0 && (
                <ErrorMessage>{fieldErrors.lieuId.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>

      {/* Section Détails du Collaborateur */}
      <FormSectionTitle>Détails du Missionaire</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>MISSIONAIRE</FormLabelRequired>
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
                placeholder="Saisir le matricule..."
                disabled={isSubmitting}
                readOnly={true}
                className={fieldErrors["beneficiary.matricule"] ? "input-error" : ""}
              />
              {fieldErrors["beneficiary.matricule"] && fieldErrors["beneficiary.matricule"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.matricule"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Fonction</FormLabelRequired>
              <FormInput
                type="text"
                name="function"
                value={formData.beneficiary.function}
                placeholder="Saisir la fonction..."
                disabled={isSubmitting}
                readOnly={true}
                className={fieldErrors["beneficiary.function"] ? "input-error" : ""}
              />
              {fieldErrors["beneficiary.function"] && fieldErrors["beneficiary.function"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.function"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Site</FormLabelRequired>
              <FormInput
                type="text"
                name="base"
                value={formData.beneficiary.base}
                placeholder="Saisir la base..."
                disabled={isSubmitting}
                readOnly={true}
                className={fieldErrors["beneficiary.base"] ? "input-error" : ""}
              />
              {fieldErrors["beneficiary.base"] && fieldErrors["beneficiary.base"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.base"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Direction</FormLabelRequired>
              <FormInput
                type="text"
                name="direction"
                value={formData.beneficiary.direction}
                placeholder="Saisir la direction..."
                disabled={isSubmitting}
                readOnly={true}
                className={fieldErrors["beneficiary.direction"] ? "input-error" : ""}
              />
              {fieldErrors["beneficiary.direction"] && fieldErrors["beneficiary.direction"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.direction"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Département</FormLabelRequired>
              <FormInput
                type="text"
                name="department"
                value={formData.beneficiary.department}
                placeholder="Saisir le département..."
                disabled={isSubmitting}
                readOnly={true}
                className={fieldErrors["beneficiary.department"] ? "input-error" : ""}
              />
              {fieldErrors["beneficiary.department"] && fieldErrors["beneficiary.department"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.department"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Service</FormLabelRequired>
              <FormInput
                type="text"
                name="service"
                value={formData.beneficiary.service}
                placeholder="Saisir le service..."
                disabled={isSubmitting}
                readOnly={true}
                className={fieldErrors["beneficiary.service"] ? "input-error" : ""}
              />
              {fieldErrors["beneficiary.service"] && fieldErrors["beneficiary.service"].length > 0 && (
                <ErrorMessage>{fieldErrors["beneficiary.service"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormInput
                type="hidden"
                name="costCenter"
                value={formData.beneficiary.costCenter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir le centre de coût..."
                disabled={isSubmitting}
              />

              {!isInternational && (
                <>
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
                </>
              )}
            </FormFieldCell>
          </FormRow>
         
        </tbody>
      </FormTable>
    </>
  );
};

export default MissionCollaboratorStep;