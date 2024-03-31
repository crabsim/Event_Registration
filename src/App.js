import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { toast, ToastContainer } from 'react-toastify';
import { Calendar, momentLocalizer } from 'react-big-calendar';

import { EventsList } from './components/EventsList';

import {
  countSelectedEvents,
  showMaxSelectedEventsError,
  findClashingEvent,
  showClashingEventsError,
  getUpdatedEventsWithToggledSelection
} from './App.helper';
import { data } from './data';
import { defaultDate, MAX_SELECTED_EVENTS, MOBILE_VIEW_WIDTH, CALENDER_VIEWS } from './App.constants';
import './App.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-toastify/dist/ReactToastify.css';

const localizer = momentLocalizer(moment);

const App = () => {
  const [events, setEvents] = useState([]);
  const [scrollToTime, setScrollToTime] = useState(defaultDate);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const formattedEvents =
          data.map(event => ({
            id: event?.id,
            title: event?.event_name,
            category: event?.event_category,
            start: new Date(event?.start_time),
            end: new Date(event?.end_time),
            selected: false,
          }));
        formattedEvents.sort((a, b) => a.start - b.start);

        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to fetch events. Please try again later.');
      }
    };
    fetchEvents();
  }, []);

  const handleSelectEvent = (selectedEvent) => {
    const selectedCount = countSelectedEvents(selectedEvents);

    if (selectedCount === MAX_SELECTED_EVENTS && !selectedEvent.selected) {
      showMaxSelectedEventsError();
      return;
    }

    if (selectedEvent?.selected) {
      const updatedEvents = getUpdatedEventsWithToggledSelection(events, selectedEvent);
      setEvents(updatedEvents);
      return;
    }

    const clashingEvent = findClashingEvent(selectedEvent, selectedEvents);
    if (clashingEvent) {
      showClashingEventsError(clashingEvent);
      return;
    }
    else {
      const updatedEvents = getUpdatedEventsWithToggledSelection(events, selectedEvent);
      setEvents(updatedEvents);
      setScrollToTime(new Date(selectedEvent?.start));
    }
  };

  const selectedEvents = events
    .filter(event => event.selected);

  return (
    <div className='main'>
      <h1>Sports Day Registration</h1>
      <div className='events-container'>
        {window.innerWidth <= MOBILE_VIEW_WIDTH ?
          <MobileView
            events={events}
            selectedEvents={selectedEvents}
            handleSelectEvent={handleSelectEvent}
            scrollToTime={scrollToTime}
          /> :
          renderWebView({ events, handleSelectEvent, selectedEvents })}
      </div>
      <ToastContainer position='bottom-center' toastStyle={{ width: '20rem', left: '50%', transform: 'translateX(-50%)' }} />
    </div>
  );
};

const MobileView = ({ events, selectedEvents, handleSelectEvent, scrollToTime }) => {

  const [showAllEvents, setShowAllEvents] = useState(true);
  const [showSelectedEvents, setShowSelectedEvents] = useState(false);
  const [showCalendarTab, setShowCalendarTab] = useState(false);

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
    <>
      <div className="mobile-tabs">
        <button className={`tab ${showAllEvents ? 'active' : ''}`}
          onClick={() => toggleTab('allEvents')}>
          All Events
        </button>
        <button className={`tab ${showSelectedEvents ? 'active' : ''}`}
          onClick={() => toggleTab('selectedEvents')}>
          Selected Events ({selectedEvents.length})
        </button>
        <button className={`tab ${showCalendarTab ? 'active' : ''}`}
          onClick={() => toggleTab('calendar')}>
          Calendar
        </button>
      </div>
      {showCalendarTab && (
        <div className='calendar-container' key="calendar-container">
          <h2>Calendar View</h2>
          <Calendar
            localizer={localizer}
            events={selectedEvents}
            defaultDate={defaultDate}
            defaultView='day'
            style={{ height: 500 }}
            scrollToTime={scrollToTime}
            onSelectEvent={handleSelectEvent}
            enableAutoScroll
            views={CALENDER_VIEWS}
          />
        </div>
      )}
      {showAllEvents && (
        <div className='events-list' key="events-list">
          <EventsList events={events} onSelectEvent={handleSelectEvent} displaySelected={false} />
        </div>
      )}
      {showSelectedEvents && (
        <div className='drawer-list' key="drawer-list">
          <EventsList events={selectedEvents} onSelectEvent={handleSelectEvent} displaySelected={true} />
        </div>
      )}
    </>
  )
}

const renderWebView = ({ events, selectedEvents, handleSelectEvent, scrollToTime }) => {
  return (
    <>
      <div className='events-row'>
        <div className='events-list'>
          <EventsList events={events} onSelectEvent={handleSelectEvent} displaySelected={false} />
        </div>
        <div className='drawer-list'>
          <EventsList events={selectedEvents} onSelectEvent={handleSelectEvent} displaySelected={true} />
        </div>
        <div className='calendar-container'>
          <h2>Calendar View</h2>
          <Calendar
            localizer={localizer}
            events={selectedEvents}
            defaultDate={defaultDate}
            defaultView='day'
            style={{ height: 560 }}
            scrollToTime={scrollToTime}
            onSelectEvent={handleSelectEvent}
            enableAutoScroll
            views={CALENDER_VIEWS}
          />
        </div>
      </div>
    </>
  )
}


export default App;