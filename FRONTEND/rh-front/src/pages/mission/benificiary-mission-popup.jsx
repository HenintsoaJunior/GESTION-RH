import "styles/generic-form-styles.css";
import "styles/mission/beneficiary-popup.css";
import AutoCompleteInput from "components/auto-complete-input";

const BeneficiaryPopup = ({ isOpen, onClose, onSubmit, beneficiary, suggestions, isSubmitting, fieldErrors, handleInputChange, index, handleAddNewSuggestion }) => {
  if (!isOpen) return null;

  // Determine if the "Ajouter" button should be disabled
  const isButtonDisabled = isSubmitting || 
    !beneficiary.beneficiary || 
    !beneficiary.matricule || 
    !beneficiary.function || 
    !beneficiary.base || 
    !beneficiary.direction || 
    !beneficiary.department || 
    !beneficiary.service || 
    !beneficiary.departureDate || 
    !beneficiary.departureTime || 
    !beneficiary.returnDate || 
    !beneficiary.returnTime || 
    fieldErrors[`beneficiaries[${index}].employeeId`] || 
    fieldErrors[`beneficiaries[${index}].departureDate`] || 
    fieldErrors[`beneficiaries[${index}].returnDate`] || 
    fieldErrors[`beneficiaries[${index}].missionDuration`];

  return (
    <div className="popup-overlay">
      <div className="beneficiary-popup">
        <div className="popup-header">
          <h3 className="popup-title">Ajout un bénéficiaire</h3>
          <button className="popup-close" onClick={onClose} disabled={isSubmitting}>
            ×
          </button>
        </div>
        
        <div className="popup-content">
          <table className="form-table w-full border-collapse">
            <tbody>
              <tr className="form-row dual-field-row">
                <td className="form-field-cell p-2 align-top">
                  <label className="form-label required">Bénéficiaire</label>
                  <AutoCompleteInput
                    value={beneficiary.beneficiary}
                    onChange={(value) => handleInputChange({ target: { name: 'beneficiary', value } }, index)}
                    suggestions={suggestions.beneficiary.map((b) => b.displayName)}
                    placeholder={
                      suggestions.beneficiary.length === 0
                        ? "Aucun employé disponible"
                        : "Saisir ou sélectionner..."
                    }
                    disabled={isSubmitting}
                    showAddOption={false}
                    fieldType="beneficiary"
                    fieldLabel="bénéficiaire"
                    addNewRoute="/employee/employee-form"
                    className={`form-input autocomplete-input w-full ${fieldErrors[`beneficiaries[${index}].employeeId`] ? "error" : ""}`}
                  />
                  {fieldErrors[`beneficiaries[${index}].employeeId`] && (
                    <span className="error-message block mt-1">{fieldErrors[`beneficiaries[${index}].employeeId`].join(", ")}</span>
                  )}
                </td>
                <td className="form-field-cell p-2 align-top">
                  <label className="form-label required">Matricule</label>
                  <input
                    type="text"
                    name="matricule"
                    value={beneficiary.matricule}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Saisir le matricule..."
                    className="form-input w-full"
                    disabled={isSubmitting || beneficiary.beneficiary}
                    readOnly={beneficiary.beneficiary}
                  />
                </td>
              </tr>
              <tr className="form-row dual-field-row">
                <td className="form-field-cell p-2 align-top">
                  <label className="form-label required">Fonction</label>
                  <input
                    type="text"
                    name="function"
                    value={beneficiary.function}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Saisir la fonction..."
                    className="form-input w-full"
                    disabled={isSubmitting || beneficiary.beneficiary}
                    readOnly={beneficiary.beneficiary}
                  />
                </td>
                <td className="form-field-cell p-2 align-top">
                  <label className="form-label required">Base à</label>
                  <input
                    type="text"
                    name="base"
                    value={beneficiary.base}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Saisir la base..."
                    className="form-input w-full"
                    disabled={isSubmitting || beneficiary.beneficiary}
                    readOnly={beneficiary.beneficiary}
                  />
                </td>
              </tr>
              <tr className="form-row dual-field-row">
                <td className="form-field-cell p-2 align-top">
                  <label className="form-label required">Direction</label>
                  <input
                    type="text"
                    name="direction"
                    value={beneficiary.direction}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Saisir la direction..."
                    className="form-input w-full"
                    disabled={isSubmitting || beneficiary.beneficiary}
                    readOnly={beneficiary.beneficiary}
                  />
                </td>
                <td className="form-field-cell p-2 align-top">
                  <label className="form-label required">Département</label>
                  <input
                    type="text"
                    name="department"
                    value={beneficiary.department}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Saisir le département..."
                    className="form-input w-full"
                    disabled={isSubmitting || beneficiary.beneficiary}
                    readOnly={beneficiary.beneficiary}
                  />
                </td>
              </tr>
              <tr className="form-row dual-field-row">
                <td className="form-field-cell p-2 align-top">
                  <label className="form-label required">Service</label>
                  <input
                    type="text"
                    name="service"
                    value={beneficiary.service}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Saisir le service..."
                    className="form-input w-full"
                    disabled={isSubmitting || beneficiary.beneficiary}
                    readOnly={beneficiary.beneficiary}
                  />
                </td>
                <td className="form-field-cell p-2 align-top">
                  <label className="form-label">Centre de coût</label>
                  <input
                    type="text"
                    name="costCenter"
                    value={beneficiary.costCenter}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Saisir le centre de coût..."
                    className="form-input w-full"
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
              <tr className="form-row dual-field-row">
                <td className="form-field-cell p-2 align-top">
                  <label className="form-label">Moyen de transport</label>
                  <AutoCompleteInput
                    value={beneficiary.transport}
                    onChange={(value) => handleInputChange({ target: { name: 'transport', value } }, index)}
                    suggestions={suggestions.transport.map((t) => t.type)}
                    placeholder={
                      suggestions.transport.length === 0
                        ? "Aucun moyen de transport disponible"
                        : "Saisir ou sélectionner un moyen de transport..."
                    }
                    disabled={isSubmitting}
                    onAddNew={(value) => handleAddNewSuggestion("transport", value)}
                    fieldType="transport"
                    fieldLabel="moyen de transport"
                    addNewRoute="/transport/create"
                    className={`form-input autocomplete-input w-full ${fieldErrors[`beneficiaries[${index}].transportId`] ? "error" : ""}`}
                  />
                  {fieldErrors[`beneficiaries[${index}].transportId`] && (
                    <span className="error-message block mt-1">{fieldErrors[`beneficiaries[${index}].transportId`].join(", ")}</span>
                  )}
                </td>
                <td className="form-field-cell p-2 align-top">
                  <label className="form-label required">Date de départ</label>
                  <input
                    type="date"
                    name="departureDate"
                    value={beneficiary.departureDate || ""}
                    onChange={(e) => handleInputChange(e, index)}
                    className={`form-input w-full ${fieldErrors[`beneficiaries[${index}].departureDate`] ? "error" : ""}`}
                    disabled={isSubmitting}
                  />
                  {fieldErrors[`beneficiaries[${index}].departureDate`] && (
                    <span className="error-message block mt-1">{fieldErrors[`beneficiaries[${index}].departureDate`].join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr className="form-row dual-field-row">
                <td className="form-field-cell p-2 align-top">
                  <label className="form-label required">Heure de départ</label>
                  <input
                    type="time"
                    name="departureTime"
                    value={beneficiary.departureTime || ""}
                    onChange={(e) => handleInputChange(e, index)}
                    className="form-input w-full"
                    disabled={isSubmitting}
                  />
                </td>
                <td className="form-field-cell p-2 align-top">
                  <label className="form-label required">Date de retour</label>
                  <input
                    type="date"
                    name="returnDate"
                    value={beneficiary.returnDate || ""}
                    onChange={(e) => handleInputChange(e, index)}
                    className={`form-input w-full ${fieldErrors[`beneficiaries[${index}].returnDate`] ? "error" : ""}`}
                    disabled={isSubmitting}
                  />
                  {fieldErrors[`beneficiaries[${index}].returnDate`] && (
                    <span className="error-message block mt-1">{fieldErrors[`beneficiaries[${index}].returnDate`].join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr className="form-row">
                <td className="form-field-cell p-2 align-top" colSpan="2">
                  <label className="form-label required">Durée prévue de la mission</label>
                  <input
                    type="number"
                    name="missionDuration"
                    value={beneficiary.missionDuration}
                    className={`form-input w-full ${fieldErrors[`beneficiaries[${index}].missionDuration`] ? "error" : ""}`}
                    disabled={isSubmitting}
                    readOnly
                  />
                  {fieldErrors[`beneficiaries[${index}].missionDuration`] && (
                    <span className="error-message block mt-1">{fieldErrors[`beneficiaries[${index}].missionDuration`].join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr className="form-row">
                <td className="form-field-cell p-2 align-top" colSpan="2">
                  <label className="form-label required">Heure de retour</label>
                  <input
                    type="time"
                    name="returnTime"
                    value={beneficiary.returnTime || ""}
                    onChange={(e) => handleInputChange(e, index)}
                    className="form-input w-full"
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="popup-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onSubmit(beneficiary)}
            disabled={isButtonDisabled}
          >
            Ajouter
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryPopup;