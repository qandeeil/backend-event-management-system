import { ObjectId, Types } from "mongoose";

export interface IFavoritesSchema extends Document {
  event_id: Types.ObjectId;
  user_id: Types.ObjectId;
}

export interface IFavorites {
  event_id: Types.ObjectId;
  user_id: Types.ObjectId;
}
