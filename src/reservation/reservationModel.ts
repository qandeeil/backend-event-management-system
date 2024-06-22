import mongoose, { Schema } from "mongoose";
import { reservationSchema } from "./interfaces";

const reservationSchema: mongoose.Schema<reservationSchema> =
  new mongoose.Schema(
    {
      event_id: { type: Schema.Types.ObjectId, ref: "Event", required: true },
      user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
  );

const Reservation: mongoose.Model<reservationSchema> =
  mongoose.model<reservationSchema>("Reservation", reservationSchema);

export default Reservation;
