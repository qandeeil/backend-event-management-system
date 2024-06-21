import mongoose from "mongoose";
import { IEvent } from "./interfaces";

const eventSchema: mongoose.Schema<IEvent> = new mongoose.Schema(
  {
    title: {
      type: String,
      require: [
        true,
        JSON.stringify({ name: false, message: "Name is required" }),
      ],
    },
    description: { type: String },
    date: {
      start_date: {
        type: Date,
        require: [
          true,
          JSON.stringify({ start_date: false, message: "Date is required" }),
        ],
      },
      end_date: {
        type: Date,
        require: [
          true,
          JSON.stringify({ end_date: false, message: "Date is required" }),
        ],
      },
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: [
        true,
        JSON.stringify({ creator: false, message: "Creator is required" }),
      ],
    },
    location: {
      country: {
        type: String,
        require: [
          true,
          JSON.stringify({ location: false, message: "Country is required" }),
        ],
      },
      city: {
        type: String,
        require: [
          true,
          JSON.stringify({ location: false, message: "City is required" }),
        ],
      },
    },
    seats: {
      type: Number,
      required: [
        true,
        JSON.stringify({ seats: false, message: "Seats are required" }),
      ],
    },
    price: {
      type: Number,
      required: [
        true,
        JSON.stringify({ price: false, message: "Price is required" }),
      ],
    },
    preview_photo: { type: String },
    cover_photo: { type: String },
    organizers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    expired: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Event: mongoose.Model<IEvent> = mongoose.model<IEvent>(
  "Event",
  eventSchema
);

export default Event;
