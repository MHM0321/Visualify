import express from "express";
const router = express.Router();
import { createUser, getAllUsers } from "../controllers/userControllers.js";

router.get("/", getAllUsers);
router.post("/", createUser);

export default router;