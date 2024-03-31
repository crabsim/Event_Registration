import { EventCard } from "./EventCard";

export const EventsList = ({ events, onSelectEvent, displaySelected }) => {
    const filteredEvents = displaySelected ? events.filter(event => event.selected) : events.filter(event => !event.selected);
  
    return (
      <>
        <h2>{displaySelected ? 'Selected Events' : 'All Events'}</h2>
        <div className='events-grid'>
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} onSelectEvent={onSelectEvent} displaySelected={displaySelected} />
          ))}
        </div>
      </>
    );
  };