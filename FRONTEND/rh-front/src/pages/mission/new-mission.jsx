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
} from "styles/generaliser/form-container";

const NewMissionForm = ({ formData, fieldErrors, isSubmitting, isLoading, regionDisplayNames, handleInputChange, handleAddNewSuggestion }) => {
  return (
    <div>
      <FormSectionTitle>Détails de la Mission</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow>
            <FormFieldCell>
              <FormLabelRequired htmlFor="missionTitle">Intitulé de la Mission</FormLabelRequired>
              <FormInput
                id="missionTitle"
                type="text"
                name="missionTitle"
                value={formData.missionTitle}
                onChange={handleInputChange}
                placeholder="Saisir le titre de la mission..."
                className={fieldErrors.Name ? "input-error" : ""}
                disabled={isSubmitting || isLoading.regions}
              />
              {fieldErrors.Name && (
                <ErrorMessage>{fieldErrors.Name.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell>
              <FormLabel htmlFor="description">Description</FormLabel>
              <FormTextarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Saisir une description..."
                rows="4"
                disabled={isSubmitting || isLoading.regions}
              />
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell>
              <FormLabel htmlFor="location">Lieu</FormLabel>
              <StyledAutoCompleteInput
                value={formData.location}
                onChange={(value) => {
                  const realValue = value.includes('/') ? value.split('/')[0] : value;
                  handleInputChange({ target: { name: 'location', value: realValue } });
                }}
                suggestions={regionDisplayNames}
                maxVisibleItems={3}
                placeholder="Saisir ou sélectionner un lieu..."
                disabled={isSubmitting || isLoading.regions}
                onAddNew={(value) => handleAddNewSuggestion("location", value)}
                showAddOption={true}
                fieldType="location"
                fieldLabel="lieu"
                addNewRoute="/lieu/create"
                className={fieldErrors.LieuId ? "error" : ""}
              />
              {fieldErrors.LieuId && (
                <ErrorMessage>{fieldErrors.LieuId.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell>
              <FormLabelRequired htmlFor="startDate">Date de début</FormLabelRequired>
              <FormInput
                id="startDate"
                type="date"
                name="startDate"
                value={formData.startDate || ""}
                onChange={handleInputChange}
                className={fieldErrors.StartDate ? "input-error" : ""}
                disabled={isSubmitting || isLoading.regions}
              />
              {fieldErrors.StartDate && (
                <ErrorMessage>{fieldErrors.StartDate.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell>
              <FormLabelRequired htmlFor="endDate">Date de fin</FormLabelRequired>
              <FormInput
                id="endDate"
                type="date"
                name="endDate"
                value={formData.endDate || ""}
                onChange={handleInputChange}
                className={fieldErrors.EndDate ? "input-error" : ""}
                disabled={isSubmitting || isLoading.regions}
              />
              {fieldErrors.EndDate && (
                <ErrorMessage>{fieldErrors.EndDate.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>
    </div>
  );
};

export default NewMissionForm;