import { Types } from "mongoose";

export interface reservationSchema extends Document {
  event_id: Types.ObjectId;
  user_id: Types.ObjectId;
}

export interface reservation {
  event_id: Types.ObjectId;
  user_id: Types.ObjectId;
}
