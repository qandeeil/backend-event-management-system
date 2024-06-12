import mongoose from "mongoose";
import { IUser } from "./interfaces";

const userSchema: mongoose.Schema<IUser> = new mongoose.Schema(
  {
    name: { type: String, required: [true, "A name is required."] },
    email: {
      type: String,
      required: [true, "A email is required."],
      unique: true,
    },
    phone_number: {
      type: String,
      required: [true, "A phone number is required."],
      unique: true,
    },
    password: { type: String, required: [true, "A password is required."] },
    account_type: {
      type: String,
      enum: ["individual", "business"],
      required: [true, "A account type is required."],
    },
    country: {
      name: String,
      code: String,
    },
  },
  { timestamps: true }
);

const User: mongoose.Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
