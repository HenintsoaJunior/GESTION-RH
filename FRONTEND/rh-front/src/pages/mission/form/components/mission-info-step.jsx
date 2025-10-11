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

const MissionInfoStep = ({
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
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Type de mission</FormLabelRequired>
              <div className="radio-group" style={{ display: "flex", gap: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <FormInput
                    type="radio"
                    name="missionType"
                    value="national"
                    checked={formData.missionType === "national"}
                    onChange={(e) => handleInputChange(e)}
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
                    onChange={(e) => handleInputChange(e)}
                    disabled={isSubmitting}
                  />
                  International
                </label>
              </div>
              {fieldErrors.missionType && fieldErrors.missionType.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.missionType.join(", ")}
                </div>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Titre de la mission</FormLabelRequired>
              <FormInput
                type="text"
                name="missionTitle"
                value={formData.missionTitle || ""}
                onChange={(e) => handleInputChange(e)}
                placeholder="Saisir le titre de la mission..."
                disabled={isSubmitting}
                className={fieldErrors.name ? "input-error" : ""}
              />
              {fieldErrors.name && fieldErrors.name.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.name.join(", ")}
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
              <FormLabelRequired>Lieu</FormLabelRequired>
              <StyledAutoCompleteInput
                value={formData.location || ""}
                onChange={(value) => handleInputChange({ target: { name: "location", value } })}
                suggestions={regionDisplayNames}
                placeholder={isLoading.regions ? "Chargement des lieux..." : "Saisir ou sélectionner un lieu..."}
                disabled={isSubmitting || isLoading.regions}
                onAddNew={(value) => handleAddNewSuggestion("location", value)}
                fieldType="location"
                fieldLabel="lieu"
                addNewRoute="/lieu/create"
                className={fieldErrors.lieuId ? "input-error" : ""}
              />
              {fieldErrors.lieuId && fieldErrors.lieuId.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.lieuId.join(", ")}
                </div>
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
                onChange={(e) => handleInputChange(e)}
                disabled={isSubmitting}
                className={fieldErrors.startDate ? "input-error" : ""}
              />
              {fieldErrors.startDate && fieldErrors.startDate.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.startDate.join(", ")}
                </div>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Date de fin</FormLabelRequired>
              <FormInput
                type="date"
                name="endDate"
                value={formData.endDate || ""}
                onChange={(e) => handleInputChange(e)}
                disabled={isSubmitting}
                className={fieldErrors.endDate ? "input-error" : ""}
              />
              {fieldErrors.endDate && fieldErrors.endDate.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.endDate.join(", ")}
                </div>
              )}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>
    </>
  );
};

export default MissionInfoStep;