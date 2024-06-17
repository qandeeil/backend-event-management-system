import { Request, Response } from "express";
import FavoritesService from "./favoritesService";
import { IFavorites } from "./interfaces";

class FavoritesController {
  private favoritesService = new FavoritesService();

  async addToFavorite(req: Request, res: Response): Promise<void> {
    try {
      const userInfo = (req as any).user.user;
      const payload: IFavorites = {
        user_id: userInfo._id,
        event_id: req.body.event_id,
      };

      const findToFavorite = await this.favoritesService.findToFavorite(
        payload
      );

      if (findToFavorite) {
        await this.favoritesService.removeToFavorite(payload);
        res.status(200).json({
          result: true,
          message: "Removed from favorites",
        });
        return;
      } else {
        await this.favoritesService.addToFavorite(payload);
        res.status(200).json({ result: true, message: "Added to favorites" });
        return;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        res.status(404).json(error.message);
        return;
      }
      res.status(404).json(error);
      return;
    }
  }
}

export default FavoritesController;
