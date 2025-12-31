/* eslint-disable @typescript-eslint/no-explicit-any */
// components/MissionCalendar.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MissionStatusEnum, 
  type Mission,
  getMissionStatusDisplay,
  normalizeMissionStatus
} from "@/api/mission/services";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  parseISO,
  startOfWeek,
  endOfWeek,
  isToday as isTodayFn
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, User, Calendar as CalendarIcon, Clock, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import * as S from '@/styles/mission-calendar-styles';

// Import des couleurs du StatusFilter
import { STATUSES, statusConfig } from '@/components/status';

interface MissionCalendarProps {
  missions: Mission[];
}

const getStatusCategory = (status: MissionStatusEnum): 'progress' | 'success' | 'warning' | 'error' => {
  const statusMap: Record<MissionStatusEnum, string> = {
    [MissionStatusEnum.Unknown]: "unknown",
    [MissionStatusEnum.PendingApproval]: "pending approval",
    [MissionStatusEnum.PaymentInProgress]: "payment in progress",
    [MissionStatusEnum.Planned]: "planned",
    [MissionStatusEnum.InProgress]: "in progress",
    [MissionStatusEnum.Completed]: "completed",
    [MissionStatusEnum.Closed]: "closed",
    [MissionStatusEnum.Canceled]: "canceled",
    [MissionStatusEnum.MissionRejected]: "mission rejected",
  };
  
  const statusKey = statusMap[status];
  
  if (statusConfig[statusKey]) {
    return statusConfig[statusKey].category;
  }
  
  const foundStatus = STATUSES.find(statusItem => statusItem.id === statusKey);
  if (foundStatus) {
    return foundStatus.category;
  }
  
  return 'progress';
};

