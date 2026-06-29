import Project from "../models/Project.js";
import User from "../models/User.js";
import Screen from "../models/Screen.js";

export const getUserProjects = async(req, res) => {
    try {
        const userId = req.params.id;
        // Include both owned projects and projects where the user is an invited member.
        const projects = await Project.find({
            $or: [
                { owner: userId },
                { 'members.userId': userId },
            ],
        }).sort({createdAt:-1});
        res.status(200).json(projects);
    } catch (error) {
        console.log("Error in getUserProjects controller", error);
        res.status(500).json("Internal Server Error");
    }
};

export const getProjectById = async(req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        //only owner or members can view
        const userId = req.query.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const isOwner = project.owner.toString() === userId;
        const isMember = project.members.some(m => m.userId.toString() === userId);
        if (!isOwner && !isMember) return res.status(403).json({ message: "Access denied" });

        res.status(200).json(project);
    } catch (error) {
        console.log("Error in getProjectById controller", error);
        res.status(500).json("Internal Server Error");
    }
};

export async function createUserProject(req, res) {
    try {
        const { name, members } = req.body;
        const owner = req.params.id;
        const sanitizedMembers = Array.isArray(members)
            ? members.filter(m => m.userId && ['editor', 'viewer'].includes(m.role))
                     .map(m => ({ userId: m.userId, role: m.role }))
            : [];
        const newProject = new Project({ name, owner, members: sanitizedMembers });
        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        console.log("Error in createUserProject controller", error);
        res.status(500).json("Internal Server Error");
    }
};

export async function addProjectMembers(req, res) {
    try {
        const { members } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });
        for (const { userId, role } of members) {
            if (!['editor', 'viewer'].includes(role)) continue;
            if (project.owner.toString() === userId) continue;
            const existing = project.members.find(m => m.userId.toString() === userId);
            if (existing) existing.role = role;
            else project.members.push({ userId, role });
        }
        await project.save();
        res.status(200).json(project);
    } catch (error) {
        console.log("Error in addProjectMembers controller", error);
        res.status(500).json("Internal Server Error");
    }
}

export async function getProjectRole(req, res) {
    try {
        const { projectId, userId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });
        if (project.owner.toString() === userId) return res.status(200).json({ role: 'editor' });
        const member = project.members.find(m => m.userId.toString() === userId);
        const role = member ? member.role : 'viewer';
        res.status(200).json({ role });
    } catch (error) {
        console.log("Error in getProjectRole controller", error);
        res.status(500).json("Internal Server Error");
    }
}

export async function renameProject(req, res) {
    try {
        const { name } = req.body;
        if (!name?.trim()) return res.status(400).json({ message: "Name required" });
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { name: name.trim() },
            { new: true }
        );
        if (!project) return res.status(404).json({ message: "Project not found" });
        res.status(200).json(project);
    } catch (error) {
        console.log("Error in renameProject controller", error);
        res.status(500).json("Internal Server Error");
    }
}

export async function deleteProject(req, res) {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });
        // Also delete all screens belonging to this project
        await Screen.deleteMany({ projectId: req.params.id });
        res.status(200).json({ message: "Project deleted" });
    } catch (error) {
        console.log("Error in deleteProject controller", error);
        res.status(500).json("Internal Server Error");
    }
}

export async function duplicateProject(req, res) {
    try {
        const original = await Project.findById(req.params.id);
        if (!original) return res.status(404).json({ message: "Project not found" });
        const copy = new Project({
            name: `${original.name} (Copy)`,
            owner: original.owner,
            members: original.members,
        });
        await copy.save();
        // Duplicate all screens too
        const screens = await Screen.find({ projectId: original._id });
        const copiedScreens = screens.map(s => ({
            projectId: copy._id,
            name: s.name,
            order: s.order,
            content: s.content,
        }));
        if (copiedScreens.length > 0) await Screen.insertMany(copiedScreens);
        res.status(201).json(copy);
    } catch (error) {
        console.log("Error in duplicateProject controller", error);
        res.status(500).json("Internal Server Error");
    }
}