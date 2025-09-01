  import {
    FormTable,
    FormRow,
    FormFieldCell,
    FormLabel,
    FormLabelRequired,
    FormInput,
    StyledAutoCompleteInput,
    ErrorMessage,
  } from "styles/generaliser/form-container";
  import {
    PopupOverlay,
    PagePopup,
    PopupHeader,
    PopupTitle,
    PopupClose,
    PopupContent,
    PopupActions,
    ButtonPrimary,
    ButtonSecondary,
  } from "styles/generaliser/popup-container";

  const BeneficiaryPopupComponent = ({ isOpen, onClose, onSubmit, beneficiary, suggestions, isSubmitting, fieldErrors, handleInputChange, index, handleAddNewSuggestion }) => {
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
      <PopupOverlay>
        <PagePopup> {/* Use the renamed styled component */}
          <PopupHeader>
            <PopupTitle>Ajout d'un bénéficiaire</PopupTitle>
            <PopupClose onClick={onClose} disabled={isSubmitting}>
              ×
            </PopupClose>
          </PopupHeader>

          <PopupContent>
            <FormTable>
              <tbody>
                <FormRow className="dual-field-row">
                  <FormFieldCell>
                    <FormLabelRequired>Bénéficiaire</FormLabelRequired>
                    <StyledAutoCompleteInput
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
                      className={fieldErrors[`beneficiaries[${index}].employeeId`] ? "error" : ""}
                      styledInput={StyledAutoCompleteInput}
                    />
                    {fieldErrors[`beneficiaries[${index}].employeeId`] && (
                      <ErrorMessage>{fieldErrors[`beneficiaries[${index}].employeeId`].join(", ")}</ErrorMessage>
                    )}
                  </FormFieldCell>
                  <FormFieldCell>
                    <FormLabelRequired>Matricule</FormLabelRequired>
                    <FormInput
                      type="text"
                      name="matricule"
                      value={beneficiary.matricule}
                      onChange={(e) => handleInputChange(e, index)}
                      placeholder="Saisir le matricule..."
                      disabled={isSubmitting || beneficiary.beneficiary}
                      readOnly={beneficiary.beneficiary}
                    />
                  </FormFieldCell>
                </FormRow>
                <FormRow className="dual-field-row">
                  <FormFieldCell>
                    <FormLabelRequired>Fonction</FormLabelRequired>
                    <FormInput
                      type="text"
                      name="function"
                      value={beneficiary.function}
                      onChange={(e) => handleInputChange(e, index)}
                      placeholder="Saisir la fonction..."
                      disabled={isSubmitting || beneficiary.beneficiary}
                      readOnly={beneficiary.beneficiary}
                    />
                  </FormFieldCell>
                  <FormFieldCell>
                    <FormLabelRequired>Base à</FormLabelRequired>
                    <FormInput
                      type="text"
                      name="base"
                      value={beneficiary.base}
                      onChange={(e) => handleInputChange(e, index)}
                      placeholder="Saisir la base..."
                      disabled={isSubmitting || beneficiary.beneficiary}
                      readOnly={beneficiary.beneficiary}
                    />
                  </FormFieldCell>
                </FormRow>
                <FormRow className="dual-field-row">
                  <FormFieldCell>
                    <FormLabelRequired>Direction</FormLabelRequired>
                    <FormInput
                      type="text"
                      name="direction"
                      value={beneficiary.direction}
                      onChange={(e) => handleInputChange(e, index)}
                      placeholder="Saisir la direction..."
                      disabled={isSubmitting || beneficiary.beneficiary}
                      readOnly={beneficiary.beneficiary}
                    />
                  </FormFieldCell>
                  <FormFieldCell>
                    <FormLabelRequired>Département</FormLabelRequired>
                    <FormInput
                      type="text"
                      name="department"
                      value={beneficiary.department}
                      onChange={(e) => handleInputChange(e, index)}
                      placeholder="Saisir le département..."
                      disabled={isSubmitting || beneficiary.beneficiary}
                      readOnly={beneficiary.beneficiary}
                    />
                  </FormFieldCell>
                </FormRow>
                <FormRow className="dual-field-row">
                  <FormFieldCell>
                    <FormLabelRequired>Service</FormLabelRequired>
                    <FormInput
                      type="text"
                      name="service"
                      value={beneficiary.service}
                      onChange={(e) => handleInputChange(e, index)}
                      placeholder="Saisir le service..."
                      disabled={isSubmitting || beneficiary.beneficiary}
                      readOnly={beneficiary.beneficiary}
                    />
                  </FormFieldCell>
                  <FormFieldCell>
                    <FormLabel>Centre de coût</FormLabel>
                    <FormInput
                      type="text"
                      name="costCenter"
                      value={beneficiary.costCenter}
                      onChange={(e) => handleInputChange(e, index)}
                      placeholder="Saisir le centre de coût..."
                      disabled={isSubmitting}
                    />
                  </FormFieldCell>
                </FormRow>
                <FormRow className="dual-field-row">
                  <FormFieldCell>
                    <FormLabel>Moyen de transport</FormLabel>
                    <StyledAutoCompleteInput
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
                      className={fieldErrors[`beneficiaries[${index}].transportId`] ? "error" : ""}
                    />
                    {fieldErrors[`beneficiaries[${index}].transportId`] && (
                      <ErrorMessage>{fieldErrors[`beneficiaries[${index}].transportId`].join(", ")}</ErrorMessage>
                    )}
                  </FormFieldCell>
                  <FormFieldCell>
                    <FormLabelRequired>Date de départ</FormLabelRequired>
                    <FormInput
                      type="date"
                      name="departureDate"
                      value={beneficiary.departureDate || ""}
                      onChange={(e) => handleInputChange(e, index)}
                      className={fieldErrors[`beneficiaries[${index}].departureDate`] ? "input-error" : ""}
                      disabled={isSubmitting}
                    />
                    {fieldErrors[`beneficiaries[${index}].departureDate`] && (
                      <ErrorMessage>{fieldErrors[`beneficiaries[${index}].departureDate`].join(", ")}</ErrorMessage>
                    )}
                  </FormFieldCell>
                </FormRow>
                <FormRow className="dual-field-row">
                  <FormFieldCell>
                    <FormLabelRequired>Heure de départ</FormLabelRequired>
                    <FormInput
                      type="time"
                      name="departureTime"
                      value={beneficiary.departureTime || ""}
                      onChange={(e) => handleInputChange(e, index)}
                      disabled={isSubmitting}
                    />
                  </FormFieldCell>
                  <FormFieldCell>
                    <FormLabelRequired>Date de retour</FormLabelRequired>
                    <FormInput
                      type="date"
                      name="returnDate"
                      value={beneficiary.returnDate || ""}
                      onChange={(e) => handleInputChange(e, index)}
                      className={fieldErrors[`beneficiaries[${index}].returnDate`] ? "input-error" : ""}
                      disabled={isSubmitting}
                    />
                    {fieldErrors[`beneficiaries[${index}].returnDate`] && (
                      <ErrorMessage>{fieldErrors[`beneficiaries[${index}].returnDate`].join(", ")}</ErrorMessage>
                    )}
                  </FormFieldCell>
                </FormRow>
                <FormRow>
                  <FormFieldCell colSpan="2">
                    <FormLabelRequired>Durée prévue de la mission</FormLabelRequired>
                    <FormInput
                      type="number"
                      name="missionDuration"
                      value={beneficiary.missionDuration}
                      className={fieldErrors[`beneficiaries[${index}].missionDuration`] ? "input-error" : ""}
                      disabled={isSubmitting}
                      readOnly
                    />
                    {fieldErrors[`beneficiaries[${index}].missionDuration`] && (
                      <ErrorMessage>{fieldErrors[`beneficiaries[${index}].missionDuration`].join(", ")}</ErrorMessage>
                    )}
                  </FormFieldCell>
                </FormRow>
                <FormRow>
                  <FormFieldCell colSpan="2">
                    <FormLabelRequired>Heure de retour</FormLabelRequired>
                    <FormInput
                      type="time"
                      name="returnTime"
                      value={beneficiary.returnTime || ""}
                      onChange={(e) => handleInputChange(e, index)}
                      disabled={isSubmitting}
                    />
                  </FormFieldCell>
                </FormRow>
              </tbody>
            </FormTable>
          </PopupContent>

          <PopupActions>
            <ButtonPrimary
              type="button"
              onClick={() => onSubmit(beneficiary)}
              disabled={isButtonDisabled}
            >
              Ajouter
            </ButtonPrimary>
            <ButtonSecondary
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Fermer
            </ButtonSecondary>
          </PopupActions>
        </PagePopup>
      </PopupOverlay>
    );
  };

  export default BeneficiaryPopupComponent;