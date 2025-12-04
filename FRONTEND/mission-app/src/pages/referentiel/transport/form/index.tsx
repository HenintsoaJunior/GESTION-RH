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
  FormSectionTitle,
  FormTable,
  FormRow,
  FormFieldCell,
  FormLabelRequired,
  FormInput,
  ErrorMessage
} from "@/styles/form-container";

import { 
  useCreateTransport, 
  useUpdateTransport,
  type Transport, 
  type TransportDTOForm 
} from '@/api/transport/services';

interface TransportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  transport: Transport | null;
  prefillType?: string;
  onSuccessClose?: (newTransport: any) => void;
}

const TransportForm: React.FC<TransportFormProps> = ({ 
  isOpen, 
  onClose, 
  onFormSuccess, 
  transport,
  prefillType = '',
  onSuccessClose 
}) => {
  const [formData, setFormData] = useState<TransportDTOForm>({ type: '' });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});

  const createTransportMutation = useCreateTransport();
  const updateTransportMutation = useUpdateTransport(transport?.transportId || '');

  useEffect(() => {
    if (transport) {
      setFormData({ type: transport.type });
    } else if (prefillType) {
      setFormData({ type: prefillType });
    } else {
      setFormData({ type: '' });
    }
    setFieldErrors({});
  }, [transport, prefillType, isOpen]);

  const isUpdateMode = useMemo(() => !!transport, [transport]);
  const isProcessing = useMemo(() => 
    createTransportMutation.isPending || updateTransportMutation.isPending,
    [createTransportMutation.isPending, updateTransportMutation.isPending]
  );

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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
  }, [fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    if (!formData.type.trim()) {
      newErrors.type = ['Le type est requis'];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (isProcessing) return;
    
    if (!validateForm()) return;

    const handleSuccess = (data: any, message: string) => {
      onFormSuccess(message);
      if (onSuccessClose && data?.data) {
        onSuccessClose(data.data);
      }
    };

    try {
      if (isUpdateMode) {
        await updateTransportMutation.mutateAsync(formData, {
          onSuccess: (response) => {
            handleSuccess(response, 'Transport modifié avec succès.');
          },
        });
      } else {
        await createTransportMutation.mutateAsync(formData, {
          onSuccess: (response) => {
            handleSuccess(response, 'Transport créé avec succès.');
          },
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création/modification du transport:', error);
    }
  }, [
    formData,
    isUpdateMode,
    validateForm,
    updateTransportMutation,
    createTransportMutation,
    onFormSuccess,
    onSuccessClose,
    isProcessing
  ]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleCancel = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFieldErrors({});
    onClose();
  }, [onClose]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!isOpen) return null;

  return (
    <PopupOverlay onClick={handleCancel}>
      <PagePopup onClick={handleOverlayClick}>
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
            <div 
              onKeyDown={handleKeyDown}
              role="form"
              aria-label={popupTitle}
              style={{ width: '100%' }}
            >
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
                        className={fieldErrors.type ? "input-error" : ""}
                        placeholder="Ex: Voiture de service, Train, Avion..."
                        autoFocus
                        required
                      />
                      {fieldErrors.type && (
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
                  style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary 
                  type="button" 
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                >
                  <Save size={16} />
                  <span>{isProcessing ? submittingText : submitText}</span>
                </ButtonPrimary>
              </div>
            </div>
          </FormContainer>
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
};

export default TransportForm;