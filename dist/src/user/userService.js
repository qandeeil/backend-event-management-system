"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("./userModel"));
class UserService {
    createUser(user) {
        return userModel_1.default.create(user);
    }
    findUserByEmail(email) {
        return userModel_1.default.findOne({ email });
    }
    findUserByPhoneNumber(phone_number) {
        return userModel_1.default.findOne({ phone_number });
    }
    updateAccount(_id, user) {
        return userModel_1.default.findByIdAndUpdate(_id, user, { new: true });
    }
}
exports.default = UserService;
