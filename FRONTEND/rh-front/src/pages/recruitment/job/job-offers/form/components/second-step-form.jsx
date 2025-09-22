import * as FaIcons from "react-icons/fa";
import {
  FormSectionTitle,
  FormTable,
  FormRow,
  FormFieldCell,
  FormLabelRequired,
  FormInput,
  ErrorMessage,
  RemoveItem,
  AddButton,
  InputButtonContainer, // New styled component for flex layout
} from "styles/generaliser/form-container";
import RichTextEditor from "components/rich-text-editor";

export default function SecondStepForm({
  formData,
  setFormData,
  errors,
  isSubmitting,
  handleAddAttribution,
  handleRemoveAttribution,
  handleAttributionChange,
}) {
  const updateJobDetails = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      jobDetails: { ...prev.jobDetails, [field]: value },
    }));
  };

  return (
    <>
      <FormSectionTitle>Détails du Poste</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Missions</FormLabelRequired>
              <RichTextEditor
                placeholder="Décrivez les missions du poste..."
                value={formData.jobDetails.missions}
                onChange={(value) => updateJobDetails("missions", value)}
                disabled={isSubmitting}
                className={errors.jobDetails?.missions ? "input-error" : ""}
              />
              {errors.jobDetails?.missions && (
                <ErrorMessage>Veuillez fournir les missions.</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          {formData.jobDetails.attributions.map((attribution, index) => (
            <FormRow key={index}>
              <FormFieldCell>
                <FormLabelRequired>Attribution {index + 1}</FormLabelRequired>
                <InputButtonContainer>
                  <FormInput
                    type="text"
                    value={attribution}
                    onChange={(e) => handleAttributionChange(index, e.target.value)}
                    placeholder="Décrivez une attribution..."
                    disabled={isSubmitting}
                    className={errors.jobDetails?.attributions ? "input-error" : ""}
                  />
                  <RemoveItem
                    type="button"
                    onClick={() => handleRemoveAttribution(index)}
                    disabled={isSubmitting || formData.jobDetails.attributions.length === 1}
                    title="Supprimer l'attribution"
                  >
                    <FaIcons.FaTrash />
                  </RemoveItem>
                </InputButtonContainer>
              </FormFieldCell>
            </FormRow>
          ))}
          {errors.jobDetails?.attributions && (
            <ErrorMessage>Toutes les attributions doivent être remplies.</ErrorMessage>
          )}
        </tbody>
      </FormTable>
      <AddButton
        type="button"
        onClick={handleAddAttribution}
        disabled={isSubmitting}
        title="Ajouter une attribution"
      >
        <FaIcons.FaPlus /> Ajouter une attribution
      </AddButton>
    </>
  );
}