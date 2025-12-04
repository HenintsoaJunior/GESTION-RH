// components/MissionCalendar.tsx
import React, { useState, useMemo } from 'react';
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
  endOfWeek
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, User, Calendar as CalendarIcon, Clock, MoreHorizontal } from 'lucide-react';
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
  
  // Chercher dans la liste des statuts
  const foundStatus = STATUSES.find(status => status.id === statusKey);
  if (foundStatus) {
    return foundStatus.category;
  }
  
  // Par défaut
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

  const today = new Date();

  // Calendrier français : semaine commence le lundi
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Début de la semaine = lundi
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  // Fin de la semaine = dimanche
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
      
      // Normaliser le statut pour obtenir l'enum
      const statusEnum = normalizeMissionStatus(mission.status);
      
      // Pour chaque jour entre start et end (inclus)
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
    
    return grouped;
  }, [missions]);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleMissionClick = (missionId: string) => {
    navigate(`/mission/collaborateur/${missionId}`);
  };

  const handleDayClick = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayMissions = missionsByDate[dateKey];
    
    if (dayMissions && dayMissions.length === 1) {
      handleMissionClick(dayMissions[0].mission.missionId);
    }
  };

  const handleShowAllMissions = (_date: Date, missions: Array<any>) => {
    if (missions.length > 0) {
      handleMissionClick(missions[0].mission.missionId);
    }
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
    
    // Compter les occurrences de chaque catégorie
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
    
    // Trouver la catégorie la plus fréquente
    const maxCount = Math.max(...Object.values(categoryCounts));
    
    for (const [category, count] of Object.entries(categoryCounts)) {
      if (count === maxCount) {
        return category as 'progress' | 'success' | 'warning' | 'error';
      }
    }
    
    return 'progress';
  };

  // Semaine française : lundi en premier
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
    <S.CalendarContainer>
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
          const isToday = isSameDay(day, today);
          const dominantCategory = getDominantStatusCategory(dayMissions);
          
          // Déterminer le nombre de missions à afficher (3-4 max)
          const maxVisibleMissions = dayMissions.length > 4 ? 3 : 4;
          const visibleMissions = dayMissions.slice(0, maxVisibleMissions);
          const hiddenMissionsCount = dayMissions.length - visibleMissions.length;
          const hasOverflow = dayMissions.length > maxVisibleMissions;
          
          return (
            <S.CalendarDayCell
              key={day.toISOString()}
              $isCurrentMonth={isCurrentMonth}
              $isToday={isToday}
              $hasMissions={dayMissions.length > 0}
              onClick={() => handleDayClick(day)}
            >
              <S.DayNumber $isToday={isToday}>
                <span>{format(day, 'd')}</span>
                {dayMissions.length > 0 && isCurrentMonth && (
                  <S.MissionCount $category={dominantCategory}>
                    {dayMissions.length}
                  </S.MissionCount>
                )}
              </S.DayNumber>
              
              <S.MissionsContainer>
                <S.MissionsList $hasOverflow={hasOverflow}>
                  {dayMissions.length > 0 ? (
                    <>
                      {visibleMissions.map(({ mission, isStart, isEnd, isMultiDay, statusEnum }) => {
                        const EventComponent = dayMissions.length > 4 ? S.CompactMissionEvent : S.MissionEvent;
                        const category = getStatusCategory(statusEnum);
                        
                        return (
                          <EventComponent
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
                            {dayMissions.length <= 4 ? (
                              <>
                                <S.MissionDetail>
                                  <User size={10} />
                                  <S.EmployeeName>
                                    {mission.employee.firstName.charAt(0)}.{mission.employee.lastName}
                                  </S.EmployeeName>
                                </S.MissionDetail>
                                <div style={{ fontSize: '9px', lineHeight: '1.2', marginTop: '1px' }}>
                                  {mission.name.length > 18 
                                    ? `${mission.name.substring(0, 18)}...` 
                                    : mission.name}
                                </div>
                                {(isStart || !isMultiDay) && (
                                  <S.MissionDuration>
                                    <Clock size={8} />
                                    {getMissionDuration(mission.startDate, mission.endDate)}
                                  </S.MissionDuration>
                                )}
                              </>
                            ) : (
                              // Version compacte
                              <>
                                <div style={{ fontSize: '8px', fontWeight: '600' }}>
                                  {mission.employee.firstName.charAt(0)}.{mission.employee.lastName.charAt(0)}
                                </div>
                                <div style={{ fontSize: '7px', opacity: 0.9, marginTop: '1px' }}>
                                  {mission.name.length > 12 
                                    ? `${mission.name.substring(0, 12)}...` 
                                    : mission.name}
                                </div>
                              </>
                            )}
                          </EventComponent>
                        );
                      })}
                      
                      {hiddenMissionsCount > 0 && (
                        <S.OverflowIndicator
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowAllMissions(day, dayMissions);
                          }}
                          title={`Voir les ${hiddenMissionsCount} autres missions`}
                        >
                          <MoreHorizontal size={10} />
                          +{hiddenMissionsCount}
                        </S.OverflowIndicator>
                      )}
                    </>
                  ) : isCurrentMonth ? (
                    <S.NoMissions>-</S.NoMissions>
                  ) : null}
                </S.MissionsList>
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
  );
};

export default MissionCalendar;