import { Request, Response, Router } from "express";
import RatingController from "./ratingController";
import AuthorizeToken from "../common/middleware/authorize";

const router = Router();
const ratingController = new RatingController();
const authorizeToken = new AuthorizeToken();

router.post(
  "/add-rate",
  authorizeToken.authorize,
  (req: Request, res: Response) => ratingController.addRating(req, res)
);

export default router;
