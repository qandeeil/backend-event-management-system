import { Router, Request, Response } from "express";
import AuthorizeToken from "../common/middleware/authorize";
import UserController from "./userController";
import UploadFile from "../common/utils/UploadFile";

const router = Router();

const userController = new UserController();
const authorizeToken = new AuthorizeToken();
const uploadFile = new UploadFile();

router.post(
  "/new-user",
  authorizeToken.authorize,
  (req: Request, res: Response) => {
    userController.createUser(req, res);
  }
);

router.get("/access-create-account", (req, res) =>
  authorizeToken.generateAccessCreateAccount(req, res)
);

router.get(
  "/check-validation-token-account-type",
  authorizeToken.authorize,
  (req, res) => userController.checkValidationToken(req, res)
);

router.post("/login", (req, res) => userController.loginUser(req, res));

router.get("/user-info", authorizeToken.authorize, (req, res) =>
  userController.getUserInfo(req, res)
);

router.post(
  "/update-account",
  authorizeToken.authorize,
  uploadFile.uploadImage().single("profile_image"),
  (req, res) => {
    userController.updateAccountUser(req, res);
  }
);

export default router;
