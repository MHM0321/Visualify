import express from "express";
const router = express.Router();
import { createUser, getAllUsers, getUserByLogin } from "../controllers/userControllers.js";

router.get("/", getAllUsers);
router.post("/signin", createUser);
router.post("/login", getUserByLogin);

export default router;