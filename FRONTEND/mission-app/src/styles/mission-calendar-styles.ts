import styled from 'styled-components';

// Interfaces pour les props
export interface CalendarDayCellProps {
  $isCurrentMonth: boolean;
  $isToday: boolean;
  $hasMissions: boolean;
  $isExpanded?: boolean;
}

export interface MissionEventProps {
  $category?: 'progress' | 'success' | 'warning' | 'error';
  $isStart: boolean;
  $isEnd: boolean;
  $isMultiDay: boolean;
  $clickable?: boolean;
}

export interface DayNumberProps {
  $isToday: boolean;
}

export interface MissionsListProps {
  $hasOverflow: boolean;
  $isExpanded?: boolean;
}

export interface MissionsContainerProps {
  $isExpanded?: boolean;
}

export interface StatusDotProps {
  $category: 'progress' | 'success' | 'warning' | 'error';
}

// Couleurs des statuts pour la calendar - utilisant les mêmes que StatusFilter
export const STATUS_CATEGORY_COLORS = {
  progress: {
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#1d4ed8',
    border: 'rgba(59, 130, 246, 0.3)',
    badge: 'rgba(59, 130, 246, 0.2)',
    hover: 'rgba(59, 130, 246, 0.25)',
  },
  success: {
    background: 'rgba(34, 197, 94, 0.15)',
    color: '#059669',
    border: 'rgba(34, 197, 94, 0.3)',
    badge: 'rgba(34, 197, 94, 0.2)',
    hover: 'rgba(34, 197, 94, 0.25)',
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.15)',
    color: '#d97706',
    border: 'rgba(245, 158, 11, 0.3)',
    badge: 'rgba(245, 158, 11, 0.2)',
    hover: 'rgba(245, 158, 11, 0.25)',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#dc2626',
    border: 'rgba(239, 68, 68, 0.3)',
    badge: 'rgba(239, 68, 68, 0.2)',
    hover: 'rgba(239, 68, 68, 0.25)',
  },
  // Version simplifiée pour la calendar
  simplified: {
    progress: {
      background: '#dbeafe',
      color: '#1e40af',
      border: '#93c5fd',
    },
    success: {
      background: '#d1fae5',
      color: '#065f46',
      border: '#86efac',
    },
    warning: {
      background: '#fef3c7',
      color: '#92400e',
      border: '#fde68a',
    },
    error: {
      background: '#fee2e2',
      color: '#991b1b',
      border: '#fca5a5',
    },
  },
} as const;

// Container principal
export const CalendarContainer = styled.div`
  padding: var(--spacing-sm);
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  overflow: hidden;
  font-family: var(--font-family);
`;

// En-tête du calendrier
export const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: 6px;
`;

// Boutons de navigation
export const NavigationButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-light);
  background: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  font-family: var(--font-family);
  color: var(--text-secondary);
  transition: all 0.15s ease-in-out;
  
  &:hover {
    background: var(--bg-secondary);
    border-color: var(--primary-color);
    color: var(--text-primary);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-light);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

// Mois en cours
export const CurrentMonth = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: capitalize;
  font-family: var(--font-family);
`;

// Grille du calendrier
export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: var(--border-light);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  overflow: hidden;
  font-size: 12px;
`;

// En-tête des jours de la semaine
export const WeekdayHeader = styled.div`
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-sm);
  text-align: center;
  font-weight: 600;
  font-size: 11px;
  font-family: var(--font-family);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

// Cellule de jour
export const CalendarDayCell = styled.div<CalendarDayCellProps>`
  background: white;
  padding: 4px;
  min-height: ${props => props.$isExpanded ? '200px' : '140px'};
  height: ${props => props.$isExpanded ? 'auto' : '140px'};
  opacity: ${props => props.$isCurrentMonth ? 1 : 0.4};
  border-right: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  cursor: ${props => props.$hasMissions ? 'pointer' : 'default'};
  position: relative;
  transition: all 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  
  ${props => props.$isToday && `
    background-color: rgba(37, 99, 235, 0.05);
    border-left: 2px solid var(--primary-color);
  `}
  
  ${props => props.$hasMissions && props.$isCurrentMonth && `
    &:hover {
      background-color: var(--bg-secondary);
      transform: translateY(-1px);
    }
  `}
  
  ${props => props.$isExpanded && `
    height: auto;
    min-height: 200px;
    max-height: 350px;
  `}
`;

