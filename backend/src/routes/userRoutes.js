import express from "express";
const router = express.Router();
import { createUser, getAllUsers, getUserByLogin } from "../controllers/userControllers.js";

router.get("/", getAllUsers);
router.post("/", createUser);
router.post("/login", getUserByLogin);

export default router;