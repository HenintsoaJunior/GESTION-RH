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
import { useCreateUnit, useUpdateUnit } from '@/api/unit/services';
import { useGetAllServices } from '@/api/service/services';
import type { Unit, UnitDTOForm } from '@/api/unit/services';
import type { Service } from '@/api/service/services';

interface UnitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  unit: Unit | null;
}

const UnitForm: React.FC<UnitFormProps> = ({ isOpen, onClose, onFormSuccess, unit }) => {
  const [formData, setFormData] = useState<UnitDTOForm>({ unitName: '', serviceId: '' });
  const [serviceSearch, setServiceSearch] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const createUnitMutation = useCreateUnit();
  const unitId = unit?.unitId || '';
  const updateUnitMutation = useUpdateUnit(unitId);

  const { data: allServicesResponse } = useGetAllServices();
  const allServices = useMemo(() => allServicesResponse?.data || [], [allServicesResponse]);

  const serviceSuggestions = useMemo(() => allServices.map((svc: Service) => svc.serviceName), [allServices]);

  const filteredServiceSuggestions = useMemo(() => serviceSuggestions.filter((sug) =>
    sug.toLowerCase().includes(serviceSearch.toLowerCase())
  ), [serviceSuggestions, serviceSearch]);

  useEffect(() => {
    if (unit) {
      setFormData({ unitName: unit.unitName, serviceId: unit.serviceId });
      setServiceSearch(unit.service?.serviceName || '');
    } else {
      setFormData({ unitName: '', serviceId: '' });
      setServiceSearch('');
    }
    setFieldErrors({});
  }, [unit]);

  // Mémorisation des états calculés
  const isUpdateMode = useMemo(() => !!unit, [unit]);
  const isProcessing = useMemo(() => 
    createUnitMutation.isPending || updateUnitMutation.isPending,
    [createUnitMutation.isPending, updateUnitMutation.isPending]
  );

  // Mémorisation des textes dynamiques
  const popupTitle = useMemo(() => 
    isUpdateMode ? 'Modifier l\'unité' : 'Ajouter une unité',
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
    setFormData((prev: UnitDTOForm) => ({ ...prev, unitName: value }));
    // Clear error on change
    if (fieldErrors['unitName']) {
      setFieldErrors(prev => ({ ...prev, 'unitName': [] }));
    }
  }, [fieldErrors]);

  const handleServiceChange = useCallback((value: string): void => {
    setServiceSearch(value);
    const matchedService = allServices.find((svc: Service) => svc.serviceName === value);
    if (matchedService) {
      setFormData((prev) => ({ ...prev, serviceId: matchedService.serviceId }));
    } else {
      setFormData((prev) => ({ ...prev, serviceId: '' }));
    }
    // Clear error on change
    if (fieldErrors['serviceId']) {
      setFieldErrors(prev => ({ ...prev, 'serviceId': [] }));
    }
  }, [allServices, fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    if (!formData.unitName.trim()) {
      newErrors['unitName'] = ['Nom de l\'unité est requis'];
    }
    if (!formData.serviceId.trim()) {
      newErrors['serviceId'] = ['Service est requis'];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (unit) {
      updateUnitMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Unité modifiée avec succès.');
        },
      });
    } else {
      createUnitMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Unité créée avec succès.');
        },
      });
    }
  }, [unit, formData, updateUnitMutation, createUnitMutation, onFormSuccess, validateForm]);

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
            <GenericForm id="unitForm" onSubmit={handleSubmit}>
              <FormSectionTitle>Informations sur l'Unité</FormSectionTitle>
              <FormTable>
                <tbody>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabelRequired>Nom de l'unité</FormLabelRequired>
                      <FormInput
                        type="text"
                        name="unitName"
                        value={formData.unitName}
                        onChange={handleNameChange}
                        disabled={isProcessing}
                        className={fieldErrors['unitName'] && fieldErrors['unitName'].length > 0 ? "input-error" : ""}
                      />
                      {fieldErrors['unitName'] && fieldErrors['unitName'].length > 0 && (
                        <ErrorMessage>{fieldErrors['unitName'].join(", ")}</ErrorMessage>
                      )}
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabelRequired>Service</FormLabelRequired>
                      <StyledAutoCompleteInput
                        value={serviceSearch}
                        onChange={handleServiceChange}
                        suggestions={filteredServiceSuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner un service..."
                        disabled={isProcessing}
                        fieldType="service"
                        fieldLabel="service"
                        showAddOption={false}
                      />
                      {fieldErrors['serviceId'] && fieldErrors['serviceId'].length > 0 && (
                        <ErrorMessage>{fieldErrors['serviceId'].join(", ")}</ErrorMessage>
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

export default UnitForm;