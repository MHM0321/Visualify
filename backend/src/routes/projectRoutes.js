import express from  "express";
import { getUserProjects,createUserProject } from "../controllers/projectControllers.js";
const router = express.Router();

router.get("/:id",getUserProjects);
router.post("/:id", createUserProject);

export default router;