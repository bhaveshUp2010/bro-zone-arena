import mongoose, { Schema } from "mongoose";

const facilitySchema = new Schema({
    name: {
        type: String,
        required: true
    },

    sports: [{
        type: String
    }],

    pricePerHour: {
        type: Number,
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    }
});

export const Facility = mongoose.model("Facility", facilitySchema);