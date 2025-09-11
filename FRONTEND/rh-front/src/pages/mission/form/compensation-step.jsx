import { FormSectionTitle, FormTable, FormRow, FormFieldCell, FormLabelRequired, FormRadio, ErrorMessage } from "styles/generaliser/form-container";

const CompensationStep = ({ formData, fieldErrors, isSubmitting, handleInputChange }) => {
  return (
    <>
      <FormSectionTitle>Type de Compensation</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Sélectionner le type de compensation</FormLabelRequired>
              <div className="flex flex-col space-y-4 mt-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <FormRadio
                    type="radio"
                    name="type"
                    value="Indemnité"
                    checked={formData.type === "Indemnité"}
                    onChange={(e) => handleInputChange(e, "compensation")}
                    disabled={isSubmitting}
                  />
                  <span className="text-sm font-medium text-gray-700 leading-none">Indemnité</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <FormRadio
                    type="radio"
                    name="type"
                    value="Note de frais"
                    checked={formData.type === "Note de frais"}
                    onChange={(e) => handleInputChange(e, "compensation")}
                    disabled={isSubmitting}
                  />
                  <span className="text-sm font-medium text-gray-700 leading-none">Note de frais</span>
                </label>
              </div>
              {fieldErrors.type && (
                <ErrorMessage>{fieldErrors.type.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>
    </>
  );
};

export default CompensationStep;