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
  FormLabel,
  ErrorMessage
} from "@/styles/form-container";
import { useCreateGender, useUpdateGender } from '@/api/gender/services';
import type { Gender, CreateGenderDTO } from '@/api/gender/services';

interface GenderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  gender: Gender | null;
}

const GenderForm: React.FC<GenderFormProps> = ({ isOpen, onClose, onFormSuccess, gender }) => {
  const [formData, setFormData] = useState<CreateGenderDTO>({ code: '', label: '' });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const createGenderMutation = useCreateGender();
  const genderId = gender?.genderId || '';
  const updateGenderMutation = useUpdateGender(genderId);

  useEffect(() => {
    if (gender) {
      setFormData({ 
        code: gender.code || '', 
        label: gender.label 
      });
    } else {
      setFormData({ code: '', label: '' });
    }
    setFieldErrors({});
  }, [gender]);

  // Mémorisation des états calculés
  const isUpdateMode = useMemo(() => !!gender, [gender]);
  const isProcessing = useMemo(() => 
    createGenderMutation.isPending || updateGenderMutation.isPending,
    [createGenderMutation.isPending, updateGenderMutation.isPending]
  );

  // Mémorisation des textes dynamiques
  const popupTitle = useMemo(() => 
    isUpdateMode ? 'Modifier le genre' : 'Ajouter un genre',
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CreateGenderDTO) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (fieldErrors[name as keyof CreateGenderDTO]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
  }, [fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    if (!formData.label.trim()) {
      newErrors.label = ['Label est requis'];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (gender) {
      updateGenderMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Genre modifié avec succès.');
        },
      });
    } else {
      createGenderMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Genre créé avec succès.');
        },
      });
    }
  }, [gender, formData, updateGenderMutation, createGenderMutation, onFormSuccess, validateForm]);

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
            <GenericForm id="genderForm" onSubmit={handleSubmit}>
              <FormSectionTitle>Informations sur le Genre</FormSectionTitle>
              <FormTable>
                <tbody>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabel>Code</FormLabel>
                      <FormInput
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabelRequired>Label</FormLabelRequired>
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

export default GenderForm;