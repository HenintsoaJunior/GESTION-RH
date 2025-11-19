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
import { useCreateDepartment, useUpdateDepartment } from '@/api/department/services';
import { useGetAllDirections } from '@/api/direction/services';

import type { Department, DepartmentDTOForm } from '@/api/department/services';
import type { Direction } from '@/api/direction/services';

interface DepartmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  department: Department | null;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ isOpen, onClose, onFormSuccess, department }) => {
  const [formData, setFormData] = useState<DepartmentDTOForm>({ name: '', directionId: '' });
  const [directionSearch, setDirectionSearch] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const createDepartmentMutation = useCreateDepartment();
  const departmentId = department?.departmentId || '';
  const updateDepartmentMutation = useUpdateDepartment(departmentId);

  const { data: allDirectionsResponse } = useGetAllDirections();
  const directions = useMemo(() => allDirectionsResponse?.data || [], [allDirectionsResponse]);

  const directionSuggestions = useMemo(() => directions.map((dir: Direction) => dir.directionName), [directions]);

  const filteredDirectionSuggestions = useMemo(() => directionSuggestions.filter((sug) =>
    sug.toLowerCase().includes(directionSearch.toLowerCase())
  ), [directionSuggestions, directionSearch]);

  useEffect(() => {
    if (department) {
      setFormData({ name: department.departmentName, directionId: department.directionId });
      setDirectionSearch(department.direction?.directionName || '');
    } else {
      setFormData({ name: '', directionId: '' });
      setDirectionSearch('');
    }
    setFieldErrors({});
  }, [department]);

  // Mémorisation des états calculés
  const isUpdateMode = useMemo(() => !!department, [department]);
  const isProcessing = useMemo(() => 
    createDepartmentMutation.isPending || updateDepartmentMutation.isPending,
    [createDepartmentMutation.isPending, updateDepartmentMutation.isPending]
  );

  // Mémorisation des textes dynamiques
  const popupTitle = useMemo(() => 
    isUpdateMode ? 'Modifier le département' : 'Ajouter un département',
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
    setFormData((prev: DepartmentDTOForm) => ({ ...prev, name: value }));
    // Clear error on change
    if (fieldErrors['name']) {
      setFieldErrors(prev => ({ ...prev, 'name': [] }));
    }
  }, [fieldErrors]);

  const handleDirectionChange = useCallback((value: string): void => {
    setDirectionSearch(value);
    const matchedDirection = directions.find((dir: Direction) => dir.directionName === value);
    if (matchedDirection) {
      setFormData((prev) => ({ ...prev, directionId: matchedDirection.directionId }));
    } else {
      setFormData((prev) => ({ ...prev, directionId: '' }));
    }
    // Clear error on change
    if (fieldErrors['directionId']) {
      setFieldErrors(prev => ({ ...prev, 'directionId': [] }));
    }
  }, [directions, fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    if (!formData.name.trim()) {
      newErrors['name'] = ['Nom du département est requis'];
    }
    if (!formData.directionId.trim()) {
      newErrors['directionId'] = ['Direction est requise'];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (department) {
      updateDepartmentMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Département modifié avec succès.');
        },
      });
    } else {
      createDepartmentMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Département créé avec succès.');
        },
      });
    }
  }, [department, formData, updateDepartmentMutation, createDepartmentMutation, onFormSuccess, validateForm]);

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
            <GenericForm id="departmentForm" onSubmit={handleSubmit}>
              <FormSectionTitle>Informations sur le Département</FormSectionTitle>
              <FormTable>
                <tbody>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabelRequired>Nom du département</FormLabelRequired>
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
                      <FormLabelRequired>Direction</FormLabelRequired>
                      <StyledAutoCompleteInput
                        value={directionSearch}
                        onChange={handleDirectionChange}
                        suggestions={filteredDirectionSuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner une direction..."
                        disabled={isProcessing}
                        fieldType="direction"
                        fieldLabel="direction"
                        showAddOption={false}
                      />
                      {fieldErrors['directionId'] && fieldErrors['directionId'].length > 0 && (
                        <ErrorMessage>{fieldErrors['directionId'].join(", ")}</ErrorMessage>
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

export default DepartmentForm;