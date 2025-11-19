/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useMemo, useEffect } from 'react';
import {
  FiltersContainer,
  FiltersHeader,
  FiltersTitle,
  FiltersControls,
  FilterControlButton,
  FiltersSection,
  FormLabelSearch,
  StyledSelect,
  FiltersActions,
  ButtonReset,
  ButtonSearch,
  Separator,
} from "@/styles/table-styles";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MissionsEnCoursMapPage = () => {
  // Zones et pays pour les filtres
  const zonesOptions = [
    { value: '', label: 'Toutes les zones' },
    { value: 'Africa', label: 'Afrique' },
    { value: 'Europe', label: 'Europe' },
    { value: 'North America', label: 'Amérique du Nord' },
    { value: 'Asia', label: 'Asie' },
  ];

  const paysOptions = [
    { value: '', label: 'Tous les pays' },
    { value: 'Madagascar', label: 'Madagascar' },
    { value: 'Senegal', label: 'Sénégal' },
    { value: 'France', label: 'France' },
    { value: 'Germany', label: 'Allemagne' },
    { value: 'USA', label: 'États-Unis' },
    { value: 'Japan', label: 'Japon' },
  ];

  // Données de démonstration pour les personnes avec missions en cours (diversifiées par zone/pays)
  const toutesPersonnesData = [
    { id: 1, nom: 'Jean Dupont', mission: 'Développement Frontend', ville: 'Antananarivo', country: 'Madagascar', zone: 'Africa', lat: -18.8792, lng: 47.5079, avancement: '75%' },
    { id: 2, nom: 'Marie Rasoanirina', mission: 'Analyse Données', ville: 'Toamasina', country: 'Madagascar', zone: 'Africa', lat: -18.1450, lng: 49.3899, avancement: '60%' },
    { id: 3, nom: 'Pierre Rakoto', mission: 'Gestion Projet', ville: 'Fianarantsoa', country: 'Madagascar', zone: 'Africa', lat: -21.4526, lng: 47.0857, avancement: '85%' },
    { id: 4, nom: 'Sophie Andrianarisoa', mission: 'QA Testing', ville: 'Mahajanga', country: 'Madagascar', zone: 'Africa', lat: -15.3581, lng: 46.3036, avancement: '40%' },
    { id: 5, nom: 'Luc Vololona', mission: 'Support Client', ville: 'Toliara', country: 'Madagascar', zone: 'Africa', lat: -23.3420, lng: 43.6671, avancement: '90%' },
    { id: 6, nom: 'Anna Razafindrakoto', mission: 'Design UI/UX', ville: 'Dakar', country: 'Senegal', zone: 'Africa', lat: 14.7167, lng: -17.4677, avancement: '55%' },
    { id: 7, nom: 'Michel Heriniaina', mission: 'DevOps', ville: 'Paris', country: 'France', zone: 'Europe', lat: 48.8566, lng: 2.3522, avancement: '70%' },
    { id: 8, nom: 'Claire Tsiahoana', mission: 'Marketing Digital', ville: 'Berlin', country: 'Germany', zone: 'Europe', lat: 52.5200, lng: 13.4050, avancement: '65%' },
    { id: 9, nom: 'David Randria', mission: 'Backend PHP', ville: 'New York', country: 'USA', zone: 'North America', lat: 40.7128, lng: -74.0060, avancement: '80%' },
    { id: 10, nom: 'Elise Nirina', mission: 'RH Recrutement', ville: 'Los Angeles', country: 'USA', zone: 'North America', lat: 34.0522, lng: -118.2437, avancement: '50%' },
    { id: 11, nom: 'Franck Andrianaivo', mission: 'Sécurité IT', ville: 'Tokyo', country: 'Japan', zone: 'Asia', lat: 35.6895, lng: 139.6917, avancement: '95%' },
    { id: 12, nom: 'Gaëlle Miarintsoa', mission: 'Comptabilité', ville: 'Osaka', country: 'Japan', zone: 'Asia', lat: 34.6937, lng: 135.5023, avancement: '45%' },
    { id: 13, nom: 'Henri Ratsirarson', mission: 'Logistique', ville: 'Antananarivo', country: 'Madagascar', zone: 'Africa', lat: -18.8792, lng: 47.5079, avancement: '78%' },
    { id: 14, nom: 'Isabelle Fanambinantsoa', mission: 'Formation', ville: 'Toamasina', country: 'Madagascar', zone: 'Africa', lat: -18.1450, lng: 49.3899, avancement: '62%' },
    { id: 15, nom: 'Jacques Razafimanantsoa', mission: 'Ventes', ville: 'Fianarantsoa', country: 'Madagascar', zone: 'Africa', lat: -21.4526, lng: 47.0857, avancement: '88%' },
    { id: 16, nom: 'Karine Andrianasolo', mission: 'Admin Système', ville: 'Mahajanga', country: 'Madagascar', zone: 'Africa', lat: -15.3581, lng: 46.3036, avancement: '35%' },
    { id: 17, nom: 'Léonard Rakotomalala', mission: 'R&D', ville: 'Toliara', country: 'Madagascar', zone: 'Africa', lat: -23.3420, lng: 43.6671, avancement: '92%' },
    { id: 18, nom: 'MiantsaFitia RAKOTOARIMANANA', mission: 'Gestion Projet', ville: 'Antsiranana', country: 'Madagascar', zone: 'Africa', lat: -12.2804, lng: 49.2917, avancement: '48%' },
    { id: 19, nom: 'Nicolas Herimanjaka', mission: 'Finances', ville: 'Antananarivo', country: 'Madagascar', zone: 'Africa', lat: -18.8792, lng: 47.5079, avancement: '82%' },
    { id: 20, nom: 'Olivia Randriamahazo', mission: 'Communication', ville: 'Toamasina', country: 'Madagascar', zone: 'Africa', lat: -18.1450, lng: 49.3899, avancement: '67%' },
  ];

  // États pour les filtres
  const [zoneFilter, setZoneFilter] = useState('');
  const [paysFilter, setPaysFilter] = useState('');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);

  // Données filtrées
  const personnesData = useMemo(() => {
    return toutesPersonnesData.filter(personne => {
      const matchesZone = !zoneFilter || personne.zone === zoneFilter;
      const matchesPays = !paysFilter || personne.country === paysFilter;
      return matchesZone && matchesPays;
    });
  }, [zoneFilter, paysFilter, toutesPersonnesData]);

  // Composant pour centrer la map sur Madagascar (par défaut, ajustable si besoin)
  const MapCenterer = () => {
    const map = useMap();
    useEffect(() => {
      if (personnesData.length > 0) {
        // Centre sur les bounds des marqueurs si possible, sinon Madagascar
        const bounds = personnesData.map(p => [p.lat, p.lng]);
        if (bounds.length > 0) {
          map.fitBounds(bounds as [[number, number], [number, number]]);
        } else {
          map.setView([-20, 47], 6);
        }
      } else {
        map.setView([-20, 47], 6); // Centre sur Madagascar si pas de données
      }
    }, [map]);
    return null;
  };

  const handleResetFilters = () => {
    setZoneFilter('');
    setPaysFilter('');
  };

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Les filtres s'appliquent déjà en temps réel via useMemo, mais on peut ajouter une logique si besoin
  };

  return (
    <div style={{ 
      fontFamily: 'century-gothic, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
    }}>

      {!isHidden && (
        <FiltersContainer $isMinimized={isMinimized}>
          <FiltersHeader>
            <FiltersTitle>Filtres</FiltersTitle>
            <FiltersControls>
              <FilterControlButton
                $isMinimized={isMinimized}
                onClick={() => setIsMinimized((p) => !p)}
                title={isMinimized ? "Développer" : "Réduire"}
              >
                {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </FilterControlButton>
              <FilterControlButton $isClose onClick={() => setIsHidden(true)} title="Fermer">
                <X size={16} />
              </FilterControlButton>
            </FiltersControls>
          </FiltersHeader>

          {!isMinimized && (
            <FiltersSection>
              <Separator />
              <form onSubmit={handleFilterSubmit}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 'var(--spacing-md)',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <FormLabelSearch>Zone</FormLabelSearch>
                    <StyledSelect
                      value={zoneFilter}
                      onChange={(e) => setZoneFilter(e.target.value)}
                    >
                      {zonesOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </StyledSelect>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <FormLabelSearch>Pays</FormLabelSearch>
                    <StyledSelect
                      value={paysFilter}
                      onChange={(e) => setPaysFilter(e.target.value)}
                    >
                      {paysOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </StyledSelect>
                  </div>
                </div>

                <Separator />

                <FiltersActions>
                  <ButtonReset
                    type="button"
                    onClick={handleResetFilters}
                    title="Effacer filtre"
                  >
                    <X size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                    Réinitialiser
                  </ButtonReset>
                  <ButtonSearch type="submit" title="Rechercher">
                    <Search size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                    Appliquer (temps réel)
                  </ButtonSearch>
                </FiltersActions>
              </form>
            </FiltersSection>
          )}
        </FiltersContainer>
      )}

      {isHidden && (
        <div style={{ /* Utiliser un style similaire à FiltersToggle si disponible, sinon inline */ 
          marginBottom: '24px',
        }}>
          <button
            type="button"
            onClick={() => setIsHidden(false)}
            style={{
              padding: '8px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '3px',
              backgroundColor: '#fff',
              color: '#63666a',
              cursor: 'pointer',
              fontFamily: 'century-gothic, sans-serif',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Search size={16} />
            Afficher les filtres
          </button>
        </div>
      )}

      {/* Content Area with Map */}
      <div style={{
        background: '#ffffff',
        borderRadius: 0,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px',
        width: '100%',
        maxWidth: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        border: 'none',
        borderTop: '5px solid #e0e0e0',
        overflow: 'hidden',
        boxSizing: 'border-box',
        paddingLeft: '32px',
        paddingRight: '32px',
        paddingBottom: '16px',
        paddingTop: '12px',
      }}>

        {/* Map Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '24px',
          marginBottom: '24px',
        }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '3px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e0e0e0',
            height: '600px',
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#333',
              fontFamily: 'century-gothic, sans-serif',
            }}>
              Carte des Missions en Cours
            </h3>
            <MapContainer center={[-20, 47] as [number, number]} zoom={6} style={{ height: '500px', width: '100%' } as React.CSSProperties}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapCenterer />
              {personnesData.map((personne) => (
                <Marker key={personne.id} position={[personne.lat, personne.lng] as [number, number]}>
                  <Popup>
                    <div style={{ fontFamily: 'century-gothic, sans-serif' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                        {personne.nom}
                      </h4>
                      <p style={{ margin: '0 0 4px 0', color: '#63666a', fontSize: '14px' }}>
                        Mission: {personne.mission}
                      </p>
                      <p style={{ margin: '0 0 4px 0', color: '#63666a', fontSize: '14px' }}>
                        Lieu: {personne.ville} ({personne.country}, {personne.zone})
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionsEnCoursMapPage;