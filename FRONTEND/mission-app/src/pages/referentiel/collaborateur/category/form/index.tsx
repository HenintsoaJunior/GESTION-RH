import { useEffect, useMemo, useCallback, useState } from 'react';
import { X, Save } from 'lucide-react';
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupContent,
  ButtonPrimary
} from "@/styles/popup-styles";
import {
  FormContainer,
  GenericForm,
  FormSectionTitle,
  FormTable,
  FormRow,
  FormFieldCell,
  FormLabelRequired,
  FormInput,
  ErrorMessage
} from "@/styles/form-container";
import { useCreateCollaboratorCategory, useUpdateCollaboratorCategory } from '@/api/collaborator/category/services';
import type { CollaboratorCategory, CollaboratorCategoryDTOForm } from '@/api/collaborator/category/services';

interface CollaboratorCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  collaboratorCategory: CollaboratorCategory | null;
}

const CollaboratorCategoryForm: React.FC<CollaboratorCategoryFormProps> = ({ isOpen, onClose, onFormSuccess, collaboratorCategory }) => {
  const [formData, setFormData] = useState<CollaboratorCategoryDTOForm>({ code: '', label: '' });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const createCollaboratorCategoryMutation = useCreateCollaboratorCategory();
  const collaboratorCategoryId = collaboratorCategory?.employeeCategoryId || '';
  const updateCollaboratorCategoryMutation = useUpdateCollaboratorCategory(collaboratorCategoryId);

  useEffect(() => {
    if (collaboratorCategory) {
      setFormData({ code: collaboratorCategory.code, label: collaboratorCategory.label });
    } else {
      setFormData({ code: '', label: '' });
    }
    setFieldErrors({});
  }, [collaboratorCategory]);

  // Mémorisation des états calculés
  const isUpdateMode = useMemo(() => !!collaboratorCategory, [collaboratorCategory]);
  const isProcessing = useMemo(() => 
    createCollaboratorCategoryMutation.isPending || updateCollaboratorCategoryMutation.isPending,
    [createCollaboratorCategoryMutation.isPending, updateCollaboratorCategoryMutation.isPending]
  );

  // Mémorisation des textes dynamiques
  const popupTitle = useMemo(() => 
    isUpdateMode ? 'Modifier la catégorie de collaborateur' : 'Ajouter une catégorie de collaborateur',
    [isUpdateMode]
  );
  const submitText = useMemo(() => 
    isUpdateMode ? 'Modifier' : 'Ajouter',
    [isUpdateMode]
  );
  const submittingText = useMemo(() => 
    isUpdateMode ? 'Modification en cours...' : 'Création en cours...',
    [isUpdateMode]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CollaboratorCategoryDTOForm) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (fieldErrors[name as keyof CollaboratorCategoryDTOForm]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
  }, [fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    if (!formData.code.trim()) {
      newErrors.code = ['Code est requis'];
    }
    if (!formData.label.trim()) {
      newErrors.label = ['Libellé est requis'];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (collaboratorCategory) {
      updateCollaboratorCategoryMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Catégorie de collaborateur modifiée avec succès.');
        },
      });
    } else {
      createCollaboratorCategoryMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Catégorie de collaborateur créée avec succès.');
        },
      });
    }
  }, [collaboratorCategory, formData, updateCollaboratorCategoryMutation, createCollaboratorCategoryMutation, onFormSuccess, validateForm]);

  const handleCancel = useCallback(() => {
    setFieldErrors({});
    onClose();
  }, [onClose]);

  // Ne pas afficher le popup si non ouvert
  if (!isOpen) return null;

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>{popupTitle}</PopupTitle>
          <PopupClose
            onClick={handleCancel}
            disabled={isProcessing}
            aria-label="Fermer le formulaire"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </PopupClose>
        </PopupHeader>

        <PopupContent>
          <FormContainer>
            <GenericForm id="collaboratorCategoryForm" onSubmit={handleSubmit}>
              <FormSectionTitle>Informations sur la Catégorie de Collaborateur</FormSectionTitle>
              <FormTable>
                <tbody>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabelRequired>Code</FormLabelRequired>
                      <FormInput
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        disabled={isProcessing}
                        className={fieldErrors.code && fieldErrors.code.length > 0 ? "input-error" : ""}
                      />
                      {fieldErrors.code && fieldErrors.code.length > 0 && (
                        <ErrorMessage>{fieldErrors.code.join(", ")}</ErrorMessage>
                      )}
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabelRequired>Libellé</FormLabelRequired>
                      <FormInput
                        type="text"
                        name="label"
                        value={formData.label}
                        onChange={handleChange}
                        disabled={isProcessing}
                        className={fieldErrors.label && fieldErrors.label.length > 0 ? "input-error" : ""}
                      />
                      {fieldErrors.label && fieldErrors.label.length > 0 && (
                        <ErrorMessage>{fieldErrors.label.join(", ")}</ErrorMessage>
                      )}
                    </FormFieldCell>
                  </FormRow>
                </tbody>
              </FormTable>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <ButtonPrimary
                  type="button"
                  onClick={handleCancel}
                  disabled={isProcessing}
                  style={{
                    opacity: isProcessing ? 0.6 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  type="submit"
                  disabled={isProcessing}
                  title={isProcessing ? submittingText : submitText}
                  aria-label={isProcessing ? submittingText : submitText}
                  style={{
                    opacity: isProcessing ? 0.6 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  <Save size={16} aria-hidden="true" />
                  <span>{isProcessing ? submittingText : submitText}</span>
                </ButtonPrimary>
              </div>
            </GenericForm>
          </FormContainer>
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
};

export default CollaboratorCategoryForm;