import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
const ConnectToDB = async () => {
    try {
        const conection_instance = await mongoose.connect(`${process.env.CONNECTION_URI}/${DB_NAME}`)
        console.log("Succesfully connected to monogo DB: ",conection_instance.connection.host);
        
    } catch (error) {
        console.log("Connection to mongoose failed:, ",error);
        process.exit(1)
    }
}

export {ConnectToDB}