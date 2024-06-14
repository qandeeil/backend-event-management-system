import Event from "./eventModel";
import { ICreateEvent, IEvent } from "./interfaces";

class EventService {
  createEvent(event: ICreateEvent) {
    return Event.create(event);
  }
}

export default EventService;
