import dotenv from "dotenv"
import { ConnectToDB } from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path : "./.env"
})

const port = process.env.PORT || process.env.port || 8080

ConnectToDB()
.then(() => {
    app.listen(port, ()=>{
        console.log("⚙️ Server is running at port :", port);  
    })
})
.catch((error) =>{
    console.log("Connection unsuccesfull: ", error);
    
})