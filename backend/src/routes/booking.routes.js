import Router from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { cancelBooking, createBooking, getAvailableSlots, getMyBookings } from "../controllers/booking.controller.js"

const router = Router()


router.route("/").post(verifyJWT, createBooking)
router.route("/available-slots").get(verifyJWT, getAvailableSlots)
router.route("/cancel-booking").post(verifyJWT, cancelBooking)
router.route("/my-bookings").get(verifyJWT, getMyBookings)

export default router