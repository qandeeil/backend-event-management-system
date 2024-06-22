import { Router } from "express";
import AuthorizeToken from "../common/middleware/authorize";
import ReservationController from "./reservationController";

const router = Router();
const authorizeToken = new AuthorizeToken();
const reservationController = new ReservationController();

router.post("/", authorizeToken.authorize, (req, res) =>
  reservationController.eventReservation(req, res)
);

export default router;
