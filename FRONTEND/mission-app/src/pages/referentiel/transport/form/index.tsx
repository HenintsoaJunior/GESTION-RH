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
import { useCreateTransport, useUpdateTransport } from '@/api/transport/services';
import type { Transport, TransportDTOForm } from '@/api/transport/services';

interface TransportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  transport: Transport | null;
}

const TransportForm: React.FC<TransportFormProps> = ({ isOpen, onClose, onFormSuccess, transport }) => {
  const [formData, setFormData] = useState<TransportDTOForm>({ type: '' });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const createTransportMutation = useCreateTransport();
  const updateTransportMutation = useUpdateTransport();

  useEffect(() => {
    if (transport) {
      setFormData({ type: transport.type });
    } else {
      setFormData({ type: '' });
    }
    setFieldErrors({});
  }, [transport]);

  // Mémorisation des états calculés
  const isUpdateMode = useMemo(() => !!transport, [transport]);
  const isProcessing = useMemo(() => 
    createTransportMutation.isPending || updateTransportMutation.isPending,
    [createTransportMutation.isPending, updateTransportMutation.isPending]
  );

  // Mémorisation des textes dynamiques
  const popupTitle = useMemo(() => 
    isUpdateMode ? 'Modifier le transport' : 'Ajouter un transport',
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
    setFormData((prev: TransportDTOForm) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (fieldErrors[name as keyof TransportDTOForm]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
  }, [fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    if (!formData.type.trim()) {
      newErrors.type = ['Type est requis'];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (transport) {
      updateTransportMutation.mutate({ id: transport.transportId, transport: formData }, {
        onSuccess: () => {
          onFormSuccess('Transport modifié avec succès.');
        },
      });
    } else {
      createTransportMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Transport créé avec succès.');
        },
      });
    }
  }, [transport, formData, updateTransportMutation, createTransportMutation, onFormSuccess, validateForm]);

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
            <GenericForm id="transportForm" onSubmit={handleSubmit}>
              <FormSectionTitle>Informations sur le Transport</FormSectionTitle>
              <FormTable>
                <tbody>
                  <FormRow>
                    <FormFieldCell>
                      <FormLabelRequired>Type</FormLabelRequired>
                      <FormInput
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        disabled={isProcessing}
                        className={fieldErrors.type && fieldErrors.type.length > 0 ? "input-error" : ""}
                      />
                      {fieldErrors.type && fieldErrors.type.length > 0 && (
                        <ErrorMessage>{fieldErrors.type.join(", ")}</ErrorMessage>
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

export default TransportForm;