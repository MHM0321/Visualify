import express from  "express";
import { getProjectScreens, createProjectScreen } from "../controllers/screenController.js";
const router = express.Router();

router.get("/:id", getProjectScreens);
router.post("/:id", createProjectScreen);

export default router;