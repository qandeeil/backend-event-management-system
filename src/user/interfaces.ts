import { CountryCode } from "libphonenumber-js/types.cjs";

export interface IUser extends Document {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  account_type: "individual" | "business";
  country: CountryCode;
}

export interface IError {
  message: string;
}
