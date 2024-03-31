import { toast } from 'react-toastify';

import { MAX_SELECTED_EVENTS } from './App.constants';

export const countSelectedEvents = events => events.filter(event => event.selected).length;

export const showMaxSelectedEventsError = () =>
    toast.error(`Maximum number of events reached - ${MAX_SELECTED_EVENTS}. You cannot select more events.`);

export const showClashingEventsError = clashingEvent =>
    toast.error(`Event selection conflict: Timing overlaps with ${clashingEvent?.title} in ${clashingEvent?.category}.`);;

export const findClashingEvent = (selectedEvent, selectedEvents) => {
    return selectedEvents.find(event => {
        if (event.id !== selectedEvent.id) {
            const selectedEventRange = getEventTimeRange(selectedEvent);
            const eventRange = getEventTimeRange(event);
            return checkTimeConflict(selectedEventRange, eventRange);
        }
        return false;
    });
};

export const getEventTimeRange = (event) => {
    const startTime = new Date(event.start)?.getTime();
    const endTime = new Date(event.end)?.getTime();
    return { startTime, endTime };
};

export const checkTimeConflict = (range1, range2) => {
    return (
        (range1.startTime >= range2.startTime && range1.startTime < range2.endTime) ||
        (range1.endTime > range2.startTime && range1.endTime <= range2.endTime) ||
        (range2.startTime >= range1.startTime && range2.startTime < range1.endTime) ||
        (range2.endTime > range1.startTime && range2.endTime <= range1.endTime)
    );
};

export const getUpdatedEventsWithToggledSelection = (events, selectedEvent) => {
    return events.map(event => {
      if (event.id === selectedEvent.id) {
        return { ...event, selected: !event.selected };
      }
      return event;
    });
  }