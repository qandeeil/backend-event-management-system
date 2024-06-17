import { Types } from "mongoose";

export interface IRating extends Document {
  event_id: Types.ObjectId;
  user_id: Types.ObjectId;
  rate: Number;
}

export interface IAddRating {
  event_id: Types.ObjectId;
  user_id: Types.ObjectId;
  rate: Number;
}
