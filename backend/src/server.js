import express from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import screenRoutes from "./routes/screenRoutes.js";
import { registerSocketHandlers } from './config/socketManager.js';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5001;
configurePassport();

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "https://visualify.boxloid0321321.workers.dev"]
}));
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/screens", screenRoutes);

// Wrap express with http server for socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://visualify.boxloid0321321.workers.dev"],
    methods: ["GET", "POST"]
  }
});

registerSocketHandlers(io);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log("Server started on PORT: ", PORT);
  });
});