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
import { useCreateSite, useUpdateSite } from '@/api/site/services';
import type { Site, CreateSiteDTO } from '@/api/site/services';

interface SiteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  site: Site | null;
}

const SiteForm: React.FC<SiteFormProps> = ({ isOpen, onClose, onFormSuccess, site }) => {
  const [formData, setFormData] = useState<CreateSiteDTO>({ siteName: '', code: '', longitude: undefined, latitude: undefined });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const createSiteMutation = useCreateSite();
  const siteId = site?.siteId || '';
  const updateSiteMutation = useUpdateSite(siteId);

  useEffect(() => {
    if (site) {
      setFormData({ 
        siteName: site.siteName, 
        code: site.code || '', 
        longitude: site.longitude, 
        latitude: site.latitude 
      });
    } else {
      setFormData({ siteName: '', code: '', longitude: undefined, latitude: undefined });
    }
    setFieldErrors({});
  }, [site]);

  // Mémorisation des états calculés
  const isUpdateMode = useMemo(() => !!site, [site]);
  const isProcessing = useMemo(() => 
    createSiteMutation.isPending || updateSiteMutation.isPending,
    [createSiteMutation.isPending, updateSiteMutation.isPending]
  );

  // Mémorisation des textes dynamiques
  const popupTitle = useMemo(() => 
    isUpdateMode ? 'Modifier le site' : 'Ajouter un site',
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
    if (name === 'longitude' || name === 'latitude') {
      setFormData((prev: CreateSiteDTO) => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
    } else {
      setFormData((prev: CreateSiteDTO) => ({ ...prev, [name]: value }));
    }
    // Clear error on change
    if (fieldErrors[name as keyof CreateSiteDTO]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
  }, [fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    if (!formData.siteName.trim()) {
      newErrors.siteName = ['Nom du site est requis'];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (site) {
      updateSiteMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Site modifié avec succès.');
        },
      });
    } else {
      createSiteMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Site créé avec succès.');
        },
      });
    }
  }, [site, formData, updateSiteMutation, createSiteMutation, onFormSuccess, validateForm]);

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
            <GenericForm id="siteForm" onSubmit={handleSubmit}>
              <FormSectionTitle>Informations sur le Site</FormSectionTitle>
              <FormTable>
                <tbody>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabelRequired>Nom du site</FormLabelRequired>
                      <FormInput
                        type="text"
                        name="siteName"
                        value={formData.siteName}
                        onChange={handleChange}
                        disabled={isProcessing}
                        className={fieldErrors.siteName && fieldErrors.siteName.length > 0 ? "input-error" : ""}
                      />
                      {fieldErrors.siteName && fieldErrors.siteName.length > 0 && (
                        <ErrorMessage>{fieldErrors.siteName.join(", ")}</ErrorMessage>
                      )}
                    </FormFieldCell>
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
                  </FormRow>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabel>Longitude</FormLabel>
                      <FormInput
                        type="number"
                        name="longitude"
                        value={formData.longitude ?? ''}
                        onChange={handleChange}
                        step="any"
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabel>Latitude</FormLabel>
                      <FormInput
                        type="number"
                        name="latitude"
                        value={formData.latitude ?? ''}
                        onChange={handleChange}
                        step="any"
                        disabled={isProcessing}
                      />
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

export default SiteForm;