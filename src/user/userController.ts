import { Request, Response } from "express";
import { IUser } from "./interfaces";
import parsePhoneNumber from "libphonenumber-js";
import AuthorizeToken from "../common/middleware/authorize";
import UserService from "./userService";
const bcrypt = require("bcrypt");
import ListOfCountries from "../../public/JSON/ListOfCountries.json";

class UserController {
  private userService = new UserService();
  private auth = new AuthorizeToken();
  private hashedPassword(password: string) {
    const saltRounds: any = process.env.HASH_SYNC_PASSWORD;
    const salt = bcrypt.genSaltSync(parseInt(saltRounds));
    const resultHashedPassword = bcrypt.hashSync(password, salt);
    return resultHashedPassword;
  }
  async verifyData(data: IUser, account_type: "individual" | "business") {
    const { email, password, name, phone_number } = data;
    const emailRegex =
      /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    const valid_email = emailRegex.test(email);
    const phoneNumber = parsePhoneNumber(phone_number || "");

    const getCountry = ListOfCountries?.find(
      (item) => item.code.toLowerCase() === phoneNumber?.country?.toLowerCase()
    );

    if (!name || !name.trim().length) {
      throw new Error(
        JSON.stringify({
          name: false,
          message: "Name is required",
        })
      );
    }

    if (!valid_email) {
      throw new Error(
        JSON.stringify({
          email: false,
          message: "Invalid email address",
        })
      );
    }

    if (await this.userService.findUserByEmail(email)) {
      throw new Error(
        JSON.stringify({
          email: false,
          message: "The email already exist",
        })
      );
    }

    if (!phoneNumber?.isValid()) {
      throw new Error(
        JSON.stringify({
          phone_number: false,
          message: "Invalid phone number",
        })
      );
    }

    if (await this.userService.findUserByPhoneNumber(phoneNumber?.number)) {
      throw new Error(
        JSON.stringify({
          phone_number: false,
          message: "The phone number already exist",
        })
      );
    }

    if (!password || password.length < 6) {
      throw new Error(
        JSON.stringify({
          password: false,
          message: "Password must be at least 6 characters long",
        })
      );
    }

    return {
      name: name,
      email: email,
      phone_number: phoneNumber?.number,
      password: this.hashedPassword(password),
      country: getCountry,
      account_type: account_type,
    };
  }

  async updateData(userInfo: IUser, data: IUser) {
    const { email, name, phone_number } = data;
    const emailRegex =
      /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    const valid_email = emailRegex.test(email);
    const phoneNumber = parsePhoneNumber(phone_number || "");

    const getCountry = ListOfCountries?.find(
      (item) => item.code.toLowerCase() === phoneNumber?.country?.toLowerCase()
    );

    if (!name || !name.trim().length) {
      throw new Error(
        JSON.stringify({
          name: false,
          message: "Name is required",
        })
      );
    }

    if (!valid_email) {
      throw new Error(
        JSON.stringify({
          email: false,
          message: "Invalid email address",
        })
      );
    }

    if (email !== userInfo.email) {
      if (await this.userService.findUserByEmail(email)) {
        throw new Error(
          JSON.stringify({
            email: false,
            message: "The email already exist",
          })
        );
      }
    }

    if (!phoneNumber?.isValid()) {
      throw new Error(
        JSON.stringify({
          phone_number: false,
          message: "Invalid phone number",
        })
      );
    }

    if (phoneNumber?.number !== userInfo.phone_number) {
      if (await this.userService.findUserByPhoneNumber(phoneNumber?.number)) {
        throw new Error(
          JSON.stringify({
            phone_number: false,
            message: "The phone number already exist",
          })
        );
      }
    }
    return {
      name: name,
      email: email,
      phone_number: phoneNumber?.number,
      country: getCountry,
    };
  }

  async createUser(req: Request, res: Response) {
    try {
      const validData: any = await this.verifyData(
        req.body,
        (req as any).user.account_type
      );
      const user = await this.userService.createUser(validData);
      return res.status(200).json(this.auth.generateUserToken(user));
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json(JSON.parse(error.message));
      }
    }
  }

  async loginUser(req: Request, res: Response) {
    const payload: IUser = req.body;
    let phoneNumber;
    if (/^\d+$/.test(payload.identity)) {
      phoneNumber = parsePhoneNumber(payload.identity || "", payload.country);
    }
    let result: any;
    if (!payload.identity || !payload.password) {
      return res.status(400).json({
        email: false,
        password: false,
        message: "Please provide both email/phone_number and password.",
      });
    }
    if (payload.identity)
      result = await this.userService.findUserByEmail(payload.identity);
    if (phoneNumber?.number)
      result = await this.userService.findUserByPhoneNumber(
        phoneNumber?.number
      );
    if (!result)
      return res
        .status(400)
        .json({ email: false, message: "This account is not exist." });
    const isMatchPassword = bcrypt.compareSync(
      payload.password,
      result.password
    );
    if (!isMatchPassword)
      return res
        .status(400)
        .json({ password: false, message: "This password is incorrect." });
    if (isMatchPassword) {
      const token = this.auth.generateUserToken(result);
      return res.status(200).json(token);
    }
  }

  async getUserInfo(req: Request, res: Response) {
    const userInfo = (req as any).user;
    const token: string | undefined = req.headers["authorization"];
    delete userInfo.user.password;
    delete userInfo.user.updatedAt;
    delete userInfo.user.createdAt;
    delete userInfo.user._id;
    if (userInfo.user.profile_image) {
      userInfo.user.profile_image =
        process.env.URL_BACKEND + userInfo.user.profile_image;
    }
    const payload = {
      ...userInfo.user,
      iat: userInfo.iat,
      exp: userInfo.exp,
      admin: userInfo.user.account_type === "business",
      token: token ? token.split(" ")[1] : null,
    };
    res.status(200).json(payload);
  }

  async checkValidationToken(req: Request, res: Response) {
    const tokenInfo = (req as any).user;
    res.status(200).json({
      ...tokenInfo,
      pass: true,
    });
  }

  async updateAccountUser(req: Request, res: Response) {
    try {
      const userInfo = (req as any).user;
      const validData: any = await this.updateData(userInfo.user, req.body);

      if (req.file) {
        const file = req.file as Express.Multer.File;
        if (file.path) {
          validData.profile_image = file.path;
        } else {
          throw new Error(
            JSON.stringify({
              upload_image: false,
              message: "File buffer is undefined",
            })
          );
        }
      }

      const user: any = await this.userService.updateAccount(
        userInfo.user._id,
        validData
      );
      const payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        profile_image: user.profile_image
          ? process.env.URL_BACKEND + user.profile_image
          : null,
        account_type: user.account_type,
        admin: user.account_type === "business",
        iat: userInfo.iat,
        exp: userInfo.exp,
      };
      res.status(200).json({ updated: true, user: payload });
    } catch (error: unknown) {
      console.error(">> error.message: ", error);
      if (error instanceof Error) {
        res.status(400).json(error.message);
      }
    }
  }

  async getOrganizers(req: Request, res: Response) {
    const organizers = await this.userService.getOrganizers();
    const modifiedOrganizers = organizers.map((organizer) => ({
      _id: organizer._id,
      name: organizer.name,
      profile_image: organizer.profile_image
        ? process.env.URL_BACKEND + organizer.profile_image
        : "",
    }));
    res.status(200).json(modifiedOrganizers);
  }
}

export default UserController;
