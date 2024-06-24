import { Types } from "mongoose";
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
  getEventbyId(_id: Types.ObjectId) {
    return Event.findById(_id).populate("organizers").populate("creator");
  }
  updateEvent(_id: Types.ObjectId, event: ICreateEvent) {
    return Event.findByIdAndUpdate(_id, event);
  }
  deleteEvent(_id: Types.ObjectId) {
    return Event.findByIdAndDelete(_id);
  }
}

export default EventService;
