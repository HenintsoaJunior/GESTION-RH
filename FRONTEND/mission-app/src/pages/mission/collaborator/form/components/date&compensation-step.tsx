import { ErrorMessage, FormSectionTitle, FormTable, FormRow, FormFieldCell, FormLabelRequired, FormInput } from "@/styles/form-container";
import React from "react";

interface CompensationStepProps {
  formData: { 
    missionType?: string;
    type: string;
    startDate?: string;
    endDate?: string;
    beneficiary: {
      departureDate: string;
      departureTime: string;
      returnDate: string;
      returnTime: string;
      missionDuration: number | string;
    };
  };
  fieldErrors: { [key: string]: string[] };
  isSubmitting: boolean;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } },
    section?: string
  ) => void;
}

const CompensationStep: React.FC<CompensationStepProps> = ({ 
  formData, 
  fieldErrors, 
  isSubmitting, 
  handleInputChange 
}) => {
  const compensationTypes = [
    {
      value: "Indemnité",
      label: "Indemnité"
    },
    {
      value: "Note de frais",
      label: "Note de frais"
    }
  ];

  const isInternational = formData.missionType === "international";

  return (
    <>
      {/* Type de Compensation */}
      <FormSectionTitle>Type de Compensation</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow>
            <FormFieldCell colSpan={2}>
              <FormLabelRequired>Type de compensation</FormLabelRequired>
              {isInternational ? (
                <FormInput
                  type="text"
                  value="Note de frais"
                  readOnly
                  disabled={isSubmitting}
                />
              ) : (
                <div className="radio-group" style={{ display: "flex", gap: "20px" }}>
                  {compensationTypes.map((type) => (
                    <label key={type.value} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <FormInput
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={formData.type === type.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, "compensation")}
                        disabled={isSubmitting}
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              )}
              {fieldErrors.type && fieldErrors.type.length > 0 && (
                <ErrorMessage>{fieldErrors.type.join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>

      {/* Dates de la Mission */}
      <FormSectionTitle>Dates de la Mission</FormSectionTitle>
      <FormTable>
        <tbody>
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
          <FormRow className="dual-field-row">
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
        </tbody>
      </FormTable>
    </>
  );
};

export default CompensationStep;