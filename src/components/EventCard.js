import React from 'react';
import moment from 'moment';

export const EventCard = ({ event, onSelectEvent, displaySelected }) => {
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