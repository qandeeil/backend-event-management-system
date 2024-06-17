import { IAddRating } from "./interfaces";
import ratingModel from "./ratingModel";

class RatingService {
  addRating(rating: IAddRating) {
    return ratingModel.create(rating);
  }
}

export default RatingService;
