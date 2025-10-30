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
import { useCreateContractType, useUpdateContractType } from '@/api/contract/services';
import type { ContractType, CreateContractTypeDTO } from '@/api/contract/services';

interface ContractTypeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  contractType: ContractType | null;
}

const ContractTypeForm: React.FC<ContractTypeFormProps> = ({ isOpen, onClose, onFormSuccess, contractType }) => {
  const [formData, setFormData] = useState<CreateContractTypeDTO>({ code: '', label: '' });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const createContractTypeMutation = useCreateContractType();
  const contractTypeId = contractType?.contractTypeId || '';
  const updateContractTypeMutation = useUpdateContractType(contractTypeId);

  useEffect(() => {
    if (contractType) {
      setFormData({ 
        code: contractType.code || '', 
        label: contractType.label 
      });
    } else {
      setFormData({ code: '', label: '' });
    }
    setFieldErrors({});
  }, [contractType]);

  // Mémorisation des états calculés
  const isUpdateMode = useMemo(() => !!contractType, [contractType]);
  const isProcessing = useMemo(() => 
    createContractTypeMutation.isPending || updateContractTypeMutation.isPending,
    [createContractTypeMutation.isPending, updateContractTypeMutation.isPending]
  );

  // Mémorisation des textes dynamiques
  const popupTitle = useMemo(() => 
    isUpdateMode ? 'Modifier le type de contrat' : 'Ajouter un type de contrat',
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
    setFormData((prev: CreateContractTypeDTO) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (fieldErrors[name as keyof CreateContractTypeDTO]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
  }, [fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    if (!formData.code.trim()) {
      newErrors.code = ['Code est requis'];
    }
    if (!formData.label.trim()) {
      newErrors.label = ['Label est requis'];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (contractType) {
      updateContractTypeMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Type de contrat modifié avec succès.');
        },
      });
    } else {
      createContractTypeMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Type de contrat créé avec succès.');
        },
      });
    }
  }, [contractType, formData, updateContractTypeMutation, createContractTypeMutation, onFormSuccess, validateForm]);

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
            <GenericForm id="contractTypeForm" onSubmit={handleSubmit}>
              <FormSectionTitle>Informations sur le Type de Contrat</FormSectionTitle>
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

export default ContractTypeForm;