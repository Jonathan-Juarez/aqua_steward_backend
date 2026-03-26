import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("MongoDB se ha conectado exitosamente.");
    } catch (error) {
        console.log("Error al conectar con MongoDB.", error);
    }
}

export default connectDB;
