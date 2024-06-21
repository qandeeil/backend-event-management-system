import { Request, Response } from "express";
import RatingService from "./ratingService";
import { IAddRating } from "./interfaces";

class RatingController {
  private ratingService = new RatingService();

  async addRating(req: Request, res: Response): Promise<void> {
    try {
      if (!req.body.event_id || !req.body.rate) {
        res.status(400).json("Event ID and rate are required.");
        return;
      }

      const userInfo = (req as any).user.user;
      const payload: IAddRating = {
        user_id: userInfo._id,
        event_id: req.body.event_id,
        rate: req.body.rate,
      };

      const checkAvalabelRate = await this.ratingService.getRatingUser({
        event_id: req.body.event_id,
        user_id: userInfo._id,
      });

      if (checkAvalabelRate) {
        await this.ratingService.updateRating({
          _id: checkAvalabelRate._id,
          rate: req.body.rate,
        });
      } else {
        await this.ratingService.addRating(payload);
      }

      res
        .status(201)
        .json({ result: true, message: "Evaluation completed successfully" });
      return;
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json(error.message);
        return;
      }
      res.status(400).json(error);
    }
  }
}

export default RatingController;
