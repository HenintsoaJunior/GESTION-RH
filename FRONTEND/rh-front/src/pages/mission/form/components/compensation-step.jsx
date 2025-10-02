import { ErrorMessage } from "styles/generaliser/form-container";
import { CreditCard, FileText } from "lucide-react";

const CompensationStep = ({ formData, fieldErrors, isSubmitting, handleInputChange }) => {
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
  );
};

export default CompensationStep;