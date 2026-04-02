import express from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import screenRoutes from "./routes/screenRoutes.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cors({origin: "http://localhost:5173"}));
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/screens", screenRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on PORT: ", PORT);
    });
});