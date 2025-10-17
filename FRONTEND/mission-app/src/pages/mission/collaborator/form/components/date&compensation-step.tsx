import { ErrorMessage, FormSectionTitle, FormTable, FormRow, FormFieldCell, FormLabelRequired, FormInput } from "@/styles/form-container";
import { CreditCard, FileText } from "lucide-react";
import React from "react";

interface CompensationStepProps {
  formData: { 
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
      label: "Indemnité",
      icon: CreditCard
    },
    {
      value: "Note de frais",
      label: "Note de frais",
      icon: FileText
    }
  ];

  return (
    <>
      {/* Type de Compensation */}
      <FormSectionTitle>Type de Compensation</FormSectionTitle>
      <div className="max-w-2xl mx-auto">
        {/* Container des radio buttons */}
        <div className="wrapper" style={{ 
          display: 'inline-flex',
          background: '#fff',
          height: '120px',
          width: '100%',
          maxWidth: '500px',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          borderRadius: '12px',
          padding: '20px 15px',
          boxShadow: '0 10px 30px rgba(105, 180, 46, 0.15)',
          border: '1px solid #e5e7eb',
          margin: '0 auto'
        }}>
          {/* Inputs radio cachés */}
          {compensationTypes.map((type, index) => (
            <input
              key={`input-${type.value}`}
              type="radio"
              name="compensation-type"
              id={`option-${index + 1}`}
              value={type.value}
              checked={formData.type === type.value}
              onChange={(e) => handleInputChange(e, "compensation")}
              disabled={isSubmitting}
              style={{ display: 'none' }}
            />
          ))}
          
          {/* Labels avec style */}
          {compensationTypes.map((type, index) => {
            const Icon = type.icon;
            const isSelected = formData.type === type.value;
            
            return (
              <label
                key={`label-${type.value}`}
                htmlFor={`option-${index + 1}`}
                className="option"
                style={{
                  background: isSelected ? '#69b42e' : '#fff',
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 10px',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  padding: '15px 10px',
                  border: `2px solid ${isSelected ? '#69b42e' : '#d1d5db'}`,
                  transition: 'all 0.3s ease',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                {/* Icône */}
                <div style={{
                  marginBottom: '8px',
                  color: isSelected ? '#fff' : '#6b7280'
                }}>
                  <Icon size={28} />
                </div>
                
                {/* Dot indicator */}
                <div 
                  className="dot"
                  style={{
                    height: '20px',
                    width: '20px',
                    background: isSelected ? '#fff' : '#d1d5db',
                    borderRadius: '50%',
                    position: 'relative',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    content: '""',
                    top: '4px',
                    left: '4px',
                    width: '12px',
                    height: '12px',
                    background: '#69b42e',
                    borderRadius: '50%',
                    opacity: isSelected ? 1 : 0,
                    transform: isSelected ? 'scale(1)' : 'scale(1.5)',
                    transition: 'all 0.3s ease'
                  }} />
                </div>
                
                {/* Text */}
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: isSelected ? '#fff' : '#6b7280',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  {type.label}
                </span>
              </label>
            );
          })}
        </div>
        
        {/* Message d'erreur */}
        {fieldErrors.type && fieldErrors.type.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
            <ErrorMessage className="text-red-600 text-sm mb-0 text-center">
              {fieldErrors.type.join(", ")}
            </ErrorMessage>
          </div>
        )}
      </div>

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
          </FormRow>
          <FormRow className="dual-field-row">
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