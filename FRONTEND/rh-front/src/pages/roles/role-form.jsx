import {
  FormTable,
  FormRow,
  FormFieldCell,
  FormLabel,
  FormLabelRequired,
  FormInput,
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

const RolePopupComponent = ({ isOpen, onClose, onSubmit, role, isSubmitting, fieldErrors, handleInputChange, buttonText }) => {
  if (!isOpen) return null;

  // Détermine si le bouton doit être désactivé
  const isButtonDisabled = isSubmitting || !role.name || fieldErrors["name"];

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>{role.roleId ? "Modifier un rôle" : "Ajout d'un rôle"}</PopupTitle>
          <PopupClose onClick={onClose} disabled={isSubmitting}>
            ×
          </PopupClose>
        </PopupHeader>

        <PopupContent>
          <FormTable>
            <tbody>
              <FormRow>
                <FormFieldCell>
                  <FormLabelRequired>Nom du rôle</FormLabelRequired>
                  <FormInput
                    type="text"
                    name="name"
                    value={role.name || ""}
                    onChange={(e) => handleInputChange(e)}
                    placeholder="Saisir le nom du rôle..."
                    disabled={isSubmitting}
                    className={fieldErrors["name"] ? "input-error" : ""}
                  />
                  {fieldErrors["name"] && (
                    <ErrorMessage>{fieldErrors["name"].join(", ")}</ErrorMessage>
                  )}
                </FormFieldCell>
              </FormRow>
              <FormRow>
                <FormFieldCell>
                  <FormLabel>Description</FormLabel>
                  <FormInput
                    type="text"
                    name="description"
                    value={role.description || ""}
                    onChange={(e) => handleInputChange(e)}
                    placeholder="Saisir une description (optionnel)..."
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
            onClick={() => onSubmit(role)}
            disabled={isButtonDisabled}
          >
            {buttonText}
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

export default RolePopupComponent;