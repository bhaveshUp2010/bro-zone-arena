import Router from "express"
import { getAllFacility, getFacilitybyId } from "../controllers/facility.controller.js"

const router = Router()

router.route("/").get(getAllFacility)
router.route("/:id").get(getFacilitybyId)

export default router