// En-tête du jour (numéro + boutons)
export const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  min-height: 24px;
  flex-shrink: 0;
`;

// Numéro du jour
export const DayNumber = styled.div<DayNumberProps>`
  font-weight: ${props => props.$isToday ? '600' : '400'};
  color: ${props => props.$isToday ? 'var(--primary-color)' : 'var(--text-secondary)'};
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  font-family: var(--font-family);
  
  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

// Container des missions
export const MissionsContainer = styled.div<MissionsContainerProps>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  max-height: ${props => props.$isExpanded ? 'none' : 'calc(140px - 30px)'};
  
  ${props => props.$isExpanded && `
    overflow-y: auto;
    max-height: 300px;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: var(--bg-secondary);
      border-radius: var(--radius-sm);
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--border-dark);
      border-radius: var(--radius-sm);
    }
  `}
`;

// Liste des missions
export const MissionsList = styled.div<MissionsListProps>`
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: ${props => props.$isExpanded ? 'visible' : 'auto'};
  overflow-x: hidden;
  max-height: ${props => props.$hasOverflow && !props.$isExpanded ? '90px' : 'none'};
  min-height: 0;
  flex: 1;
  
  ${props => !props.$isExpanded && `
    &::-webkit-scrollbar {
      width: 3px;
    }
    
    &::-webkit-scrollbar-track {
      background: var(--bg-secondary);
      border-radius: var(--radius-sm);
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--border-dark);
      border-radius: var(--radius-sm);
    }
  `}
`;

// Événement de mission
export const MissionEvent = styled.div<MissionEventProps>`
  background: ${props => {
    const category = props.$category || 'progress';
    return STATUS_CATEGORY_COLORS.simplified[category].background;
  }};
  color: ${props => {
    const category = props.$category || 'progress';
    return STATUS_CATEGORY_COLORS.simplified[category].color;
  }};
  border: 1px solid ${props => {
    const category = props.$category || 'progress';
    return STATUS_CATEGORY_COLORS.simplified[category].border;
  }};
  padding: 4px 6px;
  border-radius: ${props => {
    if (props.$isMultiDay) {
      if (props.$isStart) return 'var(--radius-sm) 0 0 var(--radius-sm)';
      if (props.$isEnd) return '0 var(--radius-sm) var(--radius-sm) 0';
      return '0';
    }
    return 'var(--radius-sm)';
  }};
  font-size: 10px;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: ${props => props.$isStart || !props.$isMultiDay ? '0' : '-1px'};
  margin-right: ${props => props.$isEnd || !props.$isMultiDay ? '0' : '-1px'};
  position: relative;
  line-height: 1.3;
  flex-shrink: 0;
  transition: all 0.15s ease-in-out;
  font-family: var(--font-family);
  
  ${props => props.$clickable && `
    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  `}
  
  ${props => props.$isMultiDay && !props.$isStart && !props.$isEnd && `
    border-left: 1px solid var(--border-light);
    border-right: 1px solid var(--border-light);
    border-radius: 0;
    margin: 0 -1px;
  `}
`;

// Version compacte de l'événement de mission
export const CompactMissionEvent = styled(MissionEvent)`
  padding: 4px;
  font-size: 10px;
  min-height: 32px;
  border-radius: var(--radius-sm);
  margin: 0;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

// Détail de la mission
export const MissionDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
  
  svg {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
  }
`;

// Nom de l'employé
export const EmployeeName = styled.span`
  font-size: 9px;
  font-weight: 500;
  opacity: 0.9;
  font-family: var(--font-family);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Contenu de la mission (pour affichage compact)
