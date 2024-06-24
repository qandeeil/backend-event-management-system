import { Types } from "mongoose";
import favoritesSchema from "./favoritesModel";
import { IFavorites } from "./interfaces";

class FavoritesService {
  findToFavorite(favorite: IFavorites) {
    return favoritesSchema.findOne(favorite);
  }

  findToFavoriteEvents(favorite: IFavorites) {
    return favoritesSchema.find(favorite);
  }

  addToFavorite(favorite: IFavorites) {
    return favoritesSchema.create(favorite);
  }

  removeToFavorite(favorite: IFavorites) {
    return favoritesSchema.findOneAndDelete(favorite);
  }

  deleteFavorite(event_id: Types.ObjectId) {
    return favoritesSchema.deleteMany({ event_id: event_id });
  }

  async getFavoritesEvent(user_id: Types.ObjectId) {
    const events = await favoritesSchema
      .find({ user_id })
      .populate("event_id")
      .populate({
        path: "event_id",
        populate: "creator",
      });
    return events.map((item) => item.event_id);
  }
}

export default FavoritesService;
