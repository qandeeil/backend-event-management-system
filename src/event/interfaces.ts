import { Types } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: IDate;
  creator: Types.ObjectId;
  location: Location;
  seats: Number;
  price: Number;
  preview_photo: string;
  cover_photo: string;
  organizers: Types.ObjectId;
  expired: boolean;
}

export interface IEventData {
  title: string;
  description: string;
  date: IDate;
  creator: Types.ObjectId;
  location: Location;
  seats: Number;
  price: Number;
  preview_photo: string;
  cover_photo: string;
  organizers: Types.ObjectId;
  expired: boolean;
}

interface IDate {
  start_date: Date;
  end_date: Date;
}

interface ILocation {
  country: string;
  city: string;
}

export interface ICreateEvent {
  title: string;
  description: string;
  date: IDate;
  creator: Types.ObjectId;
  location: ILocation;
  seats: Number;
  price: Number;
  organizers: Types.ObjectId;
  preview_photo: string | null | undefined;
  cover_photo: string | null | undefined;
}

export interface IFilterEvent {
  location: ILocation;
  date: IDate;
}
