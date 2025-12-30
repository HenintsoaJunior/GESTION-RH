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

  // Correction : Comparaison avec la bonne valeur "Internationale"
  const isInternational = formData.missionType === "Internationale";

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
                  style={{
                    height: "40px",
                    marginTop: "8px"
                  }}
                />
              ) : (
                <div style={{ 
                  display: "flex", 
                  gap: "10px",
                  marginTop: "8px"
                }}>
                  {compensationTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInputChange({ 
                        target: { name: "type", value: type.value } 
                      }, "compensation")}
                      disabled={isSubmitting}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "10px 16px",
                        border: `1px solid ${formData.type === type.value ? "var(--primary-color)" : "var(--border-color)"}`,
                        backgroundColor: formData.type === type.value ? "var(--primary-light)" : "var(--bg-primary)",
                        cursor: "pointer",
                        transition: "none",
                        minWidth: "120px",
                        height: "40px"
                      }}
                    >
                      {formData.type === type.value ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="1" width="14" height="14" rx="1" fill="var(--primary-color)" stroke="var(--primary-color)" strokeWidth="2"/>
                          <path d="M4 8L6.5 10.5L12 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="1" width="14" height="14" rx="1" stroke="var(--border-color)" strokeWidth="2"/>
                        </svg>
                      )}
                      <span style={{
                        color: formData.type === type.value ? "var(--primary-color)" : "var(--text-color)",
                        fontWeight: formData.type === type.value ? "600" : "400",
                        fontSize: "14px"
                      }}>
                        {type.label}
                      </span>
                    </button>
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
                style={{
                  height: "40px",
                  marginTop: "8px"
                }}
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
                style={{
                  height: "40px",
                  marginTop: "8px"
                }}
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
                style={{
                  height: "40px",
                  marginTop: "8px"
                }}
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
                style={{
                  height: "40px",
                  marginTop: "8px"
                }}
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
                style={{
                  height: "40px",
                  marginTop: "8px"
                }}
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
                style={{
                  height: "40px",
                  marginTop: "8px"
                }}
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
                value={formData.beneficiary.missionDuration || ""}
                className={fieldErrors["beneficiary.missionDuration"] ? "input-error" : ""}
                disabled={isSubmitting}
                readOnly
                style={{
                  height: "40px",
                  marginTop: "8px"
                }}
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