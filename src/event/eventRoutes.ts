import { Request, Response, Router } from "express";
import EventController from "./eventController";
import AuthorizeToken from "../common/middleware/authorize";
import UploadFile from "../common/utils/UploadFile";

const router = Router();
const eventController = new EventController();
const authorizeToken = new AuthorizeToken();
const uploadFile = new UploadFile("public/event_images");

router.post(
  "/create-event",
  authorizeToken.authorize,
  uploadFile.uploadImage().fields([
    { name: "preview_photo", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  (req: Request, res: Response) => eventController.createEvent(req, res)
);

router.post("/get-events", authorizeToken.authorize, (req, res) =>
  eventController.getEvents(req, res)
);

router.get("/get-event/:_id", authorizeToken.authorize, (req, res) =>
  eventController.getEventById(req, res)
);

router.post(
  "/update-event",
  authorizeToken.authorize,
  uploadFile.uploadImage().fields([
    { name: "preview_photo", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  (req: Request, res: Response) => eventController.updateEvent(req, res)
);

router.delete(
  "/delete-event/:_id",
  authorizeToken.authorize,
  (req: Request, res: Response) => eventController.deleteEvent(req, res)
);

router.get("/my-favorites", authorizeToken.authorize, (req, res) =>
  eventController.getFavoritesEvent(req, res)
);

router.get("/my-reservations", authorizeToken.authorize, (req, res) =>
  eventController.getReservationsEvent(req, res)
);

export default router;
