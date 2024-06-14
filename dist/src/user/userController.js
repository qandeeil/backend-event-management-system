"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const libphonenumber_js_1 = __importDefault(require("libphonenumber-js"));
const authorize_1 = __importDefault(require("../common/middleware/authorize"));
const userService_1 = __importDefault(require("./userService"));
const bcrypt = require("bcrypt");
const ListOfCountries_json_1 = __importDefault(require("../../public/JSON/ListOfCountries.json"));
class UserController {
    constructor() {
        this.userService = new userService_1.default();
        this.auth = new authorize_1.default();
    }
    hashedPassword(password) {
        const saltRounds = process.env.HASH_SYNC_PASSWORD;
        const salt = bcrypt.genSaltSync(parseInt(saltRounds));
        const resultHashedPassword = bcrypt.hashSync(password, salt);
        return resultHashedPassword;
    }
    verifyData(data, account_type) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, name, phone_number } = data;
            const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
            const valid_email = emailRegex.test(email);
            const phoneNumber = (0, libphonenumber_js_1.default)(phone_number || "");
            const getCountry = ListOfCountries_json_1.default === null || ListOfCountries_json_1.default === void 0 ? void 0 : ListOfCountries_json_1.default.find((item) => { var _a; return item.code.toLowerCase() === ((_a = phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.country) === null || _a === void 0 ? void 0 : _a.toLowerCase()); });
            if (!name || !name.trim().length) {
                throw new Error(JSON.stringify({
                    name: false,
                    message: "Name is required",
                }));
            }
            if (!valid_email) {
                throw new Error(JSON.stringify({
                    email: false,
                    message: "Invalid email address",
                }));
            }
            if (yield this.userService.findUserByEmail(email)) {
                throw new Error(JSON.stringify({
                    email: false,
                    message: "The email already exist",
                }));
            }
            if (!(phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.isValid())) {
                throw new Error(JSON.stringify({
                    phone_number: false,
                    message: "Invalid phone number",
                }));
            }
            if (yield this.userService.findUserByPhoneNumber(phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.number)) {
                throw new Error(JSON.stringify({
                    phone_number: false,
                    message: "The phone number already exist",
                }));
            }
            if (!password || password.length < 6) {
                throw new Error(JSON.stringify({
                    password: false,
                    message: "Password must be at least 6 characters long",
                }));
            }
            return {
                name: name,
                email: email,
                phone_number: phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.number,
                password: this.hashedPassword(password),
                country: getCountry,
                account_type: account_type,
            };
        });
    }
    updateData(userInfo, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, name, phone_number } = data;
            const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
            const valid_email = emailRegex.test(email);
            const phoneNumber = (0, libphonenumber_js_1.default)(phone_number || "");
            const getCountry = ListOfCountries_json_1.default === null || ListOfCountries_json_1.default === void 0 ? void 0 : ListOfCountries_json_1.default.find((item) => { var _a; return item.code.toLowerCase() === ((_a = phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.country) === null || _a === void 0 ? void 0 : _a.toLowerCase()); });
            if (!name || !name.trim().length) {
                throw new Error(JSON.stringify({
                    name: false,
                    message: "Name is required",
                }));
            }
            if (!valid_email) {
                throw new Error(JSON.stringify({
                    email: false,
                    message: "Invalid email address",
                }));
            }
            if (email !== userInfo.email) {
                if (yield this.userService.findUserByEmail(email)) {
                    throw new Error(JSON.stringify({
                        email: false,
                        message: "The email already exist",
                    }));
                }
            }
            if (!(phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.isValid())) {
                throw new Error(JSON.stringify({
                    phone_number: false,
                    message: "Invalid phone number",
                }));
            }
            if ((phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.number) !== userInfo.phone_number) {
                if (yield this.userService.findUserByPhoneNumber(phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.number)) {
                    throw new Error(JSON.stringify({
                        phone_number: false,
                        message: "The phone number already exist",
                    }));
                }
            }
            return {
                name: name,
                email: email,
                phone_number: phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.number,
                country: getCountry,
            };
        });
    }
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validData = yield this.verifyData(req.body, req.user.account_type);
                const user = yield this.userService.createUser(validData);
                return res.status(200).json(this.auth.generateUserToken(user));
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json(JSON.parse(error.message));
                }
            }
        });
    }
    loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = req.body;
            console.log(">> payload ", payload);
            let phoneNumber;
            if (/^\d+$/.test(payload.identity)) {
                phoneNumber = (0, libphonenumber_js_1.default)(payload.identity || "", payload.country);
                console.log(">> phoneNumber: ", phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.number);
            }
            let result;
            if (!payload.identity || !payload.password) {
                return res.status(400).json({
                    email: false,
                    password: false,
                    message: "Please provide both email/phone_number and password.",
                });
            }
            if (payload.identity)
                result = yield this.userService.findUserByEmail(payload.identity);
            if (phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.number)
                result = yield this.userService.findUserByPhoneNumber(phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.number);
            if (!result)
                return res
                    .status(400)
                    .json({ email: false, message: "This account is not exist." });
            const isMatchPassword = bcrypt.compareSync(payload.password, result.password);
            if (!isMatchPassword)
                return res
                    .status(400)
                    .json({ password: false, message: "This password is incorrect." });
            if (isMatchPassword) {
                const token = this.auth.generateUserToken(result);
                return res.status(200).json(token);
            }
        });
    }
    getUserInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userInfo = req.user;
            delete userInfo.user.password;
            delete userInfo.user.updatedAt;
            delete userInfo.user.createdAt;
            delete userInfo.user._id;
            if (userInfo.user.profile_image) {
                userInfo.user.profile_image =
                    process.env.URL_BACKEND + userInfo.user.profile_image;
            }
            const payload = Object.assign(Object.assign({}, userInfo.user), { iat: userInfo.iat, exp: userInfo.exp, admin: userInfo.user.account_type === "business" });
            res.status(200).json(payload);
        });
    }
    checkValidationToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenInfo = req.user;
            res.status(200).json(Object.assign(Object.assign({}, tokenInfo), { pass: true }));
        });
    }
    updateAccountUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userInfo = req.user;
                const validData = yield this.updateData(userInfo.user, req.body);
                if (req.file) {
                    const file = req.file;
                    if (file.path) {
                        validData.profile_image = file.path;
                    }
                    else {
                        throw new Error(JSON.stringify({
                            upload_image: false,
                            message: "File buffer is undefined",
                        }));
                    }
                }
                const user = yield this.userService.updateAccount(userInfo.user._id, validData);
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
            }
            catch (error) {
                console.error(">> error.message: ", error);
                if (error instanceof Error) {
                    res.status(400).json(JSON.parse(error.message));
                }
            }
        });
    }
}
exports.default = UserController;
