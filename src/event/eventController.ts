import { Request, Response } from "express";
import EventService from "./eventService";
import { IUser } from "../user/interfaces";
import { ICreateEvent, IEvent } from "./interfaces";

class EventController {
  private eventService = new EventService();

  async createEvent(req: Request, res: Response) {
    try {
      const { title, description, date, location, seats, price, organizers } =
        req.body;

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
        date,
        location,
        seats,
        price,
        creator: userInfo._id,
        organizers,
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

      console.log(">> payload: ", payload);

      await this.eventService.createEvent(payload);
      res.json({ created: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json(error.message);
      }
    }
  }
}

export default EventController;