export const MissionContent = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 24px;
`;

// Initiales de l'employé
export const EmployeeInitials = styled.div`
  font-size: 10px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-secondary);
`;

// Informations de la mission
export const MissionInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

// Nom de la mission
export const MissionName = styled.div`
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;

// Métadonnées de la mission
export const MissionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
`;

// Badge de durée
export const DurationBadge = styled.span`
  font-size: 9px;
  background: rgba(0, 0, 0, 0.05);
  padding: 1px 5px;
  border-radius: 10px;
  white-space: nowrap;
  color: var(--text-secondary);
`;

// Point de statut
export const StatusDot = styled.div<StatusDotProps>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => {
    const category = props.$category || 'progress';
    return STATUS_CATEGORY_COLORS.simplified[category].color;
  }};
  flex-shrink: 0;
`;

// Durée de la mission
export const MissionDuration = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 8px;
  opacity: 0.8;
  margin-top: 1px;
  font-family: var(--font-family);
  
  svg {
    width: 8px;
    height: 8px;
    flex-shrink: 0;
  }
`;

// Aucune mission
export const NoMissions = styled.div`
  color: var(--text-muted);
  font-size: 10px;
  font-style: italic;
  text-align: center;
  margin-top: 8px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family);
  padding: var(--spacing-xs);
`;

// Compteur de missions
export const MissionCount = styled.span<{ $category?: 'progress' | 'success' | 'warning' | 'error' }>`
  background: ${props => {
    const category = props.$category || 'progress';
    return STATUS_CATEGORY_COLORS.simplified[category].background;
  }};
  color: ${props => {
    const category = props.$category || 'progress';
    return STATUS_CATEGORY_COLORS.simplified[category].color;
  }};
  border: 1px solid ${props => {
    const category = props.$category || 'progress';
    return STATUS_CATEGORY_COLORS.simplified[category].border;
  }};
  border-radius: var(--radius-full);
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  font-family: var(--font-family);
  flex-shrink: 0;
`;

// Indicateur de débordement
export const OverflowIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 3px 6px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  margin-top: 3px;
  font-size: 9px;
  color: var(--text-muted);
  cursor: pointer;
  border: 1px solid var(--border-light);
  flex-shrink: 0;
  transition: all 0.15s ease-in-out;
  font-family: var(--font-family);
  
  &:hover {
    background: var(--bg-light);
    border-color: var(--border-dark);
    color: var(--text-primary);
  }
  
  svg {
    width: 10px;
    height: 10px;
  }
`;

