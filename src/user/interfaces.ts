import { CountryCode } from "libphonenumber-js/types.cjs";

export interface IUser extends Document {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  account_type: "individual" | "business";
  country: CountryCode;
  identity: string; // login user email or phone number
  profile_image: string;
}

export interface IError {
  message: string;
}
