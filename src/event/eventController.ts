import { Request, Response } from "express";
import EventService from "./eventService";
import { ICreateEvent } from "./interfaces";
import RatingService from "../rating/ratingService";
import FavoritesService from "../favorites/favoritesService";
import ReservationService from "../reservation/reservationService";
import { Types } from "mongoose";

class EventController {
  private eventService = new EventService();
  private ratingService = new RatingService();
  private favoritesService = new FavoritesService();
  private reservationService = new ReservationService();

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

      const newEvent = await this.eventService.createEvent(payload);
      res.json({ result: true, _id: newEvent._id });
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
      const dataEvents = await this.eventService.getEvents(
        req.body.page,
        cleanedFilterData
      );

      const event_ids: any = dataEvents.map((item) => item._id);
      const ratings = await this.ratingService.getRatingEvents(event_ids);
      const dataReservation =
        await this.reservationService.getReservationEvents(event_ids);

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

      // Create a map to store the count of reservations by event_id
      const bookedSeatsByEventId: { [key: string]: number } = {};

      dataReservation.forEach((reservation) => {
        const eventId = reservation.event_id.toString();
        if (!bookedSeatsByEventId[eventId]) {
          bookedSeatsByEventId[eventId] = 0;
        }
        bookedSeatsByEventId[eventId] += 1; // Each reservation represents one booked seat
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
        const bookedSeats = bookedSeatsByEventId[eventId] || 0;

        return {
          ...event.toObject(), // Convert Mongoose document to plain JavaScript object
          rating: averageRating,
          isFavorite: isFavorite,
          bookedSeats: bookedSeats,
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

      // Check reservation for the user
      const getReservation = await this.reservationService.getReservationUser({
        event_id: getEvent._id,
        user_id: userInfo._id,
      });

      const getNumberReservation =
        await this.reservationService.getReservationEvents(getEvent._id);

      const event_origin =
        getEvent.creator._id.toString() === userInfo._id.toString();

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
        event_origin: event_origin,
        booked: getReservation ? true : false,
        numberBooked: getNumberReservation.length || 0,
      };

      res.status(200).json(payload);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(400).json({ error: "Error fetching event" });
    }
  }

  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const {
        _id,
        title,
        description,
        date,
        location,
        seats,
        price,
        organizers,
      } = req.body;

      console.log(organizers.split(","));

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

      let organizersArray: any;

      if (typeof organizers === "string") {
        try {
          organizersArray = JSON.parse(organizers);
          if (!Array.isArray(organizersArray)) {
            throw new Error("Organizers should be an array");
          }
        } catch (e) {
          console.error("Failed to parse organizers:", e);
          organizersArray = [];
        }
      } else if (Array.isArray(organizers)) {
        organizersArray = organizers;
      } else {
        console.error("Invalid format for organizers");
        organizersArray = [];
      }

      const payload: ICreateEvent = {
        title,
        description,
        date,
        location,
        seats,
        price,
        creator: userInfo._id,
        organizers: organizersArray.map(
          (organizer: { _id: Types.ObjectId }) => organizer._id
        ),
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
          delete payload.preview_photo;
        }

        if (files.cover_photo && files.cover_photo[0]) {
          payload.cover_photo = files.cover_photo[0].path;
        } else {
          delete payload.cover_photo;
        }
      } else {
        delete payload.preview_photo;
        delete payload.cover_photo;
      }

      console.log(">> req.files: ", req.files);
      console.log(">> payload: ", payload);

      await this.eventService.updateEvent(_id, payload);
      res.status(200).json({
        result: true,
        message: "The data has been updated successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(400).json(error);
    }
  }

  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const _id: any = req.params._id;
      await this.eventService.deleteEvent(_id);
      await this.favoritesService.deleteFavorite(_id);
      await this.ratingService.deleteRating(_id);
      await this.reservationService.deleteReservation(_id);
      res.status(200).json({
        result: true,
        message: "The event has been deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(400).json(error);
      return;
    }
  }

  async getFavoritesEvent(req: Request, res: Response): Promise<void> {
    try {
      const userInfo = (req as any).user.user;
      const dataEvents = await this.favoritesService.getFavoritesEvent(
        userInfo._id
      );

      const event_ids: any = dataEvents.map((item) => item._id);
      const ratings = await this.ratingService.getRatingEvents(event_ids);
      const dataReservation =
        await this.reservationService.getReservationEvents(event_ids);

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

      // Create a map to store the count of reservations by event_id
      const bookedSeatsByEventId: { [key: string]: number } = {};

      dataReservation.forEach((reservation) => {
        const eventId = reservation.event_id.toString();
        if (!bookedSeatsByEventId[eventId]) {
          bookedSeatsByEventId[eventId] = 0;
        }
        bookedSeatsByEventId[eventId] += 1; // Each reservation represents one booked seat
      });

      // Create a map to check if an event is in user's favorites
      const favoriteEventIds = new Set(
        checkFavorites.map((fav) => fav.event_id.toString())
      );

      // Calculate average rating for each event and check if it's favorited
      const eventsWithRatings = dataEvents.map((event: any) => {
        const eventId = event._id.toString();
        const ratingSummary = ratingsSummaryByEventId[eventId] || {
          sum: 0,
          count: 0,
        };
        const averageRating = ratingSummary.count
          ? ratingSummary.sum / ratingSummary.count
          : 0;

        const isFavorite = favoriteEventIds.has(eventId);
        const bookedSeats = bookedSeatsByEventId[eventId] || 0;

        return {
          ...event.toObject(), // Convert Mongoose document to plain JavaScript object
          rating: averageRating,
          isFavorite: isFavorite,
          bookedSeats: bookedSeats,
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

  async getReservationsEvent(req: Request, res: Response): Promise<void> {
    try {
      const userInfo = (req as any).user.user;
      const dataEvents = await this.reservationService.getReservationsEvent(
        userInfo._id
      );

      const event_ids: any = dataEvents.map((item) => item._id);
      const ratings = await this.ratingService.getRatingEvents(event_ids);
      const dataReservation =
        await this.reservationService.getReservationEvents(event_ids);

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

      // Create a map to store the count of reservations by event_id
      const bookedSeatsByEventId: { [key: string]: number } = {};

      dataReservation.forEach((reservation) => {
        const eventId = reservation.event_id.toString();
        if (!bookedSeatsByEventId[eventId]) {
          bookedSeatsByEventId[eventId] = 0;
        }
        bookedSeatsByEventId[eventId] += 1; // Each reservation represents one booked seat
      });

      // Create a map to check if an event is in user's favorites
      const favoriteEventIds = new Set(
        checkFavorites.map((fav) => fav.event_id.toString())
      );

      // Calculate average rating for each event and check if it's favorited
      const eventsWithRatings = dataEvents.map((event: any) => {
        const eventId = event._id.toString();
        const ratingSummary = ratingsSummaryByEventId[eventId] || {
          sum: 0,
          count: 0,
        };
        const averageRating = ratingSummary.count
          ? ratingSummary.sum / ratingSummary.count
          : 0;

        const isFavorite = favoriteEventIds.has(eventId);
        const bookedSeats = bookedSeatsByEventId[eventId] || 0;

        return {
          ...event.toObject(), // Convert Mongoose document to plain JavaScript object
          rating: averageRating,
          isFavorite: isFavorite,
          bookedSeats: bookedSeats,
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
