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

export default router;
