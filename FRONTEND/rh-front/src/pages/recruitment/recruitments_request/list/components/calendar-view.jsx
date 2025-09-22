import { useMemo } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
    CalendarLegend,
    LegendItem,
    LegendColor,
    LegendLabel,
    LegendNote,
} from "styles/generaliser/table-container";

// Configuration de moment en français
moment.locale("fr");
const localizer = momentLocalizer(moment);

// Messages en français pour react-big-calendar
const messages = {
    allDay: "Toute la journée",
    previous: "Précédent",
    next: "Suivant",
    today: "Aujourd'hui",
    month: "Mois",
    week: "Semaine",
    day: "Jour",
    agenda: "Agenda",
    date: "Date",
    time: "Heure",
    event: "Événement",
    noEventsInRange: "Aucun événement dans cette période.",
    showMore: (total) => `+ ${total} événement(s) supplémentaire(s)`,
};

const CalendarView = ({ requests = [], onEventClick, permissions = {} }) => {
    // Function to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "En Cours":
                return "#3b82f6";
            case "BROUILLON":
                return "#f59e0b";
            case "Approuvé":
                return "#10b981";
            case "Rejeté":
                return "#ef4444";
            default:
                return "#6b7280";
        }
    };

    // Style getter for calendar events
    const eventStyleGetter = (event) => {
        const backgroundColor = getStatusColor(event.resource.status);
        return {
            style: {
                backgroundColor,
                borderRadius: "5px",
                opacity: 0.8,
                color: "white",
                border: "0px",
                display: "block",
            },
        };
    };

    // Transform requests to calendar events
    const calendarEvents = useMemo(() => {
        const events = [];
        requests.forEach((request) => {
            const requestDate = new Date(request.recruitmentRequest?.createdAt);
            events.push({
                id: `${request.recruitmentRequestId}`,
                title: `📋 ${request.recruitmentRequest?.positionTitle || "Demande sans titre"}`,
                start: requestDate,
                end: requestDate,
                allDay: true,
                resource: { 
                    ...request.recruitmentRequest, 
                    status: request.recruitmentRequest?.status 
                },
            });
        });
        return events;
    }, [requests]);

    // Handle event click
    const handleEventClick = (event) => {
        const requestId = event.id;
        if (requestId && permissions[requestId]?.canViewDetails) {
            onEventClick(event);
        }
    };

    return (
        <>
            {/* Calendar Legend */}
            <CalendarLegend>
                <LegendItem>
                    <LegendColor color="#3b82f6" />
                    <LegendLabel>En Cours</LegendLabel>
                </LegendItem>
                <LegendItem>
                    <LegendColor color="#f59e0b" />
                    <LegendLabel>Brouillon</LegendLabel>
                </LegendItem>
                <LegendItem>
                    <LegendColor color="#10b981" />
                    <LegendLabel>Approuvé</LegendLabel>
                </LegendItem>
                <LegendItem>
                    <LegendColor color="#ef4444" />
                    <LegendLabel>Rejeté</LegendLabel>
                </LegendItem>
                <LegendNote>📋 = Demande de recrutement</LegendNote>
            </CalendarLegend>

            {/* Calendar Component */}
            <div style={{ height: "600px" }}>
                <BigCalendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    onSelectEvent={handleEventClick}
                    selectable
                    views={["month", "week"]}
                    defaultView="month"
                    style={{ height: "100%" }}
                    eventPropGetter={eventStyleGetter}
                    messages={messages}
                />
            </div>
        </>
    );
};

export default CalendarView;