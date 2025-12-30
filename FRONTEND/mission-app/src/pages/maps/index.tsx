/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Search, X, ChevronDown, ChevronUp, MapPin, User, Calendar, Clock, Globe, Filter, RefreshCw, AlertCircle, List } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
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
  FiltersToggle,
  ButtonShowFilters,
  Separator,
} from "@/styles/table-styles";
import { useGetOngoingMissionsWithDetails } from '@/api/mission/services';
import  { STATUSES, StatusBadge } from '@/components/status';
import { LoadingSpinner } from '@/styles/detailsmission-styles';
import { 
  MissionTypeEnum, 
  MissionStatusEnum,
  getMissionTypeDisplay
} from '@/api/mission/services';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for missions avec offset pour éviter les superpositions
const createMissionIcon = (type: MissionTypeEnum, index: number) => {
  const isNational = type === MissionTypeEnum.National;
  const offset = (index % 5) * 5; // Décalage progressif jusqu'à 20px
  
  return L.divIcon({
    html: `
      <div style="
        background: ${isNational ? 'linear-gradient(135deg, var(--success-color), #059669)' : 'linear-gradient(135deg, var(--primary-color), #1d4ed8)'};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        cursor: pointer;
        transition: transform 0.2s;
        position: relative;
        transform: translate(${offset}px, ${offset}px);
      ">
        ${isNational ? 'N' : 'I'}
      </div>
    `,
    className: 'custom-mission-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Composants styled pour la responsivité
const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MapContent = styled.div<{ $hasSelectedMission?: boolean }>`
  margin: var(--spacing-lg);
  display: grid;
  grid-template-columns: ${props => props.$hasSelectedMission ? '2fr 1fr' : '1fr'};
  gap: var(--spacing-md);
  transition: all 0.3s;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const MapContainerStyle = styled.div`
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  overflow: hidden;
  height: 600px;
  position: relative;
`;

const DetailsContainer = styled.div<{ $isNational?: boolean }>`
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid ${props => props.$isNational ? 'var(--success-color)' : 'var(--primary-color)'};
  overflow: hidden;
  height: 600px;
  display: flex;
  flex-direction: column;
`;

const DetailsHeader = styled.div<{ $isNational?: boolean }>`
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background: ${props => props.$isNational 
    ? 'linear-gradient(135deg, var(--success-color), #059669)' 
    : 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))'
  };
  color: white;
`;

const DetailsContent = styled.div`
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
  color: var(--text-primary);
`;

const DetailSection = styled.div`
  margin-bottom: 24px;
  
  h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      color: var(--primary-color);
    }
  }
  
  p {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: var(--text-primary);
    line-height: 1.5;
    
    strong {
      color: var(--text-primary);
      font-weight: 600;
      min-width: 100px;
      display: inline-block;
    }
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
`;

const CalendarCell = styled.div`
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  
  div:first-child {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }
  
  div:last-child {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }
`;

const WhiteStatusBadge = styled(StatusBadge)`
  color: white !important;
  
  .status-badge {
    color: white !important;
    background-color: rgba(255, 255, 255, 0.2) !important;
  }
`;

const MissionsEnCoursMapPage = () => {
  // Récupération des missions en cours via l'API
  const { data: missions, isLoading, error, refetch } = useGetOngoingMissionsWithDetails();
  
  // États pour les filtres
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['in progress']);
  const [countryFilter, setCountryFilter] = useState('');
  const [missionTypeFilter, setMissionTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [selectedLocationMissions, setSelectedLocationMissions] = useState<any[]>([]);
  const [selectedMissionIndex, setSelectedMissionIndex] = useState<number>(0);

  // Grouper les missions par coordonnées
  const groupedMissionsByLocation = useMemo(() => {
    if (!missions) return new Map<string, any[]>();
    
    const grouped = new Map<string, any[]>();
    
    missions.forEach(mission => {
      if (mission.lieu?.latitude && mission.lieu?.longitude) {
        const key = `${mission.lieu.latitude.toFixed(6)},${mission.lieu.longitude.toFixed(6)}`;
        
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)?.push(mission);
      }
    });
    
    return grouped;
  }, [missions]);

  // Options pour les filtres
  const countryOptions = useMemo(() => {
    if (!missions) return [{ value: '', label: 'Tous les pays' }];
    
    const countries = new Set(missions.map(mission => mission.lieu?.pays).filter(Boolean));
    return [
      { value: '', label: 'Tous les pays' },
      ...Array.from(countries).sort().map(country => ({
        value: country,
        label: country
      }))
    ];
  }, [missions]);

  const missionTypeOptions = useMemo(() => [
    { value: '', label: 'Tous les types' },
    { value: MissionTypeEnum.National.toString(), label: 'Nationale' },
    { value: MissionTypeEnum.International.toString(), label: 'Internationale' },
  ], []);

  // Fonction pour normaliser le statut pour le filtre
  const normalizeStatusForFilter = (status: any): string => {
    if (typeof status === 'number') {
      const statusEnum = status as MissionStatusEnum;
      switch (statusEnum) {
        case MissionStatusEnum.InProgress: return 'in progress';
        case MissionStatusEnum.Planned: return 'planned';
        case MissionStatusEnum.PendingApproval: return 'pending approval';
        case MissionStatusEnum.Completed: return 'completed';
        case MissionStatusEnum.Canceled: return 'canceled';
        default: return 'unknown';
      }
    }
    if (typeof status === 'string') {
      return status.toLowerCase();
    }
    return 'unknown';
  };

  // Données filtrées
  const filteredMissions = useMemo(() => {
    if (!missions) return [];
    
    return missions.filter(mission => {
      // Filtre par statut
      const missionStatus = normalizeStatusForFilter(mission.status);
      const matchesStatus = selectedStatuses.length === 0 || 
        selectedStatuses.some(selected => missionStatus.includes(selected));
      
      // Filtre par pays
      const matchesCountry = !countryFilter || 
        mission.lieu?.pays?.toLowerCase().includes(countryFilter.toLowerCase());
      
      // Filtre par type de mission
      const matchesType = !missionTypeFilter || 
        mission.missionType.toString() === missionTypeFilter;
      
      // Filtre par recherche
      const matchesSearch = !searchTerm || 
        mission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.employeeFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.lieuFullName.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesCountry && matchesType && matchesSearch;
    });
  }, [missions, selectedStatuses, countryFilter, missionTypeFilter, searchTerm]);

  // Fonction pour gérer le clic sur un marqueur
  const handleMarkerClick = (locationKey: string, mission: any) => {
    const missionsAtLocation = groupedMissionsByLocation.get(locationKey) || [];
    const filteredMissionsAtLocation = missionsAtLocation.filter(m => 
      filteredMissions.some(fm => fm.missionId === m.missionId)
    );
    
    if (filteredMissionsAtLocation.length > 0) {
      // Trouver l'index de la mission cliquée
      const missionIndex = filteredMissionsAtLocation.findIndex(
        m => m.missionId === mission.missionId
      );
      
      setSelectedLocationMissions(filteredMissionsAtLocation);
      setSelectedMission(mission);
      setSelectedMissionIndex(missionIndex >= 0 ? missionIndex : 0);
    }
  };

  // Fonction pour naviguer entre les missions du même lieu
  const navigateMission = (direction: 'prev' | 'next') => {
    if (selectedLocationMissions.length <= 1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (selectedMissionIndex + 1) % selectedLocationMissions.length;
    } else {
      newIndex = (selectedMissionIndex - 1 + selectedLocationMissions.length) % selectedLocationMissions.length;
    }
    
    setSelectedMission(selectedLocationMissions[newIndex]);
    setSelectedMissionIndex(newIndex);
  };

  // Composant pour centrer la map sur les missions
  const MapCenterer = () => {
    const map = useMap();
    
    useEffect(() => {
      if (filteredMissions.length > 0) {
        const bounds = filteredMissions
          .filter(mission => mission.lieu?.latitude && mission.lieu?.longitude)
          .map(mission => [mission.lieu.latitude, mission.lieu.longitude]);
        
        if (bounds.length > 0) {
          map.fitBounds(bounds as [[number, number], [number, number]], { padding: [50, 50] });
        } else {
          map.setView([-20, 47], 6); // Centre sur Madagascar par défaut
        }
      } else {
        map.setView([-20, 47], 6);
      }
    }, [map, filteredMissions]);
    
    return null;
  };

  const handleResetFilters = () => {
    setSelectedStatuses(['in progress']);
    setCountryFilter('');
    setMissionTypeFilter('');
    setSearchTerm('');
  };

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  // Fonction pour obtenir le statut correspondant dans STATUSES
  const getStatusFromConfig = (status: any) => {
    const statusStr = normalizeStatusForFilter(status);
    const statusObj = STATUSES.find(s => s.id === statusStr);
    
    if (statusObj) return statusObj;
    
    // Fallback si le statut n'est pas trouvé
    return {
      id: statusStr,
      label: statusStr.charAt(0).toUpperCase() + statusStr.slice(1),
      color: 'var(--text-secondary)',
      category: 'progress' as const
    };
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        fontFamily: 'century-gothic, sans-serif'
      }}>
        <LoadingSpinner/>
        <span style={{ marginLeft: '16px', color: 'var(--text-secondary)' }}>Chargement des missions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        fontFamily: 'century-gothic, sans-serif',
        textAlign: 'center',
        padding: '20px'
      }}>
        <AlertCircle size={48} color="var(--error-color)" />
        <h3 style={{ margin: '16px 0 8px 0', color: 'var(--text-primary)' }}>Erreur de chargement</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error.message}</p>
        <button
          onClick={() => refetch()}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'century-gothic, sans-serif'
          }}
        >
          <RefreshCw size={16} />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'century-gothic, sans-serif',
      backgroundColor: 'var(--bg-secondary)',
      minHeight: '100vh',
    }}>
      {/* Filtres - Version simplifiée comme dans MissionFilters */}
      {!isHidden ? (
        <FiltersContainer $isMinimized={isMinimized}>
          <FiltersHeader>
            <FiltersTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} />
              Filtres avancés
            </FiltersTitle>
            <FiltersControls>
              <FilterControlButton
                $isMinimized={isMinimized}
                onClick={() => setIsMinimized((p) => !p)}
                title={isMinimized ? "Développer" : "Réduire"}
              >
                {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </FilterControlButton>
              <FilterControlButton 
                $isClose 
                onClick={() => setIsHidden(true)} 
                title="Fermer"
              >
                <X size={16} />
              </FilterControlButton>
            </FiltersControls>
          </FiltersHeader>

          {!isMinimized && (
            <FiltersSection>
              <Separator />
              <form onSubmit={handleFilterSubmit}>
                <FilterGrid>
                  
                  {/* Filtre Pays */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <FormLabelSearch>Pays</FormLabelSearch>
                    <StyledSelect
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {countryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </StyledSelect>
                  </div>

                  {/* Filtre Type de Mission */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <FormLabelSearch>Type de Mission</FormLabelSearch>
                    <StyledSelect
                      value={missionTypeFilter}
                      onChange={(e) => setMissionTypeFilter(e.target.value)}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {missionTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </StyledSelect>
                  </div>
                </FilterGrid>

                <Separator />

                <FiltersActions>
                  <ButtonReset
                    type="button"
                    onClick={handleResetFilters}
                    title="Effacer filtre"
                  >
                    <X size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                    Effacer filtres
                  </ButtonReset>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <ButtonSearch type="submit" title="Rechercher">
                      <Search size={16} style={{ marginRight: "var(--spacing-sm)" }} />
                      Rechercher
                    </ButtonSearch>
                  </div>
                </FiltersActions>
              </form>
            </FiltersSection>
          )}
        </FiltersContainer>
      ) : (
        <FiltersToggle>
          <ButtonShowFilters type="button" onClick={() => setIsHidden(false)}>
            <List size={16} style={{ marginRight: "var(--spacing-sm)" }} />
            Afficher les filtres
          </ButtonShowFilters>
        </FiltersToggle>
      )}

      {/* Contenu principal */}
      <MapContent $hasSelectedMission={!!selectedMission}>
        {/* Carte */}
        <MapContainerStyle>
          <div style={{
            padding: 'var(--spacing-md) var(--spacing-lg)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-secondary)'
          }}>
            <div>
              <h3 style={{ 
                margin: '0 0 4px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}>
                Carte géographique des missions
              </h3>
              <p style={{ 
                margin: '0',
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                {filteredMissions.length} mission{filteredMissions.length !== 1 ? 's' : ''} affichée{filteredMissions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              alignItems: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                fontSize: '14px',
                color: 'var(--text-primary)'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-color), #1d4ed8)'
                }} />
                Mission internationale
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                fontSize: '14px',
                color: 'var(--text-primary)'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--success-color), #059669)'
                }} />
                Mission nationale
              </div>
            </div>
          </div>
          
          <MapContainer 
            center={[-20, 47] as [number, number]} 
            zoom={6} 
            style={{ height: 'calc(600px - 73px)', width: '100%' } as React.CSSProperties}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapCenterer />
            {Array.from(groupedMissionsByLocation.entries()).map(([key, missionsAtLocation], groupIndex) => {
              if (missionsAtLocation.length === 0) return null;
              
              const filteredMissionsAtLocation = missionsAtLocation.filter(mission => 
                filteredMissions.some(fm => fm.missionId === mission.missionId)
              );
              
              if (filteredMissionsAtLocation.length === 0) return null;
              
              const mainMission = filteredMissionsAtLocation[0];
              const status = getStatusFromConfig(mainMission.status);
              
              return (
                <Marker 
                  key={key}
                  position={[mainMission.lieu.latitude, mainMission.lieu.longitude] as [number, number]}
                  icon={createMissionIcon(mainMission.missionType, groupIndex)}
                  eventHandlers={{
                    click: () => handleMarkerClick(key, mainMission),
                  }}
                >
                  <Popup>
                    <div style={{ 
                      fontFamily: 'century-gothic, sans-serif',
                      minWidth: '250px',
                      color: 'var(--text-primary)'
                    }}>
                      <h4 style={{ 
                        margin: '0 0 12px 0', 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: 'var(--text-primary)',
                        borderBottom: '2px solid var(--primary-color)',
                        paddingBottom: '8px'
                      }}>
                        {filteredMissionsAtLocation.length > 1 
                          ? `${filteredMissionsAtLocation.length} missions à cet emplacement` 
                          : mainMission.name
                        }
                      </h4>
                      
                      {filteredMissionsAtLocation.length > 1 ? (
                        <div>
                          <p style={{ 
                            margin: '0 0 8px 0',
                            fontSize: '14px',
                            color: 'var(--text-primary)'
                          }}>
                            <strong>Localisation:</strong> {mainMission.lieuFullName}
                          </p>
                          <p style={{ 
                            margin: '0 0 8px 0',
                            fontSize: '14px',
                            color: 'var(--text-primary)'
                          }}>
                            <strong>Missions:</strong> {filteredMissionsAtLocation.length}
                          </p>
                          <ul style={{ 
                            margin: '8px 0',
                            paddingLeft: '20px',
                            fontSize: '14px',
                            color: 'var(--text-primary)'
                          }}>
                            {filteredMissionsAtLocation.slice(0, 3).map((mission, idx) => (
                              <li key={idx} style={{ marginBottom: '4px' }}>
                                {mission.name} - {mission.employeeFullName}
                              </li>
                            ))}
                            {filteredMissionsAtLocation.length > 3 && (
                              <li>... et {filteredMissionsAtLocation.length - 3} autres</li>
                            )}
                          </ul>
                          <p style={{ 
                            margin: '12px 0 0 0',
                            fontSize: '13px',
                            color: 'var(--primary-color)',
                            fontStyle: 'italic'
                          }}>
                            Cliquez pour voir les détails de la première mission
                          </p>
                        </div>
                      ) : (
                        <>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <User size={14} color="var(--text-secondary)" />
                            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                              {mainMission.employeeFullName}
                            </span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <MapPin size={14} color="var(--text-secondary)" />
                            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                              {mainMission.lieuFullName}
                            </span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <Calendar size={14} color="var(--text-secondary)" />
                            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                              {mainMission.formattedStartDate} → {mainMission.formattedEndDate}
                            </span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <Clock size={14} color="var(--text-secondary)" />
                            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                              {mainMission.durationDisplay}
                            </span>
                          </div>
                        </>
                      )}
                      
                      <div style={{ marginTop: '12px' }}>
                        <StatusBadge status={status} />
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </MapContainerStyle>

        {/* Détails de la mission sélectionnée */}
        {selectedMission && (
          <DetailsContainer $isNational={selectedMission.missionType === MissionTypeEnum.National}>
            <DetailsHeader $isNational={selectedMission.missionType === MissionTypeEnum.National}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{ 
                      margin: '0',
                      fontSize: '18px',
                      fontWeight: '600',
                    }}>
                      Détails de la mission
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedMission(null);
                        setSelectedLocationMissions([]);
                        setSelectedMissionIndex(0);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      aria-label="Fermer les détails"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  {selectedLocationMissions.length > 1 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '8px'
                    }}>
                      <button
                        onClick={() => navigateMission('prev')}
                        disabled={selectedLocationMissions.length <= 1}
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 12px',
                          cursor: selectedLocationMissions.length > 1 ? 'pointer' : 'not-allowed',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          opacity: selectedLocationMissions.length > 1 ? 1 : 0.5
                        }}
                        aria-label="Mission précédente"
                      >
                        <ChevronUp size={14} style={{ transform: 'rotate(-90deg)' }} />
                        Précédent
                      </button>
                      
                      <span style={{
                        fontSize: '13px',
                        background: 'rgba(255,255,255,0.2)',
                        padding: '4px 12px',
                        borderRadius: '12px'
                      }}>
                        {selectedMissionIndex + 1} / {selectedLocationMissions.length}
                      </span>
                      
                      <button
                        onClick={() => navigateMission('next')}
                        disabled={selectedLocationMissions.length <= 1}
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 12px',
                          cursor: selectedLocationMissions.length > 1 ? 'pointer' : 'not-allowed',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          opacity: selectedLocationMissions.length > 1 ? 1 : 0.5
                        }}
                        aria-label="Mission suivante"
                      >
                        Suivant
                        <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                opacity: '0.9',
                marginTop: '8px'
              }}>
                <span style={{
                  padding: '4px 12px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {getMissionTypeDisplay(selectedMission.missionType)}
                </span>
                <WhiteStatusBadge 
                  status={getStatusFromConfig(selectedMission.status)}
                />
                {selectedLocationMissions.length > 1 && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '12px',
                    opacity: '0.8'
                  }}>
                    {selectedLocationMissions.length} missions à cet emplacement
                  </span>
                )}
              </div>
            </DetailsHeader>
            
            <DetailsContent>
              <DetailSection>
                <h4>
                  <MapPin size={16} />
                  Localisation
                </h4>
                <p>
                  <strong>Ville:</strong> {selectedMission.lieu?.ville || selectedMission.lieu?.nom || 'Non spécifiée'}
                </p>
                <p>
                  <strong>Pays:</strong> {selectedMission.lieu?.pays || 'Non spécifié'}
                </p>
                {selectedMission.lieu?.codePostal && (
                  <p>
                    <strong>Code postal:</strong> {selectedMission.lieu.codePostal}
                  </p>
                )}
                {selectedLocationMissions.length > 1 && (
                  <p style={{ 
                    marginTop: '12px',
                    padding: '8px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--border-radius)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic'
                  }}>
                    <strong>Note:</strong> Il y a {selectedLocationMissions.length - 1} autre(s) mission(s) à cette localisation.
                    Utilisez les flèches ci-dessus pour naviguer entre elles.
                  </p>
                )}
              </DetailSection>
              
              <DetailSection>
                <h4>
                  <User size={16} />
                  Missionnaire
                </h4>
                <p>
                  <strong>Nom:</strong> {selectedMission.employeeFullName}
                </p>
                <p>
                  <strong>Matricule:</strong> {selectedMission.employee?.employeeCode || 'Non spécifié'}
                </p>
                <p>
                  <strong>Poste:</strong> {selectedMission.employee?.jobTitle || 'Non spécifié'}
                </p>
              </DetailSection>
              
              <DetailSection>
                <h4>
                  <Calendar size={16} />
                  Calendrier
                </h4>
                <CalendarGrid>
                  <CalendarCell>
                    <div>Départ</div>
                    <div>{selectedMission.formattedStartDate}</div>
                  </CalendarCell>
                  <CalendarCell>
                    <div>Retour</div>
                    <div>{selectedMission.formattedEndDate}</div>
                  </CalendarCell>
                </CalendarGrid>
                <p>
                  <strong>Durée:</strong> {selectedMission.durationDisplay}
                </p>
              </DetailSection>
              
              <DetailSection>
                <h4>
                  <Globe size={16} />
                  Description
                </h4>
                <p>
                  {selectedMission.description || 'Aucune description disponible'}
                </p>
              </DetailSection>
            </DetailsContent>
            
            <div style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              gap: 'var(--spacing-sm)'
            }}>
              <button
                onClick={() => {
                  window.open(`/missions/${selectedMission.missionId}`, '_blank');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: selectedMission.missionType === MissionTypeEnum.National 
                    ? 'var(--success-color)' 
                    : 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  cursor: 'pointer',
                  fontFamily: 'century-gothic, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = selectedMission.missionType === MissionTypeEnum.National 
                    ? '#059669' 
                    : 'var(--primary-dark)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = selectedMission.missionType === MissionTypeEnum.National 
                    ? 'var(--success-color)' 
                    : 'var(--primary-color)';
                }}
              >
                Voir détails complets
              </button>
            </div>
          </DetailsContainer>
        )}
      </MapContent>
    </div>
  );
};

export default MissionsEnCoursMapPage;