"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
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
    profile_image: { type: String },
}, { timestamps: true });
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
