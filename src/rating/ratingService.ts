import { Types } from "mongoose";
import { IAddRating } from "./interfaces";
import ratingModel from "./ratingModel";

class RatingService {
  addRating(rating: IAddRating) {
    return ratingModel.create(rating);
  }
  getRatingEvents(event_id: Types.ObjectId[] | Types.ObjectId) {
    return ratingModel.find({ event_id });
  }
}

export default RatingService;
