import { IAddRating } from "./interfaces";
import ratingModel from "./ratingModel";

class RatingService {
  addRating(rating: IAddRating) {
    return ratingModel.create(rating);
  }
  getRatingEvents(event_id: string) {
    return ratingModel.find({ event_id });
  }
}

export default RatingService;
