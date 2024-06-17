import mongoose, { Schema } from "mongoose";
import { IFavoritesSchema } from "./interfaces";

const favoritesSchema: mongoose.Schema<IFavoritesSchema> = new mongoose.Schema(
  {
    event_id: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Favorites: mongoose.Model<IFavoritesSchema> =
  mongoose.model<IFavoritesSchema>("Favorites", favoritesSchema);

export default Favorites;
