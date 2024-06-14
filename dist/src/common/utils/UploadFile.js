"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path = require("path");
class UploadFile {
    constructor() {
        this.dir = path.join("public/profile_image");
        console.log(">> dir: ", this.dir);
        this.storage = multer_1.default.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.dir);
            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + "-" + file.originalname);
            },
        });
    }
    uploadImage() {
        return (0, multer_1.default)({ storage: this.storage });
    }
}
exports.default = UploadFile;
