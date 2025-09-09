import { FormSectionTitle, FormTable, FormRow, FormFieldCell, FormLabel, FormLabelRequired, FormInput, StyledAutoCompleteInput, ErrorMessage } from "styles/generaliser/form-container";

const MissionInfoStep = ({ formData, fieldErrors, isSubmitting, isLoading, regionDisplayNames, handleInputChange, handleAddNewSuggestion }) => {
  return (
    <>
      <FormSectionTitle>Informations de la Mission</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Titre de la mission</FormLabelRequired>
              <FormInput
                type="text"
                name="missionTitle"
                value={formData.missionTitle}
                onChange={(e) => handleInputChange(e)}
                placeholder="Saisir le titre de la mission..."
                disabled={isSubmitting}
                className={fieldErrors.name ? "input-error" : ""}
              />
              {fieldErrors.name && <ErrorMessage>{fieldErrors.name.join(", ")}</ErrorMessage>}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabel>Description</FormLabel>
              <FormInput
                type="text"
                name="description"
                value={formData.description}
                onChange={(e) => handleInputChange(e)}
                placeholder="Saisir une description..."
                disabled={isSubmitting}
              />
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Lieu</FormLabelRequired>
              <StyledAutoCompleteInput
                value={formData.location}
                onChange={(value) => handleInputChange({ target: { name: "location", value } })}
                suggestions={regionDisplayNames}
                placeholder={isLoading.regions ? "Chargement des lieux..." : "Saisir ou sélectionner un lieu..."}
                disabled={isSubmitting || isLoading.regions}
                onAddNew={(value) => handleAddNewSuggestion("location", value)}
                fieldType="location"
                fieldLabel="lieu"
                addNewRoute="/lieu/create"
                className={fieldErrors.lieuId ? "error" : ""}
              />
              {fieldErrors.lieuId && <ErrorMessage>{fieldErrors.lieuId.join(", ")}</ErrorMessage>}
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
              {fieldErrors.startDate && <ErrorMessage>{fieldErrors.startDate.join(", ")}</ErrorMessage>}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabel>Date de fin</FormLabel>
              <FormInput
                type="date"
                name="endDate"
                value={formData.endDate || ""}
                onChange={(e) => handleInputChange(e)}
                disabled={isSubmitting}
                className={fieldErrors.endDate ? "input-error" : ""}
              />
              {fieldErrors.endDate && <ErrorMessage>{fieldErrors.endDate.join(", ")}</ErrorMessage>}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>
    </>
  );
};

export default MissionInfoStep;