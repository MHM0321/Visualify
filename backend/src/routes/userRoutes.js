import express from "express";
import passport from "passport";
const router = express.Router();
import { createUser, getAllUsers, getUserByLogin, googleAuthSuccess, getUserById, renameUser, deleteUser } from "../controllers/userControllers.js";

router.get("/", getAllUsers);
router.post("/signin", createUser);
router.post("/login", getUserByLogin);
router.get("/me/:id", getUserById);
router.patch("/me/:id/rename", renameUser);
router.delete("/me/:id", deleteUser);

// Google Auth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleAuthSuccess
);

export default router;