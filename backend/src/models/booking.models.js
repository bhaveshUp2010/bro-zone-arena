import mongoose, {Schema} from "mongoose"

const bookingSchema = new Schema({

    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    facility:{
        type:Schema.Types.ObjectId,
        ref:"Facility",
        required:true
    },

    sport:{
        type:String,
        required:true
    },

    bookingDate:{
        type:Date,
        required:true
    },

    startTime:{
        type:Number,   // minutes from midnight
        required:true
    },

    endTime:{
        type:Number,
        required:true
    },

    amount:Number,

    payment:{
        orderId:String,
        paymentId:String,
        signature:String,

        status:{
            type:String,
            enum:["Pending","Paid","Refunded"],
            default:"Pending"
        }
    },

    status:{
        type:String,
        enum:["Pending","Confirmed","Cancelled"],
        default:"Pending"
    }

},{
    timestamps:true
})

export const Booking = mongoose.model("Bookings", bookingSchema)