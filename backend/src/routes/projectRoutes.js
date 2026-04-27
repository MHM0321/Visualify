import express from "express";
import { getUserProjects, createUserProject, addProjectMembers, getProjectRole } from "../controllers/projectControllers.js";
const router = express.Router();

router.get("/:id", getUserProjects);
router.post("/:id", createUserProject);
router.patch('/:id/members', addProjectMembers);
router.get('/role/:projectId/:userId', getProjectRole);

export default router;