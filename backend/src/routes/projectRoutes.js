import express from "express";
import { getUserProjects, getProjectById, createUserProject, addProjectMembers, getProjectRole, renameProject, deleteProject, duplicateProject } from "../controllers/projectControllers.js";
const router = express.Router();

// Specific routes BEFORE /:id to avoid conflicts
router.get('/single/:projectId', getProjectById);
router.get('/role/:projectId/:userId', getProjectRole);
router.get('/:id', getUserProjects);
router.post('/:id', createUserProject);
router.patch('/:id/members', addProjectMembers);
router.patch('/:id/rename', renameProject);
router.delete('/:id', deleteProject);
router.post('/:id/duplicate', duplicateProject);

export default router;