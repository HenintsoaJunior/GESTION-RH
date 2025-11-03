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
  StyledAutoCompleteInput,
  ErrorMessage
} from "@/styles/form-container";
import { useCreateLieu, useUpdateLieu } from '@/api/lieu/services';
import { useGetAllGeoZones } from '@/api/zones/services';
import type { Lieu, LieuDTOForm, GeoZone } from '@/api/lieu/services';

interface LieuFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  lieu: Lieu | null;
}

const LieuForm: React.FC<LieuFormProps> = ({ isOpen, onClose, onFormSuccess, lieu }) => {
  const [formData, setFormData] = useState<LieuDTOForm>({ nom: '', ville: '', codePostal: '', pays: '', zoneId: '' });
  const [zoneSearch, setZoneSearch] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const createLieuMutation = useCreateLieu();
  const lieuId = lieu?.lieuId || '';
  const updateLieuMutation = useUpdateLieu(lieuId);
  const { data: geoZonesData } = useGetAllGeoZones();

  const geoZones: GeoZone[] = useMemo(() => geoZonesData?.data || [], [geoZonesData]);

  const zoneSuggestions = useMemo(() => geoZones.map((zone: GeoZone) => zone.name), [geoZones]);

  const filteredZoneSuggestions = useMemo(() => 
    zoneSuggestions.filter((sug) => sug.toLowerCase().includes(zoneSearch.toLowerCase())),
    [zoneSuggestions, zoneSearch]
  );

  useEffect(() => {
    if (lieu) {
      setFormData({ 
        nom: lieu.nom, 
        ville: lieu.ville ?? '', 
        codePostal: lieu.codePostal ?? '', 
        pays: lieu.pays, 
        zoneId: lieu.zoneId ?? '' 
      });
      setZoneSearch(lieu.geoZone?.name || '');
    } else {
      setFormData({ nom: '', ville: '', codePostal: '', pays: '', zoneId: '' });
      setZoneSearch('');
    }
    setFieldErrors({});
  }, [lieu]);

  // Mémorisation des états calculés
  const isUpdateMode = useMemo(() => !!lieu, [lieu]);
  const isProcessing = useMemo(() => 
    createLieuMutation.isPending || updateLieuMutation.isPending,
    [createLieuMutation.isPending, updateLieuMutation.isPending]
  );

  // Mémorisation des textes dynamiques
  const popupTitle = useMemo(() => 
    isUpdateMode ? 'Modifier le lieu' : 'Ajouter un lieu',
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
    setFormData((prev: LieuDTOForm) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (fieldErrors[name as keyof LieuDTOForm]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
  }, [fieldErrors]);

  const handleZoneChange = useCallback((value: string): void => {
    setZoneSearch(value);
    const matchedZone = geoZones.find((zone: GeoZone) => zone.name === value);
    if (matchedZone) {
      setFormData((prev) => ({ ...prev, zoneId: matchedZone.zoneId }));
    } else {
      setFormData((prev) => ({ ...prev, zoneId: '' }));
    }
    // Clear error on change
    if (fieldErrors['zoneId']) {
      setFieldErrors(prev => ({ ...prev, 'zoneId': [] }));
    }
  }, [geoZones, fieldErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    if (!formData.nom.trim()) {
      newErrors.nom = ['Nom du lieu est requis'];
    }
    if (!formData.pays.trim()) {
      newErrors.pays = ['Pays est requis'];
    }
    if (formData.zoneId == null || !formData.zoneId.trim()) {
      newErrors.zoneId = ['Zone géographique est requise'];
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (lieu) {
      updateLieuMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Lieu modifié avec succès.');
        },
      });
    } else {
      createLieuMutation.mutate(formData, {
        onSuccess: () => {
          onFormSuccess('Lieu créé avec succès.');
        },
      });
    }
  }, [lieu, formData, updateLieuMutation, createLieuMutation, onFormSuccess, validateForm]);

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
            <GenericForm id="lieuForm" onSubmit={handleSubmit}>
              <FormSectionTitle>Informations sur le Lieu</FormSectionTitle>
              <FormTable>
                <tbody>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabelRequired>Nom du lieu</FormLabelRequired>
                      <FormInput
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        disabled={isProcessing}
                        className={fieldErrors.nom && fieldErrors.nom.length > 0 ? "input-error" : ""}
                      />
                      {fieldErrors.nom && fieldErrors.nom.length > 0 && (
                        <ErrorMessage>{fieldErrors.nom.join(", ")}</ErrorMessage>
                      )}
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabelRequired>Pays</FormLabelRequired>
                      <FormInput
                        type="text"
                        name="pays"
                        value={formData.pays}
                        onChange={handleChange}
                        disabled={isProcessing}
                        className={fieldErrors.pays && fieldErrors.pays.length > 0 ? "input-error" : ""}
                      />
                      {fieldErrors.pays && fieldErrors.pays.length > 0 && (
                        <ErrorMessage>{fieldErrors.pays.join(", ")}</ErrorMessage>
                      )}
                    </FormFieldCell>
                  </FormRow>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabel>Ville</FormLabel>
                      <FormInput
                        type="text"
                        name="ville"
                        value={formData.ville ?? ''}
                        onChange={handleChange}
                        disabled={isProcessing}
                        className={fieldErrors.ville && fieldErrors.ville.length > 0 ? "input-error" : ""}
                      />
                      {fieldErrors.ville && fieldErrors.ville.length > 0 && (
                        <ErrorMessage>{fieldErrors.ville.join(", ")}</ErrorMessage>
                      )}
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabel>Code Postal</FormLabel>
                      <FormInput
                        type="text"
                        name="codePostal"
                        value={formData.codePostal ?? ''}
                        onChange={handleChange}
                        disabled={isProcessing}
                        className={fieldErrors.codePostal && fieldErrors.codePostal.length > 0 ? "input-error" : ""}
                      />
                      {fieldErrors.codePostal && fieldErrors.codePostal.length > 0 && (
                        <ErrorMessage>{fieldErrors.codePostal.join(", ")}</ErrorMessage>
                      )}
                    </FormFieldCell>
                  </FormRow>
                  <FormRow>
                    <FormFieldCell>
                      <FormLabelRequired>Zone Géographique</FormLabelRequired>
                      <StyledAutoCompleteInput
                        value={zoneSearch}
                        onChange={handleZoneChange}
                        suggestions={filteredZoneSuggestions}
                        maxVisibleItems={5}
                        placeholder="Sélectionner une zone géographique..."
                        disabled={isProcessing}
                        fieldType="zone"
                        fieldLabel="zone"
                        showAddOption={false}
                      />
                      {fieldErrors.zoneId && fieldErrors.zoneId.length > 0 && (
                        <ErrorMessage>{fieldErrors.zoneId.join(", ")}</ErrorMessage>
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

export default LieuForm;