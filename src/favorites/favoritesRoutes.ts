import { Request, Response, Router } from "express";
import AuthorizeToken from "../common/middleware/authorize";
import FavoritesController from "./favoritesController";

const router = Router();
const authorizeToken = new AuthorizeToken();
const favoritesController = new FavoritesController();

router.post(
  "/add-to-favorite",
  authorizeToken.authorize,
  (req: Request, res: Response) => favoritesController.addToFavorite(req, res)
);

export default router;
