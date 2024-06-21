import { Request, Response } from "express";
import EventService from "./eventService";
import { ICreateEvent } from "./interfaces";
import RatingService from "../rating/ratingService";
import FavoritesService from "../favorites/favoritesService";

class EventController {
  private eventService = new EventService();
  private ratingService = new RatingService();
  private favoritesService = new FavoritesService();

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

  cleanFilterData(filterData: any) {
    const cleanedData: any = {};

    if (filterData.data) {
      if (filterData.data.start_date && filterData.data.start_date !== "") {
        cleanedData["date.start_date"] = {
          $lte: new Date(filterData.data.start_date),
        };
      }
      if (filterData.data.end_date && filterData.data.end_date !== "") {
        cleanedData["date.end_date"] = {
          $gte: new Date(filterData.data.end_date),
        };
      }
    }

    if (filterData.location) {
      if (filterData.location.country && filterData.location.country !== "") {
        cleanedData["location.country"] = filterData.location.country;
      }
      if (filterData.location.city && filterData.location.city !== "") {
        cleanedData["location.city"] = filterData.location.city;
      }
    }
    cleanedData["expired"] = filterData.expired;
    return cleanedData;
  }

  async getEvents(req: Request, res: Response) {
    try {
      const userInfo = (req as any).user.user;
      const cleanedFilterData = this.cleanFilterData(req.body.filter);
      console.log(">> cleanedFilterData : ", cleanedFilterData);
      const dataEvents = await this.eventService.getEvents(
        req.body.page,
        cleanedFilterData
      );

      const event_ids: any = dataEvents.map((item) => item._id);
      const ratings = await this.ratingService.getRatingEvents(event_ids);

      const checkFavorites = await this.favoritesService.findToFavoriteEvents({
        event_id: event_ids,
        user_id: userInfo._id,
      });

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

      // Create a map to check if an event is in user's favorites
      const favoriteEventIds = new Set(
        checkFavorites.map((fav) => fav.event_id.toString())
      );

      // Calculate average rating for each event and check if it's favorited
      const eventsWithRatings = dataEvents.map((event) => {
        const eventId = event._id.toString();
        const ratingSummary = ratingsSummaryByEventId[eventId] || {
          sum: 0,
          count: 0,
        };
        const averageRating = ratingSummary.count
          ? ratingSummary.sum / ratingSummary.count
          : 0;

        const isFavorite = favoriteEventIds.has(eventId);

        return {
          ...event.toObject(), // Convert Mongoose document to plain JavaScript object
          rating: averageRating,
          isFavorite: isFavorite,
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

  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const userInfo = (req as any).user.user;
      const eventId: any = req.params._id;

      // Get event details by id
      const getEvent: any = await this.eventService.getEventbyId(eventId);

      // Get ratings for the event
      const ratings = await this.ratingService.getRatingEvents(eventId);

      // Get ratings for the user
      const getRatingUser = await this.ratingService.getRatingUser({
        event_id: getEvent._id,
        user_id: userInfo._id,
      });

      // Initialize the ratings summary
      let sum: any = 0;
      let count: any = 0;
      const categoriesOfEvaluations = {
        one: 0,
        two: 0,
        three: 0,
        four: 0,
        five: 0,
      };

      // Calculate ratings summary
      ratings.forEach((rating) => {
        sum += rating.rate;
        count++;
        // Count the number of each rating
        switch (rating.rate) {
          case 1:
            categoriesOfEvaluations.one++;
            break;
          case 2:
            categoriesOfEvaluations.two++;
            break;
          case 3:
            categoriesOfEvaluations.three++;
            break;
          case 4:
            categoriesOfEvaluations.four++;
            break;
          case 5:
            categoriesOfEvaluations.five++;
            break;
          default:
            break;
        }
      });

      // Calculate average rating (if there are ratings)
      const averageRating = count > 0 ? sum / count : 0;

      // Format ratings to be between 1 and 5 and round to nearest integer
      const formattedRating = Math.min(5, Math.round(averageRating));

      // Prepare payload to send in response
      const payload = {
        ...getEvent.toObject(), // Convert Mongoose document to plain JavaScript object
        rating: formattedRating, // Add formatted rating to the payload
        number_of_reviews: ratings.length,
        categories_of_evaluations: categoriesOfEvaluations,
        ratingUser: getRatingUser ? getRatingUser.rate : 0,
      };

      console.log(">> payload: ", payload);
      res.status(200).json(payload);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(400).json({ error: "Error fetching event" });
    }
  }
}

export default EventController;
