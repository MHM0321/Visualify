import express from "express";
import passport from "passport";
const router = express.Router();
import { createUser, getAllUsers, getUserByLogin, googleAuthSuccess } from "../controllers/userControllers.js";

router.get("/", getAllUsers);
router.post("/signin", createUser);
router.post("/login", getUserByLogin);

// Google Auth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleAuthSuccess
);

export default router;