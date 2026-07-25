import { user } from "../models/user.models.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const generateAcccessandRefreshToken = async (user_id) => {
    try {
        const myUser = await user.findById(user_id)
        const accessToken = myUser.generateAccessToken()
        const refreshToken = myUser.generateRefreshToken()

        myUser.refreshToken = refreshToken

        await myUser.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        console.log("Actual Error: ", error);
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

const signup = asynchandler(async (req, res) => {
    const {name, email , mobileno, password} = req.body

    if(
        [name, mobileno, password].some((field) => field.trim() === "")){
            throw new ApiError(400, "All field req")
    }

    const existingUser = await user.findOne({
        $or: [{email}, {mobileno}]
    })

    if (existingUser) { 
        throw new ApiError(409, "User already exists")
    }

    const newUser = await user.create({
        email: email ,
        mobileNumber:mobileno,
        fullName: name,
        password: password
    })  

    const createdUser = await user.findById(newUser._id)
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating User")
    }
    return res.status(201).json(
        new ApiResponse(200, newUser, "User Registered Succesfully")
    )
})  

const loginUser = asynchandler(async (req, res) => {
    const { mobileNumber, password } = req.body;

    if (
        [mobileNumber, password].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existing_user = await user.findOne({ mobileNumber });

    if (!existing_user) {
        throw new ApiError(404, "User does not exist");
    }

    const passValid = await existing_user.isPasswordCorrect(password);

    if (!passValid) {
        throw new ApiError(401, "Password is invalid");
    }
    const {accessToken, refreshToken} = await generateAcccessandRefreshToken(existing_user._id)

    const loggedinUser = await user.findById(existing_user._id);

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedinUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
});

const getCurrentUser = asynchandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const logoutUser = asynchandler(async (req, res) => {
    await user.findByIdAndUpdate(
        req.user._id,{
            $unset:{
                refreshToken : 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const changePassword = asynchandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body
    
    const myUser = await user.findById(req.user?._id)
    const passValid = await myUser.isPasswordCorrect(oldPassword)
    
    if (!passValid) {
        throw new ApiError(400, "Invalid Old password")
    }
    myUser.password = newPassword
    await myUser.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200, {}, "password changed successfully"))
})

export {signup, loginUser, getCurrentUser, logoutUser, changePassword}