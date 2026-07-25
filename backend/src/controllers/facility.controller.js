import { Facility } from "../models/facility,models.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const getAllFacility = asynchandler(async (req, res) => {
    
    const facilities = await Facility.find({
        isActive: true
    })
    return res.status(200).json(new ApiResponse(200, facilities, "facilities fetched successfully"))
})

const getFacilitybyId = asynchandler(async (req, res) => {
    const {id} = req.params

    const facility = await Facility.findById(id)
    if (!facility){
        throw new ApiError(404, "Facility not found")
    }
    return res.status(200).json(new ApiResponse(200, facility, "Facility fetched successfully"))
})

export {getAllFacility , getFacilitybyId}