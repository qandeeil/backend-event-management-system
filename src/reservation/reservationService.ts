import { Types } from "mongoose";
import { reservation } from "./interfaces";
import Reservation from "./reservationModel";

class ReservationService {
  eventReservation(reservation: reservation) {
    return Reservation.create(reservation);
  }
  cancelReservation(_id: Types.ObjectId) {
    return Reservation.findByIdAndDelete(_id);
  }
  getReservationEvents(event_id: Types.ObjectId[] | Types.ObjectId) {
    return Reservation.find({ event_id });
  }
  getReservationUser(reservation: reservation) {
    return Reservation.findOne(reservation);
  }
}

export default ReservationService;