const MissionCalendar: React.FC<MissionCalendarProps> = ({ missions }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tooltip, setTooltip] = useState<{
    mission: Mission;
    x: number;
    y: number;
  } | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{
    isOpen: boolean;
    date: Date;
    missions: Array<{
      mission: Mission;
      isStart: boolean;
      isEnd: boolean;
      isMultiDay: boolean;
      statusEnum: MissionStatusEnum;
    }>;
  } | null>(null);
  
  // Supprimer la variable 'today' non utilisée
  const calendarRef = useRef<HTMLDivElement>(null);

  // Calendrier français : semaine commence le lundi
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const allCalendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  // Grouper les missions par date avec informations de position et de couleur de statut
  const missionsByDate = useMemo(() => {
    const grouped: { 
      [key: string]: Array<{
        mission: Mission;
        isStart: boolean;
        isEnd: boolean;
        isMultiDay: boolean;
        statusEnum: MissionStatusEnum;
      }> 
    } = {};
    
    missions.forEach(mission => {
      const start = parseISO(mission.startDate);
      const end = parseISO(mission.endDate);
      const isMultiDay = !isSameDay(start, end);
      
      const statusEnum = normalizeMissionStatus(mission.status);
      const missionDays = eachDayOfInterval({ start, end });
      
      missionDays.forEach((day, index) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        
        grouped[dateKey].push({
          mission,
          isStart: index === 0,
          isEnd: index === missionDays.length - 1,
          isMultiDay,
          statusEnum
        });
      });
    });
    
    // Trier les missions par date de début pour chaque jour
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => 
        new Date(a.mission.startDate).getTime() - new Date(b.mission.startDate).getTime()
      );
    });
    
    return grouped;
  }, [missions]);

  // Constantes pour la gestion de l'affichage
  const MAX_VISIBLE_MISSIONS = 3; // Missions visibles par défaut
  const MAX_EXPANDED_MISSIONS = 8; // Missions visibles quand expandé
  // Supprimer HEIGHT_PER_MISSION non utilisée

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setExpandedDays(new Set()); // Réinitialiser l'expansion en changeant de mois
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setExpandedDays(new Set()); // Réinitialiser l'expansion en changeant de mois
  };

  const handleMissionClick = (missionId: string) => {
    navigate(`/mission/${missionId}`);
  };

  const handleDayClick = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayMissions = missionsByDate[dateKey];
    
    if (dayMissions && dayMissions.length === 1) {
      handleMissionClick(dayMissions[0].mission.missionId);
    } else if (dayMissions && dayMissions.length > 1) {
      // Toggle expansion
      const newExpandedDays = new Set(expandedDays);
      if (newExpandedDays.has(dateKey)) {
        newExpandedDays.delete(dateKey);
      } else {
        newExpandedDays.add(dateKey);
      }
      setExpandedDays(newExpandedDays);
    }
  };

  const handleShowAllMissions = (date: Date, missions: Array<any>) => {
    setModal({
      isOpen: true,
      date,
      missions
    });
  };

  const closeModal = () => {
    setModal(null);
  };

  const getMissionDuration = (startDate: string, endDate: string): string => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (days === 1) {
      return '1j';
    }
    return `${days}j`;
  };

  const showMissionTooltip = (mission: Mission, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({
      mission,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  const getDominantStatusCategory = (missions: Array<{ statusEnum: MissionStatusEnum }>): 'progress' | 'success' | 'warning' | 'error' => {
    if (missions.length === 0) return 'progress';
    
    const categoryCounts: Record<'progress' | 'success' | 'warning' | 'error', number> = {
      progress: 0,
      success: 0,
      warning: 0,
      error: 0,
    };
    
    missions.forEach(({ statusEnum }) => {
      const category = getStatusCategory(statusEnum);
      categoryCounts[category]++;
    });
    
    const maxCount = Math.max(...Object.values(categoryCounts));
    
    for (const [category, count] of Object.entries(categoryCounts)) {
      if (count === maxCount) {
        return category as 'progress' | 'success' | 'warning' | 'error';
      }
    }
    
    return 'progress';
  };

  // Gérer le clic en dehors de la modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modal?.isOpen && !(event.target as Element).closest('.mission-modal')) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modal]);

  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  if (missions.length === 0) {
    return (
      <S.CalendarContainer>
        <S.EmptyState>
          <CalendarIcon size={32} />
          <h3>Aucune mission planifiée</h3>
          <p>Aucune mission n'est prévue pour la période sélectionnée.</p>
        </S.EmptyState>
      </S.CalendarContainer>
    );
  }

  return (
    <>
      <S.CalendarContainer ref={calendarRef}>
        <S.CalendarHeader>
          <S.NavigationButton onClick={handlePreviousMonth}>
            <ChevronLeft size={14} />
            Précédent
          </S.NavigationButton>
          
          <S.CurrentMonth>
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </S.CurrentMonth>
          
          <S.NavigationButton onClick={handleNextMonth}>
            Suivant
            <ChevronRight size={14} />
          </S.NavigationButton>
        </S.CalendarHeader>

        <S.CalendarGrid>
          {weekdays.map(weekday => (
            <S.WeekdayHeader key={weekday}>
              {weekday}
            </S.WeekdayHeader>
          ))}
          
          {allCalendarDays.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayMissions = missionsByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isTodayFn(day);
            const dominantCategory = getDominantStatusCategory(dayMissions);
            const isExpanded = expandedDays.has(dateKey);
            
            // Déterminer combien de missions afficher
            const maxVisibleMissions = isExpanded ? MAX_EXPANDED_MISSIONS : MAX_VISIBLE_MISSIONS;
            const visibleMissions = dayMissions.slice(0, maxVisibleMissions);
            const hiddenMissionsCount = dayMissions.length - visibleMissions.length;
            const hasHiddenMissions = hiddenMissionsCount > 0;
            const canExpand = dayMissions.length > MAX_VISIBLE_MISSIONS && !isExpanded;
            const canCollapse = isExpanded;
            const hasOverflow = dayMissions.length > maxVisibleMissions;
            
            return (
              <S.CalendarDayCell
                key={day.toISOString()}
                $isCurrentMonth={isCurrentMonth}
                $isToday={isToday}
                $hasMissions={dayMissions.length > 0}
                $isExpanded={isExpanded}
                onClick={() => handleDayClick(day)}
                style={{
                  height: isExpanded ? 'auto' : '140px',
                  minHeight: '140px',
                  position: 'relative',
                }}
              >
                <S.DayHeader>
                  <S.DayNumber $isToday={isToday}>
                    <span>{format(day, 'd')}</span>
                    {dayMissions.length > 0 && isCurrentMonth && (
                      <S.MissionCount $category={dominantCategory}>
                        {dayMissions.length}
                      </S.MissionCount>
                    )}
                  </S.DayNumber>
                  
                  {canExpand && (
                    <S.ExpandButton
                      onClick={(e) => {
                        e.stopPropagation();
                        const newExpandedDays = new Set(expandedDays);
                        newExpandedDays.add(dateKey);
                        setExpandedDays(newExpandedDays);
                      }}
                      title={`Voir plus (${hiddenMissionsCount} cachées)`}
                    >
                      <ChevronDown size={12} />
                    </S.ExpandButton>
                  )}
                  
                  {canCollapse && (
                    <S.CollapseButton
                      onClick={(e) => {
                        e.stopPropagation();
                        const newExpandedDays = new Set(expandedDays);
                        newExpandedDays.delete(dateKey);
                        setExpandedDays(newExpandedDays);
                      }}
                      title="Réduire"
                    >
                      <ChevronUp size={12} />
                    </S.CollapseButton>
                  )}
                </S.DayHeader>
                
                <S.MissionsContainer $isExpanded={isExpanded}>
                  {dayMissions.length > 0 ? (
                    <>
                      <S.MissionsList $hasOverflow={hasOverflow} $isExpanded={isExpanded}>
                        {visibleMissions.map(({ mission, isStart, isEnd, isMultiDay, statusEnum }) => {
                          const category = getStatusCategory(statusEnum);
                          
                          return (
                            <S.CompactMissionEvent
                              key={`${mission.missionId}-${dateKey}`}
                              $category={category}
                              $isStart={isStart}
                              $isEnd={isEnd}
                              $isMultiDay={isMultiDay}
                              $clickable={true}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMissionClick(mission.missionId);
                              }}
                              onMouseEnter={(e) => showMissionTooltip(mission, e)}
                              onMouseLeave={hideTooltip}
                            >
                              <S.MissionContent>
                                <S.EmployeeInitials>
                                  {mission.employee.firstName.charAt(0)}{mission.employee.lastName.charAt(0)}
                                </S.EmployeeInitials>
                                <S.MissionInfo>
                                  <S.MissionName>
                                    {mission.name.length > 15 
                                      ? `${mission.name.substring(0, 15)}...` 
                                      : mission.name}
                                  </S.MissionName>
                                  <S.MissionMeta>
                                    {(isStart || !isMultiDay) && (
                                      <S.DurationBadge>
                                        {getMissionDuration(mission.startDate, mission.endDate)}
                                      </S.DurationBadge>
                                    )}
                                    <S.StatusDot $category={category} />
                                  </S.MissionMeta>
                                </S.MissionInfo>
                              </S.MissionContent>
                            </S.CompactMissionEvent>
                          );
                        })}
                      </S.MissionsList>
                      
                      {hasHiddenMissions && !isExpanded && (
                        <S.OverflowButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowAllMissions(day, dayMissions);
                          }}
                          title={`Voir les ${hiddenMissionsCount} missions restantes`}
                        >
                          <MoreHorizontal size={12} />
                          <span>+{hiddenMissionsCount} missions</span>
                        </S.OverflowButton>
                      )}
                    </>
                  ) : isCurrentMonth ? (
                    <S.NoMissions>-</S.NoMissions>
                  ) : null}
                </S.MissionsContainer>
              </S.CalendarDayCell>
            );
          })}
        </S.CalendarGrid>
        
        {tooltip && (
          <S.MissionTooltip
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <S.TooltipTitle>
              {tooltip.mission.name}
            </S.TooltipTitle>
            <S.TooltipInfoLine>
              <User size={10} />
              <span>{tooltip.mission.employee.firstName} {tooltip.mission.employee.lastName}</span>
            </S.TooltipInfoLine>
            <S.TooltipInfoLine>
              <Clock size={10} />
              <span>Du {format(parseISO(tooltip.mission.startDate), 'dd/MM/yy')} au {format(parseISO(tooltip.mission.endDate), 'dd/MM/yy')}</span>
            </S.TooltipInfoLine>
            <S.TooltipInfoLine>
              <span>Statut: {getMissionStatusDisplay(tooltip.mission.status)}</span>
              <S.CategoryBadge $category={getStatusCategory(normalizeMissionStatus(tooltip.mission.status))}>
                {getMissionStatusDisplay(tooltip.mission.status)}
              </S.CategoryBadge>
            </S.TooltipInfoLine>
          </S.MissionTooltip>
        )}
      </S.CalendarContainer>

      {modal?.isOpen && (
        <S.ModalOverlay>
          <S.ModalContent className="mission-modal">
            <S.ModalHeader>
              <h3>Missions du {format(modal.date, 'dd MMMM yyyy', { locale: fr })}</h3>
              <S.ModalCloseButton onClick={closeModal}>×</S.ModalCloseButton>
            </S.ModalHeader>
            
            <S.ModalBody>
              <S.ModalMissionsList>
                {modal.missions.map(({ mission, statusEnum }) => {
                  const category = getStatusCategory(statusEnum);
                  
                  return (
                    <S.ModalMissionItem
                      key={mission.missionId}
                      onClick={() => {
                        handleMissionClick(mission.missionId);
                        closeModal();
                      }}
                    >
                      <S.ModalMissionColor $category={category} />
                      <S.ModalMissionInfo>
                        <S.ModalMissionName>{mission.name}</S.ModalMissionName>
                        <S.ModalMissionDetails>
                          <span>
                            <User size={10} />
                            {mission.employee.firstName} {mission.employee.lastName}
                          </span>
                          <span>
                            <Clock size={10} />
                            {getMissionDuration(mission.startDate, mission.endDate)}
                          </span>
                          <S.ModalMissionStatus $category={category}>
                            {getMissionStatusDisplay(mission.status)}
                          </S.ModalMissionStatus>
                        </S.ModalMissionDetails>
                      </S.ModalMissionInfo>
                    </S.ModalMissionItem>
                  );
                })}
              </S.ModalMissionsList>
            </S.ModalBody>
            
            <S.ModalFooter>
              <S.ModalActionButton onClick={closeModal}>
                Fermer
              </S.ModalActionButton>
            </S.ModalFooter>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </>
  );
};

export default MissionCalendar;