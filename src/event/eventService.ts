import Event from "./eventModel";
import { ICreateEvent } from "./interfaces";

class EventService {
  createEvent(event: ICreateEvent) {
    return Event.create(event);
  }
  getEvents(page: number) {
    const perPage = 5;
    const skip = (page - 1) * perPage;
    return Event.find()
      .skip(skip)
      .limit(perPage)
      .select("date location title creator cover_photo price seats")
      .populate({
        path: "creator",
        select: "name profile_image",
      });
  }
}

export default EventService;
