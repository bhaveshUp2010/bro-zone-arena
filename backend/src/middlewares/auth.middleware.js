import { ApiError } from "../utils/apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import { user } from "../models/user.models.js";

export const verifyJWT = asynchandler(async (req, _, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
    );

    const currentUser = await user
        .findById(decodedToken._id)
        .select("-password -refreshToken");

    if (!currentUser) {
        throw new ApiError(401, "Invalid Access Token");
    }

    req.user = currentUser;
    next();
});