import express from "express";
import { getUserProjects, getProjectById, createUserProject, addProjectMembers, getProjectRole } from "../controllers/projectControllers.js";
const router = express.Router();

// Specific routes BEFORE /:id to avoid conflicts
router.get('/single/:projectId', getProjectById);
router.get('/role/:projectId/:userId', getProjectRole);
router.get('/:id', getUserProjects);
router.post('/:id', createUserProject);
router.patch('/:id/members', addProjectMembers);

export default router;