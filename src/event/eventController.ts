import { Request, Response } from "express";
import EventService from "./eventService";
import { ICreateEvent } from "./interfaces";

class EventController {
  private eventService = new EventService();

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
      const data = await this.eventService.getEvents(req.body.page);
      console.log(">> page: ", req.body.page);
      res.status(200).send(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        res.status(400).json(error.message);
      }
    }
  }
}

export default EventController;
