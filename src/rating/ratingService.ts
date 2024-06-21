import { Types } from "mongoose";
import { getRatingUser, IAddRating } from "./interfaces";
import ratingModel from "./ratingModel";

class RatingService {
  addRating(rating: IAddRating) {
    return ratingModel.create(rating);
  }
  getRatingEvents(event_id: Types.ObjectId[] | Types.ObjectId) {
    return ratingModel.find({ event_id });
  }
  getRatingUser(rating: getRatingUser) {
    return ratingModel.findOne(rating).select("rate");
  }
  updateRating(rating: { _id: Types.ObjectId; rate: number }) {
    return ratingModel.findByIdAndUpdate(rating._id, { rate: rating.rate });
  }
}

export default RatingService;
