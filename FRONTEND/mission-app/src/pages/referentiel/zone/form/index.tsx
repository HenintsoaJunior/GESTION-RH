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
import { useCreateGeoZone, useUpdateGeoZone } from '@/api/zones/services';
import type { GeoZone, GeoZoneDTOForm } from '@/api/zones/services';

interface GeoZoneFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  geoZone: GeoZone | null;
}

const GeoZoneForm: React.FC<GeoZoneFormProps> = ({ isOpen, onClose, onFormSuccess, geoZone }) => {
  const [formData, setFormData] = useState<GeoZoneDTOForm>({ name: '' });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const createGeoZoneMutation = useCreateGeoZone();
  const zoneId = geoZone?.zoneId || '';
  const updateGeoZoneMutation = useUpdateGeoZone(zoneId);

  useEffect(() => {
    if (geoZone) {
      setFormData({ name: geoZone.name });
    } else {
      setFormData({ name: '' });
    }
    setFieldErrors({});
  }, [geoZone]);

  // Mémorisation des états calculés
  const isUpdateMode = useMemo(() => !!geoZone, [geoZone]);
  const isProcessing = useMemo(() => 
    createGeoZoneMutation.isPending || updateGeoZoneMutation.isPending,
    [createGeoZoneMutation.isPending, updateGeoZoneMutation.isPending]
  );

  // Mémorisation des textes dynamiques
  const popupTitle = useMemo(() => 
    isUpdateMode ? 'Modifier la zone géo' : 'Ajouter une zone géo',
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
    setFormData((prev: GeoZoneDTOForm) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (fieldErrors[name as keyof GeoZoneDTOForm]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
  }, [fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    if (!formData.name.trim()) {
      newErrors.name = ['Nom de la zone géo est requis'];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (geoZone) {
      updateGeoZoneMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Zone géo modifiée avec succès.');
        },
      });
    } else {
      createGeoZoneMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Zone géo créée avec succès.');
        },
      });
    }
  }, [geoZone, formData, updateGeoZoneMutation, createGeoZoneMutation, onFormSuccess, validateForm]);

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
            <GenericForm id="geoZoneForm" onSubmit={handleSubmit}>
              <FormSectionTitle>Informations sur la Zone Géo</FormSectionTitle>
              <FormTable>
                <tbody>
                  <FormRow>
                    <FormFieldCell>
                      <FormLabelRequired>Nom de la zone géo</FormLabelRequired>
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

export default GeoZoneForm;