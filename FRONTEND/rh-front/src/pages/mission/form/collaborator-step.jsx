import { FormSectionTitle, FormTable, FormRow, FormFieldCell, FormLabel, FormLabelRequired, FormInput, StyledAutoCompleteInput, ErrorMessage } from "styles/generaliser/form-container";

const CollaboratorStep = ({ formData, fieldErrors, isSubmitting, suggestions, handleInputChange, handleAddNewSuggestion }) => {
  return (
    <>
      <FormSectionTitle>Détails du Collaborateur</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Bénéficiaire</FormLabelRequired>
              <StyledAutoCompleteInput
                value={formData.beneficiary.beneficiary}
                onChange={(value) => handleInputChange({ target: { name: "beneficiary", value } }, "beneficiary")}
                suggestions={suggestions.beneficiary.map((b) => b.displayName)}
                placeholder={suggestions.beneficiary.length === 0 ? "Aucun employé disponible" : "Saisir ou sélectionner..."}
                disabled={isSubmitting}
                showAddOption={false}
                fieldType="beneficiary"
                fieldLabel="bénéficiaire"
                addNewRoute="/employee/employee-form"
                className={fieldErrors["beneficiary.employeeId"] ? "error" : ""}
              />
              {fieldErrors["beneficiary.employeeId"] && (
                <ErrorMessage>{fieldErrors["beneficiary.employeeId"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Matricule</FormLabelRequired>
              <FormInput
                type="text"
                name="matricule"
                value={formData.beneficiary.matricule}
                onChange={(e) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir le matricule..."
                disabled={isSubmitting || formData.beneficiary.beneficiary}
                readOnly={formData.beneficiary.beneficiary}
              />
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Fonction</FormLabelRequired>
              <FormInput
                type="text"
                name="function"
                value={formData.beneficiary.function}
                onChange={(e) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir la fonction..."
                disabled={isSubmitting || formData.beneficiary.beneficiary}
                readOnly={formData.beneficiary.beneficiary}
              />
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Base à</FormLabelRequired>
              <FormInput
                type="text"
                name="base"
                value={formData.beneficiary.base}
                onChange={(e) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir la base..."
                disabled={isSubmitting || formData.beneficiary.beneficiary}
                readOnly={formData.beneficiary.beneficiary}
              />
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Direction</FormLabelRequired>
              <FormInput
                type="text"
                name="direction"
                value={formData.beneficiary.direction}
                onChange={(e) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir la direction..."
                disabled={isSubmitting || formData.beneficiary.beneficiary}
                readOnly={formData.beneficiary.beneficiary}
              />
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Département</FormLabelRequired>
              <FormInput
                type="text"
                name="department"
                value={formData.beneficiary.department}
                onChange={(e) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir le département..."
                disabled={isSubmitting || formData.beneficiary.beneficiary}
                readOnly={formData.beneficiary.beneficiary}
              />
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Service</FormLabelRequired>
              <FormInput
                type="text"
                name="service"
                value={formData.beneficiary.service}
                onChange={(e) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir le service..."
                disabled={isSubmitting || formData.beneficiary.beneficiary}
                readOnly={formData.beneficiary.beneficiary}
              />
            </FormFieldCell>
            <FormFieldCell>
              <FormLabel>Centre de coût</FormLabel>
              <FormInput
                type="text"
                name="costCenter"
                value={formData.beneficiary.costCenter}
                onChange={(e) => handleInputChange(e, "beneficiary")}
                placeholder="Saisir le centre de coût..."
                disabled={isSubmitting}
              />
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabel>Moyen de transport</FormLabel>
              <StyledAutoCompleteInput
                value={formData.beneficiary.transport}
                onChange={(value) => handleInputChange({ target: { name: "transport", value } }, "beneficiary")}
                suggestions={suggestions.transport.map((t) => t.type)}
                placeholder={suggestions.transport.length === 0 ? "Aucun moyen de transport disponible" : "Saisir ou sélectionner un moyen de transport..."}
                disabled={isSubmitting}
                onAddNew={(value) => handleAddNewSuggestion("transport", value)}
                fieldType="transport"
                fieldLabel="moyen de transport"
                addNewRoute="/transport/create"
                className={fieldErrors["beneficiary.transportId"] ? "error" : ""}
              />
              {fieldErrors["beneficiary.transportId"] && (
                <ErrorMessage>{fieldErrors["beneficiary.transportId"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Date de départ</FormLabelRequired>
              <FormInput
                type="date"
                name="departureDate"
                value={formData.beneficiary.departureDate || ""}
                onChange={(e) => handleInputChange(e, "beneficiary")}
                className={fieldErrors["beneficiary.departureDate"] ? "input-error" : ""}
                disabled={isSubmitting}
              />
              {fieldErrors["beneficiary.departureDate"] && (
                <ErrorMessage>{fieldErrors["beneficiary.departureDate"].join(", ")}</ErrorMessage>
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
                onChange={(e) => handleInputChange(e, "beneficiary")}
                disabled={isSubmitting}
              />
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Date de retour</FormLabelRequired>
              <FormInput
                type="date"
                name="returnDate"
                value={formData.beneficiary.returnDate || ""}
                onChange={(e) => handleInputChange(e, "beneficiary")}
                className={fieldErrors["beneficiary.returnDate"] ? "input-error" : ""}
                disabled={isSubmitting}
              />
              {fieldErrors["beneficiary.returnDate"] && (
                <ErrorMessage>{fieldErrors["beneficiary.returnDate"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Durée prévue de la mission</FormLabelRequired>
              <FormInput
                type="number"
                name="missionDuration"
                value={formData.beneficiary.missionDuration}
                className={fieldErrors["beneficiary.missionDuration"] ? "input-error" : ""}
                disabled={isSubmitting}
                readOnly
              />
              {fieldErrors["beneficiary.missionDuration"] && (
                <ErrorMessage>{fieldErrors["beneficiary.missionDuration"].join(", ")}</ErrorMessage>
              )}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Heure de retour</FormLabelRequired>
              <FormInput
                type="time"
                name="returnTime"
                value={formData.beneficiary.returnTime || ""}
                onChange={(e) => handleInputChange(e, "beneficiary")}
                disabled={isSubmitting}
              />
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>
    </>
  );
};

export default CollaboratorStep;