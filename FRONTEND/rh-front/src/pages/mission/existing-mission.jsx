import { FormSectionTitle, FormTable, FormRow, FormFieldCell, FormLabel, FormLabelRequired, FormInput, FormTextarea, ErrorMessage,StyledAutoCompleteInput } from "styles/generaliser/form-container";

const ExistingMissionForm = ({ formData, fieldErrors, isSubmitting, isLoading, suggestions, handleInputChange }) => {
  return (
    <div>
      <FormSectionTitle>Sélection de la Mission</FormSectionTitle>
      <FormTable>
        <tbody>
          {/* Mission and Mission Title in one row with two columns */}
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Mission</FormLabelRequired>
              <StyledAutoCompleteInput
                value={formData.missionSearch || ""}
                onChange={(value) => {
                  handleInputChange({ target: { name: 'missionSearch', value } });
                  const selectedMission = suggestions.mission.find((m) => m.displayName === value);
                  handleInputChange({
                    target: { name: 'missionId', value: selectedMission ? selectedMission.id : "" },
                  });
                }}
                suggestions={suggestions.mission.map((m) => m.displayName)}
                placeholder={
                  suggestions.mission.length === 0
                    ? "Aucune mission disponible"
                    : "Saisir ou sélectionner une mission..."
                }
                disabled={isSubmitting || isLoading.missions}
                showAddOption={false}
                fieldType="mission"
                fieldLabel="mission"
                className={`autocomplete-input w-full ${fieldErrors.missionId ? "input-error" : ""}`}
              />
              {fieldErrors.missionId && (
                <ErrorMessage>{fieldErrors.missionId.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabel>Intitulé de la Mission</FormLabel>
              <FormInput
                type="text"
                value={formData.missionTitle}
                disabled
                readOnly
              />
            </FormFieldCell>
          </FormRow>

          {/* Other fields in separate rows, each spanning the full table width */}
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabel>Description</FormLabel>
              <FormTextarea
                value={formData.description}
                rows="4"
                disabled
                readOnly
              />
            </FormFieldCell>
          </FormRow>

          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabel>Lieu</FormLabel>
              <FormInput
                type="text"
                value={formData.location}
                disabled
                readOnly
              />
            </FormFieldCell>
          </FormRow>

          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabel>Date de début</FormLabel>
              <FormInput
                type="date"
                value={formData.startDate || ""}
                disabled
                readOnly
              />
            </FormFieldCell>
          </FormRow>

          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabel>Date de fin</FormLabel>
              <FormInput
                type="date"
                value={formData.endDate || ""}
                disabled
                readOnly
              />
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>
    </div>
  );
};

export default ExistingMissionForm;