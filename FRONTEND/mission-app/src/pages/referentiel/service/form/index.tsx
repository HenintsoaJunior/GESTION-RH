"use client";
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
  StyledAutoCompleteInput,
  ErrorMessage
} from "@/styles/form-container";
import { useCreateService, useUpdateService } from '@/api/service/services';
import { useGetAllDepartments } from '@/api/department/services';
import type { Service, ServiceDTOForm } from '@/api/service/services';
import type { Department } from '@/api/department/services';

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  service: Service | null;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ isOpen, onClose, onFormSuccess, service }) => {
  const [formData, setFormData] = useState<ServiceDTOForm>({ name: '', departmentId: '' });
  const [departmentSearch, setDepartmentSearch] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const createServiceMutation = useCreateService();
  const serviceId = service?.serviceId || '';
  const updateServiceMutation = useUpdateService(serviceId);

  const { data: allDeptsResponse } = useGetAllDepartments();
  const allDepartments = useMemo(() => allDeptsResponse?.data || [], [allDeptsResponse]);

  const departmentSuggestions = useMemo(() => allDepartments.map((dept: Department) => dept.departmentName), [allDepartments]);

  const filteredDepartmentSuggestions = useMemo(() => departmentSuggestions.filter((sug) =>
    sug.toLowerCase().includes(departmentSearch.toLowerCase())
  ), [departmentSuggestions, departmentSearch]);

  useEffect(() => {
    if (service) {
      setFormData({ name: service.serviceName, departmentId: service.departmentId });
      setDepartmentSearch(service.department?.departmentName || '');
    } else {
      setFormData({ name: '', departmentId: '' });
      setDepartmentSearch('');
    }
    setFieldErrors({});
  }, [service]);

  // Mémorisation des états calculés
  const isUpdateMode = useMemo(() => !!service, [service]);
  const isProcessing = useMemo(() => 
    createServiceMutation.isPending || updateServiceMutation.isPending,
    [createServiceMutation.isPending, updateServiceMutation.isPending]
  );

  // Mémorisation des textes dynamiques
  const popupTitle = useMemo(() => 
    isUpdateMode ? 'Modifier le service' : 'Ajouter un service',
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

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev: ServiceDTOForm) => ({ ...prev, name: value }));
    // Clear error on change
    if (fieldErrors['name']) {
      setFieldErrors(prev => ({ ...prev, 'name': [] }));
    }
  }, [fieldErrors]);

  const handleDepartmentChange = useCallback((value: string): void => {
    setDepartmentSearch(value);
    const matchedDepartment = allDepartments.find((dept: Department) => dept.departmentName === value);
    if (matchedDepartment) {
      setFormData((prev) => ({ ...prev, departmentId: matchedDepartment.departmentId }));
    } else {
      setFormData((prev) => ({ ...prev, departmentId: '' }));
    }
    // Clear error on change
    if (fieldErrors['departmentId']) {
      setFieldErrors(prev => ({ ...prev, 'departmentId': [] }));
    }
  }, [allDepartments, fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    if (!formData.name.trim()) {
      newErrors['name'] = ['Nom du service est requis'];
    }
    if (!formData.departmentId.trim()) {
      newErrors['departmentId'] = ['Département est requis'];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (service) {
      updateServiceMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Service modifié avec succès.');
        },
      });
    } else {
      createServiceMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Service créé avec succès.');
        },
      });
    }
  }, [service, formData, updateServiceMutation, createServiceMutation, onFormSuccess, validateForm]);

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
            <GenericForm id="serviceForm" onSubmit={handleSubmit}>
              <FormSectionTitle>Informations sur le Service</FormSectionTitle>
              <FormTable>
                <tbody>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabelRequired>Nom du service</FormLabelRequired>
                      <FormInput
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleNameChange}
                        disabled={isProcessing}
                        className={fieldErrors['name'] && fieldErrors['name'].length > 0 ? "input-error" : ""}
                      />
                      {fieldErrors['name'] && fieldErrors['name'].length > 0 && (
                        <ErrorMessage>{fieldErrors['name'].join(", ")}</ErrorMessage>
                      )}
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabelRequired>Département</FormLabelRequired>
                      <StyledAutoCompleteInput
                        value={departmentSearch}
                        onChange={handleDepartmentChange}
                        suggestions={filteredDepartmentSuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner un département..."
                        disabled={isProcessing}
                        fieldType="department"
                        fieldLabel="department"
                        showAddOption={false}
                      />
                      {fieldErrors['departmentId'] && fieldErrors['departmentId'].length > 0 && (
                        <ErrorMessage>{fieldErrors['departmentId'].join(", ")}</ErrorMessage>
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

export default ServiceForm;