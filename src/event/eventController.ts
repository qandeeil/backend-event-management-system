import { Request, Response } from "express";
import EventService from "./eventService";
import { ICreateEvent } from "./interfaces";
import RatingService from "../rating/ratingService";

class EventController {
  private eventService = new EventService();
  private ratingService = new RatingService();

  async createEvent(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        start_date,
        end_date,
        country,
        city,
        seats,
        price,
        organizers,
      } = req.body;

      const userInfo = (req as any).user.user;
      if (userInfo.account_type !== "business") {
        throw new Error(
          JSON.stringify({
            created: false,
            message:
              "You do not have sufficient permissions to create an event",
          })
        );
      }

      const payload: ICreateEvent = {
        title,
        description,
        date: {
          start_date: new Date(start_date),
          end_date: new Date(end_date),
        },
        location: { country, city },
        seats,
        price,
        creator: userInfo._id,
        organizers: organizers.split(","),
        preview_photo: null,
        cover_photo: null,
      };

      if (req.files) {
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };

        if (files.preview_photo && files.preview_photo[0]) {
          payload.preview_photo = files.preview_photo[0].path;
        } else {
          throw new Error(
            JSON.stringify({
              upload_image: false,
              message: "Preview photo is missing or incorrect",
            })
          );
        }

        if (files.cover_photo && files.cover_photo[0]) {
          payload.cover_photo = files.cover_photo[0].path;
        } else {
          throw new Error(
            JSON.stringify({
              upload_image: false,
              message: "Cover photo is missing or incorrect",
            })
          );
        }
      }

      await this.eventService.createEvent(payload);
      res.json({ created: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        res.status(400).json(error.message);
      }
    }
  }

  async getEvents(req: Request, res: Response) {
    try {
      const dataEvents = await this.eventService.getEvents(req.body.page);
      const event_ids = dataEvents.map((item) => item._id);
      const ratings = await this.ratingService.getRatingEvents(event_ids);

      // Create a map to store sum and count of ratings by event_id
      const ratingsSummaryByEventId: {
        [key: string]: { sum: any; count: number };
      } = {};
      ratings.forEach((rating) => {
        const eventId = rating.event_id.toString();
        if (!ratingsSummaryByEventId[eventId]) {
          ratingsSummaryByEventId[eventId] = { sum: 0, count: 0 };
        }
        ratingsSummaryByEventId[eventId].sum += rating.rate;
        ratingsSummaryByEventId[eventId].count += 1;
      });

      // Calculate average rating for each event
      const eventsWithRatings = dataEvents.map((event) => {
        const eventId = event._id.toString();
        const ratingSummary = ratingsSummaryByEventId[eventId] || {
          sum: 0,
          count: 0,
        };
        const averageRating = ratingSummary.count
          ? ratingSummary.sum / ratingSummary.count
          : 0;
        return {
          ...event.toObject(), // Convert Mongoose document to plain JavaScript object
          rating: averageRating,
        };
      });

      res.status(200).send(eventsWithRatings);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        res.status(400).json(error.message);
      }
    }
  }
}

export default EventController;
