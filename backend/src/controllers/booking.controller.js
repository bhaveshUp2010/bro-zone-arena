import { Booking } from "../models/booking.models.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const getAvailableSlots = asynchandler(async (req, res) => {
    
    const {facility, date} = req.query

    if (
        [facility, date].some((field) => field.trim() === "")
    ){
        throw new ApiError(400, "Facility and booking are req")
    }

    const booking = await Booking.find({
        facility, 

        bookingDate: new Date(date),

        status: {
            $in: ["Pending", "Confirmed"]
        }
    })
    return res.status(200).json(
        new ApiResponse(200, booking, "Booking fetched successfully")
    )
})

const createBooking = asynchandler(async (req, res) => {
    
    const {facility, sport, bookingDate, startTime, endTime, amount } = req.body
    const bookingDateValue = new Date(bookingDate)

    const existingBooking = await Booking.findOne({
        facility,
        bookingDate: bookingDateValue, 
        status:{
            $in:["Pending", "Confirmed"]
        },
        startTime:{
            $lt: endTime
        }, 
        endTime:{
            $gt: startTime  
        }, 
    })
    if(existingBooking){
        throw new ApiError(400, "Booking already exists")
    }
    const booking = await Booking.create({

        user: req.user._id,

        facility,

        sport,

        bookingDate: bookingDateValue,

        startTime,

        endTime,

        amount,

        status: "Confirmed"

    });
    return res.status(200).json(new ApiResponse(
        200, booking, "Booking created successfully"
    ))
})

const getMyBookings = asynchandler(async (req, res) => {

    const bookings = await Booking.find({

        user: req.user._id

    })
    .populate("facility")
    .sort({
        bookingDate: -1
    });
    return res.status(200).json(
        new ApiResponse(
            200,
            bookings,
            "Bookings fetched Successfully"
        )
    );
});

const cancelBooking = asynchandler(async (req, res) => {
    const bookingId = req.params?.bookingId ?? req.body?.bookingId

    const booking = await Booking.findById(bookingId)
    
    if(!booking){
        throw new ApiError(404, "booking not found")
    }
    if (booking.user.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Unauthorized action")
    }
    booking.status = "Cancelled"
    await booking.save()
    return res.status(200).json(
        new ApiResponse(200, booking, "Booking Cancelled successfully")
    )
})

export {createBooking, getAvailableSlots, getMyBookings, cancelBooking} 