import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()


app.get("/", (req, res) =>{
    res.send("Hello World")
})

app.use(express.json())
app.use(express.urlencoded({extended :true  }))
app.use(express.static("public"))
app.use(cookieParser())
app.use(
    cors({
        origin: "https://bro-zone-arena.vercel.app",
        credentials: true,
    })
);
import userRouter from "./routes/user.routes.js"
import bookingRouter from "./routes/booking.routes.js"
import facilityRouter from "./routes/facility.routes.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/bookings", bookingRouter)
app.use("/api/v1/facility", facilityRouter)

export {app};

// http://localhost:8000/api/v1/users/register
