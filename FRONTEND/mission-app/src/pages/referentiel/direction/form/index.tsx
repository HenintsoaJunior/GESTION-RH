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
import { useCreateDirection, useUpdateDirection } from '@/api/direction/services';
import type { Direction, DirectionDTOForm } from '@/api/direction/services';

interface DirectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  direction: Direction | null;
}

const DirectionForm: React.FC<DirectionFormProps> = ({ isOpen, onClose, onFormSuccess, direction }) => {
  const [formData, setFormData] = useState<DirectionDTOForm>({ name: '', acronym: '' });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const createDirectionMutation = useCreateDirection();
  const directionId = direction?.directionId || '';
  const updateDirectionMutation = useUpdateDirection(directionId);

  useEffect(() => {
    if (direction) {
      setFormData({ name: direction.directionName, acronym: direction.acronym });
    } else {
      setFormData({ name: '', acronym: '' });
    }
    setFieldErrors({});
  }, [direction]);

  // Mémorisation des états calculés
  const isUpdateMode = useMemo(() => !!direction, [direction]);
  const isProcessing = useMemo(() => 
    createDirectionMutation.isPending || updateDirectionMutation.isPending,
    [createDirectionMutation.isPending, updateDirectionMutation.isPending]
  );

  // Mémorisation des textes dynamiques
  const popupTitle = useMemo(() => 
    isUpdateMode ? 'Modifier la direction' : 'Ajouter une direction',
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
    setFormData((prev: DirectionDTOForm) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (fieldErrors[name as keyof DirectionDTOForm]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
  }, [fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    if (!formData.name.trim()) {
      newErrors.name = ['Nom de la direction est requis'];
    }
    if (!formData.acronym.trim()) {
      newErrors.acronym = ['Acronyme est requis'];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (direction) {
      updateDirectionMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Direction modifiée avec succès.');
        },
      });
    } else {
      createDirectionMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Direction créée avec succès.');
        },
      });
    }
  }, [direction, formData, updateDirectionMutation, createDirectionMutation, onFormSuccess, validateForm]);

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
            <GenericForm id="directionForm" onSubmit={handleSubmit}>
              <FormSectionTitle>Informations sur la Direction</FormSectionTitle>
              <FormTable>
                <tbody>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabelRequired>Nom de la direction</FormLabelRequired>
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
                    <FormFieldCell>
                      <FormLabelRequired>Acronyme</FormLabelRequired>
                      <FormInput
                        type="text"
                        name="acronym"
                        value={formData.acronym}
                        onChange={handleChange}
                        disabled={isProcessing}
                        className={fieldErrors.acronym && fieldErrors.acronym.length > 0 ? "input-error" : ""}
                      />
                      {fieldErrors.acronym && fieldErrors.acronym.length > 0 && (
                        <ErrorMessage>{fieldErrors.acronym.join(", ")}</ErrorMessage>
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

export default DirectionForm;