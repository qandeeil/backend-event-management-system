import Event from "./eventModel";
import { ICreateEvent } from "./interfaces";

class EventService {
  createEvent(event: ICreateEvent) {
    return Event.create(event);
  }
  getEvents(page: number, filterData: any) {
    const perPage = 10;
    const skip = (page - 1) * perPage;
    return (
      Event.find(filterData)
        // .skip(skip)
        // .limit(perPage)
        .select("date location title creator cover_photo price seats expired")
        .populate({
          path: "creator",
          select: "name profile_image",
        })
    );
  }
  checkExpiredEvents() {
    return Event.updateMany(
      {
        "date.end_date": { $lte: new Date() },
      },
      { $set: { expired: true } }
    );
  }
  getEventbyId(_id: string) {
    return Event.findById(_id).populate("organizers").populate("creator");
  }
}

export default EventService;
