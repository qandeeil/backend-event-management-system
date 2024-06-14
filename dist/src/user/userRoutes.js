"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authorize_1 = __importDefault(require("../common/middleware/authorize"));
const userController_1 = __importDefault(require("./userController"));
const UploadFile_1 = __importDefault(require("../common/utils/UploadFile"));
const router = (0, express_1.Router)();
const userController = new userController_1.default();
const authorizeToken = new authorize_1.default();
const uploadFile = new UploadFile_1.default();
router.post("/new-user", authorizeToken.authorize, (req, res) => {
    userController.createUser(req, res);
});
router.get("/access-create-account", (req, res) => authorizeToken.generateAccessCreateAccount(req, res));
router.get("/check-validation-token-account-type", authorizeToken.authorize, (req, res) => userController.checkValidationToken(req, res));
router.post("/login", (req, res) => userController.loginUser(req, res));
router.get("/user-info", authorizeToken.authorize, (req, res) => userController.getUserInfo(req, res));
router.post("/update-account", authorizeToken.authorize, uploadFile.uploadImage().single("profile_image"), (req, res) => {
    userController.updateAccountUser(req, res);
});
exports.default = router;
