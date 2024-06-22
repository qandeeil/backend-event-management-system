import { Request, Response } from "express";
import ReservationService from "./reservationService";
import { reservation } from "./interfaces";
import EventService from "../event/eventService";
import { IEventData } from "../event/interfaces";

class ReservationController {
  private reservationService = new ReservationService();
  private eventService = new EventService();

  async eventReservation(req: Request, res: Response) {
    try {
      const userInfo = (req as any).user.user;
      const payload: reservation = {
        user_id: userInfo._id,
        event_id: req.body.event_id,
      };

      const getEvent: any = await this.eventService.getEventbyId(
        payload.event_id
      );
      const getReservation = await this.reservationService.getReservationEvents(
        payload.event_id
      );

      if (getEvent.seats === getReservation.length) {
        res.json({
          result: false,
          message: "You cannot book this event because it is full",
        });
        return;
      }

      const checkReservation = await this.reservationService.getReservationUser(
        payload
      );

      if (checkReservation) {
        await this.reservationService.cancelReservation(checkReservation._id);
        res.status(200).json({
          result: true,
          message: "Your event booking has been cancelled",
        });
        return;
      } else {
        await this.reservationService.eventReservation(payload);
        res.status(200).json({ result: true, message: "The event is booked" });
        return;
      }
    } catch (error) {
      res.status(400).json(error);
      return;
    }
  }
}

export default ReservationController;
