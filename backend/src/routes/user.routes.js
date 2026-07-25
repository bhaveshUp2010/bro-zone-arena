import {Router} from "express"
import { changePassword, getCurrentUser, loginUser, logoutUser, signup } from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(signup)
router.route("/login").post(loginUser)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/change-password").post(verifyJWT, changePassword)

export default router