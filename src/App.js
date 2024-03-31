import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { toast, ToastContainer } from 'react-toastify';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { data } from './data';
import './App.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-toastify/dist/ReactToastify.css';

const localizer = momentLocalizer(moment);
const MAX_SELECTED_EVENTS = 3;
const defaultDate = new Date('2022-12-17');

const App = () => {
  const [events, setEvents] = useState([]);
  const [scrollToTime, setScrollToTime] = useState(defaultDate);

  //tabs
  const [showAllEvents, setShowAllEvents] = useState(true);
  const [showSelectedEvents, setShowSelectedEvents] = useState(false);
  const [showCalendarTab, setShowCalendarTab] = useState(false);

  const selectedEvents = events.filter(event => event.selected);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const formattedEvents = data.map(event => ({
          id: event?.id,
          title: event?.event_name,
          category: event?.event_category,
          start: new Date(event?.start_time),
          end: new Date(event?.end_time),
          selected: false,
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to fetch events. Please try again later.');
      }
    };
    fetchEvents();
  }, []);

  const handleSelectEvent = (selectedEvent) => {


    const selectedCount = events.filter(event => event.selected).length;

    if (selectedCount === MAX_SELECTED_EVENTS && !selectedEvent.selected) {
      toast.error(`Maximum number of events reached - ${MAX_SELECTED_EVENTS}. You cannot select more events.`);
      return;
    }

    if (selectedEvent?.selected) return;


    let clashingEvent = null;
    const hasConflict = events.some(event => {
      if (event.selected && event.id !== selectedEvent.id) {
        const selectedEventStartTime = new Date(selectedEvent?.start).getTime();
        const selectedEventEndTime = new Date(selectedEvent?.end).getTime();
        const eventStartTime = new Date(event.start)?.getTime();
        const eventEndTime = new Date(event.end)?.getTime();

        if (
          (selectedEventStartTime >= eventStartTime && selectedEventStartTime < eventEndTime) ||
          (selectedEventEndTime > eventStartTime && selectedEventEndTime <= eventEndTime) ||
          (eventStartTime >= selectedEventStartTime && eventStartTime < selectedEventEndTime) ||
          (eventEndTime > selectedEventStartTime && eventEndTime <= selectedEventEndTime)
        ) {
          clashingEvent = event;
          return true;
        }
      }
      setScrollToTime(new Date(selectedEvent?.start));
      return false;
    });

    if (hasConflict) {
      toast.error(`Cannot select the event ${clashingEvent?.title} in category ${clashingEvent?.category}. It conflicts with the timings of already selected events.`);
      return;
    }

    const updatedEvents = events.map(event => {
      if (event.id === selectedEvent.id) {
        return { ...event, selected: !event.selected };
      }
      return event;
    });

    setEvents(updatedEvents);
  };

  const selectedEventsForCalendar = events
    .filter(event => event.selected)
    .map(event => ({
      id: event.id,
      title: event.title,
      start: event.start,
      category: event?.event_category,
      end: event.end,
    }));

  const toggleTab = (tab) => {
    if (tab === 'allEvents') {
      setShowAllEvents(true);
      setShowSelectedEvents(false);
      setShowCalendarTab(false);
    } else if (tab === 'selectedEvents') {
      setShowAllEvents(false);
      setShowSelectedEvents(true);
      setShowCalendarTab(false);
    } else if (tab === 'calendar') {
      setShowAllEvents(false);
      setShowSelectedEvents(false);
      setShowCalendarTab(true);
    }
  };

  return (
    <div className='main'>
      <h1>Sports Day Registration</h1>
      <div className='events-container'>
        {window.innerWidth <= 450 ? (
          <>
            <div className="mobile-tabs">
              <button className={`tab ${showAllEvents ? 'active' : ''}`} onClick={() => toggleTab('allEvents')}>All Events</button>
              <button className={`tab ${showSelectedEvents ? 'active' : ''}`} onClick={() => toggleTab('selectedEvents')}>Selected Events ({selectedEvents.length})</button>
              <button className={`tab ${showCalendarTab ? 'active' : ''}`} onClick={() => toggleTab('calendar')}>Calendar</button>
            </div>
            {showCalendarTab && (
              <div className='calendar-container'>
                <h2>Calendar View</h2>
                <Calendar
                  localizer={localizer}
                  events={selectedEventsForCalendar}
                  defaultDate={defaultDate}
                  defaultView='day'
                  style={{ height: 500 }}
                  scrollToTime={scrollToTime}
                  onSelectEvent={handleSelectEvent}
                  enableAutoScroll
                  views={["day"]}
                />
              </div>
            )}
            {showAllEvents && (
              <div className='events-list'>
                <EventsList events={events} onSelectEvent={handleSelectEvent} displaySelected={false} />
              </div>
            )}
            {showSelectedEvents && (
              <div className='drawer-list'>
                <EventsList events={events} onSelectEvent={handleSelectEvent} displaySelected={true} />
              </div>
            )}
          </>
        ) : (
          <>
            <div className='events-row'>
              <div className='events-list'>
                <EventsList events={events} onSelectEvent={handleSelectEvent} displaySelected={false} />
              </div>
              <div className='drawer-list'>
                <EventsList events={events} onSelectEvent={handleSelectEvent} displaySelected={true} />
              </div>
              <div className='calendar-container'>
                <h2>Calendar View</h2>
                <Calendar
                  localizer={localizer}
                  events={selectedEventsForCalendar}
                  defaultDate={defaultDate}
                  defaultView='day'
                  style={{ height: 500 }}
                  scrollToTime={scrollToTime}
                  onSelectEvent={handleSelectEvent}
                  enableAutoScroll
                  views={["day"]}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <ToastContainer position='bottom-center' toastStyle={{ width: '20rem', left: '50%', transform: 'translateX(-50%)' }} />
    </div>
  );
};

const EventsList = ({ events, onSelectEvent, displaySelected }) => {
  const filteredEvents = displaySelected ? events.filter(event => event.selected) : events.filter(event => !event.selected);

  return (
    <>
      <h2>{displaySelected ? 'Selected Events' : 'All Events'}</h2>
      <div className='events-grid'>
        {filteredEvents.map(event => (
          <EventItem key={event.id} event={event} onSelectEvent={onSelectEvent} displaySelected={displaySelected} />
        ))}
      </div>
    </>
  );
};

const EventItem = ({ event, onSelectEvent, displaySelected }) => {
  const { title, category, start, end } = event;

  const formattedStartTime = moment(start).format('h:mm A');
  const formattedEndTime = moment(end).format('h:mm A');
  const formattedDate = moment(start).format('dddd, MMMM D');

  const handleSelect = () => {
    onSelectEvent(event);
  };

  return (
    <div className={`event-card ${displaySelected ? 'selected-event-card' : ''}`}>
      <h3>{title}</h3>
      <p>Category: {category}</p>
      <p>Date: {formattedDate}</p>
      <p>Timings: {formattedStartTime} - {formattedEndTime}</p>
      <button onClick={handleSelect}>{displaySelected ? 'Remove' : 'Select'}</button>
    </div>
  );
};

export default App;