// Bouton d'expansion
export const ExpandButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: all 0.15s ease-in-out;
  border-radius: 3px;
  
  &:hover {
    opacity: 1;
    background: var(--bg-secondary);
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

export const CollapseButton = styled(ExpandButton)`
  opacity: 0.9;
  
  &:hover {
    opacity: 1;
  }
`;

// Bouton de débordement (pour ouvrir modal)
export const OverflowButton = styled.button`
  width: 100%;
  background: rgba(0, 0, 0, 0.05);
  border: 1px dashed rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-sm);
  padding: 6px;
  font-size: 10px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  margin-top: 4px;
  flex-shrink: 0;
  font-family: var(--font-family);
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
    border-color: var(--primary-light);
    color: var(--primary-color);
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

// Tooltip pour la mission
export const MissionTooltip = styled.div`
  position: absolute;
  background: rgba(0, 0, 0, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 11px;
  max-width: 220px;
  z-index: 1000;
  pointer-events: none;
  white-space: normal;
  line-height: 1.5;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: var(--font-family);
  
  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid rgba(0, 0, 0, 0.95);
  }
`;

// État vide
export const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-muted);
  font-family: var(--font-family);
  
  svg {
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
    color: var(--text-muted);
  }
  
  h3 {
    font-size: 1rem;
    margin-bottom: var(--spacing-xs);
    color: var(--text-primary);
    font-weight: 600;
  }
  
  p {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
`;

// Badge de catégorie pour la tooltip
export const CategoryBadge = styled.span<{ $category: 'progress' | 'success' | 'warning' | 'error' }>`
  display: inline-block;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 500;
  margin-left: 4px;
  background: ${props => STATUS_CATEGORY_COLORS.simplified[props.$category].background};
  color: ${props => STATUS_CATEGORY_COLORS.simplified[props.$category].color};
  border: 1px solid ${props => STATUS_CATEGORY_COLORS.simplified[props.$category].border};
`;

// Ligne d'info dans la tooltip
export const TooltipInfoLine = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 10px;
  opacity: 0.9;
  
  svg {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    opacity: 0.8;
  }
`;

// Titre de la tooltip
export const TooltipTitle = styled.div`
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 12px;
  line-height: 1.3;
  color: white;
`;

// Version simplifiée pour la tooltip
export const SimpleMissionTooltip = styled(MissionTooltip)`
  padding: 6px 10px;
  font-size: 10px;
  max-width: 180px;
  
  ${TooltipTitle} {
    font-size: 10px;
    margin-bottom: 4px;
  }
  
  ${TooltipInfoLine} {
    font-size: 9px;
    gap: 4px;
    margin-bottom: 3px;
  }
  
  ${CategoryBadge} {
    font-size: 8px;
    padding: 1px 4px;
  }
`;

// ===== STYLES POUR LA MODAL =====

// Overlay de la modal
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

// Contenu de la modal
export const ModalContent = styled.div`
  background: white;
  border-radius: var(--radius-md);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
`;

// En-tête de la modal
export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
  flex-shrink: 0;
  
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    font-family: var(--font-family);
  }
`;

// Bouton de fermeture de la modal
export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    color: var(--text-primary);
    background: var(--bg-light);
  }
`;

// Corps de la modal
export const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  max-height: 60vh;
  flex: 1;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-dark);
    border-radius: var(--radius-sm);
  }
`;

// Liste des missions dans la modal
export const ModalMissionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Élément de mission dans la modal
export const ModalMissionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  background: white;
  
  &:hover {
    background: var(--bg-secondary);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: var(--border-dark);
  }
`;

// Indicateur de couleur pour la mission dans la modal
export const ModalMissionColor = styled.div<{ $category: 'progress' | 'success' | 'warning' | 'error' }>`
  width: 4px;
  height: 40px;
  border-radius: var(--radius-sm);
  background-color: ${props => {
    const category = props.$category || 'progress';
    return STATUS_CATEGORY_COLORS.simplified[category].color;
  }};
  flex-shrink: 0;
`;

// Informations de la mission dans la modal
export const ModalMissionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

// Nom de la mission dans la modal
export const ModalMissionName = styled.div`
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.3;
`;

// Détails de la mission dans la modal
export const ModalMissionDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: var(--text-secondary);
  
  & > span {
    display: flex;
    align-items: center;
    gap: 4px;
    
    svg {
      width: 10px;
      height: 10px;
      opacity: 0.7;
    }
  }
`;

// Statut de la mission dans la modal
export const ModalMissionStatus = styled.span<{ $category: 'progress' | 'success' | 'warning' | 'error' }>`
  background-color: ${props => {
    const category = props.$category || 'progress';
    return STATUS_CATEGORY_COLORS.simplified[category].background;
  }};
  color: ${props => {
    const category = props.$category || 'progress';
    return STATUS_CATEGORY_COLORS.simplified[category].color;
  }};
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  border: 1px solid ${props => {
    const category = props.$category || 'progress';
    return STATUS_CATEGORY_COLORS.simplified[category].border;
  }};
`;

// Pied de page de la modal
export const ModalFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  background: var(--bg-secondary);
`;

// Bouton d'action de la modal
export const ModalActionButton = styled.button`
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-family);
  transition: all 0.15s ease-in-out;
  
  &:hover {
    background: var(--primary-dark);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-light);
  }
`;