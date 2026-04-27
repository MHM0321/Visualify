import express from "express";
import { getProjectScreens, createProjectScreen, updateScreenContent } from "../controllers/screenController.js";
const router = express.Router();

router.get("/:id", getProjectScreens);
router.post("/:id", createProjectScreen);
router.patch("/:id", updateScreenContent);

export default router;