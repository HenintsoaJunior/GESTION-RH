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
  ErrorMessage,
} from "@/styles/form-container";

interface MissionInfoStepProps {
  formData: {
    missionType?: string;
    missionTitle?: string;
    description?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
  };
  fieldErrors: { [key: string]: string[] };
  isSubmitting: boolean;
  isLoading: { regions: boolean };
  regionDisplayNames: string[];
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }
  ) => void;
  handleAddNewSuggestion: (type: string, value: string) => void;
}

const MissionInfoStep: React.FC<MissionInfoStepProps> = ({
  formData,
  fieldErrors,
  isSubmitting,
  isLoading,
  regionDisplayNames,
  handleInputChange,
  handleAddNewSuggestion,
}) => {
  // Debug fieldErrors changes to confirm propagation
  useEffect(() => {
    console.log("MissionInfoStep - fieldErrors:", fieldErrors);
  }, [fieldErrors]);

  return (
    <>
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
              <FormInput
                type="text"
                name="description"
                value={formData.description || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
                placeholder="Saisir une description..."
                disabled={isSubmitting}
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
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Date de début</FormLabelRequired>
              <FormInput
                type="date"
                name="startDate"
                value={formData.startDate || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
                disabled={isSubmitting}
                className={fieldErrors.startDate ? "input-error" : ""}
              />
              {fieldErrors.startDate && fieldErrors.startDate.length > 0 && (
                <ErrorMessage>{fieldErrors.startDate.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Date de fin</FormLabelRequired>
              <FormInput
                type="date"
                name="endDate"
                value={formData.endDate || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
                disabled={isSubmitting}
                className={fieldErrors.endDate ? "input-error" : ""}
              />
              {fieldErrors.endDate && fieldErrors.endDate.length > 0 && (
                <ErrorMessage>{fieldErrors.endDate.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>
    </>
  );
};

export default MissionInfoStep;