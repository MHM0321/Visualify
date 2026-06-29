import Screen from "../models/Screen.js";
import Project from "../models/Project.js";

export async function getProjectScreens(req, res) {
    try {
        const userId = req.query.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const isOwner = project.owner.toString() === userId;
        const isMember = project.members.some(m => m.userId.toString() === userId);
        if (!isOwner && !isMember) return res.status(403).json({ message: "Access denied" });

        const screens = await Screen.find({ projectId: req.params.id }).sort({ order: 1 });
        res.status(200).json(screens);
    } catch (error) {
        console.log("Error in getProjectScreens controller", error);
        res.status(500).json("Internal Server Error");
    }
}

export const createProjectScreen = async(req, res) => {
    try {
        const {name} = req.body;
        const projectId = req.params.id;
        const screenCount = await Screen.countDocuments({ projectId });
        const newScreen = new Screen({name, projectId, order: screenCount + 1});
        await newScreen.save();
        res.status(201).json(newScreen);
    }
    catch (error) {
        console.log("Error in createProjectScreen controller", error);
        res.status(500).json("Internal Server Error");        
    }
}

export async function updateScreenContent(req, res) {
    try {
        const { content } = req.body;
        const screen = await Screen.findByIdAndUpdate(
            req.params.id,
            { $set: { content } },
            { new: true }
        );
        if (!screen) return res.status(404).json({ message: "Screen not found" });

        await Project.findByIdAndUpdate(screen.projectId, { lastEditedAt: new Date() });
        res.status(200).json(screen);
    }
    catch (error) {
        console.log("Error in updateScreenContent controller", error);
        res.status(500).json("Internal Server Error");
    }
}