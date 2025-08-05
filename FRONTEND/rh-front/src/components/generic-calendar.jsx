import { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from "lucide-react";
import "styles/generic-calendar-styles.css";

const CalendarLegend = ({ eventConfig }) => {
  return (
    <div
      className="calendar-legend-calendar"
      role="region"
      aria-label="Légende des statuts du calendrier"
    >
      {Object.values(eventConfig).map((status) => (
        <div key={status.label} className="calendar-legend-item-calendar">
          <div
            className="calendar-legend-color-calendar"
            style={{ backgroundColor: status.color }}
            aria-hidden="true"
          ></div>
          <span>{status.label}</span>
        </div>
      ))}
    </div>
  );
};

export function GenericCalendar({
  events = [],
  onEventClick,
  onDateClick,
  onDateRangeChange,
  eventRenderer,
  dateRenderer,
  viewModes = ["month", "week"],
  defaultView = "month",
  locale = "fr-FR",
  className = "",
  eventConfig = {
    "en cours": { className: "event-progress", color: "#3b82f6", label: "En Cours" },
    "planifié": { className: "event-pending", color: "#f59e0b", label: "Planifié" },
    "terminé": { className: "event-approved", color: "#10b981", label: "Terminé" },
    "annulé": { className: "event-cancelled", color: "#ef4444", label: "Annulé" },
    default: { className: "event-default", color: "#6b7280", label: "Inconnu" },
  },
  showWeekends = true,
  minDate,
  maxDate,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(defaultView);
  const [selectedDate, setSelectedDate] = useState(null);

  const monthNames = useMemo(() => [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ], []);

  const dayNames = useMemo(() => 
    showWeekends 
      ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
      : ["Lun", "Mar", "Mer", "Jeu", "Ven"], 
  [showWeekends]);

  const navigateDate = useCallback((direction) => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case "month":
        newDate.setMonth(newDate.getMonth() + direction);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction * 7));
        break;
    }
    
    setCurrentDate(newDate);
    
    if (onDateRangeChange) {
      onDateRangeChange(newDate, viewMode);
    }
  }, [currentDate, viewMode, onDateRangeChange]);

  const getEventsForDate = useCallback((date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.date || event.startDate);
      const eventDateString = eventDate.toISOString().split('T')[0];
      return eventDateString === dateString;
    });
  }, [events]);

  const handleDateClick = useCallback((date) => {
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date, getEventsForDate(date));
    }
  }, [onDateClick, getEventsForDate]);

  const handleEventClick = useCallback((event, date) => {
    if (onEventClick) {
      onEventClick(event, date);
    }
  }, [onEventClick]);

  const renderEvent = (event, date) => {
    if (eventRenderer) {
      return eventRenderer(event, date);
    }

    const config = eventConfig[event.type] || eventConfig.default || {};
    
    return (
      <div
        key={event.id || event.title}
        className={`calendar-event-calendar ${config.className || ""}`}
        onClick={(e) => {
          e.stopPropagation();
          handleEventClick(event, date);
        }}
        title={event.description || event.title}
      >
        {event.title || "Événement"}
      </div>
    );
  };

  const getMondayOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const renderMonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const startDate = getMondayOfWeek(firstDay);

    const days = [];
    const totalDays = showWeekends ? 42 : 35;

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      if (!showWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
        continue;
      }
      
      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const dayEvents = getEventsForDate(date);
      
      days.push(
        <div
          key={date.toISOString()}
          className={`calendar-day-calendar ${isCurrentMonth ? "current-month-calendar" : "other-month-calendar"} ${isToday ? "today-calendar" : ""} ${isSelected ? "selected-calendar" : ""}`}
          onClick={() => handleDateClick(date)}
        >
          <div className="day-number-calendar">
            {dateRenderer ? dateRenderer(date, isCurrentMonth, isToday) : date.getDate()}
          </div>
          <div className="day-events-calendar">
            {dayEvents.map(event => renderEvent(event, date))}
          </div>
        </div>
      );
    }

    return (
      <div className="calendar-grid-calendar month-view-calendar">
        <div className="calendar-header-days-calendar">
          {dayNames.map(day => (
            <div key={day} className="calendar-header-day-calendar">{day}</div>
          ))}
        </div>
        <div className="calendar-days-calendar">
          {days}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = getMondayOfWeek(currentDate);

    const days = [];
    const totalDays = showWeekends ? 7 : 5;

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const dayEvents = getEventsForDate(date);

      days.push(
        <div
          key={date.toISOString()}
          className={`calendar-day-calendar week-day-calendar ${isToday ? "today-calendar" : ""} ${isSelected ? "selected-calendar" : ""}`}
          onClick={() => handleDateClick(date)}
        >
          <div className="day-header-calendar">
            <div className="day-name-calendar">{dayNames[i]}</div>
            <div className="day-number-calendar">{date.getDate()}</div>
          </div>
          <div className="day-events-calendar">
            {dayEvents.map(event => renderEvent(event, date))}
          </div>
        </div>
      );
    }

    return (
      <div className="calendar-grid-calendar week-view-calendar">
        {days}
      </div>
    );
  };

  const renderCalendar = () => {
    switch (viewMode) {
      case "week":
        return renderWeekView();
      default:
        return renderMonthView();
    }
  };

  return (
    <div className={`generic-calendar-calendar ${className}`}>
      <div className="calendar-header-calendar">
        <div className="calendar-navigation-calendar">
          <button
            className="nav-button-calendar"
            onClick={() => navigateDate(-1)}
            title="Précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h2 className="calendar-title-calendar">
            {viewMode === "week"
              ? `Semaine du ${getMondayOfWeek(currentDate).toLocaleDateString(locale)}`
              : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            }
          </h2>
          
          <button
            className="nav-button-calendar"
            onClick={() => navigateDate(1)}
            title="Suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="calendar-controls-calendar">
          <div className="view-modes-calendar">
            {viewModes.map(mode => (
              <button
                key={mode}
                className={`view-button-calendar ${viewMode === mode ? "active-calendar" : ""}`}
                onClick={() => setViewMode(mode)}
              >
                {mode === "month" && <CalendarIcon className="w-4 h-4" />}
                {mode === "week" && <List className="w-4 h-4" />}
                {mode === "month" ? "Mois" : "Semaine"}
              </button>
            ))}
          </div>
          
          <button
            className="today-button-calendar"
            onClick={() => setCurrentDate(new Date())}
          >
            Aujourd'hui
          </button>
        </div>
      </div>

      <CalendarLegend eventConfig={eventConfig} />

      <div className="calendar-body-calendar">
        {renderCalendar()}
      </div>
    </div>
  );
}