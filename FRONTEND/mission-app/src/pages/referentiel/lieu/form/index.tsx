/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState, useCallback } from 'react';
import { X, Save, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupContent,
  ButtonPrimary,
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
  ErrorMessage,
} from "@/styles/form-container";
import { useCreateLieu, useUpdateLieu } from '@/api/lieu/services';
import { useGetAllGeoZones } from '@/api/zones/services';
import type { Lieu, LieuDTOForm, GeoZone } from '@/api/lieu/services';

// Fix icônes Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const defaultIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

interface LieuFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSuccess: (message: string) => void;
  lieu?: Lieu | null;
  prefillNom?: string;
  onSuccessClose?: (newLieu: Lieu) => void;
}

const LieuForm: React.FC<LieuFormProps> = ({
  isOpen,
  onClose,
  onFormSuccess,
  lieu = null,
  prefillNom = '',
  onSuccessClose,
}) => {
  const [formData, setFormData] = useState<LieuDTOForm>({
    nom: '',
    ville: null,
    codePostal: null,
    pays: '',
    zoneId: null,
    latitude: 0,
    longitude: 0,
  });

  const [zoneSearch, setZoneSearch] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [markerPosition, setMarkerPosition] = useState<LatLngTuple | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const createMutation = useCreateLieu();
  const updateMutation = useUpdateLieu(lieu?.lieuId ?? '');
  const { data: geoZonesData } = useGetAllGeoZones();

  const geoZones = useMemo<GeoZone[]>(() => geoZonesData?.data || [], [geoZonesData]);
  const zoneSuggestions = useMemo(() => geoZones.map(z => z.name), [geoZones]);
  const filteredZoneSuggestions = useMemo(
    () => zoneSuggestions.filter(s => s.toLowerCase().includes(zoneSearch.toLowerCase())),
    [zoneSuggestions, zoneSearch]
  );

  const isUpdateMode = !!lieu?.lieuId;
  const isProcessing = createMutation.isPending || updateMutation.isPending || isLoadingAddress;

  // Reset + pré-remplissage
  useEffect(() => {
    if (!isOpen) {
      setMarkerPosition(null);
      return;
    }

    if (lieu) {
      setFormData({
        nom: lieu.nom,
        ville: lieu.ville ?? null,
        codePostal: lieu.codePostal ?? null,
        pays: lieu.pays,
        zoneId: lieu.zoneId ?? null,
        latitude: lieu.latitude ?? 0,
        longitude: lieu.longitude ?? 0,
      });
      setZoneSearch(lieu.geoZone?.name || '');
      if (lieu.latitude && lieu.longitude) {
        setMarkerPosition([lieu.latitude, lieu.longitude]);
      }
    } else {
      setFormData({
        nom: prefillNom || '',
        ville: null,
        codePostal: null,
        pays: '',
        zoneId: null,
        latitude: 0,
        longitude: 0,
      });
      setZoneSearch('');
      setMarkerPosition(null);
    }
    setFieldErrors({});
  }, [isOpen, lieu, prefillNom]);

  // Récupération de l'adresse via géocodage inverse
  const fetchAddress = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      const a = data.address || {};
      const ville = a.city || a.town || a.village || a.hamlet || a.suburb || '';
      const codePostal = a.postcode || '';
      const pays = a.country || a.country_code?.toUpperCase() || '';

      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        ville: ville || prev.ville,
        codePostal: codePostal || prev.codePostal,
        pays: pays || prev.pays,
        nom: ville || prev.nom,
      }));
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    fetchAddress(lat, lng);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = ['latitude', 'longitude'].includes(name) ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: numValue }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: [] }));
  };

  const handleZoneChange = (value: string) => {
    setZoneSearch(value);
    const matched = geoZones.find(z => z.name === value);
    setFormData(prev => ({ ...prev, zoneId: matched?.zoneId ?? null }));
    if (fieldErrors.zoneId) setFieldErrors(prev => ({ ...prev, zoneId: [] }));
  };

  const validate = () => {
    const errors: Record<string, string[]> = {};
    if (!formData.nom.trim()) errors.nom = ['Le nom est requis'];
    if (!formData.pays.trim()) errors.pays = ['Le pays est requis'];
    if (!formData.zoneId) errors.zoneId = ['La zone est requise'];
    if (!isUpdateMode && formData.latitude === 0 && formData.longitude === 0) {
      errors.position = ['Veuillez placer un marqueur sur la carte'];
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (isProcessing) return;
    
    if (!validate()) return;

    const handleSuccess = (data: any) => {
      // N'appeler onFormSuccess que si nécessaire
      // Pour éviter les alertes, on passe un message vide ou on n'appelle pas du tout
      if (onFormSuccess) {
        // Passer un message vide pour éviter l'alerte
        onFormSuccess("");
      }
      
      const newLieu: Lieu = data.data;
      
      if (!isUpdateMode && onSuccessClose) {
        onSuccessClose(newLieu);
      } else {
        onClose();
      }
    };

    const errorHandler = (error: any) => {
      console.error('Erreur lors de la création/modification du lieu:', error);
    };

    const payload: LieuDTOForm = {
      nom: formData.nom.trim(),
      ville: formData.ville || null,
      codePostal: formData.codePostal || null,
      pays: formData.pays.trim(),
      zoneId: formData.zoneId || null,
      latitude: formData.latitude,
      longitude: formData.longitude,
    };

    try {
      if (isUpdateMode) {
        await updateMutation.mutateAsync(payload, { 
          onSuccess: handleSuccess,
          onError: errorHandler
        });
      } else {
        await createMutation.mutateAsync(payload, { 
          onSuccess: handleSuccess,
          onError: errorHandler
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création/modification du lieu:', error);
    }
  }, [
    formData,
    isUpdateMode,
    validate,
    updateMutation,
    createMutation,
    onFormSuccess,
    onSuccessClose,
    onClose,
    isProcessing
  ]);

  // Gestion spéciale pour la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Gestion de la soumission du formulaire
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Empêche la propagation de l'événement
    handleSubmit();
    return false;
  };

  if (!isOpen) return null;

  return (
    <PopupOverlay>
      <PagePopup style={{ maxWidth: '1100px', width: '95%' }}>
        <PopupHeader>
          <PopupTitle>{isUpdateMode ? 'Modifier le lieu' : 'Ajouter un lieu'}</PopupTitle>
          <PopupClose onClick={onClose} disabled={isProcessing}>
            <X className="w-5 h-5" />
          </PopupClose>
        </PopupHeader>

        <PopupContent>
          <FormContainer>
            <GenericForm 
              onSubmit={handleFormSubmit}
              onKeyDown={handleKeyDown}
            >
              <FormSectionTitle>Informations générales</FormSectionTitle>

              <FormTable>
                <tbody>
                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabelRequired>Nom du lieu</FormLabelRequired>
                      <FormInput
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        disabled={isProcessing}
                        placeholder="Ex: Antananarivo, Stade Mahamasina..."
                      />
                      {fieldErrors.nom && <ErrorMessage>{fieldErrors.nom[0]}</ErrorMessage>}
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabelRequired>Pays</FormLabelRequired>
                      <FormInput
                        name="pays"
                        value={formData.pays}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        disabled={isProcessing}
                        placeholder="Ex: Madagascar"
                      />
                      {fieldErrors.pays && <ErrorMessage>{fieldErrors.pays[0]}</ErrorMessage>}
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
                        placeholder="Sélectionner une zone..."
                        disabled={isProcessing}
                        fieldType="zone"
                        fieldLabel="zone"
                        showAddOption={false}
                      />
                      {fieldErrors.zoneId && <ErrorMessage>{fieldErrors.zoneId[0]}</ErrorMessage>}
                    </FormFieldCell>
                  </FormRow>

                  <FormRow className="dual-field-row">
                    <FormFieldCell>
                      <FormLabelRequired>Latitude</FormLabelRequired>
                      <FormInput
                        type="number"
                        step="0.000001"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                    <FormFieldCell>
                      <FormLabelRequired>Longitude</FormLabelRequired>
                      <FormInput
                        type="number"
                        step="0.000001"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        disabled={isProcessing}
                      />
                    </FormFieldCell>
                  </FormRow>
                </tbody>
              </FormTable>

              <div style={{ marginTop: '30px' }}>
                <FormSectionTitle>
                  <MapPin size={18} style={{ marginRight: '8px' }} />
                  Cliquez sur la carte pour placer le marqueur
                </FormSectionTitle>

                <div style={{ height: '420px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e0e0e0', position: 'relative' }}>
                  <MapContainer
                    center={markerPosition ?? [-18.8792, 47.5079]}
                    zoom={markerPosition ? 15 : 6}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapClickHandler onClick={handleMapClick} />
                    {markerPosition && <Marker position={markerPosition} icon={defaultIcon} />}
                  </MapContainer>

                  {isLoadingAddress && (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0,0,0,0.8)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      zIndex: 1000,
                    }}>
                      Recherche de l'adresse en cours...
                    </div>
                  )}
                </div>

                {fieldErrors.position && <ErrorMessage style={{ marginTop: '8px' }}>{fieldErrors.position[0]}</ErrorMessage>}

                <p style={{ marginTop: '12px', fontSize: '14px', color: '#555' }}>
                  Position : <strong>{formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</strong>
                  {formData.ville && ` — ${formData.ville}${formData.codePostal ? ` (${formData.codePostal})` : ''}`}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                <ButtonPrimary 
                  type="button" 
                  onClick={onClose} 
                  disabled={isProcessing}
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={isProcessing}
                >
                  <Save size={16} />
                  <span>{isProcessing ? 'En cours...' : isUpdateMode ? 'Modifier' : 'Créer'}</span>
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