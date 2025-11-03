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
import { useCreateNationality, useUpdateNationality } from '@/api/nationality/services';
import type { Nationality, NationalityDTOForm } from '@/api/nationality/services';

interface NationalityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  nationality: Nationality | null;
}

const NationalityForm: React.FC<NationalityFormProps> = ({ isOpen, onClose, onFormSuccess, nationality }) => {
  const [formData, setFormData] = useState<NationalityDTOForm>({ code: '', name: '' });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const createNationalityMutation = useCreateNationality();
  const nationalityId = nationality?.nationalityId || '';
  const updateNationalityMutation = useUpdateNationality(nationalityId);

  useEffect(() => {
    if (nationality) {
      setFormData({ code: nationality.code, name: nationality.name });
    } else {
      setFormData({ code: '', name: '' });
    }
    setFieldErrors({});
  }, [nationality]);

  // Mémorisation des états calculés
  const isUpdateMode = useMemo(() => !!nationality, [nationality]);
  const isProcessing = useMemo(() => 
    createNationalityMutation.isPending || updateNationalityMutation.isPending,
    [createNationalityMutation.isPending, updateNationalityMutation.isPending]
  );

  // Mémorisation des textes dynamiques
  const popupTitle = useMemo(() => 
    isUpdateMode ? 'Modifier la nationalité' : 'Ajouter une nationalité',
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
    setFormData((prev: NationalityDTOForm) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (fieldErrors[name as keyof NationalityDTOForm]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
  }, [fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    if (!formData.code.trim()) {
      newErrors.code = ['Code est requis'];
    }
    if (!formData.name.trim()) {
      newErrors.name = ['Nom est requis'];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (nationality) {
      updateNationalityMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Nationalité modifiée avec succès.');
        },
      });
    } else {
      createNationalityMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Nationalité créée avec succès.');
        },
      });
    }
  }, [nationality, formData, updateNationalityMutation, createNationalityMutation, onFormSuccess, validateForm]);

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
            <GenericForm id="nationalityForm" onSubmit={handleSubmit}>
              <FormSectionTitle>Informations sur la Nationalité</FormSectionTitle>
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
                      <FormLabelRequired>Nom</FormLabelRequired>
                      <FormInput
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isProcessing}
                        className={fieldErrors.name && fieldErrors.name.length > 0 ? "input-error" : ""}
                      />
                      {fieldErrors.name && fieldErrors.name.length > 0 && (
                        <ErrorMessage>{fieldErrors.name.join(", ")}</ErrorMessage>
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

export default NationalityForm;