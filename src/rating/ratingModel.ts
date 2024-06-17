import mongoose, { Schema } from "mongoose";
import { IRating } from "./interfaces";

const ratingSchema: mongoose.Schema<IRating> = new mongoose.Schema(
  {
    event_id: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rate: { type: Number, max: 5, default: 0 },
  },
  { timestamps: true }
);

const Rating: mongoose.Model<IRating> = mongoose.model<IRating>(
  "Rating",
  ratingSchema
);

export default Rating;
