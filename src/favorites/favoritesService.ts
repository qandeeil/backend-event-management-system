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
}

export default FavoritesService;
