import { useState, useEffect } from "react";
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
import HabilitationAssign from "../habilitation/habilitation-assign";

const RolePopupComponent = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  role, 
  isSubmitting, 
  fieldErrors, 
  handleInputChange, 
  buttonText 
}) => {
  const [selectedHabilitations, setSelectedHabilitations] = useState([]);

  // Initialiser les habilitations sélectionnées quand le rôle change
  useEffect(() => {
    if (role.habilitations && Array.isArray(role.habilitations)) {
      // Si role.habilitations contient des objets avec habilitationId
      const habilitationIds = role.habilitations.map(h => 
        typeof h === 'string' ? h : h.habilitationId
      );
      setSelectedHabilitations(habilitationIds);
    } else if (role.habilitationIds && Array.isArray(role.habilitationIds)) {
      // Si role.habilitationIds existe directement
      setSelectedHabilitations(role.habilitationIds);
    } else {
      setSelectedHabilitations([]);
    }
  }, [role]);

  // Réinitialiser les habilitations sélectionnées quand la popup se ferme
  useEffect(() => {
    if (!isOpen) {
      setSelectedHabilitations([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Détermine si le bouton doit être désactivé
  const isButtonDisabled = isSubmitting || !role.name || fieldErrors["name"];

  // Fonction de soumission qui inclut les habilitations
  const handleSubmit = () => {
    const roleData = {
      ...role,
      habilitationIds: selectedHabilitations, // Utiliser habilitationIds pour correspondre au DTO
    };
    onSubmit(roleData);
  };

  // Gérer le changement des habilitations sélectionnées
  const handleHabilitationsChange = (newSelectedHabilitations) => {
    setSelectedHabilitations(newSelectedHabilitations);
  };

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
          
          <div style={{ marginTop: "var(--spacing-lg)" }}>
            <div style={{ 
              marginBottom: "var(--spacing-md)",
              padding: "var(--spacing-sm)",
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-light)"
            }}>
              <h4 style={{ 
                margin: "0 0 var(--spacing-xs) 0", 
                fontSize: "var(--font-size-sm)",
                color: "var(--text-primary)",
                fontWeight: "500"
              }}>
                Habilitations du rôle
              </h4>
              <p style={{ 
                margin: 0, 
                fontSize: "var(--font-size-xs)", 
                color: "var(--text-secondary)" 
              }}>
                Sélectionnez les habilitations à associer à ce rôle ({selectedHabilitations.length} sélectionnée{selectedHabilitations.length > 1 ? 's' : ''})
              </p>
            </div>
            
            <HabilitationAssign
              roleId={role.roleId}
              roleName={role.name}
              initialHabilitations={role.habilitations || []}
              onHabilitationsChange={handleHabilitationsChange}
            />
          </div>
        </PopupContent>
        
        <PopupActions>
          <ButtonPrimary
            type="button"
            onClick={handleSubmit}
            disabled={isButtonDisabled}
          >
            {isSubmitting ? "Traitement..." : buttonText}
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