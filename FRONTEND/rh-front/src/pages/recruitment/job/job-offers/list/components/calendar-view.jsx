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

moment.locale("fr");
const localizer = momentLocalizer(moment);

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

const CalendarView = ({ jobOffers = [], onEventClick }) => {
    // Function to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "Publié":
                return "#10b981";
            case "Brouillon":
                return "#f59e0b";
            case "Fermé":
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

    // Transform job offers to calendar events
    const calendarEvents = useMemo(() => {
        const events = [];
        jobOffers.forEach((offer) => {
            const publicationDate = new Date(offer.publicationDate);
            events.push({
                id: offer.offerId,
                title: `💼 ${offer.title || "Offre sans titre"}`,
                start: publicationDate,
                end: publicationDate,
                allDay: true,
                resource: {
                    ...offer,
                    status: offer.status,
                },
            });
        });
        return events;
    }, [jobOffers]);

    // Handle event click
    const handleEventClick = (event) => {
        const offerId = event.id;
        if (offerId) {
            onEventClick(event);
        }
    };

    return (
        <>
            {/* Calendar Legend */}
            <CalendarLegend>
                <LegendItem>
                    <LegendColor color="#10b981" />
                    <LegendLabel>Publié</LegendLabel>
                </LegendItem>
                <LegendItem>
                    <LegendColor color="#f59e0b" />
                    <LegendLabel>Brouillon</LegendLabel>
                </LegendItem>
                <LegendItem>
                    <LegendColor color="#ef4444" />
                    <LegendLabel>Fermé</LegendLabel>
                </LegendItem>
                <LegendNote>💼 = Offre d'emploi</LegendNote>
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